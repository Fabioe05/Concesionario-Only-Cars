const multer = require("multer");

// Las imágenes ya no se escriben en disco: Multer las deja en memoria
// (req.files[i].buffer) y el controlador las sube a Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  // Máximo 5 MB por imagen.
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // El navegador ya filtra por "accept", pero el servidor debe validarlo.
    if (file.mimetype.startsWith("image/")) return cb(null, true);

    const error = new Error("Solo se permiten archivos de imagen");
    error.status = 400;
    cb(error);
  },
});

// Exportamos el middleware para poder usarlo en las rutas
module.exports = upload;
