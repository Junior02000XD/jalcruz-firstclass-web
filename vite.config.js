import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // loadEnv junta los archivos .env del proyecto con las variables reales del
  // entorno, que es como las inyecta Cloudflare Pages durante el build.
  // El '.' es el directorio de los .env: se usa en vez de process.cwd() porque
  // eslint trata este archivo con globals de navegador y `process` no existe
  // ahí. Resuelven a lo mismo, vite corre desde la raíz del proyecto.
  const env = loadEnv(mode, '.', '')

  // El build de producción falla si falta VITE_API_URL, en vez de hornear un
  // fallback a localhost. El fallback era peor que un error: compilaba bien y
  // recién fallaba en el navegador —bloqueado por mixed content— así que un
  // olvido de configuración se veía como "error de red" y no como lo que era.
  // En desarrollo no hace falta el chequeo: .env.development ya trae la URL.
  if (command === 'build' && !env.VITE_API_URL) {
    throw new Error(
      'Falta VITE_API_URL: es la URL base de la API e incluye el /api final ' +
      '(ej. https://<servicio>.up.railway.app/api). ' +
      'En Cloudflare Pages se carga en Settings -> Environment variables, ' +
      'y hay que redesplegar para que tome efecto.'
    )
  }

  return {
    plugins: [react()],
  }
})
