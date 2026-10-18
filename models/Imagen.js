const mongoose = require("mongoose");

// Guarda el binario de una imagen directamente en MongoDB.
// Cada imagen va en su propio documento (límite de 16 MB por documento,
// y aquí limitamos a 5 MB por archivo), referenciada por su _id.
const imagenSchema = new mongoose.Schema(
  {
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },
  },
  {
    timestamps: true,
    collection: "Imagenes", // Coincide con la convención de colecciones del proyecto
  },
);

module.exports = mongoose.model("Imagen", imagenSchema);
