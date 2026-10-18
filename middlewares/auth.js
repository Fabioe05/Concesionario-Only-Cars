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

module.exports = { userExtractor, requireAdmin };