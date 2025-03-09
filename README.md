# **Juego tamagochis Francisco Javier Martín Mariscal**

![image](https://github.com/user-attachments/assets/d8288b69-ab35-4338-baca-59900ed00999)

## **Descripción del código : Introducción de archivos** 

### **Server**

El archivo principal que tenemos en el que básicamente arrancamos el server y definimos rutas, etc.

Por otra parte tenemos todas las **entidades** definidas en archivos con su propio nombre y distintos **servicios**:

-**RoomService**: aquí crearemos las salas, agregamos los jugadores, eliminamos jugadores, nos ayuda a comunicarnos entre los jugadores de la sala.

-**ServerService**: en él nos encargamos de inicializar el webSocket, gestionar conexiones, agregar jugadores, enviar mensajes, verificar si nuestro servidor está activo y definimos algunos eventos.

-**GameService**: es el archivo en el que hacemos la creación de los jugadores, por lo tanto también le asignamos su posición inicial, gestionamos su movimiento, su disparo y su rotación. También almacenaremos los juegos y el array con las posibles posiciones iniciales de cada jugador.


Esto es a cuanto servicios, pero también tenemos un archivo muy importante e imprescindible para el comienzo de nuestro juego llamado **BoardBuilder**:

Como su nombre indica en él vamos a construir e inicializar nuestro tablero, mediante un mapa relleno de 0 y 5, en los que 0 representa una casilla vacía y 5 una casilla que tiene un arbusto. Mediante su método getBoard() vamos a conseguir nuestro tablero.

En cuanto a las entidades pues únicamente mencionar que contienen las propiedades o atributos de cada una además de enums que son necesarios para esas propiedades.

### **Cliente**

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

## **Descripción del código : Funcionamiento del juego** 

### Paso a paso

**1.-** Inicializamos el servidor en nuestro index.ts que ahí es donde inicializamos también el socket.IO, creamos el http, etc.

**2.-** Ahora tenemos que inicializar el cliente y lo hacemos en el index mediante una instancia de GameController, que como he dicho antes es el que también nos conecta con el server mediante el ConnectionHandler. (Aclara que la conexión obviamente la conseguimos utilizando el servidor Socket.io)

**3.-** Llega la hora de crear el tablero en nuestro BoardBuilder, almacenarlo y mandarlo al cliente mediante nuestro evento "BOARD".

**4.-** Una vez está creado el tablero, el siguiente paso es crear nuestros jugadores en el GameService y añadirlos a la sala. Cuando creamos el jugador también le asignaremos su posición inicial de la siguiente forma:

        -He creado un array con las posiciones iniciales posibles que pueden tener los jugadores, entonces a la hora de asignar la posicion mediante una función se va a generar un número random el cuál utilizaremos para coger un elemento aleatorio del array. Cuando ese elemento haya sido seleccionado se borrará del
        array mediante un delete(). Esto provoca que esa posición del array quede undefined por eso lo que haremos será asignar una posición que no sea undefined recorriendo ese array y, en el caso de que todas sean undefined porque se han otorgado todas las posiciones, el array se volverá a rellenar y quedará como 
        cuando lo iniciamos.

        También tenemos que mandar esa información de los jugadores al cliente. Mediante el evento "NEW_PLAYER" en un principio enviábamos la información de cada jugador individualmente, pero eso me estaba generando un problema a la hora de que a cada jugador le apareciese la información del resto de jugadores para 
        así pintar el tablero a cada jugador correctamente. Por lo tanto lo que he decidido hacer es almacenar tanto en el server como en el cliente los jugadores en un array de jugadores y cuando estén todos enviarlos al cliente y como he dicho, también almacenarlos en un array.

**5.-** Ahora es el turno de las distintas acciones que pueden realizar los jugadores desde el cliente, que son moverse, rotar y disparar. La meta era que la secuencia de accion de estos botones fuera que el cliente lo pulsa enviando así una petición al server y si este lo aceptaba, realizar esa acción. Y así lo he hecho,
        las tres acciones siguen el mismo camino: creamos el botón en html, añadimos el manejador de eventos en el index al hacer click en cada botón y mediante el ConnectionHandler enviamos la petición al server. En el server mediante ServerService recibimos esa petición y si cumple con los requisitos, se llama a la función definida en el
        GameService del server y se ejecuta. Y se vuelve a enviar la información actualizada al cliente.

        Como he mencionado, en el GameService del server es donde definimos cómo va a funcionar cada acción, por así decirlo, así que vamos a comentar la implementación de cada una de ellas brevemente(Es importante comentar, ya que no lo voy a hacer repetitivamente en cada paso de la explicación, que las primeras líneas para definir cada acción se basan en los              mismo, que es buscar la sala del jugador y al propio jugador en sí) :

        -Este es el código que he mencionado ahora y que básicamente hace lo que he dicho mediante la expresión '?' que nos devuelve la sala si se cumple la condición anterior y luego buscamos al jugador en la sala
        
        const room = this.games.find(game => game.room.players.some(p => p.id.id === playerId))?.room;
        if (!room) return null;
    
        const player = room.players.find(p => p.id.id === playerId);
        if (!player) return null;

        -En movePlayer simplemente hacemos un switch que dependiendo de la dirección sumará o restará una posición a 'x' o 'y'. Si la nueva posición no se sale del tablero ni interfiere a otro jugador se asigna y se manda la información al cliente.

        -En rotatePlayer también hacemos un switch cambiando la dirección de izquierda a derecha según su posición actual, Y de nuevo enviamos la nueva información al cliente.

        -En shoot mi intención era según la dirección del jugador que dispara, incidir sobre la celda o jugador al que apunta. Eso lo he conseguido y para ello también he tenido que utilizar un find para buscar si la celda a la que apunta estaba ocupada por un jugador. Pero finalmente no me ha dado tiempo de implemtentar la función shoot en su totalidad.

## **Objetivos** 

# **Objetivos conseguidos**
Creo que finalmente he conseguido cumplir bastantes objetivos de los que tenía marcados, el primero de ellos y más importante entender que hacíamos en cada parte del código y el funcionamiento del juego lo que me ha permitido solucionar muchos problema de los que me han surgido durante la programación del juego como no poder borrar posiciones anteriores, 
no se aplicaban bien las clases y sobre todo, en muchas ocasiones no conseguía que los mensajes y eventos entre servidor y cliente se intercambiaran correctamente. Pero a partir de mucho leer y entender el código (y muchos console.log) he conseguido solucionar esos problemas.

# **Objetivos no conseguidos**
Repaso abajo lo que no he conseguido y en general creo que muchos de ellos los podría haber conseguido con un poco más de tiempo ya que he tenido problemas con los commits perdiendo casi todo el proyecto y teniendo que implementar completamente el dibujar tablero, mover jugadores, etc. desde cero. Me hubiera gustado sobre todo poder implementar completamente los disparos y retocar visualmente la interfaz a la hora de esconderse para que hubiera una buena base del juego. También haber hecho un poco más eficiente la comunicación entre server y cliente para enviar los menos datos posibles.

# **Repaso objetivos**
En cuanto al funcionamiento del juego basándome en la **rúbrica**:

**1 Diseño del tablero**

-He implementado correctamente un tablero de cualquier tamaño NxN.

-La configuración inicial de la asignación de las esquinas de los jugadores se hace perfectamente, sea cual sea el tamaño del tablero.

-Los ataques creo que los estaba implementando de forma correcta y la idea que tenía podía funcionar, pero me he quedado a mitad y no me ha dado tiempo a acabar esa parte.

-Las casillas de escondite se implementan perfectamente pero a la hora de esconderse, al jugador le desaparece el botón de disparar y todo pero visualmente se queda la clase arbusto por encima de la clase player y tampoco me ha dado tiempo a cambiarlo.

**2 Comunicación Cliente-Servidor**

-Las conexiones se manejan bien mediante WebSockets.

-Los mensajes se intercambian correctamente entre ambos.

-Todos los clientes ven en tiempo real el estado del resto de jugadores.

-Los clientes se conectan y desconectan y la partida puede seguir correctamente.

**3 Implementación del Cliente y Eventos del Juego**

-La representación visual se realiza correctamente, excepto lo que indiqué antes de que se ve el jugador por encima del arbusto cuando está escondido.

-El desplazamiento y rotación se realiza correctamente, el disparo no termina de funcionar.

-La interfaz es muy sencilla pero fácil de usar, además de que cada jugador tiene su color para identificarlos.

-En cuanto al rediseño en futuro creo que las funciones están bien pero si que cambiaría cosas para que sea más intuitivo saber dónde hay que cambiar código, con esto me refiero sobre todo por ejemplo a llamar manejadores de eventos de los botones en el index, si hubiera tenido tiempo me hubiera gustado cambiarlo.

**4 Gestión de Salas y Control de Juego**

-La salas gestionan bien las partidas independientes.

-El estado del juego está bién centralizado

-Los datos del mapa como de los jugadores como he dicho antes está siempre a disposición de todos los clientes inmediatamente.

-En cuanto a asignación de ganadores y finalización de partidas no hay nada. Este objetivo no está cumplido de ninguna manera.

**5 Uso de Buenas Prácticas de Programación y Patrones de Diseño**

-El uso de clases y tal creo que está bién pero a la vez hubiera sido mejorable con más tiempo.

-En cuanto al código estructurado creo que está relativamente bien estructurado aunque hay partes que si podría haber repasado más para que todo quedara más claro.
