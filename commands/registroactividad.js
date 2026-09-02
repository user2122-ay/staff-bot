const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');

// Canal donde se publica el registro
const CANAL_REGISTRO_ID = '1523139125765607424';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('registro-actividad')
    .setDescription('Registrar tu actividad de moderación (turno, notas y evidencia)'),

  async execute(interaction) {
    // 1. Mostrar el modal con los campos de texto
    const modal = new ModalBuilder()
      .setCustomId('registroActividadModal')
      .setTitle('Registro de actividad');

    const fechaInput = new TextInputBuilder()
      .setCustomId('fecha')
      .setLabel('Fecha (DD/MM/AAAA)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const entradaInput = new TextInputBuilder()
      .setCustomId('horaEntrada')
      .setLabel('Hora de entrada (HH:MM)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const salidaInput = new TextInputBuilder()
      .setCustomId('horaSalida')
      .setLabel('Hora de salida (HH:MM)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const notasInput = new TextInputBuilder()
      .setCustomId('notas')
      .setLabel('¿Qué hiciste durante tu tiempo? (notas)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(fechaInput),
      new ActionRowBuilder().addComponents(entradaInput),
      new ActionRowBuilder().addComponents(salidaInput),
      new ActionRowBuilder().addComponents(notasInput)
    );

    await interaction.showModal(modal);

    // 2. Esperar el envío del modal (máx. 5 minutos)
    let modalSubmit;
    try {
      modalSubmit = await interaction.awaitModalSubmit({
        time: 5 * 60 * 1000,
        filter: (i) => i.customId === 'registroActividadModal' && i.user.id === interaction.user.id,
      });
    } catch {
      return; // el usuario no llenó el formulario a tiempo
    }

    const fecha = modalSubmit.fields.getTextInputValue('fecha');
    const horaEntrada = modalSubmit.fields.getTextInputValue('horaEntrada');
    const horaSalida = modalSubmit.fields.getTextInputValue('horaSalida');
    const notas = modalSubmit.fields.getTextInputValue('notas');

    await modalSubmit.reply({
      content:
        '✅ Formulario recibido. Ahora **envía en este chat** tus capturas de evidencia (una o varias imágenes). Tienes 5 minutos, o escribe `listo` si no tienes capturas.',
      flags: MessageFlags.Ephemeral,
    });

    // 3. Recolectar las capturas que el usuario envíe en el canal
    const capturas = [];
    const filtro = (m) =>
      m.author.id === interaction.user.id &&
      (m.attachments.size > 0 || m.content.toLowerCase() === 'listo');

    const collector = interaction.channel.createMessageCollector({
      filter: filtro,
      time: 5 * 60 * 1000,
    });

    collector.on('collect', (msg) => {
      if (msg.attachments.size > 0) {
        msg.attachments.forEach((att) => capturas.push(att.url));
        msg.react('✅').catch(() => {});
      }
      if (msg.content.toLowerCase() === 'listo') {
        collector.stop();
      }
    });

    collector.on('end', async () => {
      // 4. Construir y publicar el embed final en el canal fijo
      const canal = await interaction.client.channels.fetch(CANAL_REGISTRO_ID).catch(() => null);
      if (!canal) return;

      const embed = new EmbedBuilder()
        .setColor(0x2b6cb0)
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle('📋 Registro de actividad')
        .addFields(
          { name: '📅 Fecha', value: fecha, inline: true },
          { name: '🕒 Entrada', value: horaEntrada, inline: true },
          { name: '🕕 Salida', value: horaSalida, inline: true },
          { name: '📝 Notas', value: notas },
          {
            name: '📎 Pruebas',
            value: capturas.length ? `${capturas.length} captura(s) adjunta(s)` : 'Sin capturas enviadas',
          }
        )
        .setFooter({ text: `Registrado por ${interaction.user.username}` })
        .setTimestamp();

      if (capturas[0]) embed.setImage(capturas[0]);

      await canal.send({
        embeds: [embed],
        files: capturas.slice(1), // resto de imágenes como adjuntos extra
      });

      await interaction.followUp({
        content: '✅ Tu registro fue publicado correctamente en el canal.',
        flags: MessageFlags.Ephemeral,
      });
    });
  },
};
