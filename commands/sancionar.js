const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sancionar")
    .setDescription("Registrar una sanción a staff")

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
        .setDescription("Motivo de la sanción")
        .setRequired(true))

    .addStringOption(option =>
      option.setName("nota")
        .setDescription("Nota adicional")
        .setRequired(false))

    .addRoleOption(option =>
      option.setName("rol_sancion")
        .setDescription("Rol de sanción a asignar")
        .setRequired(true))

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rango = interaction.options.getRole("rango");
    const motivo = interaction.options.getString("motivo");
    const nota = interaction.options.getString("nota") || "Sin nota";
    const rolSancion = interaction.options.getRole("rol_sancion");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    // 🔴 Dar rol de sanción
    await miembro.roles.add(rolSancion).catch(() => {});

    const fecha = new Date().toLocaleString();

    const embed = new EmbedBuilder()
      .setTitle("🚫 Sanción de Staff")
      .setColor("DarkRed")
      .addFields(
        { name: "👤 Usuario del Staff", value: `<@${usuario.id}>` },
        { name: "📊 Rango del Staff", value: `<@&${rango.id}>` },
        { name: "🚫 Motivo", value: motivo },
        { name: "📝 Nota", value: nota },
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
