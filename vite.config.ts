import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { storyEditor } from './plugins/story-editor'

export default defineConfig({
  plugins: [react(), storyEditor()],
  base: '/you-me-autumn/',
})
