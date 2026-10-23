const express = require("express");
const mongoose = require("mongoose");
const Cita = require("../models/Cita");
const Vehiculo = require("../models/Vehiculo");
const {
  userExtractor,
  requireAdmin,
  usuarioOpcional,
} = require("../middlewares/auth");
const {
  enviarAvisoCita,
  enviarConfirmacionCliente,
  enviarActualizacionCliente,
} = require("../utils/correo");

const citasRouter = express.Router();

// Lunes a sábado, de 09:00 a 17:00. El último turno empieza a las 16:00
// porque cada cita ocupa una hora.
const HORAS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];
const ESTADOS = ["pendiente", "confirmada", "cancelada", "completada"];
const ZONA = "America/Caracas";
const MAX_DIAS = 60;

// Límite sencillo en memoria para el formulario público.
// Evita que una misma IP mande decenas de solicitudes seguidas.
// En producción con varias instancias conviene un almacén compartido (Redis).
const solicitudesPorIp = new Map();

function limitarPorIp(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "desconocida";
  const ahora = Date.now();
  const ventana = 15 * 60 * 1000;
  const maximo = 5;

  // Limpieza ocasional para que el Map no crezca sin control.
  if (solicitudesPorIp.size > 500) {
    for (const [clave, valor] of solicitudesPorIp) {
      if (ahora - valor.inicio > ventana) {
        solicitudesPorIp.delete(clave);
      }
    }
  }

  const registro = solicitudesPorIp.get(ip);

  if (!registro || ahora - registro.inicio > ventana) {
    solicitudesPorIp.set(ip, { inicio: ahora, cuenta: 1 });
    return next();
  }

  registro.cuenta += 1;

  if (registro.cuenta > maximo) {
    return res.status(429).json({
      error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos.",
    });
  }

  return next();
}

function texto(valor, maximo) {
  if (typeof valor !== "string") {
    return "";
  }
  return valor.trim().slice(0, maximo);
}

// Para datos que van en una sola línea (nombre, correo, teléfono, vehículo).
function textoLinea(valor, maximo) {
  return texto(valor, maximo)
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ");
}

function hoyEnZona() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
}

function horaActualEnZona() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

function sumarDias(fecha, dias) {
  const fechaBase = new Date(`${fecha}T12:00:00Z`);
  fechaBase.setUTCDate(fechaBase.getUTCDate() + dias);
  return fechaBase.toISOString().slice(0, 10);
}

function esFechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "")) {
    return false;
  }

  const fechaObjeto = new Date(`${fecha}T12:00:00Z`);
  return (
    !Number.isNaN(fechaObjeto.getTime()) &&
    fechaObjeto.toISOString().slice(0, 10) === fecha
  );
}

function validarFechaCita(fecha) {
  if (!esFechaValida(fecha)) {
    return "La fecha no es válida.";
  }

  const hoy = hoyEnZona();

  if (fecha < hoy) {
    return "La fecha no puede ser anterior a hoy.";
  }

  if (fecha > sumarDias(hoy, MAX_DIAS)) {
    return `Solo puedes agendar hasta ${MAX_DIAS} días adelante.`;
  }

  const diaSemana = new Date(`${fecha}T12:00:00Z`).getUTCDay();
  if (diaSemana === 0) {
    return "No atendemos los domingos.";
  }

  return null;
}

function validarCita(cuerpo) {
  const nombre = textoLinea(cuerpo.nombre, 80);
  const email = textoLinea(cuerpo.email, 120).toLowerCase();
  const telefono = textoLinea(cuerpo.telefono, 30);
  const mensaje = texto(cuerpo.mensaje, 500);
  const fecha = texto(cuerpo.fecha, 10);
  const hora = texto(cuerpo.hora, 5);
  const vehiculoTexto = textoLinea(cuerpo.vehiculo, 120);
  const vehiculoId = textoLinea(cuerpo.vehiculo_id || cuerpo.vehiculoId, 24);

  if (nombre.length < 2) {
    return { error: "Escribe tu nombre completo." };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "El correo no es válido." };
  }

  if (!/^[+()\d\s.-]{7,30}$/.test(telefono)) {
    return { error: "El teléfono no es válido." };
  }

  const errorFecha = validarFechaCita(fecha);
  if (errorFecha) {
    return { error: errorFecha };
  }

  if (!HORAS.includes(hora)) {
    return { error: "La hora no es válida." };
  }

  if (fecha === hoyEnZona() && hora <= horaActualEnZona()) {
    return { error: "Ese horario ya pasó. Elige otra hora." };
  }

  if (!vehiculoTexto && !vehiculoId) {
    return { error: "Indica el vehículo de interés." };
  }

  if (vehiculoId && !mongoose.Types.ObjectId.isValid(vehiculoId)) {
    return { error: "El vehículo no es válido." };
  }

  return {
    datos: {
      nombre,
      email,
      telefono,
      mensaje,
      fecha,
      hora,
      vehiculoTexto,
      vehiculoId: vehiculoId || null,
    },
  };
}

