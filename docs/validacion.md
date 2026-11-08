# Comprobaciones de acceso, generación y visor interactivo

Última revisión: 8 de noviembre de 2026. Las pruebas del PDF real y del visor descritas más abajo corresponden al 7 de noviembre.

## Logotipo oficial y LABS

La corrección posterior del 8 de noviembre sustituye el cubo y el nombre escrito por el archivo original del logotipo triangular. LABS aparece a su derecha y Montaje de N debajo de LABS. La misma cabecera se comparte entre acceso demo, portada, espera y visor.

Se comprobó la carga de la imagen y la cabecera a 320, 768, 1024 y 1440 px, sin desbordamientos ni solapamiento con OpenAI y Salir. El logotipo sigue visible en móvil: 68 por 40,97 px a 320 px, y 88 por 53,02 px en escritorio, conservando su proporción. Se revisaron visualmente móvil y escritorio. El nombre accesible del enlace conserva la marca, LABS y el subtítulo. No se observaron errores ni avisos de consola.

El JPEG se conserva sin modificar, con procedencia, tamaño y hash documentados junto al archivo. No se usa una fuente aproximada para dibujar las letras del logotipo. Las fuentes corporativas siguen aplicándose a LABS y al subtítulo. No se han añadido pruebas unitarias para este cambio visual; se verifica la imagen, la interfaz y la compilación.

## Biblioteca de montajes

Comprobación del 8 de noviembre con una compilación estática local, IndexedDB nativo del navegador integrado y dos modelos sintéticos privados. No se usó una API Key ni se llamó a OpenAI:

- Estado inicial con cero, explicación del guardado automático y recuento de una y dos conversiones guardadas. Reintentar una escritura con el mismo identificador mantiene el recuento en dos.
- Recargar y salir y volver a entrar con demo / demo conserva las dos entradas. La entrada más reciente aparece primero. Se conservan nombre, archivo, fecha, pasos y cantidades.
- Abrir desde la biblioteca reconstruye el visor con las vistas Producto, Piezas y Montaje. Se comprobaron cinco piezas físicas, su agrupación como tablero y cuatro patas, y el salto del primer paso al quinto. La reapertura funciona sin conexión con OpenAI y no cambia el contador.
- Apertura con Intro desde el botón de la biblioteca. El foco pasa al título del modelo y la página vuelve al visor. La entrada activa queda marcada como En pantalla.
- Una guía de versión incompatible muestra un aviso. La biblioteca y la otra entrada siguen disponibles; la segunda guía se abrió correctamente. La muestra se restauró y después se retiraron únicamente las dos entradas privadas, con recuento final cero.
- Biblioteca a 320, 768, 1024 y 1440 px sin desbordamientos horizontales. Los botones de apertura miden 44 px de alto; 144 px de ancho en escritorio. Se revisaron visualmente escritorio y móvil con un nombre y un archivo largos.
- Sin avisos ni errores de consola en el recorrido de la aplicación.

El navegador de comprobación bloqueó la apertura visual del enlace local blob del PDF. No se intentó eludir el bloqueo. La conservación completa del archivo y su recuperación byte a byte se comprueban en las pruebas automáticas; la apertura visual del PDF recuperado no se considera verificada en esta revisión.

Las pruebas automáticas comprueban que el guardado no se anuncia hasta completar la transacción conjunta, que un fallo de cuota no deja una entrada parcial ni aumenta el contador, que una escritura reintentada no duplica entradas y que el almacenamiento no disponible se comunica como fallo. También rechazan guías incompletas, versiones incompatibles, referencias inválidas y archivos que no son PDF. La lista explícita de campos excluye claves y URL temporales. Los errores de cuota y almacenamiento bloqueado se prueban con un entorno controlado, sin llenar ni cambiar los permisos del navegador del usuario.

La pantalla privada, sus PDF sintéticos y sus controles no se incluyen en la publicación. No se ha repetido una interpretación real del manual ni cambiado el modelo o la petición de OpenAI.

## Tabla ilustrada y estimación desde el primer uso

Revisión posterior del 8 de noviembre, comprobada en la compilación estática local con una espera privada simulada, sin llamadas a OpenAI:

