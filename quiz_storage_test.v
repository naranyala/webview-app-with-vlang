module main

import json
import os
import time

fn test_quiz_store_crud_and_persistence() {
	path := os.join_path(os.temp_dir(), 'webview-quiz-test-${time.now().unix()}.json')
	mut store := QuizStore{
		path:        path
		collections: [
			QuizCollection{
				id:          'seed'
				title:       'Seed collection'
				description: 'Test data'
				tone:        'coral'
				level:       'Test'
				questions:   []QuizQuestion{}
			},
		]
		next_id:     1
	}

	created := store.create_collection(json.encode(QuizCollection{
		id:          'ignored'
		title:       'Created collection'
		description: 'Created by test'
		tone:        'blue'
		level:       'Test'
		questions:   []QuizQuestion{}
	})) or {
		assert false, err.msg()
		return
	}
	assert created.id.starts_with('collection-')

	with_question := store.create_question(json.encode(QuizQuestionRequest{
		collection_id: created.id
		topic:         'Basics'
		question:      'What is CRUD?'
		answer:        'Create, read, update, and delete.'
	})) or {
		assert false, err.msg()
		return
	}
	assert with_question.questions.len == 1
	question_id := with_question.questions[0].id

	updated_question := store.update_question(json.encode(QuizQuestionRequest{
		collection_id: created.id
		id:            question_id
		topic:         'Storage'
		question:      'What is durable CRUD?'
		answer:        'CRUD that survives application restarts.'
	})) or {
		assert false, err.msg()
		return
	}
	assert updated_question.questions[0].topic == 'Storage'

	mut renamed := updated_question
	renamed.title = 'Renamed collection'
	updated_collection := store.update_collection(json.encode(renamed)) or {
		assert false, err.msg()
		return
	}
	assert updated_collection.title == 'Renamed collection'

	without_question := store.delete_question(json.encode(QuizQuestionRequest{
		collection_id: created.id
		id:            question_id
	})) or {
		assert false, err.msg()
		return
	}
	assert without_question.questions.len == 0

	store.delete_collection(created.id) or {
		assert false, err.msg()
		return
	}
	assert store.collections.len == 1
	assert os.exists(path)

	database := json.decode(QuizDatabase, os.read_file(path)!) or {
		assert false, err.msg()
		return
	}
	assert database.version == quiz_database_version
	assert database.collections.len == 1
	os.rm(path) or {}
}

fn test_quiz_validation_rejects_empty_question() {
	if _ := validate_question(QuizQuestion{
		id:       'q-1'
		topic:    'Test'
		question: ''
		answer:   'Answer'
	})
	{
		assert false, 'empty question should fail validation'
	} else {
		assert err.msg() == 'Quiz question and answer are required'
	}
}
