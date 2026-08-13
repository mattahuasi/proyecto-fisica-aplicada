const uiLCD = document.getElementById("pantallaLCD");
const uiLine1 = document.getElementById("lcd-line1");
const uiLine2 = document.getElementById("lcd-line2");
const potSlider = document.getElementById("potSlider");
const potValue = document.getElementById("potValue");
const btnPulso = document.getElementById("btnPulso");

function getSceneScale() {
  const box = document.querySelector(".anim-box");
  if (!box) return 1;
  return Math.min(1, box.clientWidth / 600);
}

function getSceneOriginX() {
  const box = document.querySelector(".anim-box");
  if (!box) return 0;
  const scale = getSceneScale();
  return Math.round((box.clientWidth - 600 * scale) / 2);
}

function scenePx(value) {
  return Math.round(value * getSceneScale());
}

function sceneYPx(value) {
  const box = document.querySelector(".anim-box");
  if (!box) return value;
  return Math.round(value * (box.clientHeight / 300));
}

function sceneX(value) {
  return getSceneOriginX() + scenePx(value);
}

function setSceneFigure(element, src, alt = "elemento") {
  if (!element) return;
  element.innerHTML = `<img src="${src}" alt="${alt}" />`;
}

function ajustarEscena() {
  const box = document.querySelector(".anim-box");
  if (!box) return;

  const pisoMeta = document.getElementById("piso-meta");
  const cable = document.getElementById("cable");
  const cabina = document.getElementById("cabina");
  const metaCaja = document.getElementById("meta-caja");
  const cajaWrap = document.getElementById("caja-wrapper");
  const cohete = document.getElementById("cohete");
  const fuego = document.getElementById("fuego");
  const canon = document.getElementById("canon");
  const proyectil = document.getElementById("proyectil");
  const diana = document.getElementById("diana");

  if (pisoMeta) {
    pisoMeta.style.left = `${sceneX(230)}px`;
    pisoMeta.style.top = `${sceneYPx(50)}px`;
    pisoMeta.style.width = `${scenePx(140)}px`;
  }
  if (cable) {
    cable.style.left = `${sceneX(298)}px`;
    cable.style.width = `${scenePx(4)}px`;
  }
  if (cabina) {
    cabina.style.left = `${sceneX(265)}px`;
    cabina.style.width = `${scenePx(70)}px`;
    cabina.style.height = `${sceneYPx(60)}px`;
  }
  if (metaCaja) {
    metaCaja.style.left = `${sceneX(450)}px`;
    metaCaja.style.width = `${scenePx(100)}px`;
    metaCaja.style.height = `${sceneYPx(60)}px`;
  }
  if (cajaWrap) cajaWrap.style.left = `${sceneX(20)}px`;
  if (cohete) {
    cohete.style.left = `${sceneX(275)}px`;
    cohete.style.width = `${scenePx(50)}px`;
    cohete.style.height = `${sceneYPx(60)}px`;
  }
  if (fuego) {
    fuego.style.left = `${sceneX(290)}px`;
    fuego.style.width = `${scenePx(20)}px`;
    fuego.style.height = `${sceneYPx(30)}px`;
  }
  if (canon) {
    canon.style.left = `${sceneX(10)}px`;
    canon.style.width = `${scenePx(40)}px`;
  }
  if (proyectil) {
    proyectil.style.left = `${sceneX(10)}px`;
    proyectil.style.bottom = `${sceneYPx(10)}px`;
  }
  if (diana) {
    diana.style.left = `${sceneX(450)}px`;
    diana.style.width = `${scenePx(40)}px`;
  }
}

window.addEventListener("resize", ajustarEscena);
ajustarEscena();

const HIGH = true;
let modoJuego = 0;
let estadoBotonAnterior = HIGH;
let tiempoAnterior = performance.now();
let simButtonDown = false;

let posAscensor = 0;
let cableRoto = false;
let caidaLibreY = 0;

let posCaja = 0;

let posLander = 100;
let velLander = 0;
let aterrizado = false;
let velImpacto = 0;

let posX = 0;
let posY = 0;
let velX = 0;
let velY = 0;
let volando = false;
let disparoRealizado = false;
let resultadoCatapulta = "N";
let resultadoTxtCatapulta = "";