- Tabla de madera vectorial, martillo y clavo con volumen, luces y sombras. Un solo objetivo recorre posiciones variables dentro de la superficie. Se observaron varias posiciones y velocidades de salida diferentes y se comprobaron aciertos consecutivos, doble toque con un único punto, teclado y pausa.
- Tiempos de reacción entre 0,8 y 3 segundos, con variación aleatoria y dificultad creciente. Las pruebas automáticas comprueban sus límites, la separación de las posiciones respecto a los bordes y que golpear la tabla no retire el clavo ni los puntos ya ganados.
- Objetivo táctil de 56 por 76 px en móvil y 64 por 88 px en escritorio. Tablas de 250 por 192 px a 320 px de ventana y 466,08 por 280 px a 1440 px. Sin desbordamiento horizontal a 320, 768, 1024 y 1440 px. En la vista inicial de 320 por 740 px, la tabla queda entre los 523 y 715 px de alto y se ve completa.
- La ayuda de teclado se ajusta al objetivo móvil: se enfoca con Tab y se golpea con Espacio o Intro. Se comprobó Espacio. El juego con movimiento reducido comienza en pausa.
- El tiempo restante aparece destacado desde el primer uso: referencia inicial de 3 a 10 minutos, identificada como estimación de la app. La referencia es una heurística declarada, no una medición ni una previsión de OpenAI. Una duración anterior ya permite usar datos reales; dos duraciones sintéticas mostraron la referencia correspondiente a dos guías.
- Una espera simulada de once minutos sin historial mostró Más de lo previsto, mantuvo el reloj real y no anunció cero. Se comprobaron los estados de interpretación y revisión. Pausar el juego dejó avanzar el reloj de cero a veintitrés segundos.
- Cancelar y recibir una guía simulada retiraron el juego. Sin avisos ni errores de consola durante estas comprobaciones. Los tiempos sintéticos se retiraron al finalizar.

Se conserva la limitación del navegador integrado para comprobar la ocultación nativa de la pestaña. Las medidas móviles corresponden a viewports. La pantalla privada de prueba y sus controles se retiran antes de publicar.

## Tipografía y minijuego de espera, primera versión

Comprobación anterior del 8 de noviembre, antes de la revisión de la tabla ilustrada, con la compilación estática y una pantalla privada de prueba, sin llamadas de OpenAI:

- Leroy Merlin Sans Regular y Bold originales, descargadas desde las rutas declaradas en los estilos corporativos. Next.js las sirve desde la propia aplicación. En esta comprobación anterior al cambio de logotipo, la cabecera mostraba el nombre en mayúsculas y Labs con menor peso. La cabecera actual usa el archivo oficial descrito arriba. La procedencia y los hashes están junto a las fuentes.
- Tablero de nueve huecos con clavos que aparecen, golpe de martillo, aciertos, racha y mejor racha. Se comprobaron varios aciertos seguidos, el doble clic sin puntuación duplicada, Espacio para golpear y flechas para mover el foco.
- Pausa y reanudación manual. El reloj siguió avanzando con el juego pausado. Movimiento reducido: el juego empieza en pausa y los controles permanecen disponibles.
- Estado de interpretación y cambio a revisión, tiempo transcurrido, falta de estimación inicial y rango orientativo con dos duraciones sintéticas. Los límites y la espera más larga que la referencia se comprueban también en las pruebas automáticas. Nunca se anuncia cero como garantía de finalización.
- Cancelación y llegada simulada de una guía retiran el juego. Se comprobaron estos estados en la pantalla local; no se repitió una generación facturada para esta revisión.
- Cabecera y espera a 320, 768, 1024 y 1440 px sin desbordamientos horizontales. En 320 por 740 px el tablero ocupa de 514 a 706 px de altura de la página y sus nueve casillas quedan a la vista. Casillas de 64 px en móvil pequeño y 80 px en escritorio.
- Sin avisos ni errores de consola durante el recorrido.
- Se guardan hasta seis duraciones completadas del mismo modelo, sin nombres ni contenido del manual. El almacenamiento bloqueado no interrumpe la guía.

