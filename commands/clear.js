const { SlashCommandBuilder, MessageFlags } = require('discord.js');

// Rol permitido para usar este comando
const CLEAR_ROLE_ID = '1523777021166223371';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Elimina una cantidad de mensajes del canal')
    .addIntegerOption((opt) =>
      opt
        .setName('cantidad')
        .setDescription('Cantidad de mensajes a eliminar (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(CLEAR_ROLE_ID)) {
      return interaction.reply({
        content: '❌ No tienes permiso para usar este comando.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const cantidad = interaction.options.getInteger('cantidad');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const eliminados = await interaction.channel.bulkDelete(cantidad, true);
      return interaction.editReply(
        `✅ Se eliminaron **${eliminados.size}** mensaje(s). (Discord no permite borrar mensajes con más de 14 días de antigüedad).`
      );
    } catch (error) {
      console.error(error);
      return interaction.editReply('❌ Ocurrió un error al eliminar los mensajes.');
    }
  },
};
