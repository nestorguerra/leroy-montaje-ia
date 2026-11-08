# Diseño de la experiencia

Referencias públicas consultadas el 7 de noviembre de 2026:

- [Apple MacBook Air](https://www.apple.com/es/macbook-air/): jerarquía breve, tipografía grande, espacio libre, blanco y producto como protagonista.
- [Smallpdf, Comprimir PDF](https://smallpdf.com/es/comprimir-pdf): zona de archivo dominante con las dos entradas equivalentes, arrastrar o elegir.
- [BILT](https://bilt.ai/instructions-on-bilt/) y [su ficha de aplicación](https://apps.apple.com/us/app/bilt/id879452214): instrucciones de montaje secuenciales y animación por pasos.

Se inspeccionaron pantallas públicas de las tres webs. En BILT se observó la página de instrucciones y su directorio, no un reproductor privado. Los detalles funcionales se contrastaron con su ficha pública. No se han copiado sus marcas, textos, imágenes ni pantallas.

## Decisiones

Tras el acceso demo solicitado, la portada tiene un trabajo: recibir un PDF. La acción principal es toda la zona de carga. No hay un segundo botón de generar, elección de modelo, pestañas de producto o panel de herramientas.

La conexión se pide al necesitarla. El diálogo conserva el PDF pendiente y explica el uso de la clave y la posible revisión adicional. El acceso discreto en la cabecera permite cambiar o desconectar la clave sin ocupar el recorrido principal.

El acceso usa **demo / demo**, conserva la sesión en la pestaña y ofrece Salir en la cabecera. La pantalla explica que no crea una cuenta personal. El diálogo OpenAI incorpora un guardado opcional en este navegador, desmarcado por defecto, con aviso del acceso desde el dispositivo y opción de borrado. La clave guardada nunca se rellena de nuevo en el campo visible.

La lectura muestra una espera con el nombre del PDF y opción de cancelar. A su lado aparece Clava la espera: un tablero de nueve huecos donde surgen clavos, con golpes de martillo, aciertos y rachas. Se puede pausar sin detener la generación. Con teclado, las flechas recorren el tablero y Espacio golpea. Un doble toque no vuelve a puntuar ni rompe la racha. El siguiente clavo aparece poco después de acertar. Los cambios de pestaña detienen el juego y el movimiento reducido lo deja inicialmente en pausa. No tiene sonido ni llamadas de API.

El reloj mide el tiempo real transcurrido. No se inventan porcentajes ni una cuenta atrás. Con dos o más duraciones anteriores del mismo modelo en este navegador se presenta una referencia amplia de minutos restantes, marcada como orientativa. Al superar esa referencia se explica que está tardando más, sin anunciar cero ni una finalización falsa. No se guardan nombres ni contenido del manual para calcularla. Una revisión de referencias cambia el estado visible a ajuste de piezas y movimientos. El resultado sustituye la espera sin exigir terminar la partida.

El resultado recupera las tres vistas del prototipo original, `ProductPreview`: Producto, Piezas y Montaje. Conserva un único lienzo 3D interactivo. En Producto se ve el resultado final y sus medidas. En Piezas se busca por código o nombre y se aísla una unidad. En Montaje se reproduce, pausa, repite, cambia de paso o recorre su animación con una barra. La velocidad puede reducirse a la mitad.

El giro y el zoom funcionan durante la reproducción y la pausa. El menú Vistas ofrece cuatro ángulos y el encuadre se puede recuperar. Cambiar de paso conserva el giro elegido. Un paso abierto en pausa muestra su pose final para que el visor no quede vacío; reproducirlo empieza por el movimiento de ese paso. Solo terminar de reproducir toda la guía ofrece reiniciarla desde el principio.

No se prepara un vídeo plano ni se reemplaza el modelo. En escritorio, el contexto aparece a la derecha; en móvil, debajo. El paso actual está separado de la lista compacta de navegación. La lista mantiene visible el paso activo con desplazamiento propio, sin mover la página. Los controles tienen objetivos táctiles de al menos 44 px.

El manual original y las simplificaciones están accesibles junto a la guía. El siguiente manual se puede arrastrar sobre la página o elegir al final. No se añaden galerías, cuentas personales ni historial.

## Sistema visual

La cabecera utiliza **Leroy Merlin Sans**, en los pesos Regular y Bold publicados en los [estilos corporativos](https://corporativo.leroymerlin.es/o/lmes-public-theme-rebranding/css/main.css). El nombre de marca se presenta en mayúsculas; Labs tiene menor peso. Debajo figura **Montaje de N**. Las fuentes originales se sirven localmente con Next.js. El resto de la aplicación conserva la tipografía del sistema.

Blanco, gris `#f5f5f7` y texto `#1d1d1f`. El verde `#78be20`, presente en los estilos de la [web corporativa de Leroy Merlin](https://corporativo.leroymerlin.es/recursos-graficos), se reserva al pequeño símbolo de la marca y detalles del minijuego. Se utiliza un verde oscuro derivado, `#277a17`, para textos, foco y botones con mejor contraste. Los fondos siguen siendo blancos y grises. El tablero incorpora madera clara, clavos y un martillo dibujados con CSS y SVG originales. No se copia el símbolo triangular oficial. Una ilustración SVG original identifica el PDF y el ejemplo DAY muestra el tipo de representación disponible. Revisión de marca y espera: 8 de noviembre de 2026.

Diálogo nativo con foco contenido y Escape, etiquetas de controles, zonas táctiles, foco visible y preferencia de movimiento reducido. El diseño debe funcionar a 320, 390, 768, 1024 y 1440 px.