La pausa al ocultar la pestaña está implementada con el evento de visibilidad. El navegador integrado mantiene `document.hidden` en falso al cambiar entre sus pestañas; esa transición no se considera verificada en un navegador nativo. La prueba móvil utiliza viewports, no un teléfono físico.

La pantalla de prueba y sus datos se retiran antes de la compilación y publicación. El modelo, la petición de OpenAI y las vistas del montaje no cambian.

## Acceso demo, clave y marca

Comprobación del 8 de noviembre en el navegador integrado WebKit con la compilación estática de publicación:

- Cabecera con los textos exactos Leroy Merlin Labs y Montaje de N. Blanco y gris como base, verde en la marca y las acciones.
- Usuario demo y contraseña demo permiten entrar. Una contraseña incorrecta muestra un error. Enter envía el formulario. El foco pasa al título de la portada y el desplazamiento vuelve al inicio.
- Recargar conserva el acceso demo de la pestaña. Salir devuelve al formulario y limpia los campos de acceso.
- El guardado está desmarcado inicialmente. Una conexión sin guardar desaparece al recargar. Marcar el guardado permite recuperar la conexión al recargar y después de salir y volver a entrar. El campo de clave permanece vacío al abrir la conexión guardada.
- Desmarcar el guardado y guardar los cambios retira la copia persistente. Desconectar y borrar clave también la elimina. Se recargó después de cada operación para comprobar que no se recuperaba la conexión.
- Diálogo con foco inicial en la clave, Tab y Mayús+Tab contenidos, Escape y aviso del guardado en el dispositivo.
- Acceso, portada y diálogo a 320, 768, 1024 y 1440 px, sin desbordamiento horizontal. Botones principales de 48 px y salida de 44 px. Revisión visual del acceso y del diálogo en móvil y escritorio.
- Sin avisos ni errores de consola en este recorrido.
- Pruebas de almacenamiento bloqueado, datos corruptos y conservación de datos ajenos en las pruebas automáticas. No se simularon permisos del navegador desde la interfaz.

Se utilizó únicamente una clave ficticia en un origen local de prueba. No se leyó ni guardó la clave real del usuario y no se llamó a OpenAI. El acceso demo está implementado en el cliente y no equivale a autenticación de servidor. El guardado es local, opcional y sin cifrado; no añade cuentas personales ni sincronización.

## Verificado en local

- TypeScript, ESLint sin avisos y compilación estática de Next.js 16.4.2: correctos.
- La comprobación de tipos ejecuta primero `next typegen`, como indica la documentación de Next.js, para generar los tipos de imágenes y rutas también en una copia limpia. El archivo generado `next-env.d.ts` permanece fuera de Git.
- Cuarenta y una pruebas de regresión en `pnpm test`, incluidas cantidades y referencias del inventario interactivo, credenciales demo, sesión, almacenamiento, doble toque, rachas, tiempos y posiciones variables, estimaciones y biblioteca de montajes.
- La petición usa `gpt-6.1-sol`, `reasoning.effort: "xhigh"`, 64.000 tokens máximos de salida, `stream: true`, `store: false` y esquema estricto. No incluye parámetros de muestreo ni cambia a un modelo alternativo.
- Cada pieza contiene sus movimientos. El compilador asigna ids únicos, construye las referencias y deriva la pose final del último movimiento. Se comprueba el desplazamiento conjunto de 80 piezas con el mismo código impreso.
- Un cilindro tiene un solo diámetro. Se rechazan páginas fuera del manual, índices de paso inexistentes, medidas inválidas y poses contradictorias de una pieza en un mismo paso. Una repetición idéntica se deduplica.
- El formato interno sigue rechazando ids duplicados, referencias inexistentes, piezas sin montar y poses finales incoherentes.
- Lectura SSE con eventos partidos en fragmentos de un byte, caracteres UTF-8 y saltos CRLF. Solo se acepta la respuesta final, nunca JSON parcial.
- Cancelar un stream libera el lector. Un stream interrumpido, un error de API, una respuesta incompleta, un rechazo o un error de clave, modelo o saldo no provocan otra petición automática.
- Un error semántico admite una sola revisión con el manual original y el error preciso. Dos respuestas inválidas detienen la generación sin una tercera petición.
- Espera máxima de 15 minutos, con cancelación accesible durante la generación.

