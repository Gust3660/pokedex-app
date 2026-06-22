# Pokédex

Aplicación React para consultar todos los Pokémon disponibles mediante [PokéAPI](https://pokeapi.co/).

Es una PWA instalable con soporte offline para la aplicación y los Pokémon visitados. El service worker se activa únicamente en builds de producción.

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build
```

El catálogo obtiene dinámicamente el total publicado por PokéAPI. La carga visual se realiza en páginas de 20 Pokémon y la búsqueda descarga únicamente los detalles que todavía no están en memoria.

## Despliegue en Netlify

El proyecto incluye `netlify.toml` y `.nvmrc`. Al importar el repositorio en Netlify no es necesario configurar manualmente el build:

- Comando: `npm run build`
- Directorio publicado: `dist`
- Node.js: `22.12.0`

Netlify aplicará automáticamente el fallback de SPA, los headers de seguridad y las políticas de caché necesarias para actualizar correctamente la PWA.

Puedes conectar el repositorio desde **Add new site → Import an existing project**. Como alternativa, ejecuta `npm run build` y arrastra la carpeta `dist` a Netlify Drop.
