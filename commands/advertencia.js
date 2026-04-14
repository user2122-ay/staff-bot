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
        .setDescription("Motivo")
        .setRequired(true))

    .addStringOption(option =>
      option.setName("nota")
        .setDescription("Nota adicional")
        .setRequired(false)) // 👈 IMPORTANTE

    .addRoleOption(option =>
      option.setName("rol_advertencia")
        .setDescription("Rol de advertencia")
        .setRequired(true))

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rango = interaction.options.getRole("rango");
    const motivo = interaction.options.getString("motivo");
    const nota = interaction.options.getString("nota") || "Sin nota";
    const rolAdvertencia = interaction.options.getRole("rol_advertencia");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    await miembro.roles.add(rolAdvertencia).catch(() => {});

    const fecha = new Date().toLocaleString();

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Advertencia")
      .setColor("Yellow")
      .addFields(
        { name: "👤 Usuario", value: `<@${usuario.id}>` },
        { name: "📊 Rango", value: `<@&${rango.id}>` },
        { name: "⚠️ Motivo", value: motivo },
        { name: "📝 Nota", value: nota },
        { name: "📅 Fecha", value: fecha }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const canalLogs = interaction.guild.channels.cache.get("1492368430265794641");
    if (canalLogs) canalLogs.send({ embeds: [embed] });
  }
};