const datosFisica = {
  0: {
    titulo: "Juego 1: Elevador (Dinámica — Tensión en el cable)",
    concepto:
      "<b>Concepto:</b> Segunda Ley de Newton. Para subir la cabina hace falta más fuerza que el propio peso del sistema; si la tensión supera el límite del cable, este se rompe.",
    formula:
      "T = m·g + m·a &nbsp;&nbsp;|&nbsp;&nbsp; 400 N ≤ T<sub>meta</sub> ≤ 750 N",
    calculo:
      "<b>Cálculo:</b> Gira el potenciómetro para aplicar tensión (T) al cable y llevar la cabina al Piso 3. Si te pasas de 750 N, el cable se rompe y la cabina cae en caída libre.",
    semNaranja: "N · T &lt; 400 N: Falta fuerza.",
    semVerde: "V · 400–750 N: Altura correcta.",
    semRojo: "R · T &gt; 750 N: Cable roto (caída libre).",
  },
  1: {
    titulo: "Juego 2: Empujar Caja (Dinámica — Rozamiento)",
    concepto:
      "<b>Concepto:</b> Rozamiento estático y dinámico. Mientras la fuerza aplicada no supere la fuerza de rozamiento, la caja no se mueve; al superarla, entra en movimiento.",
    formula:
      "F<sub>roz</sub> = μ·N = 200 N &nbsp;&nbsp;|&nbsp;&nbsp; x ∝ (F − F<sub>roz</sub>)",
    calculo:
      "<b>Cálculo:</b> Aplica más de 200 N para vencer el rozamiento y avanzar. Detén la caja dentro de la zona de meta verde; si empujas de más, se pasa y choca.",
    semNaranja: "N · F ≤ 200 N: El rozamiento vence.",
    semVerde: "V · Caja dentro de la meta.",
    semRojo: "R · Exceso de impulso: se pasó de la meta.",
  },
  2: {
    titulo: "Juego 3: Aterrizaje Lunar (Cinemática MRUA + Energía)",
    concepto:
      "<b>Concepto:</b> Movimiento Rectilíneo Uniformemente Acelerado (MRUA). El potenciómetro fija la aceleración de tus propulsores; la gravedad tira hacia abajo todo el tiempo.",
    formula:
      "a = a<sub>prop</sub> − g &nbsp;&nbsp;|&nbsp;&nbsp; v = v<sub>0</sub> + a·t &nbsp;&nbsp;|&nbsp;&nbsp; E<sub>c</sub> = ½·m·v<sup>2</sup>",
    calculo:
      "<b>Cálculo:</b> Sube el potenciómetro para dar más empuje y frenar la caída. Si tocas el suelo con velocidad de impacto mayor o igual a −6 m/s, aterrizas OK; si vas más rápido, se destruye.",
    semNaranja: "N · En vuelo, V &lt; −3 m/s: cuidado / frena.",
    semVerde: "V · En vuelo con V ≥ −3 m/s, o aterrizaje con V ≥ −6 m/s.",
    semRojo: "R · Solo al tocar el suelo con V &lt; −6 m/s: nave destruida.",
  },
  3: {
    titulo: "Juego 4: Catapulta (Tiro Parabólico)",
    concepto:
      "<b>Concepto:</b> Composición de movimientos: MRU en el eje X y MRUA en el eje Y. El resultado queda fijo en pantalla hasta el próximo disparo o reinicio.",
    formula:
      "v<sub>x</sub> = v<sub>0</sub>·cos(θ) &nbsp;&nbsp;|&nbsp;&nbsp; v<sub>y</sub> = v<sub>0</sub>·sin(θ) − g·t",
    calculo:
      "<b>Cálculo:</b> Gira el potenciómetro para fijar θ y presiona el botón para disparar. Si el proyectil ya está en el aire, ese mismo botón cancela el disparo.",
    semNaranja: "N · Proyectil en vuelo.",
    semVerde: "V · Diste en el blanco.",
    semRojo: "R · Fallaste el disparo.",
  },
};

function padStr(str) {
  while (str.length < 16) str += " ";
  return str.substring(0, 16);
}

