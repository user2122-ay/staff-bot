const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

function buildSancionModal(tipo) {
  const esAdvertencia = tipo === 'advertencia';

  const modal = new ModalBuilder()
    .setCustomId(`modal_${tipo}`)
    .setTitle(esAdvertencia ? '⚠️ Formato de Advertencia' : '🚫 Formato de Sanción');

  const usuarioInput = new TextInputBuilder()
    .setCustomId('usuario_id')
    .setLabel('ID o @ del Usuario del Staff')
    .setPlaceholder('Ej: 123456789012345678')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const rangoInput = new TextInputBuilder()
    .setCustomId('rango_staff')
    .setLabel('Rango del Staff')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const motivoInput = new TextInputBuilder()
    .setCustomId('motivo')
    .setLabel('Motivo')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const notaInput = new TextInputBuilder()
    .setCustomId('nota_adicional')
    .setLabel('Nota (adicional)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(usuarioInput),
    new ActionRowBuilder().addComponents(rangoInput),
    new ActionRowBuilder().addComponents(motivoInput),
    new ActionRowBuilder().addComponents(notaInput)
  );

  return modal;
}

function buildApelarModal(caseId = null) {
  const modal = new ModalBuilder()
    .setCustomId(caseId ? `modal_apelar_${caseId}` : 'modal_apelar_generico')
    .setTitle('📩 Apelar Advertencia/Sanción');

  const rows = [];

  if (!caseId) {
    const idInput = new TextInputBuilder()
      .setCustomId('case_id')
      .setLabel('ID de la Advertencia/Sanción')
      .setPlaceholder('Ej: ADV-7F3K9Q o SAN-2X8M1B')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    rows.push(new ActionRowBuilder().addComponents(idInput));
  }

  const razonInput = new TextInputBuilder()
    .setCustomId('razon_apelacion')
    .setLabel('Razón de la apelación')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  rows.push(new ActionRowBuilder().addComponents(razonInput));

  modal.addComponents(...rows);
  return modal;
}

module.exports = { buildSancionModal, buildApelarModal };
