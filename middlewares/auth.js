const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userExtractor = async (request, response, next) => {
  try {
    const token = request.cookies?.accessToken;
    if (!token) {
      return response.sendStatus(401);
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    request.user = user;
  } catch (error) {
    return response.sendStatus(403);
  }

  next();
};

const requireAdmin = (request, response, next) => {
  if (!request.user || request.user.role !== "admin") {
    return response.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
  }
  next();
};

// Para páginas HTML: si no hay sesión, redirige al login guardando el destino.
// No consulta la base de datos: solo comprueba que el token esté firmado.
const requiereSesionPagina = (request, response, next) => {
  const token = request.cookies?.accessToken;
  const login = "/contenedorPrincipal/login/login.html";
  const destino = encodeURIComponent(request.originalUrl);

  if (!token) {
    return response.redirect(`${login}?redirect=${destino}`);
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    response.set("Cache-Control", "no-store");
    return next();
  } catch (error) {
    return response.redirect(`${login}?redirect=${destino}`);
  }
};

module.exports = { userExtractor, requireAdmin, requiereSesionPagina };