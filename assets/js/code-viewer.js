const codePath = "../firmware/main.ino";
const codeBlock = document.getElementById("code-output");
const statusBox = document.getElementById("status");

async function loadCode() {
  try {
    const response = await fetch(codePath);
    if (!response.ok) throw new Error("No se pudo leer el archivo");
    const text = await response.text();
    codeBlock.textContent = text;
    statusBox.textContent = "Código cargado correctamente.";
  } catch (error) {
    codeBlock.textContent =
      "// Error al cargar firmware/main.ino\n// Verifica que el archivo exista en la ruta esperada.";
    statusBox.textContent = "No se pudo cargar el archivo automáticamente.";
    console.error(error);
  }
}

document.getElementById("copy-code").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeBlock.textContent);
    statusBox.textContent = "Código copiado al portapapeles.";
  } catch (error) {
    statusBox.textContent =
      "No se pudo copiar automáticamente. Puedes seleccionar el texto manualmente.";
    console.error(error);
  }
});

loadCode();
