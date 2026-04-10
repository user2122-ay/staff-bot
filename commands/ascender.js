const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ascender")
    .setDescription("Registrar un ascenso de staff")

    .addUserOption(option =>
      option.setName("usuario").setDescription("Staff").setRequired(true))

    .addRoleOption(option =>
      option.setName("rango_anterior").setDescription("Rango anterior").setRequired(true))

    .addRoleOption(option =>
      option.setName("rango_nuevo").setDescription("Nuevo rango").setRequired(true))

    .addUserOption(option =>
      option.setName("aprobado_por").setDescription("Alto staff").setRequired(true))

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const anterior = interaction.options.getRole("rango_anterior");
    const nuevo = interaction.options.getRole("rango_nuevo");
    const aprobador = interaction.options.getUser("aprobado_por");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    await miembro.roles.remove(anterior).catch(() => {});
    await miembro.roles.add(nuevo).catch(() => {});

    const fecha = new Date().toLocaleString();

    const embed = new EmbedBuilder()
      .setTitle("📈 Ascenso de Staff")
      .setColor("Green")
      .addFields(
        { name: "👤 Staff", value: `<@${usuario.id}>` },
        { name: "📉 Antes", value: `<@&${anterior.id}>`, inline: true },
        { name: "📈 Ahora", value: `<@&${nuevo.id}>`, inline: true },
        { name: "👮 Aprobado por", value: `<@${aprobador.id}>` },
        { name: "📅 Fecha", value: fecha }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const canalLogs = interaction.guild.channels.cache.get("1413745587483836426");
    if (canalLogs) canalLogs.send({ embeds: [embed] });
  }
};
