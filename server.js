// ==========================================
// SERVIDOR (backend)
// Express + rutas + conexión a MongoDB + arranque HTTP
// ==========================================
require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const vehiculosRouter = require("./controllers/vehiculos");
const marcasRouter = require("./controllers/marcas");
const authRouter = require("./controllers/auth");

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/img", express.static(path.join(__dirname, "public/img")));

// --- Rutas de la API ---
app.use("/api/vehiculos", vehiculosRouter);
app.use("/api/auth", authRouter);
app.use("/api/marcas", marcasRouter);

// --- Manejo de errores de subida (multer responde HTML 500 por defecto) ---
app.use((error, req, res, next) => {
  if (error.name === "MulterError") {
    const mensajes = {
      LIMIT_UNEXPECTED_FILE: "Se superó el número máximo de imágenes permitido.",
      LIMIT_FILE_SIZE: "Una de las imágenes supera el tamaño máximo (5 MB).",
    };
    return res.status(400).json({
      error: mensajes[error.code] || "Error al subir las imágenes.",
    });
  }
  if (error.status === 400) {
    return res.status(400).json({ error: error.message });
  }
  return next(error);
});

// --- Conexión a MongoDB ---
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST);
    console.log("Conectado a mongo db");
  } catch (error) {
    console.log(error);
  }
})();

// --- Arranque del servidor HTTP ---
const server = http.createServer(app);
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`El servidor esta corriendo en el puerto ${PORT}`);
});
