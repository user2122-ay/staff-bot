const mongoose = require('mongoose');

const actividadSchema = new mongoose.Schema(
  {
    usuarioId: { type: String, required: true, index: true },
    usuarioTag: { type: String, required: true },
    fecha: { type: String, required: true },       // formato DD/MM/AAAA
    horaEntrada: { type: String, required: true },  // formato HH:MM
    horaSalida: { type: String, required: true },   // formato HH:MM
    notas: { type: String, required: true },
    pruebas: [{ type: String }],                    // URLs de las capturas
  },
  { timestamps: true, collection: 'actividad_moderacion' }
);

module.exports = mongoose.models.Actividad || mongoose.model('Actividad', actividadSchema);

