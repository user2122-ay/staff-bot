const mongoose = require('mongoose');

const contadorSchema = new mongoose.Schema(
  {
    usuarioStaffId: { type: String, required: true, unique: true, index: true },
    advertenciasActivas: { type: Number, default: 0 },
    sancionesActivas: { type: Number, default: 0 },
    totalAdvertenciasHistoricas: { type: Number, default: 0 },
    totalSancionesHistoricas: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'staff_contadores' }
);

module.exports = mongoose.models.StaffContador || mongoose.model('StaffContador', contadorSchema);
