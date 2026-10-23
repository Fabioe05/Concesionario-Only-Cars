const mongoose = require("mongoose");

// Solicitud de cita para ver un vehículo.
// La fecha y la hora se guardan como texto (YYYY-MM-DD y HH:mm) para que no
// se desplacen por la zona horaria del servidor.
const citaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "El correo no es válido"],
    },
    telefono: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
      trim: true,
      maxlength: 30,
    },
    vehiculo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehiculo",
      default: null,
    },
    // Copia del nombre del vehículo para que la cita siga siendo legible
    // aunque el vehículo se elimine o cambie de nombre.
    vehiculo: {
      type: String,
      required: [true, "El vehículo es obligatorio"],
      trim: true,
      maxlength: 120,
    },
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "La fecha no es válida"],
    },
    hora: {
      type: String,
      required: [true, "La hora es obligatoria"],
      match: [/^\d{2}:\d{2}$/, "La hora no es válida"],
    },
    mensaje: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada", "completada"],
      default: "pendiente",
      index: true,
    },
    notasAdmin: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "Citas",
  },
);

// Búsquedas por día y por cliente.
citaSchema.index({ fecha: 1, hora: 1 });
citaSchema.index({ usuario: 1, fecha: 1 });

citaSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Cita", citaSchema);
