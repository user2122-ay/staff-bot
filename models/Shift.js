const mongoose = require('mongoose');

const sesionSchema = new mongoose.Schema({
  entrada: { type: Date, required: true },
  salida: { type: Date, default: null },
  duracionMinutos: { type: Number, default: 0 },
});

const shiftSchema = new mongoose.Schema(
  {
    usuarioId: { type: String, required: true, unique: true, index: true },
    enShift: { type: Boolean, default: false },
    entradaActual: { type: Date, default: null },
    totalMinutos: { type: Number, default: 0 },
    sesiones: [sesionSchema],
  },
  { timestamps: true, collection: 'shifts' }
);

module.exports = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);
