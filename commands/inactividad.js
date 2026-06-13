const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config');
const { buildInactividadContainer } = require('../utils/components');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inactividad')
    .setDescription('Solicita un período de inactividad')
    .addStringOption((opt) =>
      opt.setName('inicio')
        .setDescription('Fecha de inicio (DD/MM/YYYY)')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('fin')
        .setDescription('Fecha de fin / regreso (DD/MM/YYYY)')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('motivo')
        .setDescription('Motivo de la inactividad')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const inicioStr = interaction.options.getString('inicio');
    const finStr = interaction.options.getString('fin');
    const motivo = interaction.options.getString('motivo');

    // Parsear fechas DD/MM/YYYY
    const parseFecha = (str) => {
      const [d, m, y] = str.split('/');
      return new Date(`${y}-${m}-${d}`);
    };

    const fechaInicio = parseFecha(inicioStr);
    const fechaFin = parseFecha(finStr);

    if (isNaN(fechaInicio) || isNaN(fechaFin)) {
      return interaction.editReply('❌ Formato de fecha inválido. Usa DD/MM/YYYY. Ejemplo: 20/06/2026');
    }

    if (fechaFin <= fechaInicio) {
      return interaction.editReply('❌ La fecha de fin debe ser posterior a la fecha de inicio.');
    }

    const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

    const canal = await interaction.guild.channels
      .fetch(config.INACTIVIDAD_CHANNEL_ID)
      .catch(() => null);

    if (!canal) {
      return interaction.editReply('❌ No se encontró el canal de inactividades.');
    }

    // ¿Aprobación automática?
    const autoAprobado = dias <= config.INACTIVIDAD_AUTO_DIAS;
    const estado = autoAprobado ? 'aprobada' : 'pendiente';

    const container = buildInactividadContainer({
      usuario: interaction.user,
      inicioStr,
      finStr,
      dias,
      motivo,
      estado,
      gestedoPorTag: autoAprobado ? '🤖 Sistema automático' : null,
    });

    const msg = await canal.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    // Si es auto-aprobada, asignar rol y notificar por MD
    if (autoAprobado) {
      const member = await interaction.guild.members
        .fetch(interaction.user.id)
        .catch(() => null);

      if (member) {
        await member.roles.add(config.INACTIVIDAD_ROL_ID).catch(() => null);
      }

      // MD al usuario
      await interaction.user.send({
        content:
          `✅ **Tu solicitud de inactividad fue aprobada automáticamente.**\n` +
          `**Período:** ${inicioStr} → ${finStr} (${dias} día${dias === 1 ? '' : 's'})\n` +
          `**Motivo:** ${motivo}\n` +
          `Se te asignó el rol de inactividad.`,
      }).catch(() => null);
    }

    await interaction.editReply(
      autoAprobado
        ? `✅ Tu inactividad fue **aprobada automáticamente** (${dias} día${dias === 1 ? '' : 's'} ≤ ${config.INACTIVIDAD_AUTO_DIAS} días). Se te asignó el rol.`
        : `✅ Tu solicitud fue enviada. Espera la revisión del staff.`
    );
  },
};
