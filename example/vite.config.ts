import { defineConfig } from 'vite'
import Userscript from '../dist'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Userscript({
      externalGlobals: {
        'vue': 'Vue',
        'jquery': ['jQuery', 'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js']
      }
    })
  ]
})
