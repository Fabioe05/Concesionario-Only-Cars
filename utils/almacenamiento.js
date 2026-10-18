// ==========================================
// ALMACENAMIENTO DE IMÁGENES
// ==========================================
// Las fotos de los vehículos se guardan en MongoDB (Atlas), así sobreviven
// a los redeploys: el disco de hosts como Render es efímero.
const mongoose = require("mongoose");
const Imagen = require("../models/Imagen");

// Las imágenes se referencian con una URL como "/api/imagenes/<id>".
const PREFIJO = "/api/imagenes/";

/** Extrae los _id válidos de una lista de URLs de imágenes. */
function idsDesdeUrls(urls) {
  return (urls || [])
    .filter((url) => typeof url === "string" && url.startsWith(PREFIJO))
    .map((url) => url.slice(PREFIJO.length))
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
}

/**
 * Sube los buffers de Multer a la base de datos y devuelve sus URLs.
 * Si algo falla, borra las que ya se habían guardado (sin dejar huérfanas).
 */
async function subirImagenes(archivos) {
  const urls = [];
  try {
    for (const archivo of archivos || []) {
      const imagen = await Imagen.create({
        data: archivo.buffer,
        contentType: archivo.mimetype,
        size: archivo.size,
      });
      urls.push(`${PREFIJO}${imagen._id}`);
    }
  } catch (error) {
    await borrarImagenesPorUrl(urls);
    throw error;
  }

  return urls;
}

/** Borra de la base de datos las imágenes cuyas URLs se indiquen. */
async function borrarImagenesPorUrl(urls) {
  const ids = idsDesdeUrls(urls);
  if (ids.length === 0) return;
  await Imagen.deleteMany({ _id: { $in: ids } });
}

module.exports = { subirImagenes, borrarImagenesPorUrl, PREFIJO };
