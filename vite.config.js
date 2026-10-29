import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Las pruebas ya no se configuran aquí: las ejecuta Karma + Jasmine (ver karma.conf.cjs)
export default defineConfig({
  plugins: [react()],
})
