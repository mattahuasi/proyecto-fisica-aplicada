let port = null;
let writer = null;
let reader = null;
let keepReading = false;

const uiLCD = document.getElementById("pantallaLCD");
const uiLine1 = document.getElementById("lcd-line1");
const uiLine2 = document.getElementById("lcd-line2");
const uiInst = document.getElementById("txt-instrucciones");

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
    pisoMeta.style.top = `${scenePx(50)}px`;
    pisoMeta.style.width = `${scenePx(140)}px`;
  }
  if (cable) {
    cable.style.left = `${sceneX(298)}px`;
    cable.style.width = `${scenePx(4)}px`;
  }
  if (cabina) {
    cabina.style.left = `${sceneX(265)}px`;
    cabina.style.width = `${scenePx(70)}px`;
    cabina.style.height = `${scenePx(60)}px`;
    cabina.style.fontSize = `${scenePx(35)}px`;
  }
  if (metaCaja) {
    metaCaja.style.left = `${sceneX(450)}px`;
    metaCaja.style.width = `${scenePx(100)}px`;
    metaCaja.style.height = `${scenePx(60)}px`;
  }
  if (cajaWrap) cajaWrap.style.left = `${sceneX(20)}px`;
  if (cohete) {
    cohete.style.left = `${sceneX(275)}px`;
    cohete.style.width = `${scenePx(50)}px`;
    cohete.style.height = `${scenePx(60)}px`;
  }
  if (fuego) {
    fuego.style.left = `${sceneX(290)}px`;
    fuego.style.width = `${scenePx(20)}px`;
    fuego.style.height = `${scenePx(30)}px`;
  }
  if (canon) {
    canon.style.left = `${sceneX(10)}px`;
    canon.style.width = `${scenePx(40)}px`;
  }
  if (proyectil) {
    proyectil.style.left = `${sceneX(10)}px`;
    proyectil.style.bottom = `${scenePx(10)}px`;
  }
  if (diana) {
    diana.style.left = `${sceneX(450)}px`;
    diana.style.width = `${scenePx(40)}px`;
  }
}

window.addEventListener("resize", ajustarEscena);
ajustarEscena();

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
      "<b>Concepto:</b> Movimiento Rectilíneo Uniformemente Acelerado (MRUA). El potenciómetro fija la aceleración de tus propulsores; la gravedad tira hacia abajo todo el tiempo. El semáforo en vuelo solo es un aviso de velocidad — el resultado real se decide al tocar el suelo.",
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
      "<b>Concepto:</b> Composición de movimientos: MRU en el eje X (velocidad horizontal constante) y MRUA en el eje Y. El resultado queda fijo en pantalla hasta el próximo disparo o reinicio.",
    formula:
      "v<sub>x</sub> = v<sub>0</sub>·cos(θ) &nbsp;&nbsp;|&nbsp;&nbsp; v<sub>y</sub> = v<sub>0</sub>·sin(θ) − g·t",
    calculo:
      "<b>Cálculo:</b> Gira el potenciómetro para fijar θ y presiona el botón físico para disparar. Si el proyectil ya está en el aire, ese mismo botón cancela el disparo.",
    semNaranja: "N · Proyectil en vuelo.",
    semVerde: "V · Diste en el blanco.",
    semRojo: "R · Fallaste el disparo.",
  },
};

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
}

async function enviarComando(cmd) {
  if (writer) {
    try {
      await writer.write(cmd);
    } catch (e) {
      console.error("Error comando", e);
    }
  }
  actualizarPanelFisica(cmd);
}

function procesarTrama(trama) {
  const p = trama.split("|");
  if (p.length < 6) return;

  const modo = p[0];
  const led = p[1];
  const animX = parseInt(p[2], 10);
  const animY = parseInt(p[3], 10);

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
      cabina.style.top = `${scenePx(240)}px`;
      cable.style.height = "0px";
      setSceneFigure(cabina, "assets/images/cabin-fail.svg", "Cabina fallida");
      cabina.classList.add("status-fail");
    } else {
      const posPx = 240 - animY * 1.9;
      cabina.style.top = `${scenePx(posPx)}px`;
      cable.style.height = `${scenePx(led === "R" ? 0 : posPx)}px`;
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
    cohete.style.top = `${scenePx(altVisual)}px`;
    fuego.style.top = `${scenePx(altVisual + 60)}px`;
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
      proyectil.style.left = "10px";
      proyectil.style.bottom = "10px";
    } else {
      proyectil.style.left = 10 + animX * 2.5 + "px";
      proyectil.style.bottom = 10 + animY * 2.5 + "px";
    }
  }
}

document.getElementById("btnConectar").addEventListener("click", async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    document.getElementById("btnConectar").disabled = true;
    document.getElementById("btnDesconectar").disabled = false;
    uiInst.innerHTML = "<b>Estado:</b> Placa conectada correctamente.";

    const textEncoder = new TextEncoderStream();
    writer = textEncoder.writable.getWriter();
    textEncoder.readable.pipeTo(port.writable);

    const textDecoder = new TextDecoderStream();
    reader = textDecoder.readable.getReader();
    port.readable.pipeTo(textDecoder.writable);

    keepReading = true;
    let buffer = "";

    while (keepReading) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lineas = buffer.split("\n");
      buffer = lineas.pop();
      lineas.forEach((linea) => procesarTrama(linea.trim()));
    }
  } catch (err) {
    if (err.name !== "NotFoundError") alert("Error: " + err.message);
  }
});

document
  .getElementById("btnDesconectar")
  .addEventListener("click", async () => {
    keepReading = false;
    if (reader) {
      await reader.cancel();
      reader = null;
    }
    if (writer) {
      await writer.close();
      writer = null;
    }
    if (port) {
      await port.close();
      port = null;
    }
    document.getElementById("btnConectar").disabled = false;
    document.getElementById("btnDesconectar").disabled = true;
    uiLCD.className = "lcd-container";
    uiLine1.innerText = "DESCONECTADO";
    uiLine2.innerText = "";
  });
