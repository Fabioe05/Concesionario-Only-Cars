const mongoose = require("mongoose");
const Vehiculo = require("../models/Vehiculo");
const Marca = require("../models/Marca");
const vehiculosRouter = require("express").Router();
const upload = require("../middlewares/upload"); // <--- Importamos tu nuevo middleware
/**
 * 1. Registrar un nuevo vehículo
 * POST /api/vehiculos
 */
vehiculosRouter.post("/", upload.array("imagenes", 5), async (req, res) => {
 try {
        // 1. Ver qué está llegando en consola (antes de hacer return)
        console.log("Archivos recibidos de Multer:", req.files);
        // 2. Crear el objeto del vehículo con los datos de texto (req.body)
        const nuevoVehiculo = new Vehiculo(req.body);
        // 3. Evaluar si llegaron imágenes y extraer sus rutas
        if (req.files && req.files.length > 0) {
            // Mapeamos el arreglo req.files para obtener la ruta que guardaremos en BD.
            // Si guardaste en public/uploads/, la ruta para el frontend será /uploads/nombre-archivo.jpg
            const rutasImagenes = req.files.map(file => `/uploads/${file.filename}`);
            // Asignamos ese arreglo de rutas al modelo. 
            // IMPORTANTE: Asegúrate de que el nombre aquí ('images' o 'imagenes') 
            // sea exactamente el mismo que definiste en tu Vehiculo.js (el modelo de Mongoose).
            nuevoVehiculo.images = rutasImagenes; 
        }

        // 4. Ahora sí, guardar en la base de datos (texto + rutas de fotos)
        const vehiculoGuardado = await nuevoVehiculo.save();

        // 5. Retornar la respuesta exitosa
        return res.status(201).json(vehiculoGuardado);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errores = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Error de validación al registrar el vehículo",
        detalles: errores,
      });
    }
    return res.status(400).json({
      error: "Error al registrar el vehículo",
      detalle: error.message || error,
    });
  }
});
/**
 * 2. Obtener todos los vehículos
 * GET /api/vehiculos
 */
vehiculosRouter.get("/", async (req, res) => {
  try {
    // .find() busca en la base de datos. req.query permite aplicar filtros opcionales de la URL.
    const vehiculos = await Vehiculo.find(req.query);
    return res.json(vehiculos);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener vehículos",
      error: error.message || error,
    });
  }
});

/**
 * 3. Obtener un vehículo por su ID
 * GET /api/vehiculos/:id
 */
vehiculosRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de vehículo no válido" });
    }

    // Buscamos un documento específico por su ID único
    const vehiculo = await Vehiculo.findById(id);
    if (!vehiculo) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    return res.json(vehiculo);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener el vehículo",
      error: error.message || error,
    });
  }
});

/**
 * 4. Obtener vehículos filtrados por marca
 * GET /api/vehiculos/marca/:marca
 */
vehiculosRouter.get("/marca/:marca", async (req, res) => {
  try {
    const marcaParam = req.params.marca;

    // Primero buscamos el ID de la marca en la colección Marcas (como lo arreglamos antes)
    const marcaEncontrada = await Marca.findOne({
      name: { $regex: new RegExp(`^${marcaParam}$`, "i") },
    });

    if (!marcaEncontrada) {
      return res
        .status(404)
        .json({ mensaje: "Marca no registrada en la base de datos" });
    }

    // Luego buscamos los vehículos usando ese marca_id
    const vehiculos = await Vehiculo.find({ marca_id: marcaEncontrada._id });

    if (vehiculos.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No hay vehículos para esta marca" });
    }

    return res.json(vehiculos);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener vehículos de la marca",
      error: error.message || error,
    });
  }
});

/**
 * 5. Actualizar los datos de un vehículo por su ID
 * PUT /api/vehiculos/:id
 */
vehiculosRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de vehículo no válido" });
    }

    // findByIdAndUpdate busca por ID y reemplaza con lo que venga en req.body.
    // { new: true } devuelve el documento ya actualizado, runValidators aplica las reglas de tu modelo.
    const vehiculoActualizado = await Vehiculo.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehiculoActualizado) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    return res.json(vehiculoActualizado);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errores = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Error de validación al actualizar el vehículo",
        detalles: errores,
      });
    }
    return res.status(500).json({
      mensaje: "Error al actualizar el vehículo",
      error: error.message || error,
    });
  }
});

/**
 * 6. Eliminar un vehículo por su ID
 * DELETE /api/vehiculos/:id
 */
vehiculosRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de vehículo no válido" });
    }

    // Busca y elimina directamente de la base de datos en un solo paso
    const vehiculoEliminado = await Vehiculo.findByIdAndDelete(id);

    if (!vehiculoEliminado) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    return res.json({
      mensaje: "Vehículo eliminado exitosamente",
      vehiculo: vehiculoEliminado,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al eliminar el vehículo",
      error: error.message || error,
    });
  }
});

module.exports = vehiculosRouter;
