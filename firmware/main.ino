#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

// Definición de Pines
const int PIN_POT = A0;
const int PIN_BOTON = 2;
const int LED_NARANJA = 3;
const int LED_VERDE = 4;
const int LED_ROJO = 5;

// Variables de Control
int modoJuego = 0;
bool estadoBotonAnterior = HIGH;
unsigned long tiempoAnterior = 0;

// Variables de Física y Estados
float posAscensor = 0;
bool cableRoto = false;
float caidaLibreY = 0;

float posCaja = 0;

float posLander = 100, velLander = 0;
bool aterrizado = false;
float velImpacto = 0;

float posX = 0, posY = 0, velX = 0, velY = 0;
bool volando = false;
bool disparoRealizado = false;   // ya hubo un disparo con resultado fijo
char resultadoCatapulta = 'N';
String resultadoTxtCatapulta = "";

void resetJuego() {
  posAscensor = 0; cableRoto = false; caidaLibreY = 0;
  posCaja = 0;
  posLander = 100; velLander = 0; aterrizado = false; velImpacto = 0;
  posX = 0; posY = 0; velX = 0; velY = 0; volando = false;
  disparoRealizado = false; resultadoCatapulta = 'N'; resultadoTxtCatapulta = "";

  // Apaga los LEDs de inmediato para que el reset se note al instante
  digitalWrite(LED_NARANJA, LOW);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_ROJO, LOW);
}

void setup() {
  Serial.begin(9600);
  pinMode(PIN_BOTON, INPUT_PULLUP);
  pinMode(LED_NARANJA, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);

  lcd.init();
  lcd.backlight();
  tiempoAnterior = millis();
}

