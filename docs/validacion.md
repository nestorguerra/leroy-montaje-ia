# Comprobaciones del rediseño y de las referencias de piezas

Fecha: 7 de noviembre de 2026.

## Verificado en local

- TypeScript, ESLint y compilación estática de Next.js 16.4.2: correctos.
- Once pruebas de regresión en `pnpm test`: referencias inexistentes, ids repetidos, movimientos idénticos o contradictorios, referencias con espacios, piezas sin montar, poses finales incoherentes y revisión limitada de la API.
- Chrome real, automatizado con Playwright, a 320, 390, 768, 1024 y 1440 px. Carga visible en el primer recorrido de pantalla, sin desbordamiento horizontal.
- Inicio mediante selección y arrastre de un PDF. Sin botón adicional de generación, selector de modelo o herramientas de producto.
- Rechazo de PDF con firma inválida antes de enviar una petición.
- Diálogo de conexión: campo oculto, foco contenido con Tab, Escape, continuidad del manual pendiente y tamaño móvil de 320 px.
- Respuesta simulada con una pieza inexistente: una revisión con el PDF original y el error concreto; respuesta corregida validada y mostrada.
- Dos respuestas incoherentes: proceso detenido sin una tercera petición ni un modelo incompleto en pantalla.
- Errores 401, 429 y manual insuficiente: una sola petición, sin reintentos automáticos. Cancelación durante la lectura: regreso a la carga.
- Peticiones de prueba: PDF en la entrada, autenticación ficticia, `store: false` y esquema estricto. Ninguna petición con una clave válida.
- Animación disponible mientras se genera el vídeo automáticamente. Selección de pasos y enlace a la página del manual original.
- Grabación real con MediaRecorder, en MP4, de 1280 × 960 y unos 12 segundos. Descarga sin la clave ficticia.
- Seleccionar pasos mueve el vídeo hacia delante y hacia atrás. Reproducir el vídeo cambia el paso activo. Se corrigió la tolerancia entre los tiempos grabados y los tiempos redondeados por el reproductor.
- Movimiento reducido: animación visible inicialmente pausada, con la pieza mostrada. Resultado en móvil con el reproductor antes que los pasos.
- Desconexión y recarga borran la clave. localStorage, sessionStorage y cookies vacíos.
- Sin excepciones JavaScript ni errores de consola inesperados en el recorrido completo.
- Inspección visual de portada, conexión, lectura, revisión, animación, vídeo, errores y móvil.

## Límites

Las respuestas del modelo se simularon con inventario y pasos explícitamente ficticios. Se reprodujeron las dos causas del aviso aportado en la captura, pero no se dispone del JSON original que falló ni del manual concreto usado en esa petición. La corrección de ese resultado exacto necesita repetir el PDF en la aplicación.

No se hizo una generación de pago con OpenAI. El usuario debe introducir su clave y contrastar el resultado con el manual completo. La consistencia del JSON no acredita la fidelidad del montaje.

No se ha realizado un montaje físico ni una validación profesional de herrajes. La prueba móvil corresponde a viewports de navegador, no a un teléfono físico. La calidad y los formatos de grabación varían entre navegadores.
