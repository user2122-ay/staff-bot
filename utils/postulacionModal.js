const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function buildPostulacionModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_postulacion_staff')
    .setTitle('📋 Postulación a Staff');

  const experiencia = new TextInputBuilder()
    .setCustomId('experiencia')
    .setLabel('Experiencia previa como Staff')
    .setPlaceholder('¿Has sido staff antes? ¿Dónde y qué hacías?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const conceptoRP = new TextInputBuilder()
    .setCustomId('concepto_rp')
    .setLabel('¿Qué es Roleplay (RP) para ti?')
    .setPlaceholder('Explica con tus palabras qué es el RP y por qué es importante respetarlo')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const situacion = new TextInputBuilder()
    .setCustomId('situacion_hipotetica')
    .setLabel('Situación hipotética')
    .setPlaceholder('Un usuario te insulta mientras lo sancionas. ¿Qué haces?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const erlc = new TextInputBuilder()
    .setCustomId('caso_erlc')
    .setLabel('Caso de moderación ERLC')
    .setPlaceholder('Ves a dos jugadores en RDM/VDM al mismo tiempo. ¿Cómo actúas?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const psicologia = new TextInputBuilder()
    .setCustomId('manejo_presion')
    .setLabel('Manejo de presión / psicología')
    .setPlaceholder('¿Cómo controlas el estrés al recibir muchas quejas a la vez sin perder la calma?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(experiencia),
    new ActionRowBuilder().addComponents(conceptoRP),
    new ActionRowBuilder().addComponents(situacion),
    new ActionRowBuilder().addComponents(erlc),
    new ActionRowBuilder().addComponents(psicologia)
  );

  return modal;
}

module.exports = { buildPostulacionModal };