/**
 * GET /api/citas/disponibilidad?fecha=YYYY-MM-DD
 * Público: devuelve los turnos y cuáles ya están ocupados.
 */
citasRouter.get("/disponibilidad", async (req, res) => {
  try {
    const fecha = texto(req.query.fecha, 10);
    const errorFecha = validarFechaCita(fecha);

    if (errorFecha) {
      return res.status(400).json({ error: errorFecha });
    }

    const ocupadas = await Cita.find({
      fecha,
      estado: { $in: ["pendiente", "confirmada"] },
    })
      .select("hora -_id")
      .lean();

    const horasOcupadas = ocupadas.map((cita) => cita.hora);
    const esHoy = fecha === hoyEnZona();
    const horaActual = horaActualEnZona();

    return res.json({
      fecha,
      horas: HORAS,
      ocupadas: horasOcupadas,
      disponibles: HORAS.filter(
        (hora) =>
          !horasOcupadas.includes(hora) && (!esHoy || hora > horaActual),
      ),
    });
  } catch (error) {
    console.error("Error al consultar disponibilidad:", error.message);
    return res.status(500).json({
      error: "No se pudo consultar la disponibilidad.",
    });
  }
});

/**
 * POST /api/citas
 * Público: cualquier persona puede solicitar una cita, con o sin cuenta.
 */
citasRouter.post("/", usuarioOpcional, limitarPorIp, async (req, res) => {
  try {
    const resultado = validarCita(req.body || {});

    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    const { datos } = resultado;
    let vehiculo = datos.vehiculoTexto;
    let vehiculoId = datos.vehiculoId;

    if (vehiculoId) {
      const vehiculoEncontrado = await Vehiculo.findById(vehiculoId);

      if (!vehiculoEncontrado) {
        return res.status(404).json({
          error: "El vehículo seleccionado ya no está disponible.",
        });
      }

      vehiculo = [
        vehiculoEncontrado.marca,
        vehiculoEncontrado.modelo,
        vehiculoEncontrado.anio,
      ]
        .filter(Boolean)
        .join(" ");
    }

    const ocupada = await Cita.findOne({
      fecha: datos.fecha,
      hora: datos.hora,
      estado: { $in: ["pendiente", "confirmada"] },
    });

    if (ocupada) {
      return res.status(409).json({
        error: "Ese horario ya está ocupado. Elige otro.",
      });
    }

    const cita = await Cita.create({
      usuario: req.user?._id || null,
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono,
      vehiculo_id: vehiculoId,
      vehiculo,
      fecha: datos.fecha,
      hora: datos.hora,
      mensaje: datos.mensaje,
    });

    const [avisoAdmin, avisoCliente] = await Promise.all([
      enviarAvisoCita(cita),
      enviarConfirmacionCliente(cita),
    ]);

    if (!avisoAdmin.ok) {
      console.error("No se pudo avisar al administrador:", avisoAdmin.motivo);
    }

    if (!avisoCliente.ok) {
      console.error("No se pudo confirmar al cliente:", avisoCliente.motivo);
    }

    return res.status(201).json({
      mensaje:
        "Cita solicitada. El equipo de Only Cars te contactará para confirmar.",
      cita,
      correo: {
        admin: avisoAdmin.ok,
        cliente: avisoCliente.ok,
      },
    });
  } catch (error) {
    console.error("Error al crear la cita:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Revisa los datos de la cita.",
        detalles: Object.values(error.errors).map((detalle) => detalle.message),
      });
    }

    return res.status(500).json({
      error: "No se pudo registrar la cita. Intenta de nuevo.",
    });
  }
});

/**
 * GET /api/citas/mias
 * Requiere sesión: citas vinculadas a la cuenta.
 */
citasRouter.get("/mias", userExtractor, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Sesión no válida." });
    }

    // Las notas internas del admin no deben llegar al cliente.
    const citas = await Cita.find({ usuario: req.user._id })
      .select("-notasAdmin")
      .sort({
        fecha: 1,
        hora: 1,
      });

    return res.json(citas);
  } catch (error) {
    console.error("Error al obtener mis citas:", error.message);
    return res.status(500).json({
      error: "No se pudieron obtener tus citas.",
    });
  }
});

/**
 * GET /api/citas
 * Solo administradores. Filtros opcionales: estado, fecha, desde, hasta.
 */
