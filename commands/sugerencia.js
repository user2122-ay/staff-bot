const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config');
const { buildSugerenciaContainer } = require('../utils/components');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sugerencia')
    .setDescription('Envía una sugerencia al servidor')
    .addStringOption((opt) =>
      opt.setName('sugerencia')
        .setDescription('Tu sugerencia')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const texto = interaction.options.getString('sugerencia');

    const canal = await interaction.guild.channels
      .fetch(config.SUGERENCIAS_CHANNEL_ID)
      .catch(() => null);

    if (!canal) {
      return interaction.editReply('❌ No se encontró el canal de sugerencias.');
    }

    const container = buildSugerenciaContainer(interaction.user, texto, 'pendiente');

    const msg = await canal.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    // Crear hilo para comentarios
    await msg.startThread({
      name: `💬 Comentarios · ${interaction.user.username}`,
      autoArchiveDuration: 1440,
    });

    await interaction.editReply('✅ Tu sugerencia fue enviada correctamente.');
  },
};
