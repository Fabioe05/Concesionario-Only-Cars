const mongoose = require("mongoose");

const marcaSchema = new mongoose.Schema(
  {
    name: {
      // Cambiado de 'nombre' a 'name' tal como está en tu Atlas
      type: String,
      required: [true, "El nombre de la marca es requerido"],
      trim: true,
    },
    status: {
      // Agregado para que coincida con tu base de datos
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "Marcas", // Coincide con tu colección en Atlas
  },
);

// Limpieza del _id al enviar como JSON
marcaSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
  collection: "Marcas",
});

module.exports = mongoose.model("Marca", marcaSchema);
