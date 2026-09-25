require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Vehiculo = require("./models/Vehiculo");
const Marca = require("./models/Marca");
const cors = require("cors");
const path = require("path");

//middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "/")));

// Conexión a MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST);
    console.log("Conectado a mongo db");
  } catch (error) {
    console.log(error);
  }
})();

// 1. Obtener todos los vehículos (para el Home o catálogo)
app.get("/api/vehiculos", async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find();
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener vehículos", error });
  }
});

// 2. Obtener UN vehículo por su ID de MongoDB
app.get("/api/vehiculos/:id", async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findById(req.params.id);
    if (!vehiculo)
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el vehículo", error });
  }
});

// 3. Obtener vehículos filtrados por MARCA

app.get("/api/vehiculos/marca/:marca", async (req, res) => {
  try {
    const marcaParam = req.params.marca;

    // 1. Primero buscamos el documento de la marca por su texto (ej. "Kia")
    const marcaEncontrada = await Marca.findOne({
      name: { $regex: new RegExp(`${marcaParam}$`, "i") }, // Cambia "nombre" si en tu DB de Marcas se llama diferente
    });

    if (!marcaEncontrada) {
      return res
        .status(404)
        .json({ mensaje: "Marca no registrada en la base de datos" });
    }

    // 2. Buscamos los vehículos usando el _id exacto de la marca encontrada
    const vehiculos = await Vehiculo.find({
      marca_id: marcaEncontrada._id,
    });

    if (vehiculos.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No hay vehículos para esta marca" });
    }

    res.json(vehiculos);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener vehículos de la marca", error });
  }
});

// 4. Registrar un nuevo vehículo
app.post("/api/vehiculos", async (req, res) => {
  try {
    const nuevoVehiculo = new Vehiculo(req.body);
    await nuevoVehiculo.save();
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    res.status(400).json({ error: "Error al registrar el vehículo" });
  }
});

module.exports = app;
