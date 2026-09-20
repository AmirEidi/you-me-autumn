import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const ENDPOINT = '/__story'
const MEDIA_ENDPOINT = '/__media'
const MAX_BODY = 5_000_000

/**
 * Dev-only bridge that lets the in-browser scene editor save straight to
 * src/story.json. `apply: 'serve'` keeps it out of production builds, so the
 * deployed site ships no write endpoint.
 */
export function storyEditor(): Plugin {
  return {
    name: 'story-editor',
    apply: 'serve',
    configureServer(server) {
      const target = resolve(server.config.root, 'src/story.json')

      // Lets the editor offer the files that actually exist in public/media,
      // instead of the author guessing a path and getting a silent 404.
      server.middlewares.use(MEDIA_ENDPOINT, async (_req, res) => {
        try {
          const dir = resolve(server.config.root, 'public/media')
          const entries = await readdir(dir, { withFileTypes: true })
          const files = entries
            .filter((entry) => entry.isFile() && !entry.name.endsWith('.md'))
            .map((entry) => `media/${entry.name}`)
            .sort()

          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(files))
        } catch {
          res.setHeader('content-type', 'application/json')
          res.end('[]')
        }
      })

      server.middlewares.use(ENDPOINT, (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('POST only')
          return
        }

        let body = ''
        let aborted = false

        req.on('data', (chunk) => {
          if (aborted) return
          body += chunk
          if (body.length > MAX_BODY) {
            aborted = true
            res.statusCode = 413
            res.end('story too large')
            req.destroy()
          }
        })

        req.on('end', async () => {
          if (aborted) return
          try {
            const { base, scenes } = JSON.parse(body)
            if (!Array.isArray(scenes)) throw new Error('expected an array of scenes')

            // A tab left open from an earlier session holds a stale draft, and a
            // blind write would silently discard whatever reached the file since.
            // Compare against what that editor actually loaded, and refuse if it moved.
            if (typeof base === 'string') {
              const current = JSON.stringify(JSON.parse(await readFile(target, 'utf8')))
              if (current !== base) {
                res.statusCode = 409
                res.end(
                  'src/story.json changed on disk since this editor loaded it. ' +
                    'Reload the page to pick up that version — saving now would discard it.',
                )
                return
              }
            }

            await writeFile(target, `${JSON.stringify(scenes, null, 2)}\n`, 'utf8')

            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ ok: true, scenes: scenes.length }))
            server.config.logger.info(`[story-editor] saved ${scenes.length} scenes to src/story.json`)
          } catch (error) {
            res.statusCode = 400
            res.end(String(error instanceof Error ? error.message : error))
          }
        })
      })
    },
  }
}
