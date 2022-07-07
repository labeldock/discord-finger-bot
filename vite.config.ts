import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const path = require('path')

// https://vitejs.dev/config/
export default ({ mode })=>{
  const dc = defineConfig({
    plugins: [react()],
    resolve:{
      alias:{
        '~' : path.resolve(__dirname, './src')
      }
    },
    server:{
      hmr:/stage|production/.test(process.env.SERVE_ENV) ? false : undefined
    }
  })  
  console.log('definec', dc)

  return defineConfig({
    plugins: [react()],
    resolve:{
      alias:{
        '~' : path.resolve(__dirname, './src')
      }
    },
    server:{
      hmr:/stage|production/.test(process.env.SERVE_ENV) ? false : undefined
    }
  })  
}

