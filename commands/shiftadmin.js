const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config');
const Shift = require('../models/Shift');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shiftadmin')
    .setDescription('Administrar horas de shift (solo admins)')
    .addSubcommand((sub) =>
      sub.setName('resetear')
        .setDescription('Resetear horas de un usuario o de todos')
        .addUserOption((opt) =>
          opt.setName('usuario')
            .setDescription('Usuario a resetear (deja vacío para resetear todos)')
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('añadir')
        .setDescription('Añadir minutos/horas a un usuario')
        .addUserOption((opt) =>
          opt.setName('usuario').setDescription('Usuario').setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt.setName('horas').setDescription('Horas a añadir').setRequired(false)
        )
        .addIntegerOption((opt) =>
          opt.setName('minutos').setDescription('Minutos a añadir').setRequired(false)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.SHIFT_ADMIN_ROLE_ID)) {
      return interaction.reply({
        content: '❌ No tienes permiso para usar este comando.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const sub = interaction.options.getSubcommand();

    if (sub === 'resetear') {
      const usuario = interaction.options.getUser('usuario');

      if (usuario) {
        await Shift.findOneAndUpdate(
          { usuarioId: usuario.id },
          { totalMinutos: 0, sesiones: [], enShift: false, entradaActual: null }
        );
        return interaction.editReply(`✅ Horas de <@${usuario.id}> reseteadas.`);
      } else {
        await Shift.updateMany({}, {
          totalMinutos: 0,
          sesiones: [],
          enShift: false,
          entradaActual: null,
        });
        return interaction.editReply('✅ Horas de **todos** los usuarios reseteadas.');
      }
    }

    if (sub === 'añadir') {
      const usuario = interaction.options.getUser('usuario');
      const horas = interaction.options.getInteger('horas') || 0;
      const minutos = interaction.options.getInteger('minutos') || 0;
      const totalAñadir = (horas * 60) + minutos;

      if (totalAñadir <= 0) {
        return interaction.editReply('❌ Debes indicar al menos 1 hora o 1 minuto.');
      }

      await Shift.findOneAndUpdate(
        { usuarioId: usuario.id },
        { $inc: { totalMinutos: totalAñadir } },
        { upsert: true }
      );

      return interaction.editReply(
        `✅ Se añadieron **${horas}h ${minutos}m** a <@${usuario.id}>.`
      );
    }
  },
};
