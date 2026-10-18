const express = require("express");
const mongoose = require("mongoose");
const Imagen = require("../models/Imagen");

const imagenesRouter = express.Router();

/**
 * Sirve una imagen guardada en la base de datos.
 * GET /api/imagenes/:id
 */
imagenesRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mensaje: "ID de imagen no válido" });
  }

  try {
    // La imagen en sí (binario) no hace falta procesarla, solo devolverla.
    const imagen = await Imagen.findById(id);
    if (!imagen) {
      return res.status(404).json({ mensaje: "Imagen no encontrada" });
    }

    res.set("Content-Type", imagen.contentType || "application/octet-stream");
    // Una imagen no cambia una vez subida: se puede cachear "para siempre".
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(imagen.data);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener la imagen",
      error: error.message || error,
    });
  }
});

module.exports = imagenesRouter;
