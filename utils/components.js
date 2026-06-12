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

// Panel principal -> solo botón de Apelar
function buildMainPanel() {
  const container = new ContainerBuilder().setAccentColor(config.EMBED_COLOR);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      '# 📩 Apelaciones de Advertencias y Sanciones\n' +
        'Si consideras que una Advertencia o Sanción fue injusta, puedes apelarla aquí.\n\n' +
        '> Necesitarás el **ID del caso** (ej: `ADV-7F3K9Q` o `SAN-2X8M1B`) y explicar tu razón.'
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const row = new ActionRowBuilder().addComponents(
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

// Componente que se muestra al aplicar una advertencia/sanción (con su botón de Apelar)
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

// Container dentro del ticket de apelación, con botones de gestión
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
