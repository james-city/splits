import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ghPages } from 'vite-plugin-gh-pages'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    ghPages({
      preserveCNAME: true,
      onBeforePublish: ({ outDir }) => {
        const CNAME = path.join(outDir, 'CNAME')
        fs.writeFileSync(CNAME, 'splits.james.city')
      }
    })
  ]
})
