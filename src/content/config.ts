import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders'

export const attachmentSchema = z
  .object({
    id: z.string(),
    url: z.string().url(),
    size: z.number().int().nonnegative(),
    type: z.string(),

    // These are present for images, but keeping them optional makes the schema reusable if you later attach PDFs/audio, etc.
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),

    filename: z.string(),
    cleanFilename: z.string().optional(),
    aspectRatio: z.number().positive().optional(),
  })
  .strict()

export const articleSchema = z
  .object({
    __syncedAt: z.string().datetime(),

    cover: z.array(attachmentSchema).default([]),
    coverSource: z.array(attachmentSchema).default([]),

    index: z.number().int().nonnegative(),

    lastModified: z.string().datetime(),
    lastModifiedX: z.number().int(),

    recordId: z.string(),
    status: z.enum(["Draft", "Published", "Archived"]),

    text: z.string().default(""),
    title: z.string().min(1),
    slug: z.string(),
  })
  .strict()
  .transform((d) => ({ ...d, id: d.slug }))

const articles = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/articles',
  }),
  schema: articleSchema,
});

export const collections = {
  articles,
};

export type Attachment = z.infer<typeof attachmentSchema>;
export type Article = z.infer<typeof articleSchema>;
