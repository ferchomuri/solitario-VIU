/***** INICIO DECLARACIÓN DE VARIABLES GLOBALES *****/

// Array de palos
let palos = ["viu", "cua", "hex", "cir"];
// Array de número de cartas
//let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// En las pruebas iniciales solo se trabajará con cuatro cartas por palo:
let numeros = [ 12];

// paso (top y left) en pixeles de una carta a la siguiente en un mazo
let paso = 5;

// Tapetes
let tapeteInicial = document.getElementById("inicial");
let tapeteSobrantes = document.getElementById("sobrantes");
let tapeteReceptor1 = document.getElementById("receptor1");
let tapeteReceptor2 = document.getElementById("receptor2");
let tapeteReceptor3 = document.getElementById("receptor3");
let tapeteReceptor4 = document.getElementById("receptor4");

// Mazos
let mazoInicial = [];
let mazoSobrantes = [];
let mazoReceptor1 = [];
let mazoReceptor2 = [];
let mazoReceptor3 = [];
let mazoReceptor4 = [];

// Contadores de cartas
let contInicial = document.getElementById("contador_inicial");
let contSobrantes = document.getElementById("contador_sobrantes");
let contReceptor1 = document.getElementById("contador_receptor1");
let contReceptor2 = document.getElementById("contador_receptor2");
let contReceptor3 = document.getElementById("contador_receptor3");
let contReceptor4 = document.getElementById("contador_receptor4");
let contMovimientos = document.getElementById("contador_movimientos");

// Tiempo
let contTiempo = document.getElementById("contador_tiempo"); // span cuenta tiempo
let segundos = 0; // cuenta de segundos
let temporizador = null; // manejador del temporizador

// Movimientos
let movimiento=0;


/***** FIN DECLARACIÓN DE VARIABLES GLOBALES *****/

// Rutina asociada a boton reset
/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/
function reiniciarJuego() {
  location.reload()   //recargar página
}


// El juego arranca ya al cargar la página: no se espera a reiniciar
/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/

comenzarJuego();  //llamado a la función inicial para iniciar el juego.
// Desarrollo del comienzo de juego
function comenzarJuego() {
  contMovimientos.innerHTML=movimiento;  //cargado del contador de movimientos al elemento en pantalla
  arrancarTiempo(); //inicialización del tiempo
  generarMazoInicial();  //generación del array con las cartas a jugar
  asociarMazoTapeteContador(mazoSobrantes, tapeteSobrantes); //asociación del array de cartas (mazo) a su respectivo tapete
  asociarMazoTapeteContador(mazoReceptor1, tapeteReceptor1);
  asociarMazoTapeteContador(mazoReceptor2, tapeteReceptor2);
  asociarMazoTapeteContador(mazoReceptor3, tapeteReceptor3);
  asociarMazoTapeteContador(mazoReceptor4, tapeteReceptor4);

  setContador(contInicial, mazoInicial.length);     //asignación del número de cartas del mazo al respectivo span en pantalla.
  setContador(contSobrantes, mazoSobrantes.length);
  setContador(contReceptor1, mazoReceptor1.length);
  setContador(contReceptor2, mazoReceptor2.length);
  setContador(contReceptor3, mazoReceptor3.length);
  setContador(contReceptor4, mazoReceptor4.length);

  barajar(mazoInicial);   //mezclasr las cartas del mazo inicial
}

