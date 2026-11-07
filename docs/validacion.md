# Comprobaciones de la generación con GPT-6.1 Sol

Fecha: 7 de noviembre de 2026.

## Verificado en local

- TypeScript, ESLint sin avisos y compilación estática de Next.js 16.4.2: correctos.
- Dieciocho pruebas de regresión en `pnpm test`.
- La petición usa `gpt-6.1-sol`, `reasoning.effort: "xhigh"`, 64.000 tokens máximos de salida, `stream: true`, `store: false` y esquema estricto. No incluye parámetros de muestreo ni cambia a un modelo alternativo.
- Cada pieza contiene sus movimientos. El compilador asigna ids únicos, construye las referencias y deriva la pose final del último movimiento. Se comprueba el desplazamiento conjunto de 80 piezas con el mismo código impreso.
- Un cilindro tiene un solo diámetro. Se rechazan páginas fuera del manual, índices de paso inexistentes, medidas inválidas y poses contradictorias de una pieza en un mismo paso. Una repetición idéntica se deduplica.
- El formato interno sigue rechazando ids duplicados, referencias inexistentes, piezas sin montar y poses finales incoherentes.
- Lectura SSE con eventos partidos en fragmentos de un byte, caracteres UTF-8 y saltos CRLF. Solo se acepta la respuesta final, nunca JSON parcial.
- Cancelar un stream libera el lector. Un stream interrumpido, un error de API, una respuesta incompleta, un rechazo o un error de clave, modelo o saldo no provocan otra petición automática.
- Un error semántico admite una sola revisión con el manual original y el error preciso. Dos respuestas inválidas detienen la generación sin una tercera petición.
- Espera máxima de 15 minutos, con cancelación accesible durante la generación.

## Navegador

Chrome real, automatizado con Playwright y respuestas de OpenAI simuladas:

- Portada y carga a 320, 390, 768, 1024 y 1440 px, sin desbordamiento horizontal.
- Una sola acción de carga mediante selección o arrastre. Inicio automático tras conectar la clave, sin selector de producto o modelo.
- PDF con firma inválida rechazado antes de la petición.
- Conexión con campo oculto, foco contenido, Escape y aviso de GPT-6.1 Sol con razonamiento Muy alto.
- Petición SSE, revisión limitada, animación, pasos, enlace a la página del PDF local y resultado adaptable.
- Grabación y descarga reales de un vídeo de prueba de 1280 por 960 y unos 12 segundos. Seleccionar pasos mueve el vídeo en ambas direcciones y reproducirlo cambia el paso activo.
- Clave ficticia solo en memoria; desconexión y recarga la borran. Sin cookies ni almacenamiento persistente.
- Movimiento reducido: animación visible inicialmente pausada con las piezas mostradas.
- Sin excepciones JavaScript ni errores inesperados de consola.

## PDF aportado para reproducir el fallo

Se ha leído el manual real de 36 páginas, incluido el inventario y los diagramas de montaje. El PDF original se cargó en el navegador y se comprobó byte a byte su inclusión completa en la petición interceptada.

Para comprobar el tamaño del inventario se preparó a mano un escenario con 81 piezas visuales, conservando los códigos y cantidades de perfiles y paneles. Sus poses y etapas son sintéticas, están señaladas como prueba y no constituyen una guía de montaje. Este escenario se validó y dibujó en escritorio y móvil. El PDF, sus ilustraciones y ese escenario local no se incluyen en el repositorio ni en la aplicación pública.

## Límites

No se dispone del JSON original que produjo la captura. El nuevo formato elimina por construcción las referencias a piezas inexistentes y la duplicación de poses finales, pero no acredita qué condición concreta falló en aquella respuesta.

No se ha hecho una generación de pago con una clave válida de OpenAI. La interpretación real del PDF por GPT-6.1 Sol y su fidelidad completa al montaje siguen pendientes de esa prueba. Las respuestas simuladas demuestran el funcionamiento del programa ante los datos ensayados, no el comportamiento del modelo.

No se ha realizado un montaje físico ni una validación profesional de herrajes. La prueba móvil usa viewports de navegador, no un teléfono físico. Los formatos y la calidad de vídeo dependen del navegador.
