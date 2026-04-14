const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("advertencia")
    .setDescription("Registrar una advertencia a staff")

    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario del staff")
        .setRequired(true))

    .addRoleOption(option =>
      option.setName("rango")
        .setDescription("Rango actual del staff")
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
      .setTitle("⚠️ Advertencia de Staff")
      .setColor("Yellow")
      .addFields(
        { name: "👤 Usuario del Staff", value: `<@${usuario.id}>` },
        { name: "📊 Rango del Staff", value: `<@&${rango.id}>` },
        { name: "⚠️ Motivo", value: motivo },
        { name: "📝 Nota", value: nota },
        { name: "📅 Fecha", value: fecha }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // 📢 LOGS (mismo canal que usas)
    const canalLogs = interaction.guild.channels.cache.get("1492368430265794641");

    if (canalLogs) {
      canalLogs.send({ embeds: [embed] });
    }
  }
};
