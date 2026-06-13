const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config');
const Shift = require('../models/Shift');
const { buildShiftVerContainer } = require('../utils/components');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shift')
    .setDescription('Gestión de shifts de moderación')
    .addSubcommand((sub) =>
      sub.setName('ver')
        .setDescription('Ver tus horas y sesiones')
        .addUserOption((opt) =>
          opt.setName('usuario')
            .setDescription('Ver shift de otro usuario (solo admins)')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'ver') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      let objetivo = interaction.options.getUser('usuario');

      if (objetivo && !interaction.member.roles.cache.has(config.SHIFT_ADMIN_ROLE_ID)) {
        return interaction.editReply('❌ Solo los admins pueden ver el shift de otro usuario.');
      }

      objetivo = objetivo || interaction.user;

      const shift = await Shift.findOne({ usuarioId: objetivo.id });

      if (!shift || shift.sesiones.length === 0) {
        return interaction.editReply(`❌ <@${objetivo.id}> no tiene sesiones registradas.`);
      }

      const container = buildShiftVerContainer(objetivo, shift);

      return interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};
