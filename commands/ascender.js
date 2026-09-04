const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} = require("discord.js");

// Canal donde se publican los logs de ascensos
const CANAL_LOGS_ID = "1523776057206116412";

// Rol permitido para usar el comando /ascender (el botón de felicitar NO tiene esta restricción)
const ASCENDER_ROLE_ID = "1523777021166223371";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ascender")
    .setDescription("Registrar un ascenso de staff")

    .addUserOption((option) =>
      option.setName("usuario").setDescription("Staff").setRequired(true)
    )

    .addRoleOption((option) =>
      option.setName("rango_anterior").setDescription("Rango anterior").setRequired(true)
    )

    .addRoleOption((option) =>
      option.setName("rango_nuevo").setDescription("Nuevo rango").setRequired(true)
    )

    .addUserOption((option) =>
      option.setName("aprobado_por").setDescription("Alto staff").setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(ASCENDER_ROLE_ID)) {
      return interaction.reply({
        content: "❌ No tienes permiso para usar este comando.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const usuario = interaction.options.getUser("usuario");
    const anterior = interaction.options.getRole("rango_anterior");
    const nuevo = interaction.options.getRole("rango_nuevo");
    const aprobador = interaction.options.getUser("aprobado_por");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    await miembro.roles.remove(anterior).catch(() => {});
    await miembro.roles.add(nuevo).catch(() => {});

    const fecha = `<t:${Math.floor(Date.now() / 1000)}:F>`;

    // Quiénes ya felicitaron (en memoria, se reinicia si el bot se reinicia)
    const felicitadores = new Set();

    // Construye el container, incluyendo el conteo de felicitaciones y el botón, todo integrado dentro
    const construirContainer = () => {
      const container = new ContainerBuilder().setAccentColor(0x2ecc71);

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## 📈 Ascenso de Staff")
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `→|  **Staff:** <@${usuario.id}>\n\n` +
          `→|  **Antes:** <@&${anterior.id}>\n` +
          `→|  **Ahora:** <@&${nuevo.id}>`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `→|  **Aprobado por:** <@${aprobador.id}>\n` +
          `→|  **Fecha:** ${fecha}`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          felicitadores.size
            ? `🎉  **${felicitadores.size}** persona(s) felicitaron a <@${usuario.id}>`
            : `🎉  Sé el primero en felicitar a <@${usuario.id}>`
        )
      );

      const boton = new ButtonBuilder()
        .setCustomId(`felicitar_${usuario.id}`)
        .setLabel("Felicitar 🎉")
        .setStyle(ButtonStyle.Success);

      container.addActionRowComponents(new ActionRowBuilder().addComponents(boton));

      return container;
    };

    const payload = () => ({
      components: [construirContainer()],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: ["users"] }, // menciona roles sin hacer ping
    });

    await interaction.reply(payload());
    const mensajeRespuesta = await interaction.fetchReply();

    const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS_ID);
    let mensajeLogs = null;
    if (canalLogs) {
      mensajeLogs = await canalLogs.send(payload()).catch(() => null);
    }

    // Botón de felicitar: cualquiera puede usarlo, sin restricción de rol
    const manejarFelicitacion = async (i) => {
      if (i.user.id === usuario.id) {
        return i.reply({
          content: "No puedes felicitarte a ti mismo 😅",
          flags: MessageFlags.Ephemeral,
        });
      }

      if (felicitadores.has(i.user.id)) {
        return i.reply({
          content: "Ya felicitaste a esta persona 🎉",
          flags: MessageFlags.Ephemeral,
        });
      }

      felicitadores.add(i.user.id);

      await i.reply({
        content: `🎉 ¡Felicitaste a <@${usuario.id}>!`,
        flags: MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });

      const nuevoPayload = payload();
      await mensajeRespuesta.edit(nuevoPayload).catch(() => {});
      if (mensajeLogs) mensajeLogs.edit(nuevoPayload).catch(() => {});
    };

    const colectorRespuesta = mensajeRespuesta.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });
    colectorRespuesta.on("collect", manejarFelicitacion);

    if (mensajeLogs) {
      const colectorLogs = mensajeLogs.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });
      colectorLogs.on("collect", manejarFelicitacion);
    }

    // DM de felicitación al staff ascendido
    const dmContainer = new ContainerBuilder().setAccentColor(0x2ecc71);

    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## 🎉 ¡Felicidades por tu ascenso!")
    );

    dmContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Has sido ascendido de **${anterior.name}** a **${nuevo.name}**.\n\n` +
        `Aprobado por **${aprobador.username}**, gracias a tu esfuerzo y dedicación en el staff. ` +
        `¡Sigue así, te lo has ganado! 🚀`
      )
    );

    await usuario
      .send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 })
      .catch(() => {}); // por si tiene los MD cerrados
  },
};
