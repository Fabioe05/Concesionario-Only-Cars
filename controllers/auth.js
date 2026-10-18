const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ajusta la ruta a tu modelo
const { userExtractor } = require("../middlewares/auth");

// 1. RUTA DE REGISTRO
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hashear contraseña usando el método estático de tu modelo
    const passwordHash = await User.hashPassword(password);

    // Crear usuario
    const user = new User({ name, email, passwordHash });
    await user.save();

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 2. RUTA DE LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    // Verificar contraseña usando tu método de instancia
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    // Crear Token
    const userForToken = { id: user._id, email: user.email, role: user.role };
    // Asegúrate de tener ACCESS_TOKEN_SECRET en tu archivo .env
    const token = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Enviar Token en Cookie (como espera tu userExtractor.js)
    res.cookie("accessToken", token, {
      httpOnly: true, // Protege contra ataques XSS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });

    // Enviamos el nombre para guardarlo en el frontend y saber quién inició sesión
    res
      .status(200)
      .json({ message: "Login exitoso", name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 3. RUTA DE LOGOUT (Cerrar sesión)
authRouter.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Sesión cerrada exitosamente" });
});

// 4. RUTA DEL PERFIL (datos del usuario logueado)
authRouter.get("/me", userExtractor, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Sesión no válida" });
  }

  const { id, name, email, role, createdAt } = req.user;
  res.status(200).json({ id, name, email, role, createdAt });
});

module.exports = authRouter;
