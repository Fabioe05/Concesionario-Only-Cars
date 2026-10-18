const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento local para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // La carpeta donde se guardarán las fotos (ruta absoluta para no depender
    // del directorio desde el que se arranque el servidor).
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: function (req, file, cb) {
    // Renombra el archivo para evitar nombres duplicados
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
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

// Exportamos el middleware para poder usarlo en tus rutas
module.exports = upload;
