#**Juego tamagochis Francisco Javier Martín Mariscal**

##**Descripción del código** 

###**Server**

El archivo principal que tenemos en el que básicamente arrancamos el server y definimos rutas, etc.

Por otra parte tenemos todas las **entidades** definidas en archivos con su propio nombre y distintos **servicios**:

-**RoomService**: aquí crearemos las salas, agregamos los jugadores, eliminamos jugadores, nos ayuda a comunicarnos entre los jugadores de la sala.

-**ServerService**: en él nos encargamos de inicializar el webSocket, gestionar conexiones, agregar jugadores, enviar mensajes, verificar si nuestro servidor está activo y definimos algunos eventos.

-**GameService**: es el archivo en el que hacemos la creación de los jugadores, por lo tanto también le asignamos su posición inicial, gestionamos su movimiento, su disparo y su rotación. También almacenaremos los juegos y el array con las posibles posiciones iniciales de cada jugador.


Esto es a cuanto servicios, pero también tenemos un archivo muy importante e imprescindible para el comienzo de nuestro juego llamado **BoardBuilder**:

Como su nombre indica en él vamos a construir e inicializar nuestro tablero, mediante un mapa relleno de 0 y 5, en los que 0 representa una casilla vacía y 5 una casilla que tiene un arbusto. Mediante su método getBoard() vamos a conseguir nuestro tablero.

En cuanto a las entidades pues únicamente mencionar que contienen las propiedades o atributos de cada una además de enums que son necesarios para esas propiedades.

###**Cliente**

En el cliente tenemos assets como pueden ser las imagenes o nuestro archivo de css, además de, obviamente, un index.html que será lo que visualicemos en el navegador.

Ahora vamos a empezar a hablar de otros archivos y luego nos adentraremos en las entidades y los servicios:

-**GameController**: se va a encargar de interconectar archivos como el connectionHandler, GameService, nuestra interfaz,etc. Las funciones que tiene son almacenar el estado del juego, instanciar nuestro GameService, inicializar nuestro Conmection Handler y nuestra interfaz.

-**Index.js**: inicializa el juego y configura los manejadores de los eventos de nuestros botones.

-**Queue.js**: se encarga de crear y administrar la cola como su nombre indica.

-**Ui.js**: definimos una estructura para nuestra interfaz con métodos como drawBoard() y elementos como el tablero.

-**UIv1.js**: inicializamos la interfaz y se encarga de pintar nuestro tablero y jugadores.

En cuanto a entidades, tenemos **Board** y **Player**.

Y en cuanto a servicios, tenemos:

-**ConnectionHandler**: va a ser el encargado de conectarnos con el servidor mediante WebSockets tanto como para mandar mensajes como para recibirlos.

-**GameService**: controla todos los aspectos del juego. Su estado, sus propiedades, inicializa las propiedades y el scheduler (que lo que va haciendo es procesar en distintos intervalos las acciones que hay en cola) y también gestionamos acciones como do_newPlayer() entre otras.
