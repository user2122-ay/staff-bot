const mongoose = require('mongoose');

const casoSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    tipo: { type: String, enum: ['advertencia', 'sancion'], required: true },
    nivel: { type: Number, required: true },
    usuarioStaffId: { type: String, required: true, index: true },
    rangoStaff: { type: String, required: true },
    motivo: { type: String, required: true },
    notaAdicional: { type: String, default: '' },
    aplicadoPorId: { type: String, required: true },
    rolAsignadoId: { type: String, required: true },
    estado: {
      type: String,
      enum: ['activo', 'apelado', 'aceptada_apelacion', 'negada_apelacion'],
      default: 'activo',
    },
    apelacion: {
      ticketChannelId: { type: String, default: null },
      razon: { type: String, default: null },
      reclamadoPorId: { type: String, default: null },
      resueltoPorId: { type: String, default: null },
      resultado: { type: String, default: null },
      transcriptUrl: { type: String, default: null },
      cerradoEn: { type: Date, default: null },
    },
  },
  { timestamps: true, collection: 'sanciones_staff' }
);

module.exports = mongoose.models.SancionStaff || mongoose.model('SancionStaff', casoSchema);