function actualizarPanelFisica(modo) {
  if (modo === "R" || modo === "r") return;
  const info = datosFisica[modo];
  if (!info) return;
  document.getElementById("info-titulo").innerText = info.titulo;
  document.getElementById("info-concepto").innerHTML = info.concepto;
  document.getElementById("info-formula").innerHTML = info.formula;
  document.getElementById("info-calculo").innerHTML = info.calculo;
  document.getElementById("sem-txt-naranja").innerHTML = info.semNaranja;
  document.getElementById("sem-txt-verde").innerHTML = info.semVerde;
  document.getElementById("sem-txt-rojo").innerHTML = info.semRojo;
  document.getElementById("info-semaforo").style.display = "flex";
  setJuegoActivo(modo);
}

function setJuegoActivo(modo) {
  document.querySelectorAll(".btn-juego[data-juego]").forEach((button) => {
    const activo = button.dataset.juego === String(modo);
    button.classList.toggle("is-active", activo);
    button.setAttribute("aria-pressed", String(activo));
  });
}

function resetJuego() {
  posAscensor = 0;
  cableRoto = false;
  caidaLibreY = 0;
  posCaja = 0;
  posLander = 100;
  velLander = 0;
  aterrizado = false;
  velImpacto = 0;
  posX = 0;
  posY = 0;
  velX = 0;
  velY = 0;
  volando = false;
  disparoRealizado = false;
  resultadoCatapulta = "N";
  resultadoTxtCatapulta = "";
}

function resetVisual() {
  uiLCD.className = "lcd-container";
  uiLine1.innerText = "SISTEMA LISTO.";
  uiLine2.innerText = "SIMULADOR LOCAL.";
  document
    .querySelectorAll(".sys-container")
    .forEach((el) => (el.style.display = "none"));
  document.getElementById("info-semaforo").style.display = "none";
}

function ejecutarResetCompleto() {
  resetJuego();
  resetVisual();
}

function enviarComando(cmd) {
  if (cmd === "R" || cmd === "r") {
    ejecutarResetCompleto();
    return;
  }
  modoJuego = parseInt(cmd, 10);
  ejecutarResetCompleto();
  actualizarPanelFisica(cmd);
}

function procesarTrama(trama) {
  const p = trama.split("|");
  if (p.length < 6) return;

  const modo = p[0];
  const led = p[1];
  const animX = parseInt(p[2], 10);
  const animY = parseInt(p[3], 10);

  setJuegoActivo(modo);

  uiLine1.innerText = p[4];
  uiLine2.innerText = p[5];

  uiLCD.className = "lcd-container";
  if (led === "N") uiLCD.classList.add("led-naranja");
  if (led === "V") uiLCD.classList.add("led-verde");
  if (led === "R") uiLCD.classList.add("led-rojo");

  document
    .querySelectorAll(".sys-container")
    .forEach((el) => (el.style.display = "none"));

  if (modo === "0") {
    document.getElementById("ascensor-sys").style.display = "block";
    const cabina = document.getElementById("cabina");
    const cable = document.getElementById("cable");

    if (animY === -1) {
      cabina.style.top = `${sceneYPx(240)}px`;
      cable.style.height = "0px";
      setSceneFigure(cabina, "assets/images/cabin-fail.svg", "Cabina fallida");
      cabina.classList.add("status-fail");
    } else {
      const animacionVisualY = led === "R" ? (animY * animY) / 100 : animY;
      const posPx = 240 - animacionVisualY * 1.9;
      cabina.style.top = `${sceneYPx(posPx)}px`;
      cable.style.height = `${sceneYPx(led === "R" ? 0 : posPx)}px`;
      setSceneFigure(
        cabina,
        led === "R"
          ? "assets/images/cabin-fail.svg"
          : "assets/images/cabin.svg",
        led === "R" ? "Cabina fallida" : "Cabina",
      );
      cabina.classList.toggle("status-fail", led === "R");
    }
  } else if (modo === "1") {
    document.getElementById("friccion-sys").style.display = "block";
    const cajaWrap = document.getElementById("caja-wrapper");
    const personaje = document.getElementById("caja-personaje");
    const cajaBox = document.getElementById("caja-fisica");

    cajaWrap.style.left = `${scenePx(20 + animX * 4.3)}px`;

    if (led === "R") {
      setSceneFigure(personaje, "assets/images/runner.svg", "Persona");
      setSceneFigure(cajaBox, "assets/images/explosion.svg", "Explosión");
    } else if (led === "V") {
      setSceneFigure(personaje, "assets/images/runner.svg", "Persona");
      setSceneFigure(cajaBox, "assets/images/box.svg", "Caja");
    } else {
      setSceneFigure(personaje, "assets/images/runner.svg", "Persona");
      setSceneFigure(cajaBox, "assets/images/box.svg", "Caja");
    }
  } else if (modo === "2") {
    document.getElementById("lander-sys").style.display = "block";
    const cohete = document.getElementById("cohete");
    const fuego = document.getElementById("fuego");
    const altVisual = 230 - animY * 2.1;
    cohete.style.top = `${sceneYPx(altVisual)}px`;
    fuego.style.top = `${sceneYPx(altVisual + 60)}px`;
    fuego.style.display = led !== "R" && animY > 0 ? "block" : "none";
    setSceneFigure(
      cohete,
      led === "R" ? "assets/images/explosion.svg" : "assets/images/rocket.svg",
      led === "R" ? "Explosión" : "Nave",
    );
  } else if (modo === "3") {
    document.getElementById("tiro-sys").style.display = "block";
    const proyectil = document.getElementById("proyectil");
    const canon = document.getElementById("canon");

    if (animX === 0 && animY === 0) {
      let angulo = parseInt(p[4].substring(4, 6), 10);
      if (Number.isNaN(angulo)) angulo = 45;
      canon.style.transform = `rotate(-${angulo}deg)`;
      proyectil.style.left = `${sceneX(10)}px`;
      proyectil.style.bottom = `${sceneYPx(10)}px`;
    } else {
      proyectil.style.left = `${sceneX(10 + animX * 2.5)}px`;
      proyectil.style.bottom = `${sceneYPx(10 + animY * 2.5)}px`;
    }
  }
}

