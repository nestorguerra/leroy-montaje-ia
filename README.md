# Leroy Merlin Labs · Montaje de N

[Abrir la aplicación](https://nestorguerra.github.io/leroy-montaje-ia/)

Copia independiente de la prueba Leroy Merlin, basada en el motor 3D de [Bygga](https://github.com/Nutlope/bygga). Se conservan su licencia MIT y aviso de autoría.

## Uso

1. Entra con usuario **demo** y contraseña **demo**.
2. Arrastra el PDF completo del manual, hasta 20 MB, o toca la zona para elegirlo.
3. Si hace falta, introduce tu API Key de OpenAI. Puedes marcar **Guardar clave en este navegador** para recordarla en próximas visitas.
4. La guía aparece automáticamente con tres vistas: **Producto**, **Piezas** y **Montaje**. En móvil, la información queda debajo del modelo.

Arrastra el modelo para girarlo, usa la rueda o pellizca para acercarte. En **Producto** ves el resultado final. En **Piezas** puedes buscar por nombre o código y aislar una unidad. Las piezas idénticas se agrupan sin perder sus cantidades. En **Montaje** puedes reproducir la secuencia, pausar, avanzar dentro de cada paso, saltar al anterior o siguiente, repetir y reducir la velocidad. Puedes seguir girando y ampliando el modelo mientras se reproduce.

El menú **Vistas** ofrece perspectiva, frente, lado y vista superior. **Centrar vista** recupera el encuadre inicial. Con el visor enfocado, las flechas giran, más y menos cambian el zoom, cero centra y espacio reproduce o pausa. Las pestañas admiten flechas, Inicio y Fin. La lista de pasos mantiene visible el paso actual sin desplazar toda la página.

Al elegir un paso en pausa, ves cómo queda. Al reproducirlo, ves cómo se realiza. Elegir el último paso no reinicia la guía; terminar la reproducción completa sí permite volver al principio.

Para empezar otra guía, basta con arrastrar otro PDF. No hay selectores de productos o modelos ni un botón adicional de generación. La mesa DAY aparece como ejemplo visual en la portada. Los datos originales de DAY y SPACEO NEO se conservan en el código.

Mientras se interpreta el manual aparece **Clava la espera**, un minijuego de martillo y clavos con aciertos, rachas y pausa. Funciona con ratón, toque o flechas y Espacio. Al ocultar la pestaña el juego se detiene; la lectura del manual continúa. Con movimiento reducido empieza pausado. La guía sustituye automáticamente la espera cuando está lista, aunque el juego esté pausado.

La espera muestra el tiempo transcurrido real. OpenAI no proporciona un tiempo restante. Después de al menos dos guías completadas con el mismo modelo, se ofrece una referencia amplia de minutos basada en las últimas seis duraciones de este navegador. Si la espera supera esa referencia, se indica que está tardando más, sin prometer una llegada a cero. Se guardan automáticamente solo esas duraciones, sin nombres, páginas, contenido ni claves. Si el almacenamiento no está disponible, la guía continúa y se muestra únicamente el reloj. No se añaden llamadas de OpenAI para jugar ni para estimar el tiempo.

## Clave y archivos

GitHub Pages sirve una aplicación estática. La petición va directamente del navegador a `https://api.openai.com/v1/responses`, con la clave aportada por cada usuario. No se incluye una clave del propietario en el código ni en GitHub Secrets.

El acceso **demo / demo** es una puerta de demostración implementada en el cliente. No crea una cuenta ni verifica la identidad en un servidor. Su marcador de sesión está en `sessionStorage` y permite recargar la pestaña sin volver a entrar. El código y los archivos estáticos siguen siendo públicos.

Por defecto, la clave permanece solo en memoria de React y se borra al recargar o cerrar sesión. **Guardar clave en este navegador** está desmarcado inicialmente. Si lo marcas, la clave se guarda sin cifrar en `localStorage` del origen de esta web, con un nombre propio de la aplicación. Se recupera al volver a entrar. No se sincroniza entre dispositivos ni se envía a un servidor propio. El acceso demo no cifra ni protege ese almacenamiento frente a otras personas con acceso al navegador o al mismo origen.

**Salir** cierra el acceso demo, cancela la lectura activa y retira la guía y la conexión de la sesión. Conserva una clave guardada voluntariamente. Para borrarla, abre **OpenAI** y pulsa **Desconectar y borrar clave**. También puedes desmarcar el guardado y pulsar **Guardar cambios** para seguir conectado solo en memoria. Si el navegador impide guardar o borrar, se muestra un error y no se anuncia que la operación haya terminado. No se registra la clave ni el contenido de los manuales.

Soltar o elegir un PDF inicia la petición si ya hay una clave. En caso contrario, conectar la clave inicia el manual pendiente. Se usa `store: false`; esto no elimina las políticas de tratamiento o retención aplicables a la cuenta de OpenAI. El consumo se factura en esa cuenta de API.

Una clave usada en el navegador puede ser leída por el propio navegador, sus extensiones y quien controle el dispositivo. Usa el guardado solo en un equipo propio. Para un servicio con autenticación real o una clave compartida se necesita un servidor con control de acceso y gasto. La [guía de claves de OpenAI](https://developers.openai.com/api/docs/guides/api-keys) recomienda mantener los secretos fuera del código del navegador; esta demostración permite usar y recordar una clave personal por decisión del usuario.

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
- `src/components/montage/GenerationWait.tsx` y `NailGame.tsx`: espera, reloj y minijuego.
- `src/lib/browser-session.ts`: acceso demo y almacenamiento opcional de la clave.
- `src/lib/generation-timing.ts` y `waiting-game.ts`: duraciones locales y reglas de los clavos.
- `src/app/prueba-leroy/montage.css`: diseño adaptable.
- `src/lib/ai/openai.ts`: peticiones y revisión limitada.
- `src/lib/ai/blueprint.ts`: formato de generación y compilador de movimientos por pieza.
- `src/lib/ai/response.ts`: lectura de eventos SSE y cancelación.
- `src/lib/ai/guide.ts`: formato interno, validación y conversión al plan 3D.
- `src/lib/assembly-inventory.ts`: agrupación de piezas conservando las cantidades y referencias.
- `src/lib/video.ts`: utilidades de duración y grabación conservada fuera del recorrido principal.
- `tests/guide.test.mjs`: regresiones de referencias, revisión e inventario.
- `tests/browser-session.test.mjs`: credenciales demo, cierre de sesión, guardado, borrado y almacenamiento bloqueado.
- `tests/waiting.test.mjs`: doble toque, rachas, tiempos no disponibles, almacenamiento bloqueado y estimaciones que se alargan.
- `src/engine/`: motor 3D de Bygga.
- `src/lib/leroy/`, `src/data/leroy-*.json` y `docs/prueba-leroy/procedencia.json`: ejemplos originales.
- [Decisiones de UX y referencias](docs/diseno-ux.md).
- [Comprobaciones y límites](docs/validacion.md).

Documentación consultada el 7 de noviembre de 2026: [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [migración a GPT-6](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra#migration-quickstart), [PDF](https://developers.openai.com/api/docs/guides/file-inputs), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [streaming](https://developers.openai.com/api/docs/guides/streaming-responses), [estado de conversación](https://developers.openai.com/api/docs/guides/conversation-state), [exportación estática de Next.js](https://nextjs.org/docs/app/guides/static-exports) y [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

La cabecera utiliza Leroy Merlin Sans en sus pesos Regular y Bold, servidos desde la propia aplicación mediante `next/font/local`. [Procedencia y archivos originales](src/assets/fonts/leroy-merlin/README.md).

Proyecto experimental independiente, sin afiliación oficial con Leroy Merlin. La licencia MIT no concede derechos sobre marcas, fuentes ni manuales de terceros.
