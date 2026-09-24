// =====================================================
//  Brecha · mini CTF(capture the flag) en una terminal falsa
// =====================================================

// ===== Datos del sistema "hackeado" =====
// Archivos visibles con un "ls" normal
const archivos = {
  "leeme.txt":
    "Bienvenida, agente. En este sistema hay banderas con formato FLAG{...}.\nCuando encuentres una, entrégala con: submit FLAG{...}",
  "notas.txt":
    "Recordatorio del admin: los archivos que empiezan por punto no salen con un 'ls' normal.",
  "logs.txt":
    "[08:14] login fallido\n[08:15] login fallido\n[08:16] FLAG{los_logs_hablan}\n[08:17] login correcto (admin)",
};

// Archivos ocultos: solo salen con "ls -a"
const ocultos = {
  ".secreto": "Si la pantalla te deslumbra, pulsa F2.\nFLAG{lo_oculto_se_ve}",
  ".historial": "cd /home/admin\nls -a\nsudo r3dt34m   # uy, la contraseña no iba aquí\nexit",
};

// Archivos que solo puede leer root
const archivosRoot = {
  "root.txt": "Enhorabuena, eres root.\nFLAG{acceso_total}",
};

const CLAVE_ROOT = "r3dt34m";

// Cada bandera guarda si ya se ha entregado (true) o no (false)
const banderas = {
  "FLAG{los_logs_hablan}": false,
  "FLAG{lo_oculto_se_ve}": false,
  "FLAG{acceso_total}": false,
};

// ===== Estado del juego =====
let usuario = "invitado";

// Closure: la variable "cuenta" solo la puede tocar la función que devuelve
function crearContador() {
  let cuenta = 0;
  return () => ++cuenta;
}
const contarComando = crearContador();
let totalComandos = 0;

// ===== Elementos del DOM =====
const terminal = document.querySelector("#terminal");
const entrada = document.querySelector("#entrada");
const etiquetaPrompt = document.querySelector("#etiquetaPrompt");
const marcador = document.querySelector("#marcador");
const atajos = document.querySelector("#atajos");

// ===== Funciones de pantalla =====
const textoPrompt = () => `${usuario}@brecha:~$`;

// Añade una línea a la terminal. textContent (nunca innerHTML) para evitar XSS
function imprimir(texto, tipo = "salida") {
  const linea = document.createElement("p");
  linea.textContent = texto;
  linea.classList.add(tipo);
  terminal.appendChild(linea);
}

function contarBanderas() {
  let encontradas = 0;
  let total = 0;
  for (const bandera in banderas) {
    total++;
    if (banderas[bandera]) encontradas++;
  }
  return { encontradas: encontradas, total: total };
}

function actualizarMarcador() {
  const cuenta = contarBanderas();
  marcador.textContent = `Banderas: ${cuenta.encontradas}/${cuenta.total} · Comandos: ${totalComandos}`;
}

// ===== Comandos =====
function mostrarAyuda() {
  imprimir(`Comandos disponibles:
  help               muestra esta ayuda
  ls                 lista los archivos (prueba también: ls -a)
  cat <archivo>      muestra el contenido de un archivo
  whoami             dice qué usuario eres
  sudo <contraseña>  intenta convertirte en root
  submit <bandera>   entrega una bandera
  echo <texto>       repite el texto
  clear              limpia la terminal`);
}

// Devuelve los nombres de un objeto de archivos separados por espacios
function nombresDe(objeto) {
  let lista = "";
  for (const nombre in objeto) {
    lista += `${nombre}   `;
  }
  return lista;
}

function listar(opcion) {
  let lista = nombresDe(archivos);
  if (opcion === "-a") lista += nombresDe(ocultos);
  if (usuario === "root") lista += nombresDe(archivosRoot);
  imprimir(lista.trim());
}

function leer(nombre) {
  if (nombre === "") {
    imprimir("Uso: cat <archivo>", "error");
    return;
  }
  if (archivosRoot[nombre] !== undefined && usuario !== "root") {
    imprimir(`cat: ${nombre}: permiso denegado`, "error");
    return;
  }

  const contenido = archivos[nombre] ?? ocultos[nombre] ?? archivosRoot[nombre];
  if (contenido === undefined) {
    imprimir(`cat: ${nombre}: no existe el archivo`, "error");
    return;
  }
  imprimir(contenido);
}

function hacerseRoot(clave) {
  if (usuario === "root") {
    imprimir("Ya eres root.");
  } else if (clave === "") {
    imprimir("Uso: sudo <contraseña>", "error");
  } else if (clave === CLAVE_ROOT) {
    usuario = "root";
    etiquetaPrompt.textContent = textoPrompt();
    document.body.classList.add("root");
    imprimir("Acceso concedido. Ahora eres root.", "exito");
  } else {
    imprimir("sudo: contraseña incorrecta", "error");
  }
}

function entregar(bandera) {
  if (bandera === "") {
    imprimir("Uso: submit FLAG{...}", "error");
  } else if (banderas[bandera] === undefined) {
    imprimir("Esa bandera no es válida.", "error");
  } else if (banderas[bandera]) {
    imprimir("Esa bandera ya la habías entregado.");
  } else {
    banderas[bandera] = true;
    imprimir(`¡Bandera correcta! ${bandera}`, "exito");

    const cuenta = contarBanderas();
    if (cuenta.encontradas === cuenta.total) {
      imprimir("🏁 Sistema comprometido: has encontrado todas las banderas.", "exito");
      document.body.classList.add("victoria");
    }
  }
}

// ===== Intérprete: recibe lo escrito y decide qué comando ejecutar =====
function ejecutar(textoEntrada) {
  const texto = textoEntrada.trim();
  if (texto === "") return;

  imprimir(`${textoPrompt()} ${texto}`, "comando");
  totalComandos = contarComando();

  // "cat logs.txt" → comando = "cat", argumentos = ["logs.txt"]
  // /\s+/ separa por uno o más espacios seguidos
  const [comando, ...argumentos] = texto.split(/\s+/);
  const argumento = argumentos[0] ?? "";

  switch (comando) {
    case "help":
      mostrarAyuda();
      break;
    case "ls":
      listar(argumento);
      break;
    case "cat":
      leer(argumento);
      break;
    case "whoami":
      imprimir(usuario);
      break;
    case "sudo":
      hacerseRoot(argumento);
      break;
    case "submit":
      entregar(argumento);
      break;
    case "echo":
      // slice(4) quita las 4 letras de "echo" del principio
      imprimir(texto.slice(4).trim());
      break;
    case "clear":
      terminal.textContent = "";
      break;
    default:
      imprimir(`${comando}: comando no encontrado. Escribe "help".`, "error");
  }

  actualizarMarcador();
}

// ===== Eventos =====
// Teclado: Enter ejecuta lo escrito
entrada.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    ejecutar(entrada.value);
    entrada.value = "";
  }
});

// Delegación: un solo listener para todos los botones de atajos
atajos.addEventListener("click", (event) => {
  const boton = event.target.closest("button");
  if (!boton || !atajos.contains(boton)) return;
  ejecutar(boton.textContent);
});

// ★ Bonus: tecla secreta F2 → modo oscuro
document.addEventListener("keydown", (event) => {
  if (event.key === "F2") {
    document.body.classList.toggle("oscuro");
  }
});

// ===== Arranque =====
etiquetaPrompt.textContent = textoPrompt();
actualizarMarcador();
imprimir('Conectado a brecha. Escribe "help" para empezar.');
