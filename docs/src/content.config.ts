import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
const docs = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/docs',
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
  }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    locale: z.enum(['en']),
    sidebar: z.object({
      group: z.enum(['start', 'guides', 'reference', 'api']),
      order: z.number().int().positive(),
    }),
  }),
})
export const collections = { docs }
