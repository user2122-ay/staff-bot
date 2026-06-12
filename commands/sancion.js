const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config');
const { aplicarSancion } = require('../utils/sanciones');
const { buildCaseContainer } = require('../utils/components');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sancion')
    .setDescription('Aplica una sanción a un miembro del Staff')
    .addUserOption((opt) =>
      opt.setName('usuario').setDescription('Usuario del Staff').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('rango').setDescription('Rango del Staff').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('motivo').setDescription('Motivo de la sanción').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('nota').setDescription('Nota adicional (opcional)').setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.STAFF_MANAGER_ROLE_ID)) {
      return interaction.reply({
        content: '❌ No tienes permiso para usar este comando.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    const usuario = interaction.options.getUser('usuario');
    const rango = interaction.options.getString('rango');
    const motivo = interaction.options.getString('motivo');
    const nota = interaction.options.getString('nota') || '';

    const member = await interaction.guild.members.fetch(usuario.id).catch(() => null);
    if (!member) {
      return interaction.editReply('❌ No pude encontrar a ese usuario en el servidor.');
    }

    const { caso } = await aplicarSancion(member, {
      rangoStaff: rango,
      motivo,
      notaAdicional: nota,
      aplicadoPorId: interaction.user.id,
    });

    const container = buildCaseContainer(caso, {
      usuarioStaffTag: usuario.tag,
      aplicadoPorTag: interaction.user.tag,
    });

    await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
