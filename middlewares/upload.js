const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento local para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // La carpeta donde se guardarán las fotos.
    // Asegúrate de que la ruta public/uploads exista.
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    // Renombra el archivo para evitar nombres duplicados
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Exportamos el middleware para poder usarlo en tus rutas
module.exports = upload;
