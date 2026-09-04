module main

import json
import os
import sync
import time

struct QuizQuestion {
mut:
	id       string
	topic    string
	question string
	answer   string
}

struct QuizCollection {
mut:
	id          string
	title       string
	description string
	tone        string
	level       string
	questions   []QuizQuestion
}

struct QuizDatabase {
	version     int
	collections []QuizCollection
}

struct QuizQuestionRequest {
	collection_id string
	id            string
	topic         string
	question      string
	answer        string
}

struct QuizStore {
mut:
	path        string
	collections []QuizCollection
	next_id     int
	mutex       sync.Mutex
}

const quiz_database_version = 1
const max_quiz_collections = 1000
const max_quiz_questions = 500
const max_quiz_text_len = 20000

fn new_quiz_store() !QuizStore {
	config_dir := os.config_dir()!
	storage_dir := os.join_path(config_dir, 'webview-app')
	os.mkdir_all(storage_dir)!
	path := os.join_path(storage_dir, 'quizzes.json')

	if os.exists(path) {
		raw := os.read_file(path)!
		database := json.decode(QuizDatabase, raw)!
		if database.version != quiz_database_version {
			return error('Unsupported quiz database version')
		}
		return QuizStore{
			path:        path
			collections: normalize_collections(database.collections)!
			next_id:     1
		}
	}

	mut store := QuizStore{
		path:        path
		collections: seed_quiz_collections()
		next_id:     1
	}
	store.save()!
	return store
}

fn normalize_collections(collections []QuizCollection) ![]QuizCollection {
	if collections.len > max_quiz_collections {
		return error('Quiz database contains too many collections')
	}
	mut normalized := []QuizCollection{}
	for collection in collections {
		normalized << validate_collection(collection)!
	}
	return normalized
}

fn validate_collection(collection QuizCollection) !QuizCollection {
	mut normalized := collection
	normalized.id = normalized.id.trim_space()
	normalized.title = normalized.title.trim_space()
	normalized.description = normalized.description.trim_space()
	normalized.tone = normalized.tone.trim_space()
	normalized.level = normalized.level.trim_space()
	if normalized.id.len == 0 {
		return error('Quiz collection id is required')
	}
	if normalized.title.len == 0 {
		return error('Quiz collection title is required')
	}
	if normalized.title.len > 200 || normalized.description.len > 1000 {
		return error('Quiz collection metadata is too long')
	}
	if normalized.questions.len > max_quiz_questions {
		return error('Quiz collection contains too many questions')
	}
	mut questions := []QuizQuestion{}
	for question in normalized.questions {
		questions << validate_question(question)!
	}
	normalized.questions = questions
	return normalized
}

fn validate_question(question QuizQuestion) !QuizQuestion {
	mut normalized := question
	normalized.id = normalized.id.trim_space()
	normalized.topic = normalized.topic.trim_space()
	normalized.question = normalized.question.trim_space()
	normalized.answer = normalized.answer.trim_space()
	if normalized.id.len == 0 {
		return error('Quiz question id is required')
	}
	if normalized.question.len == 0 || normalized.answer.len == 0 {
		return error('Quiz question and answer are required')
	}
	if normalized.question.len > max_quiz_text_len || normalized.answer.len > max_quiz_text_len {
		return error('Quiz question or answer is too long')
	}
	return normalized
}

fn (mut store QuizStore) save() ! {
	database := QuizDatabase{
		version:     quiz_database_version
		collections: store.collections
	}
	temporary_path := '${store.path}.tmp'
	os.write_file(temporary_path, json.encode(database)) or { return err }
	os.rename(temporary_path, store.path) or {
		os.rm(temporary_path) or {}
		return err
	}
}

fn (mut store QuizStore) new_id(prefix string) string {
	id := '${prefix}-${time.now().unix()}-${store.next_id}'
	store.next_id++
	return id
}

fn (mut store QuizStore) list() ![]QuizCollection {
	store.mutex.lock()
	result := store.collections
	store.mutex.unlock()
	return result
}

fn (mut store QuizStore) create_collection(payload string) !QuizCollection {
	incoming := json.decode(QuizCollection, payload)!
	mut collection_input := incoming
	collection_input.id = 'pending'
	mut collection := validate_collection(collection_input)!
	store.mutex.lock()
	if store.collections.len >= max_quiz_collections {
		store.mutex.unlock()
		return error('Quiz collection limit reached')
	}
	collection.id = store.new_id('collection')
	store.collections << collection
	store.save() or {
		store.collections.delete_last()
		store.mutex.unlock()
		return err
	}
	store.mutex.unlock()
	return collection
}