citasRouter.get("/", userExtractor, requireAdmin, async (req, res) => {
  try {
    const filtro = {};

    if (req.query.estado !== undefined) {
      if (!ESTADOS.includes(req.query.estado)) {
        return res.status(400).json({
          error: "El estado indicado no es válido.",
        });
      }
      filtro.estado = req.query.estado;
    }

    if (req.query.fecha) {
      if (!esFechaValida(req.query.fecha)) {
        return res.status(400).json({ error: "La fecha no es válida." });
      }
      filtro.fecha = req.query.fecha;
    } else if (req.query.desde || req.query.hasta) {
      if (req.query.desde && !esFechaValida(req.query.desde)) {
        return res.status(400).json({
          error: "La fecha inicial no es válida.",
        });
      }
      if (req.query.hasta && !esFechaValida(req.query.hasta)) {
        return res.status(400).json({
          error: "La fecha final no es válida.",
        });
      }

      filtro.fecha = {};
      if (req.query.desde) {
        filtro.fecha.$gte = req.query.desde;
      }
      if (req.query.hasta) {
        filtro.fecha.$lte = req.query.hasta;
      }
    }

    const citas = await Cita.find(filtro)
      .sort({ fecha: 1, hora: 1 })
      .limit(500);

    return res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas:", error.message);
    return res.status(500).json({
      error: "No se pudieron obtener las citas.",
    });
  }
});

/**
 * PATCH /api/citas/:id
 * Solo administradores: cambiar estado, notas o reprogramar.
 */
citasRouter.patch("/:id", userExtractor, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "El ID de la cita no es válido." });
    }

    const cita = await Cita.findById(id);

    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    const { estado, notasAdmin, fecha, hora } = req.body || {};

    if (estado !== undefined && !ESTADOS.includes(estado)) {
      return res.status(400).json({
        error: "El estado indicado no es válido.",
      });
    }

    // Guardamos los valores anteriores para saber qué correo enviar.
    const estadoAnterior = cita.estado;
    const fechaAnterior = cita.fecha;
    const horaAnterior = cita.hora;

    const fechaFinal = fecha !== undefined ? texto(fecha, 10) : cita.fecha;
    const horaFinal = hora !== undefined ? texto(hora, 5) : cita.hora;
    const estadoFinal = estado !== undefined ? estado : cita.estado;

    const cambioHorario = fechaFinal !== cita.fecha || horaFinal !== cita.hora;
    const cambioEstado = estadoFinal !== cita.estado;
    const estabaActiva = ["pendiente", "confirmada"].includes(cita.estado);
    const estaraActiva = ["pendiente", "confirmada"].includes(estadoFinal);
    const reactivacion = !estabaActiva && estaraActiva;

    // Solo se valida el calendario si se mueve la cita o si se reactiva.
    // Agregar una nota a una cita pasada no debe fallar por "horario pasado".
    if (cambioHorario || reactivacion) {
      const errorFecha = validarFechaCita(fechaFinal);
      if (errorFecha) {
        return res.status(400).json({ error: errorFecha });
      }

      if (!HORAS.includes(horaFinal)) {
        return res.status(400).json({ error: "La hora no es válida." });
      }

      if (fechaFinal === hoyEnZona() && horaFinal <= horaActualEnZona()) {
        return res.status(400).json({
          error: "Ese horario ya pasó. Elige otra hora.",
        });
      }
    }

    if (estaraActiva) {
      const ocupada = await Cita.findOne({
        _id: { $ne: cita._id },
        fecha: fechaFinal,
        hora: horaFinal,
        estado: { $in: ["pendiente", "confirmada"] },
      });

      if (ocupada) {
        return res.status(409).json({
          error: "Ese horario ya está ocupado por otra cita.",
        });
      }
    }

    cita.fecha = fechaFinal;
    cita.hora = horaFinal;
    cita.estado = estadoFinal;

    if (notasAdmin !== undefined) {
      cita.notasAdmin = texto(notasAdmin, 500);
    }

    await cita.save();

    // Solo se avisa al cliente si cambió algo que le importa:
    // el estado, o el horario de una cita que sigue activa.
    // Las notas internas nunca se envían por correo.
    let resultadoCorreo = null;
    if (cambioEstado || (cambioHorario && estaraActiva)) {
      try {
        resultadoCorreo = await enviarActualizacionCliente(cita, {
          estadoAnterior,
          fechaAnterior,
          horaAnterior,
        });
      } catch (error) {
        console.error(
          "Error al preparar el correo de actualización:",
          error.message,
        );
        resultadoCorreo = { ok: false, motivo: error.message };
      }

      if (!resultadoCorreo.ok) {
        console.error(
          "No se pudo avisar al cliente de la actualización:",
          resultadoCorreo.motivo,
        );
      }
    }

    return res.json({
      mensaje: "Cita actualizada.",
      cita,
      correo: resultadoCorreo ? { cliente: resultadoCorreo.ok } : null,
    });
  } catch (error) {
    console.error("Error al actualizar la cita:", error.message);
    return res.status(500).json({
      error: "No se pudo actualizar la cita.",
    });
  }
});

module.exports = citasRouter;
