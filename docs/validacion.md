# Comprobaciones de la copia con IA

Fecha: 7 de noviembre de 2026.

## Verificado en local

- TypeScript, ESLint y compilación estática de Next.js 16.4.2: correctos.
- Interfaz en Chrome real, automatizado con Playwright, a 1440 px y 390 px de ancho. Sin desbordamiento horizontal ni excepciones JavaScript.
- Campo de clave: oculto por defecto, mostrar/ocultar, borrar, continuidad entre vistas de la app y borrado al recargar.
- Archivos: PDF, varias fotografías, reordenación y rechazo de una firma de archivo incorrecta.
- Petición a Responses: PDF codificado en la entrada, autenticación con una clave de prueba ficticia, `store: false`, esquema JSON estricto y modelo seleccionado.
- Respuestas simuladas 401, 429, manual insuficiente, referencia a una pieza inexistente y guía correcta. Sin reintentos automáticos.
- Guía sintética: render 3D, navegación, inventario, secuencia automática y enlace a página del manual.
- Descarga de JSON y vídeo sin incluir la clave de prueba.
- Exportación real con MediaRecorder de un vídeo WebM de 771.739 bytes. Reabierto y decodificado en navegador: 1280 × 960, más de 200 fotogramas, sin error de reproducción. Imagen y textos inspeccionados.
- Ejemplos heredados DAY y NEO: apertura, cambio de vistas y navegación en móvil.
- API de OpenAI: preflight CORS sin credenciales aceptado desde el origen de GitHub Pages.

## Límites de la comprobación

Las respuestas del modelo se simularon con un inventario y pasos explícitamente ficticios. No se utilizó una clave válida ni se hizo una generación de pago. Falta comprobar una generación real con la clave que introduzca el usuario y comparar su resultado con un manual real completo. La consistencia de un JSON no acredita la fidelidad del montaje.

No se ha realizado un montaje físico, una validación profesional de los herrajes ni una prueba en un teléfono físico. La prueba móvil corresponde a un viewport de navegador de 390 px. La calidad y los formatos de exportación pueden variar entre navegadores.
