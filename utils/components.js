const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const config = require('../config');

function buildMainPanel() {
  const container = new ContainerBuilder().setAccentColor(config.EMBED_COLOR);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      '# ⚠️ Panel de Advertencias y Sanciones\n' +
        'Sistema oficial de control de Staff. Usa los botones para registrar una **Advertencia** o **Sanción**.\n\n' +
        '> **3 Advertencias** acumuladas equivalen automáticamente a **1 Sanción**.\n' +
        '> Los roles correspondientes se asignan de forma automática.'
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      '**→ |  Acciones disponibles**\n' +
        '🔸 Registrar Advertencia\n' +
        '🔸 Registrar Sanción\n' +
        '🔸 Apelar una Advertencia/Sanción existente'
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('panel_advertencia')
      .setLabel('⚠️ Advertencia')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('panel_sancion')
      .setLabel('🚫 Sanción')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('panel_apelar')
      .setLabel('📩 Apelar Sanción/Advertencia')
      .setStyle(ButtonStyle.Primary)
  );

  container.addActionRowComponents(row);

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('-# Sistema de Asuntos Internos · Gestión de Staff')
  );

  return container;
}

function buildCaseContainer(caso, extra) {
  const esAdvertencia = caso.tipo === 'advertencia';
  const titulo = esAdvertencia ? '⚠️ Formato de Advertencia' : '🚫 Formato de Sanción';
  const accent = esAdvertencia ? config.EMBED_COLOR : 0x992D22;

  const container = new ContainerBuilder().setAccentColor(accent);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${titulo}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const body =
    `**→ |  Usuario del Staff:** ${extra.usuarioStaffTag} (<@${caso.usuarioStaffId}>)\n\n` +
    `**→ |  Rango del Staff:** ${caso.rangoStaff}\n\n` +
    `**→ |  Motivo:** ${caso.motivo}\n\n` +
    `**→ |  Nota (adicional):** ${caso.notaAdicional || 'N/A'}\n\n` +
    `**→ |  Nivel:** ${caso.nivel}\n` +
    `**→ |  Rol asignado:** <@&${caso.rolAsignadoId}>\n` +
    `**→ |  Aplicado por:** ${extra.aplicadoPorTag}\n` +
    `**→ |  ID del Caso:** \`${caso.caseId}\``;

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(body));

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`apelar_caso_${caso.caseId}`)
      .setLabel(esAdvertencia ? '📩 Apelar Advertencia' : '📩 Apelar Sanción')
      .setStyle(ButtonStyle.Primary)
  );

  container.addActionRowComponents(row);

  return container;
}

function buildAppealContainer(caso, extra) {
  const container = new ContainerBuilder().setAccentColor(config.EMBED_COLOR);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('# 📩 Apelación de Sanción/Advertencia')
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const body =
    `**→ |  Caso apelado:** \`${caso.caseId}\` (${caso.tipo === 'advertencia' ? 'Advertencia' : 'Sanción'} N°${caso.nivel})\n\n` +
    `**→ |  Usuario del Staff:** <@${caso.usuarioStaffId}>\n\n` +
    `**→ |  Rango del Staff:** ${caso.rangoStaff}\n\n` +
    `**→ |  Motivo original:** ${caso.motivo}\n\n` +
    `**→ |  Nota original:** ${caso.notaAdicional || 'N/A'}\n\n` +
    `**→ |  Razón de la apelación:** ${extra.razonApelacion}\n\n` +
    `**→ |  Apelación abierta por:** <@${extra.abiertoPorId}>\n` +
    `**→ |  Estado:** 🟡 Pendiente de revisión`;

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(body));

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`apelacion_reclamar_${caso.caseId}`)
      .setLabel('🙋 Reclamar')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`apelacion_aceptar_${caso.caseId}`)
      .setLabel('✅ Aceptar Apelación')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`apelacion_negar_${caso.caseId}`)
      .setLabel('❌ Negar Apelación')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`apelacion_cerrar_${caso.caseId}`)
      .setLabel('🔒 Cerrar Ticket')
      .setStyle(ButtonStyle.Secondary)
  );

  container.addActionRowComponents(row);

  return container;
}

module.exports = {
  buildMainPanel,
  buildCaseContainer,
  buildAppealContainer,
};
