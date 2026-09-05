import { z } from 'zod';

const dateKey = z.preprocess(
  (value) =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : null,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
);

export const todoSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    completed: z.boolean(),
    dueDate: dateKey
  })
  .transform((todo) => ({
    ...todo,
    dueDate: todo.dueDate ?? null
  }));

export const chainNoteSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  tag: z.string(),
  updated: z.string(),
  question: z.string(),
  answer: z.string()
});

const paperBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string() }),
  z.object({ type: z.literal('quote'), text: z.string() }),
  z.object({ type: z.literal('list'), items: z.array(z.string()) }),
  z.object({
    type: z.literal('code'),
    language: z.string().optional().default('code'),
    code: z.string()
  })
]);

const paperSectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string(),
  blocks: z.array(z.unknown()).default([])
});

const paperReferenceSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  authors: z.string().optional().default(''),
  year: z.string().optional().default(''),
  title: z.string().optional().default(''),
  type: z.string().optional().default('Other'),
  doi: z.string().optional().default(''),
  url: z.string().optional().default(''),
  text: z.string()
});

const paperAssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().default('image'),
  src: z.string().min(1),
  alt: z.string().default(''),
  caption: z.string().default('')
});

const academicPaperEnvelopeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().default(''),
  authors: z
    .array(
      z.object({
        name: z.string().min(1),
        affiliation: z.string().optional().default('')
      })
    )
    .default([]),
  venue: z.string().optional().default(''),
  year: z.string().optional().default(''),
  abstract: z.string().optional().default(''),
  keywords: z.array(z.string()).default([]),
  sections: z.array(z.unknown()).default([]),
  references: z.array(z.unknown()).default([]),
  assets: z.array(z.unknown()).default([])
});

export function parseTodoRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const result = todoSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

export function parseChainNoteRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const result = chainNoteSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

function parsePaperSection(value) {
  const sectionResult = paperSectionSchema.safeParse(value);
  if (!sectionResult.success) return null;
  return {
    ...sectionResult.data,
    blocks: sectionResult.data.blocks.flatMap((block) => {
      const result = paperBlockSchema.safeParse(block);
      return result.success ? [result.data] : [];
    })
  };
}

function parsePaperReference(value) {
  const result = paperReferenceSchema.safeParse(value);
  if (!result.success) return null;
  return {
    ...result.data,
    id: result.data.id || result.data.label
  };
}

export function parseAcademicPaper(value) {
  const result = academicPaperEnvelopeSchema.safeParse(value);
  if (!result.success) return null;
  return {
    ...result.data,
    sections: result.data.sections.map(parsePaperSection).filter(Boolean),
    references: result.data.references.map(parsePaperReference).filter(Boolean),
    assets: result.data.assets
      .map((asset) => {
        const assetResult = paperAssetSchema.safeParse(asset);
        return assetResult.success ? assetResult.data : null;
      })
      .filter(Boolean)
  };
}

export function parseAcademicPaperRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.map(parseAcademicPaper).filter(Boolean);
}

const quizQuestionSchema = z.object({
  id: z.string().optional(),
  topic: z.string(),
  question: z.string(),
  answer: z.string()
});

const quizCollectionSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string(),
  tone: z.string(),
  level: z.string(),
  questions: z.array(quizQuestionSchema)
});

const quizPayloadSchema = z.union([
  z.string(),
  quizCollectionSchema,
  z.array(quizCollectionSchema)
]);

export function parseQuizPayloadValue(value) {
  const result = quizPayloadSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

const assetRecordSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  kind: z.string().default('other'),
  size: z.number().default(0),
  updated: z.string().default('')
});

export function parseAssetRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const result = assetRecordSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

const audioFeatureSchema = z.object({
  path: z.string().min(1),
  tempo: z.number().positive(),
  key: z.string().default('Unknown'),
  loudnessDb: z.number().default(0),
  durationSec: z.number().default(0)
});

export function parseAudioFeatureRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const result = audioFeatureSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}
