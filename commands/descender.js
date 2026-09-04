const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");

// Canal donde se publican los logs de descensos
const CANAL_LOGS_ID = "1523776057206116412";

// Rol permitido para usar este comando
const DESCENDER_ROLE_ID = "1523777021166223371";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("descender")
    .setDescription("Registrar un descenso de staff")

    .addUserOption((option) =>
      option.setName("usuario").setDescription("Miembro del staff").setRequired(true)
    )

    .addRoleOption((option) =>
      option.setName("rango_anterior").setDescription("Rango anterior").setRequired(true)
    )

    .addRoleOption((option) =>
      option.setName("rango_nuevo").setDescription("Rango al que desciende").setRequired(true)
    )

    .addUserOption((option) =>
      option.setName("aprobado_por").setDescription("Alto staff que aprueba").setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(DESCENDER_ROLE_ID)) {
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

    // 1. Container para el canal / respuesta
    const container = new ContainerBuilder().setAccentColor(0xe74c3c);

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## 📉 Descenso de Staff")
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

    const payload = {
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: ["users"] }, // menciona roles sin hacer ping
    };

    await interaction.reply(payload);

    const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS_ID);
    if (canalLogs) canalLogs.send(payload).catch(() => {});

    // 2. DM discreto al staff descendido (sin tono de "felicitación", solo aviso claro)
    const dmContainer = new ContainerBuilder().setAccentColor(0xe74c3c);

    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## 📉 Cambio de rango")
    );

    dmContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Has sido descendido de **${anterior.name}** a **${nuevo.name}**.\n\n` +
        `Gestionado por **${aprobador.username}**. Si tienes dudas sobre el motivo, puedes hablar con el alto staff.`
      )
    );

    await usuario
      .send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 })
      .catch(() => {}); // por si tiene los MD cerrados
  },
};
