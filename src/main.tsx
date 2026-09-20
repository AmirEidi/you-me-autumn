import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)

// `?edit` opens the scene editor. The check is on import.meta.env.DEV, so the
// editor is dropped from the production bundle and cannot be reached on the
// deployed site — it only exists while `npm run dev` is running.
const wantsEditor = import.meta.env.DEV && new URLSearchParams(window.location.search).has('edit')

if (wantsEditor) {
  void import('./editor/StoryEditor').then(({ StoryEditor }) => {
    root.render(
      <StrictMode>
        <StoryEditor />
      </StrictMode>,
    )
  })
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
