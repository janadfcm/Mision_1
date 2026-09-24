# Brecha · mini CTF en el navegador

Mini-juego tipo *Capture The Flag* dentro de una terminal falsa, hecho con HTML, CSS y JavaScript puro (sin frameworks ni librerías). Escribes comandos como en una terminal real y tienes que encontrar **3 banderas** con formato `FLAG{...}` y entregarlas con `submit`.

## Cómo ejecutarlo

1. Abre la carpeta en VS Code.
2. Clic derecho sobre `index.html` → **Open with Live Server** (o doble clic en `index.html`).

## Cómo se juega

| Comando | Qué hace |
|---|---|
| `help` | Lista los comandos |
| `ls` / `ls -a` | Lista archivos (`-a` incluye los ocultos) |
| `cat <archivo>` | Muestra un archivo |
| `whoami` | Usuario actual |
| `sudo <contraseña>` | Intenta convertirte en root |
| `submit <bandera>` | Entrega una bandera |
| `echo <texto>` | Repite el texto |
| `clear` | Limpia la terminal |

También hay botones de atajo para los comandos más comunes.

**★ Bonus:** hay una tecla secreta que activa el modo oscuro. La pista está escondida dentro del propio juego.

## Estructura

```
m1-brecha/
├── index.html      estructura
├── css/
│   └── estilos.css presentación
├── js/
│   └── app.js      comportamiento
└── README.md
```

## Conceptos de la Unidad 1 que se usan

- **DOM:** `querySelector`, `textContent`, `classList.add/toggle`, `createElement` + `appendChild`.
- **Eventos:** `keydown` (Enter y tecla secreta), `click` con **delegación** (`event.target.closest`), todo con `addEventListener` y sin handlers inline en el HTML.
- **Fundamentos:** `const`/`let`, `===`, `switch`, `for...in`, template literals (también multilínea), parámetros por defecto, desestructuración con *rest*, `??`, arrow functions y un **closure** para el contador de comandos.
- **Seguridad:** toda la salida se pinta con `textContent`, nunca con `innerHTML`. Prueba `echo <img src=x onerror=alert(1)>`: se muestra como texto y no se ejecuta (XSS evitado).
- **Carga del script:** `type="module"`, que actúa como `defer` y activa el *strict mode*.

## Uso de IA

- **Herramienta:** Claude (claude.ai).
- **Qué hice con IA:** <!-- COMPLETA: p. ej. la idea inicial y un primer borrador de app.js, estilos.css e index.html -->
- **Prompts reales relevantes:**
  1. «vale vamos a ir a otra misión y quiero mismo usa solo cosas de pdf, y usos del pdf, aunque pienses que otra forma mejor de hacerlo usa las cosas del pdf» (junto con la rúbrica de la M1 y el PDF de la Unidad 1).
  2. <!-- COMPLETA con otro prompt real, p. ej. una pregunta sobre una línea concreta del código -->
- **Cómo lo verifiqué:** <!-- COMPLETA: p. ej. probé cada comando en el navegador, forcé errores (cat de un archivo que no existe, sudo con contraseña mala, submit repetido), comprobé la consola con F12 y revisé que cada cosa usada aparece en el PDF de la unidad -->
- **Qué escribí a mano:** <!-- COMPLETA con lo que cambiaste o añadiste tú -->

## Autopsia

**1. Separar los comandos con `split(" ")` y desestructuración.**
`const [comando, ...argumentos] = texto.split(" ")` es simple y se entiende de un vistazo, pero no soporta argumentos con espacios ni comillas. Descarté escribir un analizador más completo (recorrer el texto carácter a carácter respetando comillas) porque ningún comando del juego lo necesita. La única excepción es `echo`, que usa `replace` sobre el texto original para conservar los espacios.

**2. Guardar las banderas en un objeto `{ bandera: true/false }`.**
Así compruebo en un solo acceso si una bandera existe (`banderas[x] === undefined`) y si ya se entregó, y es imposible contar una dos veces. La alternativa descartada era un array con las banderas válidas más otro array de encontradas donde ir haciendo `push`: habría que recorrer ambos arrays y vigilar los duplicados a mano. El precio de mi opción es que para contar las encontradas tengo que recorrer el objeto con `for...in`.
