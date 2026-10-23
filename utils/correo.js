const nodemailer = require("nodemailer");

// Zona horaria usada solo para la fecha del pie del correo.
const ZONA = "America/Caracas";

let transporte = null;

function configurado() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

function obtenerTransporte() {
  if (!configurado()) {
    return null;
  }

  if (!transporte) {
    transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporte;
}

function escaparHtml(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caracter) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[caracter],
  );
}

function formatearFecha(fecha) {
  const partes = String(fecha || "").split("-");
  if (partes.length !== 3) {
    return String(fecha || "");
  }
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function limpiarCabecera(valor) {
  return String(valor ?? "").replace(/[\r\n]+/g, " ").trim();
}

function urlBase() {
  // En Render, RENDER_EXTERNAL_URL existe aunque no se configure APP_URL.
  // APP_URL tiene prioridad para poder usar un dominio propio.
  const base =
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

function coloresBadge(tipo) {
  if (tipo === "confirmada") {
    return { fondo: "#dcfce7", texto: "#166534" };
  }
  if (tipo === "cancelada") {
    return { fondo: "#fee2e2", texto: "#991b1b" };
  }
  if (tipo === "pendiente") {
    return { fondo: "#fef3c7", texto: "#92400e" };
  }
  return { fondo: "#e0e7ff", texto: "#3730a3" };
}

function etiquetaEstado(estado) {
  return (
    {
      pendiente: "Pendiente de confirmación",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      completada: "Completada",
    }[estado] || "Actualizada"
  );
}

function plantillaCorreo({
  badge,
  badgeTipo = "nueva",
  titulo,
  subtitulo,
  filas,
  nota = "",
  boton = null,
}) {
  const colores = coloresBadge(badgeTipo);

  const filasHtml = (filas || [])
    .map(
      (fila) => `
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid #ececf1;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a8a95;width:145px;vertical-align:top;">
            ${escaparHtml(fila.etiqueta)}
          </td>
          <td style="padding:11px 0;border-bottom:1px solid #ececf1;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#1b1b20;vertical-align:top;">
            ${escaparHtml(fila.valor).replace(/\n/g, "<br>")}
          </td>
        </tr>`,
    )
    .join("");

  const notaHtml = nota
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;">
        <tr>
          <td style="background:#f7f7fa;border-left:3px solid #e50914;padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#555561;">
            ${escaparHtml(nota).replace(/\n/g, "<br>")}
          </td>
        </tr>
      </table>`
    : "";

  const botonHtml = boton
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr>
          <td style="border-radius:6px;background:#e50914;">
            <a href="${escaparHtml(boton.url)}" style="display:inline-block;padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:.4px;color:#ffffff;text-decoration:none;">
              ${escaparHtml(boton.texto)}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const fechaPie = new Intl.DateTimeFormat("es-VE", {
    timeZone: ZONA,
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escaparHtml(titulo)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:26px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e4e4ea;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:#0b0b0d;padding:26px 30px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;letter-spacing:2px;color:#ffffff;">
                  ONLY<span style="color:#e50914;">CARS</span>
                </div>
                <div style="margin-top:5px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8e8e99;">
                  Vehículos y citas
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:${colores.fondo};color:${colores.texto};font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                  ${escaparHtml(badge)}
                </span>
                <h1 style="margin:16px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;color:#111116;">
                  ${escaparHtml(titulo)}
                </h1>
                <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#555561;">
                  ${escaparHtml(subtitulo)}
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${filasHtml}
                </table>
                ${notaHtml}
                ${botonHtml}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #ececf1;padding:18px 30px;background:#fafafc;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#8a8a95;text-align:center;">
                Only Cars · Aviso automático del sistema de citas<br>
                ${escaparHtml(fechaPie)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function enviarCorreo({ to, subject, text, html, replyTo }) {
  const transporter = obtenerTransporte();

  if (!transporter) {
    console.warn(
      "Correo no enviado: faltan SMTP_HOST, SMTP_USER o SMTP_PASS en .env.",
    );
    return { ok: false, motivo: "SMTP no configurado" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      replyTo,
    });

    return { ok: true, id: info.messageId };
  } catch (error) {
    console.error("Error al enviar correo:", error.message);
    return { ok: false, motivo: error.message };
  }
}

function textoAvisoAdmin(cita) {
  const lineas = [
    "Nueva solicitud de cita en Only Cars",
    "",
    `Cliente: ${cita.nombre}`,
    `Correo: ${cita.email}`,
    `Teléfono: ${cita.telefono}`,
    `Vehículo: ${cita.vehiculo}`,
    `Fecha: ${formatearFecha(cita.fecha)}`,
    `Hora: ${cita.hora}`,
  ];

  if (cita.mensaje) {
    lineas.push("", `Mensaje: ${cita.mensaje}`);
  }

  lineas.push("", `Panel: ${urlBase()}/admin/admin.html`);
  return lineas.join("\n");
}

async function enviarAvisoCita(cita) {
  const fecha = formatearFecha(cita.fecha);

  const filas = [
    { etiqueta: "Cliente", valor: cita.nombre },
    { etiqueta: "Correo", valor: cita.email },
    { etiqueta: "Teléfono", valor: cita.telefono },
    { etiqueta: "Vehículo", valor: cita.vehiculo },
    { etiqueta: "Fecha", valor: fecha },
    { etiqueta: "Hora", valor: cita.hora },
    { etiqueta: "Mensaje", valor: cita.mensaje || "Sin mensaje" },
  ];

  const html = plantillaCorreo({
    badge: "Nueva solicitud",
    badgeTipo: "nueva",
    titulo: "Nueva solicitud de cita",
    subtitulo: `Un cliente quiere ver este vehículo: ${cita.vehiculo}. Revisa la solicitud y confirma el horario.`,
    filas,
    nota: "La cita queda en estado pendiente hasta que el equipo la confirme desde el panel.",
    boton: {
      texto: "Abrir panel de administración",
      url: `${urlBase()}/admin/admin.html`,
    },
  });

  return enviarCorreo({
    to: process.env.MAIL_TO || process.env.SMTP_USER,
    subject: `Nueva cita: ${limpiarCabecera(cita.nombre)} · ${fecha} ${cita.hora}`,
    text: textoAvisoAdmin(cita),
    html,
    replyTo: cita.email,
  });
}

function textoConfirmacionCliente(cita) {
  return [
    `Hola, ${cita.nombre}.`,
    "",
    "Recibimos tu solicitud de cita en Only Cars.",
    "",
    `Vehículo: ${cita.vehiculo}`,
    `Fecha: ${formatearFecha(cita.fecha)}`,
    `Hora: ${cita.hora}`,
    "Estado: Pendiente de confirmación",
    "",
    "El equipo te contactará para confirmar el horario.",
    "Si necesitas cambiar o cancelar la cita, responde a este correo o escríbenos por WhatsApp.",
    "",
    `Ver vehículos: ${urlBase()}/contenedorPrincipal/vehiculos/listado.html`,
  ].join("\n");
}

async function enviarConfirmacionCliente(cita) {
  const fecha = formatearFecha(cita.fecha);

  const filas = [
    { etiqueta: "Vehículo", valor: cita.vehiculo },
    { etiqueta: "Fecha", valor: fecha },
    { etiqueta: "Hora", valor: cita.hora },
    { etiqueta: "Estado", valor: "Pendiente de confirmación" },
  ];

  const html = plantillaCorreo({
    badge: "Pendiente",
    badgeTipo: "pendiente",
    titulo: `Hola, ${cita.nombre}`,
    subtitulo:
      "Recibimos tu solicitud de cita. El equipo de Only Cars te contactará para confirmar el horario.",
    filas,
    nota: "Si necesitas cambiar o cancelar la cita, responde a este correo o escríbenos por WhatsApp.",
    boton: {
      texto: "Ver vehículos disponibles",
      url: `${urlBase()}/contenedorPrincipal/vehiculos/listado.html`,
    },
  });

  return enviarCorreo({
    to: cita.email,
    subject: `Recibimos tu solicitud de cita · ${fecha} ${cita.hora}`,
    text: textoConfirmacionCliente(cita),
    html,
    replyTo: process.env.MAIL_TO || process.env.SMTP_USER,
  });
}

function contenidoActualizacionCliente(
  cita,
  { estadoAnterior, fechaAnterior, horaAnterior } = {},
) {
  const reprogramada =
    Boolean(fechaAnterior && horaAnterior) &&
    (cita.fecha !== fechaAnterior || cita.hora !== horaAnterior);
  const estado = cita.estado;
  const cambioEstado = Boolean(estadoAnterior && estadoAnterior !== estado);
  const horarioAnteriorVisible =
    reprogramada && ["pendiente", "confirmada"].includes(estado);

  let badge = "Actualizada";
  let badgeTipo = estado || "nueva";
  let titulo = "Tu cita fue actualizada";
  let subtitulo = "Actualizamos los datos de tu cita en Only Cars.";
  let nota =
    "Si tienes dudas, responde a este correo o escríbenos por WhatsApp.";

  if (estado === "confirmada") {
    badge = "Confirmada";
    titulo = reprogramada
      ? "Tu cita está confirmada y cambió de horario"
      : "Tu cita está confirmada";
    subtitulo = reprogramada
      ? "Confirmamos tu cita y actualizamos el horario. Estos son los nuevos datos."
      : "Confirmamos tu cita. Te esperamos en el horario indicado.";
  } else if (estado === "cancelada") {
    badge = "Cancelada";
    titulo = "Tu cita fue cancelada";
    subtitulo = "La cita para ver este vehículo fue cancelada.";
    nota =
      "Si quieres reprogramar, responde a este correo o escríbenos por WhatsApp.";
  } else if (estado === "completada") {
    badge = "Completada";
    titulo = "Gracias por tu visita";
    subtitulo =
      "Marcamos tu cita como completada. Gracias por visitar Only Cars.";
    nota =
      "Si quieres contarnos cómo fue tu experiencia, responde a este correo.";
  } else if (estado === "pendiente") {
    badge = "Pendiente";
    titulo = reprogramada
      ? "Tu solicitud cambió de horario"
      : cambioEstado
        ? "Tu cita volvió a estar pendiente"
        : "Tu solicitud fue actualizada";
    subtitulo = reprogramada
      ? "Actualizamos el horario de tu solicitud. La cita sigue pendiente de confirmación."
      : "Tu solicitud está pendiente de confirmación. El equipo de Only Cars te contactará.";
  }

  const filas = [
    { etiqueta: "Vehículo", valor: cita.vehiculo },
    { etiqueta: "Fecha", valor: formatearFecha(cita.fecha) },
    { etiqueta: "Hora", valor: cita.hora },
    { etiqueta: "Estado", valor: etiquetaEstado(estado) },
  ];

  if (horarioAnteriorVisible) {
    filas.push({
      etiqueta: "Horario anterior",
      valor: `${formatearFecha(fechaAnterior)} · ${horaAnterior}`,
    });
  }

  let subject;
  if (reprogramada && estado === "confirmada") {
    subject = `Cita confirmada y reprogramada · ${formatearFecha(cita.fecha)} ${cita.hora}`;
  } else if (reprogramada && estado === "pendiente") {
    subject = `Cita reprogramada · ${formatearFecha(cita.fecha)} ${cita.hora}`;
  } else if (estado === "pendiente" && cambioEstado) {
    subject = `Cita reactivada · ${formatearFecha(cita.fecha)} ${cita.hora}`;
  } else if (estado === "confirmada") {
    subject = `Cita confirmada · ${formatearFecha(cita.fecha)} ${cita.hora}`;
  } else if (estado === "cancelada") {
    subject = `Cita cancelada · ${formatearFecha(cita.fecha)} ${cita.hora}`;
  } else if (estado === "completada") {
    subject = `Cita completada · ${formatearFecha(cita.fecha)} ${cita.hora}`;
  } else {
    subject = `Cita actualizada · ${formatearFecha(cita.fecha)} ${cita.hora}`;
  }

  return {
    reprogramada,
    horarioAnteriorVisible,
    estadoTexto: etiquetaEstado(estado),
    subject,
    badge,
    badgeTipo,
    titulo,
    subtitulo,
    nota,
    filas,
    fechaAnterior,
    horaAnterior,
  };
}

function textoActualizacionCliente(cita, contenido) {
  const lineas = [
    `Hola, ${cita.nombre}.`,
    "",
    contenido.subtitulo,
    "",
    `Vehículo: ${cita.vehiculo}`,
    `Fecha: ${formatearFecha(cita.fecha)}`,
    `Hora: ${cita.hora}`,
    `Estado: ${contenido.estadoTexto}`,
  ];

  if (contenido.horarioAnteriorVisible) {
    lineas.push(
      `Horario anterior: ${formatearFecha(contenido.fechaAnterior)} · ${contenido.horaAnterior}`,
    );
  }

  lineas.push("", contenido.nota);

  if (cita.usuario) {
    lineas.push(
      "",
      `Ver mis citas: ${urlBase()}/contenedorPrincipal/mis-citas/mis-citas.html`,
    );
  } else {
    lineas.push(
      "",
      `Ver vehículos: ${urlBase()}/contenedorPrincipal/vehiculos/listado.html`,
    );
  }

  return lineas.join("\n");
}

async function enviarActualizacionCliente(cita, datosAnteriores = {}) {
  const contenido = contenidoActualizacionCliente(cita, datosAnteriores);

  const html = plantillaCorreo({
    badge: contenido.badge,
    badgeTipo: contenido.badgeTipo,
    titulo: contenido.titulo,
    subtitulo: contenido.subtitulo,
    filas: contenido.filas,
    nota: contenido.nota,
    boton: {
      texto: cita.usuario ? "Ver mis citas" : "Ver vehículos disponibles",
      url: cita.usuario
        ? `${urlBase()}/contenedorPrincipal/mis-citas/mis-citas.html`
        : `${urlBase()}/contenedorPrincipal/vehiculos/listado.html`,
    },
  });

  return enviarCorreo({
    to: cita.email,
    subject: contenido.subject,
    text: textoActualizacionCliente(cita, contenido),
    html,
    replyTo: process.env.MAIL_TO || process.env.SMTP_USER,
  });
}

module.exports = {
  configurado,
  enviarCorreo,
  enviarAvisoCita,
  enviarConfirmacionCliente,
  enviarActualizacionCliente,
};
