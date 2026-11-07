# Montaje. Tu manual, en movimiento.

[Abrir la aplicación](https://nestorguerra.github.io/leroy-montaje-ia/)

Copia independiente de la prueba Leroy Merlin, basada en el motor 3D de [Bygga](https://github.com/Nutlope/bygga). Se conservan su licencia MIT y aviso de autoría.

## Uso

1. Arrastra el PDF completo del manual, hasta 20 MB, o toca la zona para elegirlo.
2. Si hace falta, introduce tu API Key de OpenAI. Solo se pide una vez por sesión.
3. La guía aparece automáticamente: animación a la izquierda y pasos a la derecha. En móvil, los pasos quedan debajo.

Elegir un paso cambia la animación. El vídeo se prepara en el dispositivo mientras la guía ya está disponible. Después se puede reproducir, recorrer o guardar con los controles del reproductor. Para empezar otra guía, basta con arrastrar otro PDF.

No hay selectores de productos, modelos, inventario ni un botón adicional de generación. La mesa DAY aparece como ejemplo visual en la portada. Los datos originales de DAY y SPACEO NEO se conservan en el código.

## Clave y archivos

GitHub Pages sirve una aplicación estática. La petición va directamente del navegador a `https://api.openai.com/v1/responses`, con la clave aportada por cada usuario. No se incluye una clave del propietario en el código ni en GitHub Secrets.

La clave se mantiene en memoria de React. Se borra al recargar o al pulsar **Desconectar** dentro de la conexión OpenAI. No se guarda en cookies, localStorage, sessionStorage, IndexedDB ni un servidor propio. No se registra la clave ni el contenido de los manuales.

Soltar o elegir un PDF inicia la petición si ya hay una clave. En caso contrario, conectar la clave inicia el manual pendiente. Se usa `store: false`; esto no elimina las políticas de tratamiento o retención aplicables a la cuenta de OpenAI. El consumo se factura en esa cuenta de API.

Una clave usada en el navegador puede ser leída por el propio navegador, sus extensiones y quien controle el dispositivo. Este prototipo usa una clave personal por sesión. Un servicio con una clave compartida requiere un servidor con autenticación y control de gasto. Véase la [biblioteca JavaScript de OpenAI](https://developers.openai.com/api/reference/typescript).

El manual original solo tiene una URL local temporal en la pestaña. No se publica en GitHub. El vídeo no contiene la clave ni el PDF original.

## Comprobación y revisión de la respuesta

OpenAI interpreta el PDF con `gpt-5.4-mini` y devuelve un objeto con esquema estricto. El programa comprueba medidas, páginas declaradas, ids únicos, referencias, uso de todas las piezas y correspondencia entre los pasos y las posiciones finales. Esta consistencia no demuestra la fidelidad de la interpretación.

La corrección del aviso «pieza inexistente o repetida» distingue estos casos:

- Una repetición exactamente idéntica se elimina sin cambiar acciones o posiciones.
- Los espacios accidentales de una referencia solo se recortan si el resultado coincide exactamente con un id existente.
- Una referencia inexistente o dos poses diferentes para una pieza en el mismo paso se rechazan. Se solicita una única revisión con el manual original y el error preciso. La nueva respuesta debe superar de nuevo todas las comprobaciones.

La revisión puede consumir una segunda llamada de API. Se informa de ello antes de conectar y durante el proceso. Nunca se inventa una pieza ni se elimina una acción contradictoria para aceptar el resultado. Si falla la revisión, se muestra el error y no se presenta un montaje incoherente.

Los errores de red, clave, saldo, rechazo, respuesta incompleta y manual insuficiente no se reintentan automáticamente. Cancelar la espera no garantiza que OpenAI no haya procesado o facturado la petición anterior.

## Representación y vídeo

La geometría usa cajas y cilindros. Las medidas y posiciones inferidas se marcan como aproximadas. El manual sigue siendo la referencia para herrajes, cargas, taladros, uniones y anclajes. El número de página y el orden interpretados también pueden contener errores.

El vídeo graba la animación 3D con sus pasos escritos, sin audio. Se genera en tiempo real con MediaRecorder, en WebM o MP4 según el navegador. La preparación se pausa si se oculta la pestaña y continúa al volver. Si el navegador no permite grabarlo, la animación y los pasos siguen disponibles. Con movimiento reducido, la reproducción visible empieza pausada.

El modelo no genera código ejecutable ni recibe herramientas. Las instrucciones incluidas dentro del PDF se tratan como datos, no como órdenes.

## Desarrollo

Node.js 24 y pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abrir `http://localhost:3000`. No hace falta `.env`.

```sh
pnpm typecheck
pnpm lint
pnpm test
NEXT_PUBLIC_BASE_PATH=/leroy-montaje-ia pnpm build
```

GitHub Actions ejecuta las comprobaciones y publica `out/` al actualizar `main`. GitHub Pages utiliza **GitHub Actions** como fuente. `NEXT_PUBLIC_BASE_PATH` solo contiene la ruta pública del repositorio.

## Código y fuentes

- `src/components/ManualStudio.tsx`: recorrido de PDF, conexión y estados.
- `src/components/montage/`: carga, diálogo y reproductor con pasos.
- `src/app/prueba-leroy/montage.css`: diseño adaptable.
- `src/lib/ai/openai.ts`: peticiones y revisión limitada.
- `src/lib/ai/guide.ts`: esquema, validación y conversión al plan 3D.
- `src/lib/video.ts`: grabación y capítulos en el dispositivo.
- `tests/guide.test.mjs`: regresiones de referencias y revisión.
- `src/engine/`: motor 3D de Bygga.
- `src/lib/leroy/`, `src/data/leroy-*.json` y `docs/prueba-leroy/procedencia.json`: ejemplos originales.
- [Decisiones de UX y referencias](docs/diseno-ux.md).
- [Comprobaciones y límites](docs/validacion.md).

Documentación consultada el 7 de noviembre de 2026: [PDF](https://developers.openai.com/api/docs/guides/file-inputs), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [estado de conversación](https://developers.openai.com/api/docs/guides/conversation-state), [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [exportación estática de Next.js](https://nextjs.org/docs/app/guides/static-exports) y [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Proyecto experimental independiente, sin afiliación oficial con Leroy Merlin. La licencia MIT no concede derechos sobre marcas ni manuales de terceros.
