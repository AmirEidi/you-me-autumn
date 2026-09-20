import { useCallback, useEffect, useMemo, useState } from 'react'
import App from '../App'
import rawStory from '../story.json'
import {
  BACKGROUNDS,
  KINDS,
  emptyScene,
  resolveScene,
  toFaNumber,
  type Background,
  type Kind,
  type StoryScene,
} from '../story'
import './editor.css'

type SaveState = { status: 'idle' | 'saving' | 'saved' | 'error'; message?: string }

const clone = (scenes: StoryScene[]): StoryScene[] => JSON.parse(JSON.stringify(scenes))

export function StoryEditor() {
  const [saved, setSaved] = useState<StoryScene[]>(() => clone(rawStory as StoryScene[]))
  const [draft, setDraft] = useState<StoryScene[]>(() => clone(rawStory as StoryScene[]))
  const [selected, setSelected] = useState(0)
  const [save, setSave] = useState<SaveState>({ status: 'idle' })
  const [mediaFiles, setMediaFiles] = useState<string[]>([])

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved])
  const scene = draft[selected]

  // Real paths under public/media, so a src is picked from what exists instead of guessed.
  useEffect(() => {
    fetch('/__media')
      .then((res) => res.json())
      .then(setMediaFiles)
      .catch(() => setMediaFiles([]))
  }, [])

  // The preview renders the real site component, so what shows here is what ships.
  const previewScenes = useMemo(() => draft.map(resolveScene), [draft])

  const patch = (changes: Partial<StoryScene>) => {
    setDraft((scenes) => scenes.map((item, i) => (i === selected ? { ...item, ...changes } : item)))
  }

  const commit = useCallback(async () => {
    setSave({ status: 'saving' })
    try {
      const response = await fetch('/__story', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!response.ok) throw new Error(await response.text())

      setSaved(clone(draft))
      setSave({ status: 'saved', message: 'saved to src/story.json' })
    } catch (error) {
      setSave({ status: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }, [draft])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void commit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commit])

  useEffect(() => {
    if (save.status !== 'saved') return
    const timer = setTimeout(() => setSave({ status: 'idle' }), 2500)
    return () => clearTimeout(timer)
  }, [save.status])

  const move = (from: number, to: number) => {
    if (to < 0 || to >= draft.length) return
    setDraft((scenes) => {
      const next = [...scenes]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setSelected(to)
  }

  const addScene = () => {
    setDraft((scenes) => {
      const next = [...scenes]
      next.splice(selected + 1, 0, emptyScene())
      return next
    })
    setSelected((index) => index + 1)
  }

  const duplicateScene = () => {
    setDraft((scenes) => {
      const next = [...scenes]
      const copy = JSON.parse(JSON.stringify(scenes[selected])) as StoryScene
      copy.id = copy.id + '-copy'
      next.splice(selected + 1, 0, copy)
      return next
    })
    setSelected((index) => index + 1)
  }

  const deleteScene = () => {
    if (draft.length === 1) return
    setDraft((scenes) => scenes.filter((_, i) => i !== selected))
    setSelected((index) => Math.max(0, index - 1))
  }

  // The hand-written scene labels drifted out of step with the real order.
  const renumber = () => {
    setDraft((scenes) =>
      scenes.map((item, i) =>
        item.kind === 'choice' ? item : { ...item, eyebrow: 'صحنه ' + toFaNumber(i + 1) },
      ),
    )
  }

  const duplicateIds = useMemo(() => {
    const seen = new Set<string>()
    const dupes = new Set<string>()
    for (const item of draft) {
      if (seen.has(item.id)) dupes.add(item.id)
      seen.add(item.id)
    }
    return dupes
  }, [draft])

  if (!scene) return null

  return (
    <div className="editor">
      <header className="editor-bar">
        <strong>Scene editor</strong>
        <span className="editor-hint">src/story.json · dev only</span>
        <span className="editor-spacer" />
        {duplicateIds.size > 0 && (
          <span className="editor-warn">duplicate id: {[...duplicateIds].join(', ')}</span>
        )}
        {save.message && (
          <span className={save.status === 'error' ? 'editor-warn' : 'editor-ok'}>{save.message}</span>
        )}
        <button type="button" onClick={renumber}>
          Renumber
        </button>
        <button type="button" onClick={() => setDraft(clone(saved))} disabled={!dirty}>
          Revert
        </button>
        <button type="button" className="primary" onClick={() => void commit()} disabled={!dirty}>
          {save.status === 'saving' ? 'Saving...' : dirty ? 'Save (Ctrl+S)' : 'Saved'}
        </button>
      </header>

      <div className="editor-body">
        <aside className="editor-list">
          {draft.map((item, index) => (
            <button
              key={item.id + '-' + index}
              type="button"
              className={index === selected ? 'scene-item active' : 'scene-item'}
              onClick={() => setSelected(index)}
            >
              <span className="scene-num">{index + 1}</span>
              <span className="scene-id">{item.id}</span>
              <span className="scene-peek" dir="rtl">
                {item.lines[0] ?? ''}
              </span>
            </button>
          ))}

          <div className="list-actions">
            <button type="button" onClick={addScene}>
              + Add
            </button>
            <button type="button" onClick={duplicateScene}>
              Duplicate
            </button>
            <button type="button" onClick={deleteScene} disabled={draft.length === 1}>
              Delete
            </button>
          </div>
        </aside>

        <section className="editor-form">
          <div className="row">
            <label>
              <span>id</span>
              <input value={scene.id} onChange={(e) => patch({ id: e.target.value })} />
            </label>
            <label>
              <span>order</span>
              <span className="move-btns">
                <button type="button" onClick={() => move(selected, selected - 1)} disabled={selected === 0}>
                  up
                </button>
                <button
                  type="button"
                  onClick={() => move(selected, selected + 1)}
                  disabled={selected === draft.length - 1}
                >
                  down
                </button>
              </span>
            </label>
          </div>

          <div className="row">
            <label>
              <span>background</span>
              <select
                value={scene.background}
                onChange={(e) => patch({ background: e.target.value as Background })}
              >
                {BACKGROUNDS.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>kind</span>
              <select
                value={scene.kind ?? ''}
                onChange={(e) => patch({ kind: (e.target.value || undefined) as Kind | undefined })}
              >
                <option value="">(plain text)</option>
                {KINDS.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>eyebrow</span>
            <input
              dir="rtl"
              value={scene.eyebrow ?? ''}
              onChange={(e) => patch({ eyebrow: e.target.value })}
            />
          </label>

          <label>
            <span>lines — one paragraph per line</span>
            <textarea
              dir="rtl"
              rows={10}
              value={scene.lines.join('\n')}
              onChange={(e) => patch({ lines: e.target.value.split('\n') })}
            />
          </label>

          <label>
            <span>button text</span>
            <input dir="rtl" value={scene.cta} onChange={(e) => patch({ cta: e.target.value })} />
          </label>

          <fieldset>
            <legend>
              media
              <button
                type="button"
                className="tiny"
                onClick={() =>
                  patch({
                    media: scene.media
                      ? undefined
                      : { type: 'video', src: mediaFiles[0] ?? '', alt: '', caption: '', fallback: '' },
                  })
                }
              >
                {scene.media ? 'remove' : 'add'}
              </button>
            </legend>

            {scene.media && (
              <>
                <div className="row">
                  <label>
                    <span>type</span>
                    <select
                      value={scene.media.type}
                      onChange={(e) =>
                        patch({ media: { ...scene.media!, type: e.target.value as 'video' | 'image' } })
                      }
                    >
                      <option value="video">video</option>
                      <option value="image">image</option>
                    </select>
                  </label>
                  <label>
                    <span>src — relative to public/</span>
                    <input
                      list="media-files"
                      value={scene.media.src}
                      onChange={(e) => patch({ media: { ...scene.media!, src: e.target.value } })}
                    />
                  </label>
                </div>
                <label>
                  <span>alt</span>
                  <input
                    dir="rtl"
                    value={scene.media.alt}
                    onChange={(e) => patch({ media: { ...scene.media!, alt: e.target.value } })}
                  />
                </label>
                <div className="row">
                  <label>
                    <span>caption</span>
                    <input
                      dir="rtl"
                      value={scene.media.caption ?? ''}
                      onChange={(e) => patch({ media: { ...scene.media!, caption: e.target.value } })}
                    />
                  </label>
                  <label>
                    <span>fallback text</span>
                    <input
                      dir="rtl"
                      value={scene.media.fallback ?? ''}
                      onChange={(e) => patch({ media: { ...scene.media!, fallback: e.target.value } })}
                    />
                  </label>
                </div>
              </>
            )}
          </fieldset>

          <fieldset>
            <legend>
              music
              <button
                type="button"
                className="tiny"
                onClick={() =>
                  patch({
                    music: scene.music
                      ? undefined
                      : { title: '', src: mediaFiles.find((file) => file.endsWith('.mp3')) ?? '' },
                  })
                }
              >
                {scene.music ? 'remove' : 'add'}
              </button>
            </legend>

            {scene.music && (
              <div className="row">
                <label>
                  <span>title</span>
                  <input
                    value={scene.music.title}
                    onChange={(e) => patch({ music: { ...scene.music!, title: e.target.value } })}
                  />
                </label>
                <label>
                  <span>src — relative to public/</span>
                  <input
                    list="media-files"
                    value={scene.music.src}
                    onChange={(e) => patch({ music: { ...scene.music!, src: e.target.value } })}
                  />
                </label>
              </div>
            )}
          </fieldset>

          <datalist id="media-files">
            {mediaFiles.map((file) => (
              <option key={file} value={file} />
            ))}
          </datalist>
        </section>

        <section className="editor-preview">
          <App scenes={previewScenes} previewIndex={selected} />
        </section>
      </div>
    </div>
  )
}