## Pruebas anteriores del flujo PDF

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

Estas comprobaciones de grabación corresponden a la versión anterior. El visor actual conserva el 3D y no genera vídeo automáticamente.

## Visor interactivo, comprobación del 7 de noviembre

Comprobación en el navegador integrado WebKit con una compilación estática local y datos sintéticos privados, sin nuevas llamadas de OpenAI:

- Producto, Piezas y Montaje comparten un solo lienzo principal. El resultado no contiene un elemento de vídeo.
- Búsqueda por nombre y código, estado sin resultados, vista de todas las piezas y aislamiento de una unidad. Las cantidades permanecen completas al agrupar piezas idénticas.
- Giro con arrastre durante la reproducción, giro con teclado en pausa, zoom y selección de vista frontal. La pausa conserva exactamente el tiempo del motor mientras se gira el modelo.
- Reproducción automática hasta el segundo paso y final del montaje. Repetición, media velocidad y avance con la barra. El montaje con movimiento reducido empieza pausado y muestra las piezas del paso.
- Guía de 34 pasos: salto al último, paso activo visible dentro de su lista y reproducción del paso 34 sin reiniciar en el primero. Pestañas navegables con flechas.
- Visor a 320, 768, 1024 y 1440 px, sin desbordamiento horizontal. Controles de reproducción de al menos 44 por 44 px. Revisión visible en móvil y tableta.
- Sin errores de consola durante estas operaciones. La ruta y las respuestas sintéticas de comprobación se retiran antes de la compilación de publicación.

No se ha repetido la interpretación del PDF real para comprobar los nuevos controles. El generador y su modelo no cambian en esta revisión. La generación real descrita a continuación pertenece a la versión anterior del reproductor.

## PDF aportado para reproducir el fallo

Se ha leído el manual real de 36 páginas, incluido el inventario y los diagramas de montaje. El PDF original se cargó en el navegador y se comprobó byte a byte su inclusión completa en la petición interceptada.

Para comprobar el tamaño del inventario se preparó a mano un escenario con 81 piezas visuales, conservando los códigos y cantidades de perfiles y paneles. Sus poses y etapas son sintéticas, están señaladas como prueba y no constituyen una guía de montaje. Este escenario se validó y dibujó en escritorio y móvil. El PDF, sus ilustraciones y ese escenario local no se incluyen en el repositorio ni en la aplicación pública.

## Generación real con OpenAI

El usuario introdujo su clave directamente en la aplicación. Se completó una generación real con GPT-6.1 Sol y razonamiento xhigh. La guía resultante tiene 34 pasos y se dibujó sin el error de referencias.

Se recorrieron sus 34 enlaces de página: todos están entre las páginas físicas 20 y 33 y mantienen el orden del montaje. Se revisaron las instrucciones de la base, los laterales, los submontajes, la cubierta y ambas puertas. Se observó el cierre de las dos puertas en la animación final. El resultado se comprobó a 669 y 1440 px, sin desbordamiento horizontal.

La aplicación terminó la grabación real y mostró «Vídeo listo». Se descargó un MP4 de 1280 por 960, 525,6111 segundos y 29.765.210 bytes. Se comprobó la navegación del primer paso al último y en sentido inverso: 0 segundos y 501,578899 segundos, respectivamente. El reproductor llegó al fotograma final sin error. El vídeo no tiene audio. La clave no se leyó, copió ni registró.

El vídeo y las capturas de este manual quedan como archivos privados para el usuario. No se incluyen en el repositorio ni en GitHub Pages.

## Límites

No se dispone del JSON original que produjo la captura. El nuevo formato elimina por construcción las referencias a piezas inexistentes y la duplicación de poses finales, pero no acredita qué condición concreta falló en aquella respuesta.

La prueba real confirma la generación y reproducción de esta guía en la versión anterior. La prueba del nuevo visor acredita sus controles con datos sintéticos. No acredita cada medida, posición o fijación: la geometría es aproximada y el manual conserva la autoridad sobre el montaje.

No se ha realizado un montaje físico ni una validación profesional de herrajes. La prueba móvil usa viewports de navegador, no un teléfono físico ni gestos multitáctiles reales.
