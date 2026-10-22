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
const { userExtractor, requiereSesionPagina } = require("./middlewares/auth");

const vehiculosRouter = require("./controllers/vehiculos");
const marcasRouter = require("./controllers/marcas");
const authRouter = require("./controllers/auth");
const imagenesRouter = require("./controllers/imagenes");

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

// Vistas del sitio: solo el login, el registro y su CSS son públicos.
const PAGINAS_PUBLICAS = ["/login/", "/registro/", "/auth.css"];

app.use("/contenedorPrincipal", (req, res, next) => {
  if (PAGINAS_PUBLICAS.some((ruta) => req.path.startsWith(ruta))) {
    return next();
  }
  return requiereSesionPagina(req, res, next);
});

app.use(
  "/contenedorPrincipal",
  express.static(path.join(RAIZ, "contenedorPrincipal"), {
    setHeaders: (res) => res.setHeader("Cache-Control", "no-store"),
  }),
);

// Panel de administración: se queda como estaba (la API ya exige rol admin).
app.use("/admin", express.static(path.join(RAIZ, "admin")));

// Portada: sin sesión se muestra la bienvenida pública; con sesión, la home.
app.get(
  ["/", "/index.html"],
  (req, res, next) => {
    if (!req.cookies?.accessToken) {
      return res.redirect("/bienvenida.html");
    }
    return requiereSesionPagina(req, res, next);
  },
  (req, res) => {
    res.sendFile(path.join(RAIZ, "index.html"), {
      headers: { "Cache-Control": "no-store" },
    });
  },
);

// Archivos sueltos públicos (los usa la bienvenida y el login).
["index.css", "index.js", "sesion.js", "bienvenida.html", "bienvenida.css"].forEach(
  (archivo) => {
    app.get(`/${archivo}`, (req, res) => res.sendFile(path.join(RAIZ, archivo)));
  },
);

// Toda la API exige sesión, salvo entrar, registrarse y cerrar sesión.
const RUTAS_API_PUBLICAS = ["/auth/login", "/auth/register", "/auth/logout"];

app.use("/api", (req, res, next) => {
  if (RUTAS_API_PUBLICAS.some((ruta) => req.path.startsWith(ruta))) {
    return next();
  }
  return userExtractor(req, res, next);
});

// --- Rutas de la API ---
app.use("/api/vehiculos", vehiculosRouter);
app.use("/api/auth", authRouter);
app.use("/api/marcas", marcasRouter);
app.use("/api/imagenes", imagenesRouter);

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
