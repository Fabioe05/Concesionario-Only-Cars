const express = require("express");
const Marca = require("../models/Marca");

const marcasRouter = express.Router();

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

module.exports = marcasRouter;
