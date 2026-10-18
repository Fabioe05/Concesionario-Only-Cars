const fs = require("fs/promises");
const path = require("path");

const CARPETA_UPLOADS = path.join(__dirname, "..", "public", "uploads");

/**
 * Borra del disco las imágenes indicadas.
 * - Solo acepta rutas que empiecen por /uploads/ (evita borrar archivos ajenos).
 * - Usa path.basename para que nunca se salga de la carpeta de uploads.
 * - Ignora los archivos que ya no existan.
 */
async function borrarImagenes(urls) {
  const rutas = (urls || [])
    .filter((url) => typeof url === "string" && url.startsWith("/uploads/"))
    .map((url) => path.join(CARPETA_UPLOADS, path.basename(url)));

  await Promise.all(rutas.map((ruta) => fs.unlink(ruta).catch(() => {})));
}

module.exports = { borrarImagenes };
