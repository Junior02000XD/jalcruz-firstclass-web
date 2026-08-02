# Jalcruz / First Class — Web

SPA en React + Vite que sirve de interfaz al CRM de las empresas de la familia Cruz,
consumiendo la [jalcruz-firstclass-api](https://github.com/Junior02000XD/jalcruz-firstclass-api).

**Dos módulos sobre la misma app:**

- **Jalcruz (RRHH):** empresas, áreas de trabajo, trabajadores, planillas y asistencia.
- **First Class (CRM):** campañas, prospectos, clases de prueba, profesores, seguimiento
  de ventas y embudo de conversión.

## Stack

- React 19 + Vite (JSX)
- React Router — navegación SPA
- Tailwind CSS — estilos
- Axios — cliente HTTP
- Lucide React — iconografía

## Cómo correr

Requiere Node.js 20+ y la
[jalcruz-firstclass-api](https://github.com/Junior02000XD/jalcruz-firstclass-api)
corriendo localmente.

```bash
git clone https://github.com/Junior02000XD/jalcruz-firstclass-web
cd jalcruz-firstclass-web
npm install
npm run dev
```

No hay nada que configurar para desarrollar: `.env.development` está commiteado
y ya apunta a `http://localhost:5035/api`, el puerto del perfil `http` de la API.

## Configuración

La URL de la API sale de una sola variable de entorno, **`VITE_API_URL`**, que
lee `src/api/axios.js`. **Incluye el `/api` final** (los controllers de la API
cuelgan de ahí):

| Entorno | De dónde sale |
|---|---|
| Desarrollo (`npm run dev`) | `.env.development`, commiteado — `http://localhost:5035/api` |
| Producción (Cloudflare Pages) | *Settings → Environment variables* — `https://<servicio>.up.railway.app/api` |

Vite la **hornea en el bundle en tiempo de build**: cambiarla no tiene efecto
hasta un redespliegue, no es configuración de runtime.

Si falta en un build de producción, el build **falla** con el motivo en claro
(`vite.config.js`) en vez de compilar contra un fallback que recién se rompería
en el navegador. `.env.development` no se lee en producción, así que no la tapa.

> El dominio del panel también tiene que estar en `Cors__AllowedOrigins` de la
> API, o el navegador bloquea las llamadas por CORS.
