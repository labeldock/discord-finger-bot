import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
const path = require('path')

// https://vitejs.dev/config/
export default ({ mode })=>{
  const { VITE_API_BASEURL } = loadEnv(mode, process.cwd())
  return defineConfig({
    plugins: [react()],
    resolve:{
      alias:{
        '~' : path.resolve(__dirname, './src')
      }
    },
    server:{ 
      port: 3333,
      strictPort: true,
      proxy:{
        '/api': {
          target: VITE_API_BASEURL, //http://192.168.1.234:6600
          changeOrigin: true,
          secure: false,      
          ws: true,
        }
      },
    },
  })  
}