function simularPaso() {
  const potRaw = parseInt(potSlider.value, 10);
  const botonPresionado = simButtonDown;
  const flancoBajada = botonPresionado && estadoBotonAnterior === HIGH;
  estadoBotonAnterior = !botonPresionado;

  const tiempoActual = performance.now();
  const dt = (tiempoActual - tiempoAnterior) / 1000;
  tiempoAnterior = tiempoActual;

  let lcd1 = "";
  let lcd2 = "";
  let ledActivo = "N";
  let animX = 0;
  let animY = 0;

  if (modoJuego === 0) {
    if (flancoBajada) resetJuego();

    const tension = Math.round((potRaw / 1023) * 1000);
    const peso = 490;

    if (tension > 750 && !cableRoto) {
      cableRoto = true;
      caidaLibreY = posAscensor;
    }

    if (cableRoto) {
      caidaLibreY -= 40 * dt;
      animY = Math.floor(caidaLibreY);
      ledActivo = "R";
      lcd1 = "!PELIGRO CAIDA!";
      lcd2 = "CABLE ROTO     ";

      if (caidaLibreY <= 0) {
        caidaLibreY = 0;
        animY = -1;
      }
    } else {
      posAscensor = Math.min((tension / 750) * 100, 100);
      animY = Math.floor(posAscensor);
      lcd1 = "T:" + tension + "N P:" + peso + "N";

      if (tension >= 400 && tension <= 750) {
        ledActivo = "V";
        lcd2 = "META ALCANZADA! ";
      } else if (tension < 400) {
        ledActivo = "N";
        lcd2 = "Tension bajisima";
      }
    }
  } else if (modoJuego === 1) {
    if (flancoBajada) resetJuego();

    const fuerzaEmpuje = Math.round((potRaw / 1023) * 400);
    const F_ROZ = 200;

    lcd1 = "Fe:" + fuerzaEmpuje + "N Froz:" + F_ROZ + "N";

    if (fuerzaEmpuje <= F_ROZ) {
      posCaja = 0;
      ledActivo = "N";
      lcd2 = "ROZAMIENTO VENCE";
    } else {
      posCaja = ((fuerzaEmpuje - F_ROZ) / (400 - F_ROZ)) * 130;
      if (posCaja > 100) {
        ledActivo = "R";
        lcd2 = "EXCESO IMPULSO! ";
      } else if (posCaja >= 80) {
        ledActivo = "V";
        lcd2 = "META PERFECTA!! ";
      } else {
        ledActivo = "N";
        lcd2 = "Moviendo...     ";
      }
    }

    animX = Math.floor(posCaja > 100 ? 100 : posCaja);
  } else if (modoJuego === 2) {
    if (flancoBajada) resetJuego();

    const GRAVEDAD = 9.81;
    const MASA = 500;
    const VEL_SEGURA = -3.0;
    const VEL_LIMITE = -6.0;

    const propulsor = Math.round((potRaw / 1023) * 20);
    const aceleracionY = propulsor - GRAVEDAD;

    if (!aterrizado) {
      velLander += aceleracionY * dt;
      posLander += velLander * dt;

      if (posLander <= 0) {
        posLander = 0;
        aterrizado = true;
        velImpacto = velLander;
      } else {
        if (velLander >= VEL_SEGURA) {
          ledActivo = "V";
          lcd2 = "Descenso seguro ";
        } else {
          ledActivo = "N";
          lcd2 =
            velLander >= VEL_LIMITE ? "Cuidado, rapido " : "!FRENA YA!      ";
        }
        lcd1 = "Alt:" + Math.floor(posLander) + "m V:" + Math.floor(velLander);
      }
    }

    if (aterrizado) {
      const energiaImpacto = 0.5 * MASA * velImpacto * velImpacto;
      if (velImpacto >= VEL_LIMITE) {
        ledActivo = "V";
        lcd2 = "ATERRIZAJE OK!  ";
      } else {
        ledActivo = "R";
        lcd2 = "!NAVE DESTRUIDA!";
      }
      lcd1 = "Ec:" + Math.floor(energiaImpacto) + "J";
    }

    animY = Math.floor(posLander);
  } else if (modoJuego === 3) {
    const angulo = Math.round((potRaw / 1023) * 90);

    if (flancoBajada) {
      if (!volando) {
        velX = 45 * Math.cos((angulo * Math.PI) / 180);
        velY = 45 * Math.sin((angulo * Math.PI) / 180);
        volando = true;
        disparoRealizado = false;
        posX = 0;
        posY = 0;
      } else {
        volando = false;
        posX = 0;
        posY = 0;
      }
    }

    if (volando) {
      velY -= 9.81 * dt;
      posX += velX * dt;
      posY += velY * dt;
      ledActivo = "N";
      lcd2 = "Proyectil aire..";

      if (posY <= 0) {
        posY = 0;
        volando = false;
        disparoRealizado = true;

        if (posX >= 170 && posX <= 195) {
          resultadoCatapulta = "V";
          resultadoTxtCatapulta = "!! BLANCO !!    ";
        } else {
          resultadoCatapulta = "R";
          resultadoTxtCatapulta = "FALLASTE...     ";
        }
        posX = 0;
      }
    } else if (disparoRealizado) {
      ledActivo = resultadoCatapulta;
      lcd2 = resultadoTxtCatapulta;
    } else {
      ledActivo = "N";
      lcd2 = "Apunta y Dispara";
    }

    animX = Math.floor(posX);
    animY = Math.floor(posY);
    lcd1 = "Ang:" + angulo + "g X:" + animX + "m";
  }

  const trama = [
    String(modoJuego),
    ledActivo,
    String(animX),
    String(animY),
    padStr(lcd1),
    padStr(lcd2),
  ].join("|");

  procesarTrama(trama);
  requestAnimationFrame(simularPaso);
}

potSlider.addEventListener("input", () => {
  potValue.textContent = potSlider.value;
});

function setPulso(down) {
  simButtonDown = down;
  btnPulso.classList.toggle("is-down", down);
  btnPulso.textContent = down ? "Pulsador activo" : "Mantener presionado";
}

btnPulso.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  setPulso(true);
});

btnPulso.addEventListener("pointerup", () => setPulso(false));
btnPulso.addEventListener("pointerleave", () => setPulso(false));
btnPulso.addEventListener("pointercancel", () => setPulso(false));
btnPulso.addEventListener("lostpointercapture", () => setPulso(false));
window.addEventListener("pointerup", () => setPulso(false));

potValue.textContent = potSlider.value;
setPulso(false);
actualizarPanelFisica("0");
requestAnimationFrame(simularPaso);
