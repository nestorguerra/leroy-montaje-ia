# Del manual al montaje, con OpenAI

Copia independiente de la prueba Leroy Merlin, basada en el motor 3D de [Bygga](https://github.com/Nutlope/bygga), con su licencia MIT y aviso de autoría conservados.

## Usar la aplicación

1. Abre la pestaña **Tu manual con IA**.
2. Introduce tu propia API Key de OpenAI. Se oculta por defecto; puedes mostrarla o borrarla.
3. Sube un PDF completo o hasta 12 imágenes de sus páginas, con un máximo total de 20 MB. Ordena las imágenes con las flechas.
4. Elige el modelo y pulsa **Crear mi guía animada**. El consumo se factura en tu proyecto de OpenAI.
5. Contrasta los pasos con el manual. Cambia entre producto, piezas y montaje; gira, pausa o repite la animación.
6. Reproduce la secuencia completa o descarga un vídeo con los pasos escritos. Puedes guardar también el JSON de la interpretación.

La mesa DAY y la cómoda SPACEO NEO siguen disponibles como ejemplos preparados a mano, sin clave y sin consumo de API.

## Clave y archivos

Esta versión estática funciona en GitHub Pages y hace la petición directamente desde el navegador a `https://api.openai.com/v1/responses`. Cada usuario aporta su propia clave. No hay una clave del propietario en el código ni en GitHub Secrets.

La aplicación conserva la clave solo en el estado de React durante la sesión de la pestaña. No usa cookies, localStorage, sessionStorage, IndexedDB ni un servidor propio para guardarla. No registra la clave ni el contenido de los manuales. El botón de borrar elimina la clave del estado y cancela una petición pendiente.

El manual se envía a OpenAI solo al pulsar el botón de generar. Se usa `store: false`; esto no elimina las políticas de tratamiento o retención que OpenAI aplique a la cuenta. Los enlaces al manual original son URLs locales temporales y caducan al cerrar la página. El JSON y el vídeo no incluyen la clave ni el archivo original.

Una clave usada en el navegador es accesible para el propio navegador, sus extensiones y quien controle ese dispositivo. Esta opción está pensada como prueba personal con clave propia. Para un servicio con una clave compartida, hace falta un servidor con autenticación y control de gasto. OpenAI documenta este límite en su [biblioteca JavaScript](https://developers.openai.com/api/reference/typescript).

## Qué genera y qué no

OpenAI interpreta el inventario y los pasos usando el PDF (texto e imágenes) o las fotografías. Devuelve un objeto con un esquema estricto. La aplicación comprueba tipos, límites, referencias de piezas, páginas declaradas, uso de todas las piezas y correspondencia de las posiciones finales antes de enviarlo al motor de Bygga. Esta validación comprueba consistencia de los datos; no demuestra que la lectura del manual sea correcta.

La geometría usa cajas y cilindros. Las dimensiones, uniones y movimientos inferidos se señalan como aproximados. El manual sigue siendo la referencia: no usar el dibujo para fabricar, taladrar o validar anclajes. El número de página y el orden interpretados por la IA también pueden contener errores.

El vídeo es una grabación de la animación 3D con los pasos escritos, sin audio. No es un vídeo fotorrealista ni una generación con Sora. Se exporta en tiempo real con MediaRecorder, en WebM o MP4 según el navegador. Hay que mantener la pestaña visible. El modelo no genera archivos de código ni ejecuta instrucciones incluidas en el manual.

No se reintentan automáticamente peticiones fallidas, incompletas o canceladas. Cancelar la espera no garantiza que OpenAI no haya procesado o facturado la petición. No se incluyen galerías públicas ni almacenamiento de manuales.

## Desarrollo local

Node.js 24 y pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abre `http://localhost:3000`. No hace falta un archivo `.env`.

```sh
pnpm typecheck
pnpm lint
NEXT_PUBLIC_BASE_PATH=/leroy-montaje-ia pnpm build
```

El resultado estático está en `out/`. GitHub Actions compila y publica al actualizar `main`. GitHub Pages debe tener **GitHub Actions** como fuente. La variable `NEXT_PUBLIC_BASE_PATH` contiene solo el nombre público del repositorio, nunca una clave.

## Código y procedencia

- `src/app/prueba-leroy/`: interfaz y ejemplos originales ampliados.
- `src/components/ManualStudio.tsx`: clave, archivos y guía generada.
- `src/lib/ai/openai.ts`: única llamada de red de IA, límites y errores.
- `src/lib/ai/guide.ts`: esquema, comprobaciones y conversión al plan 3D.
- `src/lib/video.ts`: exportación de vídeo en el dispositivo.
- `src/engine/`: motor 3D de Bygga.
- `src/lib/leroy/` y `src/data/leroy-*.json`: ejemplos heredados y sus fuentes.
- `docs/prueba-leroy/procedencia.json`: procedencia de los ejemplos originales.

Documentación de integración consultada el 7 de noviembre de 2026: [archivos PDF](https://developers.openai.com/api/docs/guides/file-inputs), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [exportación estática de Next.js](https://nextjs.org/docs/app/guides/static-exports) y [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Proyecto experimental independiente, sin afiliación oficial con Leroy Merlin. La licencia MIT no concede derechos sobre marcas ni manuales de terceros.
