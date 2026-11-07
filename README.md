# Montaje. Tu manual, en movimiento.

[Abrir la aplicación](https://nestorguerra.github.io/leroy-montaje-ia/)

Copia independiente de la prueba Leroy Merlin, basada en el motor 3D de [Bygga](https://github.com/Nutlope/bygga). Se conservan su licencia MIT y aviso de autoría.

## Uso

1. Arrastra el PDF completo del manual, hasta 20 MB, o toca la zona para elegirlo.
2. Si hace falta, introduce tu API Key de OpenAI. Solo se pide una vez por sesión.
3. La guía aparece automáticamente con tres vistas: **Producto**, **Piezas** y **Montaje**. En móvil, la información queda debajo del modelo.

Arrastra el modelo para girarlo, usa la rueda o pellizca para acercarte. En **Producto** ves el resultado final. En **Piezas** puedes buscar por nombre o código y aislar una unidad. Las piezas idénticas se agrupan sin perder sus cantidades. En **Montaje** puedes reproducir la secuencia, pausar, avanzar dentro de cada paso, saltar al anterior o siguiente, repetir y reducir la velocidad. Puedes seguir girando y ampliando el modelo mientras se reproduce.

El menú **Vistas** ofrece perspectiva, frente, lado y vista superior. **Centrar vista** recupera el encuadre inicial. Con el visor enfocado, las flechas giran, más y menos cambian el zoom, cero centra y espacio reproduce o pausa. Las pestañas admiten flechas, Inicio y Fin. La lista de pasos mantiene visible el paso actual sin desplazar toda la página.

Al elegir un paso en pausa, ves cómo queda. Al reproducirlo, ves cómo se realiza. Elegir el último paso no reinicia la guía; terminar la reproducción completa sí permite volver al principio.

Para empezar otra guía, basta con arrastrar otro PDF. No hay selectores de productos o modelos ni un botón adicional de generación. La mesa DAY aparece como ejemplo visual en la portada. Los datos originales de DAY y SPACEO NEO se conservan en el código.

## Clave y archivos

GitHub Pages sirve una aplicación estática. La petición va directamente del navegador a `https://api.openai.com/v1/responses`, con la clave aportada por cada usuario. No se incluye una clave del propietario en el código ni en GitHub Secrets.

La clave se mantiene en memoria de React. Se borra al recargar o al pulsar **Desconectar** dentro de la conexión OpenAI. No se guarda en cookies, localStorage, sessionStorage, IndexedDB ni un servidor propio. No se registra la clave ni el contenido de los manuales.

Soltar o elegir un PDF inicia la petición si ya hay una clave. En caso contrario, conectar la clave inicia el manual pendiente. Se usa `store: false`; esto no elimina las políticas de tratamiento o retención aplicables a la cuenta de OpenAI. El consumo se factura en esa cuenta de API.

Una clave usada en el navegador puede ser leída por el propio navegador, sus extensiones y quien controle el dispositivo. Este prototipo usa una clave personal por sesión. Un servicio con una clave compartida requiere un servidor con autenticación y control de gasto. Véase la [biblioteca JavaScript de OpenAI](https://developers.openai.com/api/reference/typescript).

El manual original solo tiene una URL local temporal en la pestaña. No se publica en GitHub.

## Comprobación y revisión de la respuesta

OpenAI interpreta el PDF con **`gpt-6.1-sol` y `reasoning.effort: "xhigh"` (Muy alto)**. No se cambia a otro modelo si el proyecto no tiene acceso. La respuesta usa un esquema estricto y un máximo de 64.000 tokens de salida, que incluye el razonamiento. La espera admite hasta 15 minutos y puede cancelarse.

El formato de generación evita dos fuentes de incoherencia de las versiones anteriores:

- Cada pieza contiene sus propios movimientos y el índice del paso en que ocurren. El programa asigna los ids y construye las referencias. La IA no tiene que repetir identificadores entre inventario y animación.
- La posición final se obtiene del último movimiento de la pieza. No se pide una segunda copia de las coordenadas que luego deba coincidir.
- Los cilindros declaran un solo diámetro. Cada pieza física repetida mantiene una entrada independiente, aunque comparta el código impreso con otras piezas.

Se comprueban medidas positivas, páginas declaradas, índices de pasos, piezas sin movimientos y movimientos contradictorios. Los movimientos idénticos repetidos se deduplican. El plan compilado vuelve a superar la validación de ids, referencias y poses finales antes de llegar al motor 3D. Esta consistencia no demuestra la fidelidad de la interpretación.

La respuesta llega por streaming SSE. Solo se acepta el evento final con la guía completa; los fragmentos de JSON no se muestran como un montaje. Una desconexión o una respuesta incompleta detiene el proceso.

La revisión puede consumir una segunda llamada de API. Se informa de ello antes de conectar y durante el proceso. Nunca se inventa una pieza ni se elimina una acción contradictoria para aceptar el resultado. Si falla la revisión, se muestra el error y no se presenta un montaje incoherente.

Los errores de red, clave, saldo, rechazo, respuesta incompleta y manual insuficiente no se reintentan automáticamente. Cancelar la espera no garantiza que OpenAI no haya procesado o facturado la petición anterior.

## Representación interactiva

La geometría usa cajas y cilindros. Las medidas y posiciones inferidas se marcan como aproximadas. El manual sigue siendo la referencia para herrajes, cargas, taladros, uniones y anclajes. El número de página y el orden interpretados también pueden contener errores.

La guía conserva el mismo lienzo 3D durante toda la sesión. No graba ni sustituye automáticamente la escena por un vídeo plano. La orientación elegida se mantiene al avanzar de paso. La reproducción usa el reloj del motor 3D para sincronizar los controles y los movimientos, también a media velocidad. Con movimiento reducido, el montaje empieza pausado y las vistas de producto y piezas aparecen sin transiciones.

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
- `src/components/montage/`: carga, diálogo, vistas, inventario y reproducción interactiva.
- `src/app/prueba-leroy/montage.css`: diseño adaptable.
- `src/lib/ai/openai.ts`: peticiones y revisión limitada.
- `src/lib/ai/blueprint.ts`: formato de generación y compilador de movimientos por pieza.
- `src/lib/ai/response.ts`: lectura de eventos SSE y cancelación.
- `src/lib/ai/guide.ts`: formato interno, validación y conversión al plan 3D.
- `src/lib/assembly-inventory.ts`: agrupación de piezas conservando las cantidades y referencias.
- `src/lib/video.ts`: utilidades de duración y grabación conservada fuera del recorrido principal.
- `tests/guide.test.mjs`: regresiones de referencias, revisión e inventario.
- `src/engine/`: motor 3D de Bygga.
- `src/lib/leroy/`, `src/data/leroy-*.json` y `docs/prueba-leroy/procedencia.json`: ejemplos originales.
- [Decisiones de UX y referencias](docs/diseno-ux.md).
- [Comprobaciones y límites](docs/validacion.md).

Documentación consultada el 7 de noviembre de 2026: [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [migración a GPT-6](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra#migration-quickstart), [PDF](https://developers.openai.com/api/docs/guides/file-inputs), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [streaming](https://developers.openai.com/api/docs/guides/streaming-responses), [estado de conversación](https://developers.openai.com/api/docs/guides/conversation-state), [exportación estática de Next.js](https://nextjs.org/docs/app/guides/static-exports) y [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Proyecto experimental independiente, sin afiliación oficial con Leroy Merlin. La licencia MIT no concede derechos sobre marcas ni manuales de terceros.
