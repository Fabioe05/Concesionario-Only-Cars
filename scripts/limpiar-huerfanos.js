// Limpia los archivos de public/uploads que ningún vehículo referencia.
//
// Uso (desde la raíz del proyecto):
//   node scripts/limpiar-huerfanos.js            -> solo muestra qué borraría
//   node scripts/limpiar-huerfanos.js --aplicar  -> los borra de verdad
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Vehiculo = require("../models/Vehiculo");

const CARPETA_UPLOADS = path.join(__dirname, "..", "public", "uploads");
const APLICAR = process.argv.includes("--aplicar");

async function main() {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const vehiculos = await Vehiculo.find({}, "images");

  // Nombres de archivo referenciados por algún vehículo.
  const referenciados = new Set();
  for (const vehiculo of vehiculos) {
    for (const url of vehiculo.images || []) {
      referenciados.add(path.basename(url));
    }
  }

  const archivos = fs.readdirSync(CARPETA_UPLOADS);
  const huerfanos = archivos.filter((nombre) => !referenciados.has(nombre));

  console.log(`Vehículos: ${vehiculos.length}`);
  console.log(`Archivos en uploads: ${archivos.length}`);
  console.log(`Huérfanos: ${huerfanos.length}`);

  for (const nombre of huerfanos) {
    console.log(`  ${APLICAR ? "borrando" : "borraría"} ${nombre}`);
    if (APLICAR) fs.unlinkSync(path.join(CARPETA_UPLOADS, nombre));
  }

  if (!APLICAR && huerfanos.length > 0) {
    console.log("\nModo seguro: añade --aplicar para borrarlos.");
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Error:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
