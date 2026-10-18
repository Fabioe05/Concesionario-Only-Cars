const mongoose = require("mongoose");
const Vehiculo = require("../models/Vehiculo");
const Marca = require("../models/Marca");
const vehiculosRouter = require("express").Router();
const upload = require("../middlewares/upload");
const { userExtractor, requireAdmin } = require("../middlewares/auth");
const { borrarImagenes } = require("../utils/imagenes");
const { subirImagenes } = require("../utils/almacenamiento");
/**
 * 1. Registrar un nuevo vehículo
 * POST /api/vehiculos
 */
vehiculosRouter.post("/", userExtractor, requireAdmin, upload.array("imagenes", 10), async (req, res) => {
  let urlsImagenes = [];
  try {
    const nuevoVehiculo = new Vehiculo(req.body);
    if (req.files && req.files.length > 0) {
      // Subimos las imágenes a la base de datos y guardamos sus URLs.
      urlsImagenes = await subirImagenes(req.files);
      nuevoVehiculo.images = urlsImagenes;
    }
    const vehiculoGuardado = await nuevoVehiculo.save();

    return res.status(201).json(vehiculoGuardado);
  } catch (error) {
    // Si el guardado falla, limpiamos las imágenes que ya se guardaron.
    await borrarImagenes(urlsImagenes);

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
vehiculosRouter.put("/:id", userExtractor, requireAdmin, upload.array("imagenes", 10), async (req, res) => {
  let imagenesNuevas = [];
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de vehículo no válido" });
    }

    // Datos actuales, para saber qué imágenes se quitaron.
    const vehiculoAnterior = await Vehiculo.findById(id);

    const datos = { ...req.body };

    // Imágenes: conservamos las que el admin dejó y añadimos las nuevas subidas.
    let imagenesConservadas = [];

    if (req.body.keepExistingImages) {
      try {
        imagenesConservadas = JSON.parse(req.body.keepExistingImages);
      } catch (error) {
        imagenesConservadas = null;
      }

      // Si el campo llegó pero no es una lista válida, no tocamos nada:
      // tratarlo como lista vacía borraría todas las fotos del vehículo.
      // (Aquí aún no subimos nada, así que no hay archivos que limpiar.)
      if (!Array.isArray(imagenesConservadas)) {
        return res.status(400).json({
          error: "El listado de imágenes a conservar no es válido.",
        });
      }
    }

    // Subimos las imágenes nuevas a la base de datos y guardamos sus URLs.
    if (req.files && req.files.length > 0) {
      imagenesNuevas = await subirImagenes(req.files);
    }

    // Solo tocamos las imágenes si el formulario envió ese campo.
    if (req.body.keepExistingImages || imagenesNuevas.length > 0) {
      datos.images = [...imagenesConservadas, ...imagenesNuevas];
    }
    delete datos.keepExistingImages;

    const vehiculoActualizado = await Vehiculo.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    });

    if (!vehiculoActualizado) {
      // No existe: limpiamos las imágenes nuevas que ya subimos.
      await borrarImagenes(imagenesNuevas);
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    // Borramos las imágenes que ya no forman parte del vehículo
    // (tanto locales como guardadas en la base de datos).
    const imagenesBorradas = (vehiculoAnterior?.images || []).filter(
      (url) => !vehiculoActualizado.images.includes(url),
    );
    await borrarImagenes(imagenesBorradas);

    return res.json(vehiculoActualizado);
  } catch (error) {
    // Si la actualización falla, las imágenes recién subidas quedarían huérfanas.
    await borrarImagenes(imagenesNuevas);

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
vehiculosRouter.delete("/:id", userExtractor, requireAdmin, async (req, res) => {
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

    // Borramos del disco las imágenes del vehículo eliminado.
    await borrarImagenes(vehiculoEliminado.images);

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
