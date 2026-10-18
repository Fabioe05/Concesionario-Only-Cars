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

// --- Archivos estáticos (lista blanca: NUNCA servir la raíz del proyecto) ---
// Servir __dirname completo expondría server.js, package.json, models/,
// controllers/, middlewares/, .git, etc. Por eso montamos solo lo público.
const RAIZ = __dirname;

// Imágenes del sitio y archivos subidos por el panel.
app.use("/img", express.static(path.join(RAIZ, "public", "img")));
app.use("/uploads", express.static(path.join(RAIZ, "public", "uploads")));

// Vistas del sitio y del panel de administración.
app.use("/contenedorPrincipal", express.static(path.join(RAIZ, "contenedorPrincipal")));
app.use("/admin", express.static(path.join(RAIZ, "admin")));

// Archivos sueltos de la portada (solo estos; el resto de la raíz queda bloqueado).
const ARCHIVOS_PUBLICOS = ["index.html", "index.css", "index.js", "sesion.js"];
app.get("/", (req, res) => res.sendFile(path.join(RAIZ, "index.html")));
ARCHIVOS_PUBLICOS.forEach((archivo) => {
  app.get(`/${archivo}`, (req, res) => res.sendFile(path.join(RAIZ, archivo)));
});

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
// Render (y la mayoría de hosts) inyectan el puerto en process.env.PORT.
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`El servidor esta corriendo en el puerto ${PORT}`);
});
