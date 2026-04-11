const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("descender")
    .setDescription("Registrar un descenso de staff")

    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Miembro del staff")
        .setRequired(true))

    .addRoleOption(option =>
      option.setName("rango_anterior")
        .setDescription("Rango anterior")
        .setRequired(true))

    .addRoleOption(option =>
      option.setName("rango_nuevo")
        .setDescription("Rango al que desciende")
        .setRequired(true))

    .addUserOption(option =>
      option.setName("aprobado_por")
        .setDescription("Alto staff que aprueba")
        .setRequired(true))

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const anterior = interaction.options.getRole("rango_anterior");
    const nuevo = interaction.options.getRole("rango_nuevo");
    const aprobador = interaction.options.getUser("aprobado_por");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    // 🔻 Quitar rol anterior y poner el nuevo
    await miembro.roles.remove(anterior).catch(() => {});
    await miembro.roles.add(nuevo).catch(() => {});

    const fecha = new Date().toLocaleString();

    const embed = new EmbedBuilder()
      .setTitle("📉 Descenso de Staff")
      .setColor("Red")
      .addFields(
        { name: "👤 Nombre del Staff", value: `<@${usuario.id}>` },
        { name: "📈 Rango Anterior", value: `<@&${anterior.id}>`, inline: true },
        { name: "📉 Rango Descendido", value: `<@&${nuevo.id}>`, inline: true },
        { name: "👮 Aprobado por", value: `<@${aprobador.id}>` },
        { name: "📅 Fecha", value: fecha }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // 📢 LOGS
    const canalLogs = interaction.guild.channels.cache.get("1492368430265794641");

    if (canalLogs) {
      canalLogs.send({ embeds: [embed] });
    }
  }
};
