const mongoose = require("mongoose");

const vehiculoSchema = new mongoose.Schema(
  {
    marca_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Marca",
      required: true,
    },
    marca: {
      type: String,
      required: [true, "La marca es requerida"],
      trim: true,
    },
    modelo: {
      type: String,
      required: [true, "El modelo es requerido"],
      trim: true,
    },
    año: {
      type: Number,
      required: [true, "El año es requerido"],
    },
    motor: {
      type: String,
      required: [true, "El motor es requerido"],
    },
    transmision: {
      type: String,
      required: [true, "La transmisión es requerida"],
      enum: {
        values: ["manual", "automatica"],
        message: "{VALUE} no es un tipo de transmisión válido",
      },
      lowercase: true,
    },
    owners: {
      type: Number,
      default: 1,
      min: [1, "El número de dueños debe ser al menos 1"],
    },
    precio: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: [0, "El precio no puede ser negativo"],
    },
    status: {
      type: String,
      enum: {
        values: ["disponible", "vendido", "reservado"],
        message: "{VALUE} no es un estatus válido",
      },
      default: "disponible",
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "La descripción es requerida"],
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString(); // Convierte el _id a un id más limpio
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    collection: "Vehiculos",
  },
);

module.exports = mongoose.model("Vehiculo", vehiculoSchema);
