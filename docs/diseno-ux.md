# Diseño de la experiencia

Referencias públicas consultadas el 7 de noviembre de 2026:

- [Apple MacBook Air](https://www.apple.com/es/macbook-air/): jerarquía breve, tipografía grande, espacio libre, blanco y producto como protagonista.
- [Smallpdf, Comprimir PDF](https://smallpdf.com/es/comprimir-pdf): zona de archivo dominante con las dos entradas equivalentes, arrastrar o elegir.
- [BILT](https://bilt.ai/instructions-on-bilt/) y [su ficha de aplicación](https://apps.apple.com/us/app/bilt/id879452214): instrucciones de montaje secuenciales y animación por pasos.

Se inspeccionaron pantallas públicas de las tres webs. En BILT se observó la página de instrucciones y su directorio, no un reproductor privado. Los detalles funcionales se contrastaron con su ficha pública. No se han copiado sus marcas, textos, imágenes ni pantallas.

## Decisiones

La portada tiene un trabajo: recibir un PDF. La acción principal es toda la zona de carga. No hay un segundo botón de generar, elección de modelo, pestañas de producto o panel de herramientas.

La conexión se pide al necesitarla. El diálogo conserva el PDF pendiente y explica el uso de la clave y la posible revisión adicional. El acceso discreto en la cabecera permite cambiar o desconectar la clave sin ocupar el recorrido principal.

La lectura muestra una espera indeterminada con el nombre del PDF y opción de cancelar. No se inventan porcentajes de interpretación. Una revisión de referencias cambia el estado visible a ajuste de piezas y movimientos.

El resultado recupera las tres vistas del prototipo original, `ProductPreview`: Producto, Piezas y Montaje. Conserva un único lienzo 3D interactivo. En Producto se ve el resultado final y sus medidas. En Piezas se busca por código o nombre y se aísla una unidad. En Montaje se reproduce, pausa, repite, cambia de paso o recorre su animación con una barra. La velocidad puede reducirse a la mitad.

El giro y el zoom funcionan durante la reproducción y la pausa. El menú Vistas ofrece cuatro ángulos y el encuadre se puede recuperar. Cambiar de paso conserva el giro elegido. Un paso abierto en pausa muestra su pose final para que el visor no quede vacío; reproducirlo empieza por el movimiento de ese paso. Solo terminar de reproducir toda la guía ofrece reiniciarla desde el principio.

No se prepara un vídeo plano ni se reemplaza el modelo. En escritorio, el contexto aparece a la derecha; en móvil, debajo. El paso actual está separado de la lista compacta de navegación. La lista mantiene visible el paso activo con desplazamiento propio, sin mover la página. Los controles tienen objetivos táctiles de al menos 44 px.

El manual original y las simplificaciones están accesibles junto a la guía. El siguiente manual se puede arrastrar sobre la página o elegir al final. No se añaden galerías, cuentas ni historial.

## Sistema visual

Tipografía del sistema, blanco, gris `#f5f5f7`, texto `#1d1d1f` y acento azul `#0071e3`. La marca es propia: montaje. Una ilustración SVG original identifica el PDF y el ejemplo DAY muestra el tipo de representación disponible.

Diálogo nativo con foco contenido y Escape, etiquetas de controles, zonas táctiles, foco visible y preferencia de movimiento reducido. El diseño debe funcionar a 320, 390, 768, 1024 y 1440 px.
