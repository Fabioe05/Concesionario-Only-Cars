const express = require("express");
const mongoose = require("mongoose");
const Marca = require("../models/Marca");
const Vehiculo = require("../models/Vehiculo");
const { userExtractor, requireAdmin } = require("../middlewares/auth");

const marcasRouter = express.Router();

/**
 * Escapa los caracteres especiales de una expresión regular.
 * Así el nombre se busca como texto literal y nadie puede colar un patrón.
 */
function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Lista todas las marcas registradas.
 * GET /api/marcas
 */
marcasRouter.get("/", async (req, res) => {
  try {
    const marcas = await Marca.find();
    return res.json(marcas);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener las marcas",
      error: error.message || error,
    });
  }
});

/**
 * Registrar una nueva marca.
 * POST /api/marcas
 */
marcasRouter.post("/", userExtractor, requireAdmin, async (req, res) => {
  try {
    const nombre = (req.body.name || "").trim();

    if (!nombre) {
      return res
        .status(400)
        .json({ error: "El nombre de la marca es requerido" });
    }

    // Duplicados sin distinguir mayúsculas/minúsculas ("kia" == "Kia").
    const existente = await Marca.findOne({
      name: new RegExp(`^${escaparRegex(nombre)}$`, "i"),
    });

    if (existente) {
      return res
        .status(409)
        .json({ error: `La marca "${existente.name}" ya está registrada` });
    }

    const marca = await new Marca({ name: nombre }).save();
    return res.status(201).json(marca);
  } catch (error) {
    if (error.name === "ValidationError") {
      const detalles = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: "Error de validación", detalles });
    }
    return res.status(500).json({
      mensaje: "Error al registrar la marca",
      error: error.message || error,
    });
  }
});

/**
 * Eliminar una marca por su ID (solo si ningún vehículo la usa).
 * DELETE /api/marcas/:id
 */
marcasRouter.delete("/:id", userExtractor, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de marca no válido" });
    }

    const marca = await Marca.findById(id);
    if (!marca) {
      return res.status(404).json({ mensaje: "Marca no encontrada" });
    }

    // Bloqueo: los vehículos guardan marca_id, borrarla los dejaría huérfanos.
    const enUso = await Vehiculo.countDocuments({ marca_id: marca._id });
    if (enUso > 0) {
      return res.status(409).json({
        error: `No se puede eliminar "${marca.name}": ${enUso} vehículo(s) la usan.`,
      });
    }

    await marca.deleteOne();
    return res.json({ mensaje: "Marca eliminada exitosamente", marca });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al eliminar la marca",
      error: error.message || error,
    });
  }
});

module.exports = marcasRouter;
