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

Configurar la URL base de la API en `src/api/axios.js`.
