import type { APIRoute } from 'astro'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// A single maintained skill source also serves the downloadable website file.
export const GET: APIRoute = async () =>
  new Response(await readFile(resolve('../skills/ticker/SKILL.md'), 'utf8'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