/*
  función encargada de inicializar el tiempo en formato de horas:minutos:segundos
*/
function arrancarTiempo() {
  /*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/
  if (temporizador) clearInterval(temporizador);
  let hms = function () {
    let seg = Math.trunc(segundos % 60);
    let min = Math.trunc((segundos % 3600) / 60);
    let hor = Math.trunc((segundos % 86400) / 3600);
    let tiempo =
      (hor < 10 ? "0" + hor : "" + hor) +
      ":" +
      (min < 10 ? "0" + min : "" + min) +
      ":" +
      (seg < 10 ? "0" + seg : "" + seg);
    setContador(contTiempo, tiempo);
    segundos++;
  };
  segundos = 0;
  hms(); // Primera visualización 00:00:00
  temporizador = setInterval(hms, 1000);
}



/*
  función que se encarga de mezclar los elementos dentro del array que recibe
  y cargar estas cartas(imágenes) dentro del tapete inicial. A demás se encarga
  de desbloquear la última carta mostrada en el tapete para que sea arrastrable
*/
function barajar(mazo) {
  /*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/
  let contadorMazo = 0;
  mazo.sort(function () {
    return Math.random() - 0.5;
  });

  mazo.map((carta) => {
    carta.style.top = `${contadorMazo + 10}px`;
    carta.style.left = `${contadorMazo + 10}px`;
    tapeteInicial.appendChild(carta);
    contadorMazo += 8;
  });
    mazoInicial[mazoInicial.length-1].draggable=true; //se permite que la ultima carta del mazo inicial sea arrastrable
}


/*
  Función que recibe un array de cartas y el objeto tapete (div) para asociarlos por medio de eventos
*/
function asociarMazoTapeteContador(mazo, tapete) {
  // Asociar eventos a los tapetes
  tapete.addEventListener("dragover", function (event) {  //al arrastrar una carta por encima de este tapete
    event.preventDefault();   //cancelar acciones por defecto
  });
  tapete.addEventListener("drop", function (event) {    //al soltar una carta por encima de este tapete
    event.preventDefault();   //cancelar acciones por defecto
    let cartaSeleccionada = event.dataTransfer.getData("id");   //obtenemos el id de la carta que se soltó
    let tapeteCarta = event.dataTransfer.getData("tapete");     //obtenemos el tapete del que proviene la carta
    let tapeteNuevo = capitalizarPrimeraLetra(event.currentTarget.id);  //se obtiene el identificador del tapete en el que se soltó la carta (actual)

    validarMovimiento(cartaSeleccionada, mazo, tapeteCarta, tapeteNuevo); //se aplican las reglas de movimiento, si son válidas la carta será movida, caso contrario permanecerá en su mismo tapete

    
    mazo.map((carta) => {     //re creación de cartas en el tapete actual utilizando el mazo asociado 
      tapete.appendChild(carta);
    });
    
    comprobarVicoria();   //cada que se realiza un movimiento se comprueba si el juego ha terminado a demás de volver a cargar el tapete inicial si éste ya no tiene cartas y el tapete de sobrantes sí.

    incContador();  //se actualizan los contadores de cartas en pantalla (span)
  });
}


/*
  función para agregar atributos a los objetos del DOM
*/
function agregarAtributosCarta(e) {
  e.dataTransfer.setData("numero", e.target.dataset.numero);
  e.dataTransfer.setData("palo", e.target.dataset.palo);
  e.dataTransfer.setData("id", e.target.id);
  e.dataTransfer.setData("tapete", e.target.dataset.tapete);
}


/*
  función para generar el mazo unicial utilizando los arrays que contienen los número y palos de cartas disponibles
*/
function generarMazoInicial() {
  numeros.map((numero) => {
    palos.map((palo) => {
      let carta = document.createElement("img");
      carta.id = `${numero}-${palo}`;
      carta.src = `./imagenes/baraja/${numero}-${palo}.png`;
      carta.classList.add("carta");
      carta.setAttribute("data-palo", palo);
      carta.setAttribute("data-numero", numero);
      carta.setAttribute("data-tapete", "tapeteInicial");
      carta.setAttribute("draggable", false);
      carta.ondragstart = agregarAtributosCarta;
      mazoInicial.push(carta);    //cargado del elemento (img) al array del mazo Inicial
    });
  });
}


/*
  función para asignar valores a los contadores (span) de las cartas de cada tapete
*/
function incContador() {
  setContador(contInicial, mazoInicial.length);
  setContador(contSobrantes, mazoSobrantes.length);
  setContador(contReceptor1, mazoReceptor1.length);
  setContador(contReceptor2, mazoReceptor2.length);
  setContador(contReceptor3, mazoReceptor3.length);
  setContador(contReceptor4, mazoReceptor4.length);
}


/* función para agregar valores a un componente, recibe el componente y el valor a agregar */
function setContador(contador, valor) {
  contador.innerHTML = valor;
}


/*  La función permite validar y realizar el movimiento si se cumplen las siguientes
    reglas al mover una carta:
    1.  Si el tapete receptor está vacío solo permitirá mover cualquier carta de valor 12
    2.  Si el tapete receptor tiene cartas se permite el movimiento cuando la carta a mover
        es un número menor a la carta en el receptor y además tiene que ser de color distinto.
    3.  Cualquier carta puede ser movida al tapete de sobrantes
    4.  Ninguna carta puede volver a moverse al tapete inicial
    la función recibe la carta actual, el array que la contiene, el tapede del que provino y el tapete al que se va a mover
*/
function validarMovimiento(cartaSeleccionada, mazo, tapeteCarta, tapeteNuevo) {
  //Obtener informacion de la carta 
  let objCartaSeleccionada=document.getElementById(cartaSeleccionada);  //obtenemos el objeto carta
  mazoReceptor=null;  //mazo que tomará el valor del mazo (tapete) al que se va a mover la carta
  switch(tapeteNuevo){
    case "Receptor1":
      mazoReceptor=mazoReceptor1; 
    break;
    case "Receptor2":
      mazoReceptor=mazoReceptor2; 
    break;
    case "Receptor3":
      mazoReceptor=mazoReceptor3; 
    break;
    case "Receptor4":
      mazoReceptor=mazoReceptor4; 
    break;
    case "Sobrantes": //si el tapete al que se va a mover la carta es de sobrantes entonces se mueve directamente y se termina la función (3ra Regla)
      moverCarta(cartaSeleccionada, mazo, tapeteCarta, tapeteNuevo);
    return;
    //no se aceptan casos en el que el tapete nuevo sea el inicial (4ta regla)
  }

  //validaciones para mover
  if(mazoReceptor.length==0){
    if (objCartaSeleccionada.dataset.numero==12){   //1ra regla
      moverCarta(cartaSeleccionada, mazo, tapeteCarta, tapeteNuevo); //mover carta
    }
    else
      notificar("Movimiento inválido:<br>Solo puede colocar cartas con número 12", tapeteNuevo); //se presenta una notificación de movimiento inválido
  }
  else{
    cartaTapete=mazoReceptor[mazoReceptor.length-1];
    if((objCartaSeleccionada.dataset.numero == (cartaTapete.dataset.numero - 1)) && cartaTapete.dataset.numero > 0 ){ // 2da regla (Número menor)
      if(((cartaTapete.dataset.palo=='viu' || cartaTapete.dataset.palo=='cua' ) && (objCartaSeleccionada.dataset.palo=="cir" || objCartaSeleccionada.dataset.palo=="hex" ))  ||
         ((cartaTapete.dataset.palo=='cir' || cartaTapete.dataset.palo=='hex' ) && (objCartaSeleccionada.dataset.palo=="viu" || objCartaSeleccionada.dataset.palo=="cua" ))  //2da regla(color distinto)
        )
        moverCarta(cartaSeleccionada, mazo, tapeteCarta, tapeteNuevo);  //mover carta
      else
      notificar("Movimiento inválido:<br>La carta tiene que ser de otro color", tapeteNuevo); //se presenta una notificación de movimiento inválido
    }
    else{
      notificar("Movimiento inválido:<br>La carta tiene que ser un número menor", tapeteNuevo); //se presenta una notificación de movimiento inválido
    }
  }   
}


/* Función que mueve la carta de un tapete a otro, recibe el id de la carta a mover, el mazo a donde se va a mover,
   el tapete de donde se va a remover la carta y el nuevo tapete donde se agregará la carta*/
function moverCarta(cartaSeleccionada, mazo, tapeteCarta, tapeteNuevo){
  let splitCartaSeleccionada = cartaSeleccionada.split("-"); //obtenemos el número y palo de la carta
  removerCarta(cartaSeleccionada, mazo, tapeteCarta); //se remueve la carta del tapete anterior
  let carta = document.createElement("img");  //creación de la nueva carta con los mismos elementos de la carta seleccionada
  carta.id = cartaSeleccionada;
  carta.src = `./imagenes/baraja/${cartaSeleccionada}.png`;
  carta.classList.add("carta");
  carta.setAttribute("data-palo", splitCartaSeleccionada[1]);
  carta.setAttribute("data-numero", splitCartaSeleccionada[0]);
  carta.setAttribute("data-tapete", `tapete${tapeteNuevo}`);
  carta.ondragstart = agregarAtributosCarta;
  carta.style.top = 'calc(50% - (60px/2) )';  //posicionamiento de la carta en el centro del nuevo tapete
  carta.style.left = 'calc(50% - (45px/2) )';
  if(tapeteNuevo=="Inicial") {    //si se está moviendo las cartas al tapete inicial (a causa que el mazo inicial se encuentra vacío y el de sobrantes no)
    carta.setAttribute("draggable", false);   //se bloquea las cartas para que no sean arrastrables (al barajar ya se desbloquea la ultima carta)
  }
  else{
    carta.setAttribute("draggable", true); //agregado del atributo arrastable
    movimiento++; //se aumenta el contador de movimientos
    contMovimientos.innerHTML=movimiento;     //se actualiza el span de movimientos en pantalla
  }
  mazo.push(carta);   //se agrega la carta al nuevo maso
  notificar('',tapeteNuevo);    //se presenta una notificación de movimiento válido
}



/* función que se encarga de comprobar que se ha terminado el juego, es decir que tanto el tapete inicial como el de sobrantes ya no tienen cartas restantes */
function comprobarVicoria(){
  if(mazoInicial.length==0 && mazoSobrantes.length==0){ //si el mazo inicial y de sobrantes no tienen cartas entonces se comienza el proceso de informar que el jugador ha ganado
    clearInterval(temporizador); //se detiene el temporizador
    segundos--;   //se remueve 1 segundo estimado a causa del tiempo de ejecución y carga de mensajes, para que la información coincida con la mostrada en pantalla
    tiempoTranscurrido="";   //almacenará la cadena en singular o plural del tiempo transcurrido (en formato x minutos con x segundos)
    if (segundos>60){   //si ha pasado mas de 69 segundos entonces se transforman a minutos
      if(segundos/60 > 2 )  //si ha pasado de 2 minutos se expresa en plural
      tiempoTranscurrido=Math.trunc(segundos/60)+" minutos con "+(segundos - (Math.trunc(segundos/60)*60))+" segundos"
      else
      tiempoTranscurrido=Math.trunc(segundos/60)+" minuto con "+ (segundos-60)+" segundos";
    }
    else{
      tiempoTranscurrido=(segundos)+" segundos"; //expresión simple en x segundos
    }
    cartas=document.getElementsByClassName('carta');  //se obtienen todas las cartas de la mesa
    for(i=0;i<cartas.length;i++){
      cartas[i].setAttribute('draggable','false');  //se bloquea cada carta para que ya no sea arrastrable
    }
    Swal.fire({ //función de SweetAlert para mostrar un pop up de juego terminado
      html: "<h1>Ganaste!!</h1><h3>en un tiempo de: "+tiempoTranscurrido+", luego de "+movimiento+" movimientos</he>",
      imageUrl: 'https://i.pinimg.com/originals/87/6f/ab/876fab6207f93c293ae77a70f188c402.gif',
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: 'Trofeo ganador',
      showConfirmButton: false,
      backdrop: `
        rgba(218, 165, 32 ,0.5)
        url("https://usagif.com/wp-content/uploads/gif/confetti-12.gif")
        no-repeat
        left top/100% 100%
      `,
      style:"background-size: 100% 100%;",
    })
  }
  else{ //si no se ha ganado hay que comprobar que no se necesite barajar la mano inicial
    if(mazoInicial.length==0 && mazoSobrantes.length>0){  //si no hay cartas en el mazo inicial pero si hay en el mazo sobrante, entonces se procede a mover las cartas al mazo inicial
      while(mazoSobrantes.length > 0){   //mientras existan cartas en el mazo sobrante
        moverCarta(mazoSobrantes[0].id, mazoInicial, "Sobrantes", "Inicial"); //mover primera carta de mazo de sobrantes a mazo inicial
      }
      barajar(mazoInicial); //barajar cartas del mazo inicial.
    }
  }
}



/*
 función para eliminar la carta de un tapete y del respectivo mazo, recibe el id de la carta a eliminar y el tapete en el que se encuentra
*/
function removerCarta(cartaSeleccionada, tapeteCarta) {
  //Remover carta elegida del mazo inicial
  if (tapeteCarta.includes("Inicial") && mazoInicial.length > 0) {  //si el tapete es el inicial
    eliminarObjetoPorId(mazoInicial, cartaSeleccionada);  //eliminar carta del mazo
    if(mazoInicial.length>0)    //si el mazo inicial aún tiene cartas
      mazoInicial[mazoInicial.length-1].draggable=true; //desbloquear la última carta para que sea arrastrable
  }

  if (tapeteCarta.includes("1") && mazoReceptor1.length > 0) {
    eliminarObjetoPorId(mazoReceptor1, cartaSeleccionada);
  }

  if (tapeteCarta.includes("2") && mazoReceptor2.length > 0) {
    eliminarObjetoPorId(mazoReceptor2, cartaSeleccionada);
  }

  if (tapeteCarta.includes("3") && mazoReceptor3.length > 0) {
    eliminarObjetoPorId(mazoReceptor3, cartaSeleccionada);
  }

  if (tapeteCarta.includes("4") && mazoReceptor4.length > 0) {
    eliminarObjetoPorId(mazoReceptor4, cartaSeleccionada);
  }

  if (tapeteCarta.includes("Sobrantes") && mazoSobrantes.length > 0) {
    eliminarObjetoPorId(mazoSobrantes, cartaSeleccionada);
  }


  //Remover carta seleccionada del DOM
  let imgToDelete = document.getElementById(cartaSeleccionada); 
  imgToDelete.remove(); 
}

  //función para poner la primera letra de una cadena en mayúscula
function capitalizarPrimeraLetra(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

  //Función para eliminar un objeto dentro de un array a partir de un Id, recive el array y el id a eliminar
function eliminarObjetoPorId(arr, id) {
  const objectoConId = arr.findIndex((obj) => obj.id === id); //búsqueda del objeto con el id
  if (objectoConId > -1) {  //si se encotró el objeto
    arr.splice(objectoConId, 1);  //quitarlo del array
  }

  return arr;   //se retorna el array con el objeto eliminado
}


/*  Función que activa los toast de SweetAlert para notificar al jugador, a demás agrega la animación a los tapetes
    respectivos para indicar un movimiento erróneo (sombra roja) o válido (sombra verde).
    Recibe el mensaje a mostrar en el toast y el tapete a cargar la animación.
    NOTA: si el mensaje es una cadena vacía, se cargará la animación de movimiento válido en el tapete.
*/
function notificar(mensaje,tapete){
  tapete=document.getElementById(tapete.toLowerCase()); //se obtiene el tapete del DOM
  if(mensaje){  //si existe un mensaje
    tapete.style="animation: movimientoError 2s;";  //agregado de la animación de movimiento erróneo al tapete
    Swal.fire({       //función de SweetAlert para mostrar un toast con el mensaje por 3 segundos.
      toast:true,
      position: 'top-end',
      timerProgressBar: true,
      background:'#FFC8C8',
      icon: 'error',
      html: "<h4>"+mensaje+"</h4>",
      showConfirmButton: false,
      timer: 3000,
    }).then(() => {
      tapete.style='animation:none' //al ocultar el toast se resetea la animación del tapete.
    });;
  }
  else{ //si no existe un mensaje
    tapete.style="animation: movimientoCorrecto 0.5s;"; //agregado de la animación de movimiento válido al tapete
    setTimeout(function(){tapete.style="animation:none"}, 500)  //reseteado de la animación del tapete luego de 0.5 segundos
  }

}