void loop() {
  // Leer comandos de la Web
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == '0') { modoJuego = 0; resetJuego(); }
    else if (cmd == '1') { modoJuego = 1; resetJuego(); }
    else if (cmd == '2') { modoJuego = 2; resetJuego(); }
    else if (cmd == '3') { modoJuego = 3; resetJuego(); }
    else if (cmd == 'R' || cmd == 'r') { resetJuego(); }
  }

  bool botonPresionado = (digitalRead(PIN_BOTON) == LOW);
  bool flancoBajada = (botonPresionado && estadoBotonAnterior == HIGH);
  estadoBotonAnterior = !botonPresionado;

  int potRaw = analogRead(PIN_POT);

  unsigned long tiempoActual = millis();
  float dt = (tiempoActual - tiempoAnterior) / 1000.0;
  tiempoAnterior = tiempoActual;

  String lcd1 = "", lcd2 = "";
  char ledActivo = 'N';
  int animX = 0, animY = 0;

  // ==========================================
  // JUEGO 1: EL ASCENSOR (TENSION EN EL CABLE)
  // ==========================================
  if (modoJuego == 0) {
    if (flancoBajada) resetJuego();

    int tension = map(potRaw, 0, 1023, 0, 1000);
    float peso = 490.0; // ~490 N (50kg * 9.81)

    if (tension > 750 && !cableRoto) {
      cableRoto = true;
      caidaLibreY = posAscensor;
    }

    if (cableRoto) {
      caidaLibreY -= 40.0 * dt;
      animY = (int)caidaLibreY;
      ledActivo = 'R';
      lcd1 = "!PELIGRO CAIDA!";
      lcd2 = "CABLE ROTO     ";

      if (caidaLibreY <= 0) {
        caidaLibreY = 0;
        animY = -1;
      }
    } else {
      posAscensor = map(tension, 0, 750, 0, 100);
      if (posAscensor > 100) posAscensor = 100;
      animY = (int)posAscensor;

      lcd1 = "T:" + String(tension) + "N P:" + String((int)peso) + "N";

      if (tension >= 400 && tension <= 750) {
        ledActivo = 'V';
        lcd2 = "META ALCANZADA! ";
      } else if (tension < 400) {
        ledActivo = 'N';
        lcd2 = "Tension bajisima";
      }
    }
  }

  // ==========================================
  // JUEGO 2: CAJA (ROZAMIENTO ESTATICO Y DINAMICO)
  // ==========================================
  else if (modoJuego == 1) {
    if (flancoBajada) resetJuego();

    int fuerzaEmpuje = map(potRaw, 0, 1023, 0, 400);
    const int F_ROZ = 200;

    lcd1 = "Fe:" + String(fuerzaEmpuje) + "N Froz:" + String(F_ROZ) + "N";

    if (fuerzaEmpuje <= F_ROZ) {
      posCaja = 0;
      ledActivo = 'N';
      lcd2 = "ROZAMIENTO VENCE";
    } else {
      posCaja = map(fuerzaEmpuje, F_ROZ, 400, 0, 130);

      if (posCaja > 100) {
        ledActivo = 'R';
        lcd2 = "EXCESO IMPULSO! ";
      } else if (posCaja >= 80) {
        ledActivo = 'V';
        lcd2 = "META PERFECTA!! ";
      } else {
        ledActivo = 'N';
        lcd2 = "Moviendo...     ";
      }
    }

    animX = (int)(posCaja > 100 ? 100 : posCaja);
  }

  // ==========================================
  // JUEGO 3: ATERRIZAJE LUNAR (CINEMATICA MRUA + ENERGIA)
  // ==========================================
  else if (modoJuego == 2) {
    if (flancoBajada) resetJuego();

    const float GRAVEDAD = 9.81;    // g (m/s^2)
    const float MASA = 500.0;       // masa de la nave (kg)
    const float VEL_SEGURA = -3.0;  // por encima de esto, descenso tranquilo
    const float VEL_LIMITE = -6.0;  // umbral de impacto seguro/destruido

    int propulsor = map(potRaw, 0, 1023, 0, 20); // aceleracion de los propulsores
    float aceleracionY = propulsor - GRAVEDAD;   // a_neta = a_propulsor - g

    if (!aterrizado) {
      // MRUA: v = v0 + a*t ; y = y0 + v0*t + 1/2*a*t^2 (integrado paso a paso)
      velLander += aceleracionY * dt;
      posLander += velLander * dt;

      if (posLander <= 0) {
        // Se toca el suelo: se guarda la velocidad de impacto UNA sola vez
        posLander = 0;
        aterrizado = true;
        velImpacto = velLander;
      } else {
        // En pleno vuelo: solo es un aviso de velocidad, todavia no choco.
        if (velLander >= VEL_SEGURA) {
          ledActivo = 'V';
          lcd2 = "Descenso seguro ";
        } else {
          ledActivo = 'N';
          lcd2 = (velLander >= VEL_LIMITE) ? "Cuidado, rapido " : "!FRENA YA!      ";
        }
        lcd1 = "Alt:" + String((int)posLander) + "m V:" + String((int)velLander);
      }
    }

    if (aterrizado) {
      // Resultado final FIJO (no se vuelve a evaluar cada ciclo)
      float energiaImpacto = 0.5 * MASA * velImpacto * velImpacto; // Ec = 1/2 m v^2
      if (velImpacto >= VEL_LIMITE) {
        ledActivo = 'V';
        lcd2 = "ATERRIZAJE OK!  ";
      } else {
        ledActivo = 'R';
        lcd2 = "!NAVE DESTRUIDA!";
      }
      lcd1 = "Ec:" + String((int)energiaImpacto) + "J";
    }

    animY = (int)posLander;
  }

  // ==========================================
  // JUEGO 4: CATAPULTA (TIRO PARABOLICO)
  // ==========================================
  else if (modoJuego == 3) {
    int angulo = map(potRaw, 0, 1023, 0, 90);

    if (flancoBajada) {
      if (!volando) {
        // Nuevo disparo: MRU en X, MRUA en Y (gravedad).
        // Tambien borra el resultado del disparo anterior.
        velX = 45.0 * cos(angulo * 3.14159 / 180.0);
        velY = 45.0 * sin(angulo * 3.14159 / 180.0);
        volando = true;
        disparoRealizado = false;
        posX = 0; posY = 0;
      } else {
        // El mismo boton cancela el disparo si ya esta en el aire
        volando = false;
        posX = 0; posY = 0;
      }
    }

    if (volando) {
      velY -= 9.81 * dt;
      posX += velX * dt;
      posY += velY * dt;
      ledActivo = 'N';
      lcd2 = "Proyectil aire..";

      if (posY <= 0) {
        posY = 0;
        volando = false;
        disparoRealizado = true;

        // Zona de "blanco" alineada con la posicion visual de la diana
        if (posX >= 170 && posX <= 195) {
          resultadoCatapulta = 'V';
          resultadoTxtCatapulta = "!! BLANCO !!    ";
        } else {
          resultadoCatapulta = 'R';
          resultadoTxtCatapulta = "FALLASTE...     ";
        }
        posX = 0; // vuelve el canon a modo "apuntando" con el potenciometro
      }
    } else if (disparoRealizado) {
      // Mantiene el resultado visible (LED y LCD) hasta el proximo
      // disparo o hasta que reinicies, en vez de perderse al instante.
      ledActivo = resultadoCatapulta;
      lcd2 = resultadoTxtCatapulta;
    } else {
      ledActivo = 'N';
      lcd2 = "Apunta y Dispara";
    }

    animX = (int)posX; animY = (int)posY;
    lcd1 = "Ang:" + String(angulo) + "g X:" + String(animX) + "m";
  }

  // Enviar datos
  Serial.print(modoJuego); Serial.print("|");
  Serial.print(ledActivo); Serial.print("|");
  Serial.print(animX); Serial.print("|");
  Serial.print(animY); Serial.print("|");
  Serial.print(padStr(lcd1)); Serial.print("|");
  Serial.println(padStr(lcd2));

  digitalWrite(LED_NARANJA, ledActivo == 'N' ? HIGH : LOW);
  digitalWrite(LED_VERDE,   ledActivo == 'V' ? HIGH : LOW);
  digitalWrite(LED_ROJO,    ledActivo == 'R' ? HIGH : LOW);

  lcd.setCursor(0,0); lcd.print(padStr(lcd1));
  lcd.setCursor(0,1); lcd.print(padStr(lcd2));

  delay(40);
}

String padStr(String str) {
  while(str.length() < 16) str += " ";
  return str.substring(0, 16);
}
