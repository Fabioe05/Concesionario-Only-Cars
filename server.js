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
const imagenesRouter = require("./controllers/imagenes");
const citasRouter = require("./controllers/citas");

const app = express();

// Render y la mayoría de hosts ponen la IP real en X-Forwarded-For.
// Confiamos en un proxy para que req.ip sea la IP del cliente y el
// límite de solicitudes del formulario de citas funcione por persona.
app.set("trust proxy", 1);

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

// Vistas del sitio: públicas. La API protege las escrituras.
app.use(
  "/contenedorPrincipal",
  express.static(path.join(RAIZ, "contenedorPrincipal"), {
    setHeaders: (res) => res.setHeader("Cache-Control", "no-store"),
  }),
);

// Panel de administración: la página es pública, la API exige rol admin.
app.use("/admin", express.static(path.join(RAIZ, "admin")));

// Portada pública.
app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(RAIZ, "index.html"), {
    headers: { "Cache-Control": "no-store" },
  });
});

// Archivos sueltos públicos (los usa el sitio y el login).
["index.css", "index.js", "sesion.js"].forEach((archivo) => {
  app.get(`/${archivo}`, (req, res) => res.sendFile(path.join(RAIZ, archivo)));
});

// --- Rutas de la API ---
app.use("/api/vehiculos", vehiculosRouter);
app.use("/api/auth", authRouter);
app.use("/api/marcas", marcasRouter);
app.use("/api/imagenes", imagenesRouter);
app.use("/api/citas", citasRouter);

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