fn (mut store QuizStore) update_collection(payload string) !QuizCollection {
	incoming := json.decode(QuizCollection, payload)!
	collection := validate_collection(incoming)!
	store.mutex.lock()
	index := store.collection_index(collection.id)
	if index < 0 {
		store.mutex.unlock()
		return error('Quiz collection not found')
	}
	previous := store.collections[index]
	store.collections[index] = collection
	store.save() or {
		store.collections[index] = previous
		store.mutex.unlock()
		return err
	}
	store.mutex.unlock()
	return collection
}

fn (mut store QuizStore) delete_collection(id string) ! {
	collection_id := id.trim_space()
	if collection_id.len == 0 {
		return error('Quiz collection id is required')
	}
	store.mutex.lock()
	index := store.collection_index(collection_id)
	if index < 0 {
		store.mutex.unlock()
		return error('Quiz collection not found')
	}
	if store.collections.len <= 1 {
		store.mutex.unlock()
		return error('At least one quiz collection must remain')
	}
	removed := store.collections[index]
	store.collections.delete(index)
	store.save() or {
		store.collections.insert(index, removed)
		store.mutex.unlock()
		return err
	}
	store.mutex.unlock()
}

fn (mut store QuizStore) create_question(payload string) !QuizCollection {
	request := json.decode(QuizQuestionRequest, payload)!
	mut question := validate_question(QuizQuestion{
		id:       'pending'
		topic:    request.topic
		question: request.question
		answer:   request.answer
	})!
	store.mutex.lock()
	collection_index := store.collection_index(request.collection_id)
	if collection_index < 0 {
		store.mutex.unlock()
		return error('Quiz collection not found')
	}
	if store.collections[collection_index].questions.len >= max_quiz_questions {
		store.mutex.unlock()
		return error('Quiz question limit reached')
	}
	question.id = store.new_id('question')
	store.collections[collection_index].questions << question
	result := store.collections[collection_index]
	store.save() or {
		store.collections[collection_index].questions.delete_last()
		store.mutex.unlock()
		return err
	}
	store.mutex.unlock()
	return result
}

fn (mut store QuizStore) update_question(payload string) !QuizCollection {
	request := json.decode(QuizQuestionRequest, payload)!
	question := validate_question(QuizQuestion{
		id:       request.id
		topic:    request.topic
		question: request.question
		answer:   request.answer
	})!
	store.mutex.lock()
	collection_index := store.collection_index(request.collection_id)
	if collection_index < 0 {
		store.mutex.unlock()
		return error('Quiz collection not found')
	}
	question_index := store.question_index(collection_index, request.id)
	if question_index < 0 {
		store.mutex.unlock()
		return error('Quiz question not found')
	}
	previous := store.collections[collection_index].questions[question_index]
	store.collections[collection_index].questions[question_index] = question
	result := store.collections[collection_index]
	store.save() or {
		store.collections[collection_index].questions[question_index] = previous
		store.mutex.unlock()
		return err
	}
	store.mutex.unlock()
	return result
}

fn (mut store QuizStore) delete_question(payload string) !QuizCollection {
	request := json.decode(QuizQuestionRequest, payload)!
	store.mutex.lock()
	collection_index := store.collection_index(request.collection_id)
	if collection_index < 0 {
		store.mutex.unlock()
		return error('Quiz collection not found')
	}
	question_index := store.question_index(collection_index, request.id)
	if question_index < 0 {
		store.mutex.unlock()
		return error('Quiz question not found')
	}
	removed := store.collections[collection_index].questions[question_index]
	store.collections[collection_index].questions.delete(question_index)
	result := store.collections[collection_index]
	store.save() or {
		store.collections[collection_index].questions.insert(question_index, removed)
		store.mutex.unlock()
		return err
	}
	store.mutex.unlock()
	return result
}

fn (mut store QuizStore) collection_index(id string) int {
	for index, item in store.collections {
		if item.id == id {
			return index
		}
	}
	return -1
}

fn (mut store QuizStore) question_index(collection_index int, id string) int {
	for index, item in store.collections[collection_index].questions {
		if item.id == id {
			return index
		}
	}
	return -1
}

fn seed_question(id string, topic string, question string, answer string) QuizQuestion {
	return QuizQuestion{
		id:       id
		topic:    topic
		question: question
		answer:   answer
	}
}

