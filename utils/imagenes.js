const fs = require("fs/promises");
const path = require("path");
const { borrarImagenesPorUrl } = require("./almacenamiento");

const CARPETA_UPLOADS = path.join(__dirname, "..", "public", "uploads");

/**
 * Borra las imágenes indicadas, sin importar de dónde vengan:
 * - Rutas locales "/uploads/..."           -> borra el archivo del disco.
 * - URLs de la base de datos "/api/imagenes/<id>" -> borra el documento.
 * - Cualquier otra cosa                    -> se ignora.
 * Los archivos que ya no existan también se ignoran.
 */
async function borrarImagenes(urls) {
  const lista = (urls || []).filter((url) => typeof url === "string");

  const borradosLocales = lista
    .filter((url) => url.startsWith("/uploads/"))
    .map((url) => {
      // path.basename evita que la ruta se salga de la carpeta de uploads.
      const ruta = path.join(CARPETA_UPLOADS, path.basename(url));
      return fs.unlink(ruta).catch(() => {});
    });

  const urlsEnBaseDeDatos = lista.filter((url) =>
    url.startsWith("/api/imagenes/"),
  );

  await Promise.all([
    ...borradosLocales,
    borrarImagenesPorUrl(urlsEnBaseDeDatos),
  ]);
}

module.exports = { borrarImagenes };
