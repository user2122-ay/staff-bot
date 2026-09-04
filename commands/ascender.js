const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");

// Canal donde se publican los logs de ascensos
const CANAL_LOGS_ID = "1523776057206116412";

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
    )

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const anterior = interaction.options.getRole("rango_anterior");
    const nuevo = interaction.options.getRole("rango_nuevo");
    const aprobador = interaction.options.getUser("aprobado_por");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    await miembro.roles.remove(anterior).catch(() => {});
    await miembro.roles.add(nuevo).catch(() => {});

    const fecha = `<t:${Math.floor(Date.now() / 1000)}:F>`;

    // 1. Container para el canal / respuesta
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

    const payload = {
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: ["users"] }, // menciona roles sin hacer ping
    };

    await interaction.reply(payload);

    const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS_ID);
    if (canalLogs) canalLogs.send(payload).catch(() => {});

    // 2. DM de felicitación al staff ascendido
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
