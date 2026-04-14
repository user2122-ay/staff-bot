const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("advertir")
    .setDescription("Advertir a un miembro del staff")

    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario del staff")
        .setRequired(true))

    .addRoleOption(option =>
      option.setName("rango")
        .setDescription("Rango del staff")
        .setRequired(true))

    .addStringOption(option =>
      option.setName("motivo")
        .setDescription("Motivo de la advertencia")
        .setRequired(true))

    .addStringOption(option =>
      option.setName("nota")
        .setDescription("Nota adicional")
        .setRequired(false))

    .addRoleOption(option =>
      option.setName("rol_advertencia")
        .setDescription("Rol de advertencia a asignar")
        .setRequired(true))

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rango = interaction.options.getRole("rango");
    const motivo = interaction.options.getString("motivo");
    const nota = interaction.options.getString("nota") || "Sin nota";
    const rolAdvertencia = interaction.options.getRole("rol_advertencia");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    // ⚠️ Dar rol de advertencia
    await miembro.roles.add(rolAdvertencia).catch(() => {});

    const fecha = new Date().toLocaleString();

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Formato de Advertencia")
      .setColor("Yellow")
      .setDescription(
        `**→ |  Usuario del Staff:** <@${usuario.id}>\n\n` +
        `**→ |  Rango del Staff:** <@&${rango.id}>\n\n` +
        `**→ |  Motivo:** ${motivo}\n\n` +
        `**→ |  Nota (adicional):** ${nota}`
      )
      .setFooter({ text: `Fecha: ${fecha}` });

    await interaction.reply({ embeds: [embed] });

    // 📢 LOGS
    const canalLogs = interaction.guild.channels.cache.get("1492368430265794641");
    if (canalLogs) canalLogs.send({ embeds: [embed] });
  }
};
