const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function buildReporteModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_reporte')
    .setTitle('🚨 Reportar miembro');

  const usuarioInput = new TextInputBuilder()
    .setCustomId('usuario_reportado')
    .setLabel('Usuario reportado (nombre o ID)')
    .setPlaceholder('Ej: Juan#1234 o 123456789012345678')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const razonInput = new TextInputBuilder()
    .setCustomId('razon')
    .setLabel('Razón del reporte')
    .setPlaceholder('Describe detalladamente qué ocurrió')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const evidenciaInput = new TextInputBuilder()
    .setCustomId('evidencia')
    .setLabel('Evidencia (links, capturas, etc.)')
    .setPlaceholder('Opcional - pega links de imágenes o describe la evidencia')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(usuarioInput),
    new ActionRowBuilder().addComponents(razonInput),
    new ActionRowBuilder().addComponents(evidenciaInput)
  );

  return modal;
}

module.exports = { buildReporteModal };
