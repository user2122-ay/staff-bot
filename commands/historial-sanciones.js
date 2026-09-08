const { SlashCommandBuilder, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const SancionStaff = require('../models/SancionStaff');
const StaffContador = require('../models/StaffContador');

// Solo este rol puede consultar el historial de sanciones de otros miembros del staff.
const ROL_AUTORIZADO_ID = '1523777021166223371';
const COLOR_SANCION = 0xc0392b;

const ETIQUETAS_ESTADO = {
  activo: '🔴 Activo',
  apelado: '🟡 En apelación',
  aceptada_apelacion: '🟢 Apelación aceptada',
  negada_apelacion: '⚫ Apelación negada',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('historial-sanciones')
    .setDescription('Ver el historial de sanciones y advertencias de un miembro del staff')
    .addUserOption((opt) => opt.setName('staff').setDescription('Miembro del staff a consultar').setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO_ID)) {
      await interaction.reply({ content: '❌ No tenés permiso para usar este comando.', ephemeral: true });
      return;
    }

    const objetivo = interaction.options.getUser('staff');
    await interaction.deferReply({ ephemeral: true });

    const [contador, casos] = await Promise.all([
      StaffContador.findOne({ usuarioStaffId: objetivo.id }),
      SancionStaff.find({ usuarioStaffId: objetivo.id }).sort({ createdAt: -1 }).limit(10),
    ]);

    if (!casos || casos.length === 0) {
      await interaction.editReply({ content: `✅ ${objetivo} no tiene sanciones ni advertencias registradas.` });
      return;
    }

    const resumenTexto =
      `⚠️ **Advertencias activas:** ${contador?.advertenciasActivas ?? 0} (histórico: ${contador?.totalAdvertenciasHistoricas ?? 0})\n` +
      `🚫 **Sanciones activas:** ${contador?.sancionesActivas ?? 0} (histórico: ${contador?.totalSancionesHistoricas ?? 0})`;

    const lineasCasos = casos.map((caso) => {
      const icono = caso.tipo === 'sancion' ? '🚫' : '⚠️';
      const fecha = caso.createdAt ? new Date(caso.createdAt).toLocaleDateString('es-CO') : 'Sin fecha';
      const estadoTexto = ETIQUETAS_ESTADO[caso.estado] || caso.estado;

      let linea =
        `${icono} **Caso ${caso.caseId}** — ${caso.tipo === 'sancion' ? 'Sanción' : 'Advertencia'} nivel ${caso.nivel}\n` +
        `**Motivo:** ${caso.motivo}\n` +
        `**Aplicado por:** <@${caso.aplicadoPorId}> (${caso.rangoStaff})\n` +
        `**Estado:** ${estadoTexto} — ${fecha}`;

      if (caso.notaAdicional) {
        linea += `\n**Nota:** ${caso.notaAdicional}`;
      }
      if (caso.apelacion?.razon) {
        linea += `\n**Apelación:** ${caso.apelacion.razon}`;
      }

      return linea;
    });

    const container = new ContainerBuilder()
      .setAccentColor(COLOR_SANCION)
      .addTextDisplayComponents((td) => td.setContent(`## 📋 Historial de ${objetivo.username}`))
      .addSeparatorComponents((sep) => sep.setSpacing(SeparatorSpacingSize.Small).setDivider(true))
      .addTextDisplayComponents((td) => td.setContent(resumenTexto))
      .addSeparatorComponents((sep) => sep.setSpacing(SeparatorSpacingSize.Small).setDivider(true))
      .addTextDisplayComponents((td) => td.setContent(lineasCasos.join('\n\n')));

    if (casos.length === 10) {
      container.addTextDisplayComponents((td) => td.setContent('-# Mostrando los 10 casos más recientes.'));
    }

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  },
};

