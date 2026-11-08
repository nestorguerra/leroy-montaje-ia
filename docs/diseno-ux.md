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

La lectura muestra una espera con el nombre del PDF y opción de cancelar. A su lado aparece Clava la espera, sobre una tabla de madera ilustrada con canto y vetas, clavos metálicos y un martillo verde con volumen. Son gráficos vectoriales originales que se mantienen nítidos al cambiar de tamaño. Los clavos aparecen en posiciones variables dentro de la tabla, con tiempos de reacción y velocidades de salida diferentes. El ritmo aumenta con los aciertos y se indica con una etiqueta breve. Un golpe al clavo suma un punto; dar en la tabla rompe la racha. Un doble toque no vuelve a puntuar. El siguiente clavo aparece poco después del acierto. El objetivo táctil mide 56 por 76 px en móvil y 64 por 88 px en escritorio. Las posiciones respetan los márgenes del tablero.

El juego se puede pausar sin detener la generación. Con teclado, Tab lleva al clavo y Espacio o Intro golpea; el foco se conserva cuando cambia de posición. La ayuda ya no pide recorrer una cuadrícula de huecos. Los cambios de pestaña detienen el juego y el movimiento reducido lo deja inicialmente en pausa. No tiene sonido ni llamadas de API.

El tiempo restante estimado aparece en grande, antes del reloj transcurrido. La primera estimación utiliza una referencia inicial de 3 a 10 minutos, marcada como estimación de la app. Es una suposición de producto para el primer uso, no un dato medido ni comunicado por OpenAI. Desde una duración anterior del mismo modelo se sustituye por una referencia de los tiempos reales de este navegador, hasta las seis últimas guías. Se actualiza con el tiempo transcurrido, en minutos redondeados hacia arriba. Al superar la referencia se explica que está tardando más, sin anunciar cero ni una finalización falsa. No se inventa un porcentaje de avance. No se guardan nombres ni contenido del manual para calcularla. Una revisión de referencias cambia el estado visible a ajuste de piezas y movimientos. El resultado sustituye la espera sin exigir terminar la partida.

El resultado recupera las tres vistas del prototipo original, `ProductPreview`: Producto, Piezas y Montaje. Conserva un único lienzo 3D interactivo. En Producto se ve el resultado final y sus medidas. En Piezas se busca por código o nombre y se aísla una unidad. En Montaje se reproduce, pausa, repite, cambia de paso o recorre su animación con una barra. La velocidad puede reducirse a la mitad.

El giro y el zoom funcionan durante la reproducción y la pausa. El menú Vistas ofrece cuatro ángulos y el encuadre se puede recuperar. Cambiar de paso conserva el giro elegido. Un paso abierto en pausa muestra su pose final para que el visor no quede vacío; reproducirlo empieza por el movimiento de ese paso. Solo terminar de reproducir toda la guía ofrece reiniciarla desde el principio.

No se prepara un vídeo plano ni se reemplaza el modelo. En escritorio, el contexto aparece a la derecha; en móvil, debajo. El paso actual está separado de la lista compacta de navegación. La lista mantiene visible el paso activo con desplazamiento propio, sin mover la página. Los controles tienen objetivos táctiles de al menos 44 px.

El manual original y las simplificaciones están accesibles junto a la guía. El siguiente manual se puede arrastrar sobre la página o elegir al final.

La biblioteca solicitada el 8 de noviembre queda debajo de la portada y del visor. Su acción es recuperar un montaje terminado, con un recuento visible de manuales convertidos. Mantiene la jerarquía de la página: la carga del PDF sigue siendo la entrada principal. Una lista de filas muestra nombre, archivo, fecha, pasos y piezas, con una sola acción de apertura por entrada. Se evita crear un lienzo 3D adicional para cada miniatura.

El estado vacío muestra cero y explica el guardado automático. La lectura inicial no presenta un cero ficticio mientras se recupera el recuento. Una reapertura indica la entrada activa y lleva el foco al título del visor. En móvil, el contador pasa debajo de la cabecera y cada fila distribuye los datos y la acción en dos líneas; los controles miden al menos 44 px. Los nombres largos se ajustan y los archivos se abrevian visualmente.

La biblioteca conserva el PDF y el modelo completos en este navegador. Guardar solo el nombre dejaría inaccesibles los pasos y sus fuentes después de recargar. El recuento cambia al confirmar la escritura conjunta del resumen, la guía y el PDF. Reintentar la misma escritura conserva su identificador y no añade duplicados. La guía sigue disponible si el guardado falla, con aviso y reintento. Si falla una reapertura, las demás entradas permanecen accesibles. El pie explica la conservación local y el efecto de borrar los datos de la web. No se añade sincronización ni una cuenta personal.

## Sistema visual

La cabecera utiliza el archivo original del logotipo triangular de Leroy Merlin, con **LABS** a su lado y **Montaje de N** debajo de LABS, según la corrección del usuario del 8 de noviembre. El logotipo conserva sus proporciones y permanece visible en móvil. Los textos complementarios utilizan **Leroy Merlin Sans**, en los pesos Regular y Bold publicados en los [estilos corporativos](https://corporativo.leroymerlin.es/o/lmes-public-theme-rebranding/css/main.css). El logotipo y las fuentes se sirven desde la aplicación con Next.js. El resto de la aplicación conserva la tipografía del sistema.

Blanco, gris `#f5f5f7` y texto `#1d1d1f`. El verde `#78be20`, presente en los estilos de la [web corporativa de Leroy Merlin](https://corporativo.leroymerlin.es/recursos-graficos), se reserva a detalles del minijuego y la identidad de la marca. Se utiliza un verde oscuro derivado, `#277a17`, para textos, foco y botones con mejor contraste. Los fondos siguen siendo blancos y grises. El tablero incorpora madera clara, clavos y un martillo dibujados con CSS y SVG originales. El logotipo oficial se incorpora sin modificar y con su procedencia documentada; se mantiene el aviso de proyecto independiente. Una ilustración SVG original identifica el PDF y el ejemplo DAY muestra el tipo de representación disponible. Revisión de marca y espera: 8 de noviembre de 2026.

Diálogo nativo con foco contenido y Escape, etiquetas de controles, zonas táctiles, foco visible y preferencia de movimiento reducido. El diseño debe funcionar a 320, 390, 768, 1024 y 1440 px.