fn seed_quiz_collections() []QuizCollection {
	return [
		QuizCollection{
			id:          'blender-fundamentals'
			title:       'Blender Fundamentals'
			description: 'Build confidence with the 3D editor, modeling, and scenes.'
			tone:        'coral'
			level:       'Beginner'
			questions:   [
				seed_question('bf-01', 'Workflow',
					'What is the difference between Object Mode and Edit Mode?',
					'Object Mode transforms the whole object. Edit Mode changes its mesh data, such as vertices, edges, and faces, without changing the object origin or its relationship to the scene.'),
				seed_question('bf-02', 'Interface', 'What does the 3D cursor control in Blender?',
					'It marks a position and orientation in 3D space. It is used as a placement target for new objects and as a pivot for operations such as cursor-based transforms.'),
				seed_question('bf-03', 'Modeling',
					'Why would you apply an object scale before beveling it?',
					'Applying the scale makes the object transform 1, 1, 1 so a bevel width behaves consistently on every axis.'),
				seed_question('bf-04', 'Mesh data', 'What is the purpose of a normal in a mesh?',
					'A normal describes the direction a face is pointing. Blender uses normals for shading, backface visibility, and several geometry operations.'),
				seed_question('bf-05', 'Scene management',
					'How does a collection help organize a Blender scene?',
					'A collection groups objects so they can be selected, hidden, instanced, or managed together. Collections can also be nested inside other collections.'),
			]
		},
		QuizCollection{
			id:          'blender-workflow'
			title:       'Blender Workflow'
			description: 'Test practical knowledge of modifiers, materials, and lighting.'
			tone:        'gold'
			level:       'Intermediate'
			questions:   [
				seed_question('bw-01', 'Modifiers', 'What makes a modifier non-destructive?',
					'It changes how an object is evaluated without permanently rewriting the underlying mesh. The stack can be reordered, adjusted, disabled, or applied later.'),
				seed_question('bw-02', 'Materials',
					'When is a normal map preferable to adding more geometry?',
					'Use a normal map for small surface detail that mainly affects shading. It is cheaper than modeling every detail, but it does not change the silhouette.'),
				seed_question('bw-03', 'Lighting',
					'What is the job of a key light in a three-point lighting setup?',
					'The key light is the main source that establishes the subject direction, form, and overall contrast.'),
				seed_question('bw-04', 'Texturing', 'What problem does UV unwrapping solve?',
					'It lays a 3D surface out on a 2D plane so image textures can be assigned with predictable coordinates and minimal stretching.'),
				seed_question('bw-05', 'Process', 'Why use a reference image while modeling?',
					'A reference gives the model measurable visual constraints for proportion, shape, and detail instead of relying only on memory.'),
			]
		},
		QuizCollection{
			id:          'audio-programming'
			title:       'Audio Programming'
			description: 'Explore signals, samples, timing, and real-time audio systems.'
			tone:        'blue'
			level:       'Intermediate'
			questions:   [
				seed_question('ap-01', 'Digital audio', 'What does the sample rate describe?',
					'It is the number of samples captured or generated per second. A 48 kHz stream contains 48,000 samples per second for each channel.'),
				seed_question('ap-02', 'Real time',
					'Why can an audio callback be unsafe for memory allocation?',
					'Allocation can block or take an unpredictable amount of time. In a real-time callback that can cause glitches, so work should use preallocated memory.'),
				seed_question('ap-03', 'DSP', 'What is aliasing in a digital audio signal?',
					'It is false frequency content created when a signal contains energy above the Nyquist frequency. Anti-alias filtering or oversampling helps prevent it.'),
				seed_question('ap-04', 'Buffers',
					'What is the difference between a mono and stereo buffer?',
					'A mono buffer has one channel of samples. A stereo buffer has two channels, commonly left and right.'),
				seed_question('ap-05', 'Dynamics', 'What does an envelope follower measure?',
					'It tracks the changing amplitude of a signal, usually with separate attack and release behavior.'),
			]
		},
		QuizCollection{
			id:          'synthesis-dsp'
			title:       'Synthesis and DSP'
			description: 'Review oscillators, filters, spectra, and musical control signals.'
			tone:        'coral'
			level:       'Advanced'
			questions:   [
				seed_question('sd-01', 'Oscillators', 'What is a wavetable oscillator?',
					'It generates a periodic waveform by reading values from a stored single-cycle table.'),
				seed_question('sd-02', 'Filters', 'What does a low-pass filter remove?',
					'It attenuates frequencies above its cutoff while allowing lower frequencies through.'),
				seed_question('sd-03', 'Analysis',
					'What does an FFT reveal about an audio signal?',
					'It transforms time-domain samples into frequency-domain bins, showing spectral components.'),
				seed_question('sd-04', 'Control',
					'Why is a parameter smoother useful in a synthesizer?',
					'It turns abrupt control changes into short ramps and prevents clicks caused by discontinuities.'),
				seed_question('sd-05', 'Modulation', 'What is an LFO typically used for?',
					'A low-frequency oscillator produces a slow periodic control signal for modulation such as vibrato, tremolo, or panning.'),
			]
		},
	]
}
