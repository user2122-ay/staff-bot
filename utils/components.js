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

// Container simple de una sola línea/párrafo (para logs y respuestas rápidas en V2)
function buildSimpleContainer(text, accentColor = config.EMBED_COLOR) {
  const container = new ContainerBuilder().setAccentColor(accentColor);
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  return container;
}

// Panel para postularse a Staff
function buildPostulacionPanel() {
  const container = new ContainerBuilder().setAccentColor(config.EMBED_COLOR);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      '# 📋 Postulación a Staff\n' +
        '¿Quieres formar parte del equipo de Staff? Completa el formulario.\n\n' +
        '> Responde con sinceridad y la mayor claridad posible. Tus respuestas serán evaluadas por el equipo de Asuntos Internos.'
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('postular_staff')
      .setLabel('📋 Postularme a Staff')
      .setStyle(ButtonStyle.Primary)
  );

  container.addActionRowComponents(row);

  return container;
}

// Container con las respuestas de una postulación
function buildPostulacionContainer(usuario, respuestas) {
  const container = new ContainerBuilder().setAccentColor(config.EMBED_COLOR);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# 📋 Nueva Postulación a Staff\n**Usuario:** ${usuario.tag} (<@${usuario.id}>)`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const body =
    `**→ |  Experiencia previa:**\n${respuestas.experiencia}\n\n` +
    `**→ |  ¿Qué es RP para ti?:**\n${respuestas.concepto_rp}\n\n` +
    `**→ |  Situación hipotética:**\n${respuestas.situacion_hipotetica}\n\n` +
    `**→ |  Caso ERLC:**\n${respuestas.caso_erlc}\n\n` +
    `**→ |  Manejo de presión:**\n${respuestas.manejo_presion}`;

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(body));

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('-# Postulación enviada • Sistema de Reclutamiento')
  );

  return container;
}

function buildSugerenciaContainer(usuario, texto, estado) {
  const esAceptada = estado === 'aceptada';
  const esRechazada = estado === 'rechazada';

  const accent = esAceptada ? 0x2ECC71 : esRechazada ? 0x992D22 : config.EMBED_COLOR;

  const estadoTexto = esAceptada
    ? '✅ Aceptada'
    : esRechazada
    ? '❌ Rechazada'
    : '🟡 Pendiente';

  const container = new ContainerBuilder().setAccentColor(accent);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# 💡 Sugerencia\n**→ |  Autor:** ${usuario.tag} (<@${usuario.id}>)\n\n` +
      `**→ |  Sugerencia:**\n${texto}\n\n` +
      `**→ |  Estado:** ${estadoTexto}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // Solo mostrar botones si está pendiente
  if (estado === 'pendiente') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`sugerencia_aceptar_${usuario.id}_${Date.now()}`)
        .setLabel('✅ Aprobar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`sugerencia_rechazar_${usuario.id}_${Date.now()}`)
        .setLabel('❌ Rechazar')
        .setStyle(ButtonStyle.Danger)
    );
    container.addActionRowComponents(row);
  }

  return container;
}
function buildInactividadContainer({ usuario, inicioStr, finStr, dias, motivo, estado, gestedoPorTag }) {
  const esAprobada = estado === 'aprobada';
  const esRechazada = estado === 'rechazada';

  const accent = esAprobada ? 0x2ECC71 : esRechazada ? 0x992D22 : config.EMBED_COLOR;
  const estadoTexto = esAprobada ? '✅ Aprobada' : esRechazada ? '❌ Rechazada' : '🟡 Pendiente';

  const container = new ContainerBuilder().setAccentColor(accent);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# 🌙 Solicitud de Inactividad\n` +
      `**→ |  Usuario:** ${usuario.tag} (<@${usuario.id}>)\n\n` +
      `**→ |  Inicio:** ${inicioStr}\n` +
      `**→ |  Fin:** ${finStr}\n` +
      `**→ |  Duración:** ${dias} día${dias === 1 ? '' : 's'}\n\n` +
      `**→ |  Motivo:** ${motivo}\n\n` +
      `**→ |  Estado:** ${estadoTexto}` +
      (gestedoPorTag ? `\n**→ |  Gestionado por:** ${gestedoPorTag}` : '')
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  if (estado === 'pendiente') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`inactividad_aprobar_${usuario.id}`)
        .setLabel('✅ Aprobar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`inactividad_rechazar_${usuario.id}`)
        .setLabel('❌ Rechazar')
        .setStyle(ButtonStyle.Danger)
    );
    container.addActionRowComponents(row);
  }

  return container;
}
// Panel de shift con botones Entrar/Salir/Ver
function buildShiftPanel() {
  const container = new ContainerBuilder().setAccentColor(config.EMBED_COLOR);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      '# 🕐 Panel de Shift\n' +
      'Registra tu entrada y salida de moderación.\n\n' +
      '> Pulsa **Entrar al Shift** cuando empieces a moderar.\n' +
      '> Pulsa **Salir del Shift** cuando termines.'
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('shift_entrar')
      .setLabel('🟢 Entrar al Shift')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('shift_salir')
      .setLabel('🔴 Salir del Shift')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('shift_ver')
      .setLabel('📊 Ver mis horas')
      .setStyle(ButtonStyle.Secondary)
  );

  container.addActionRowComponents(row);

  return container;
}

// Container con el resumen de horas y sesiones de un usuario
function buildShiftVerContainer(usuario, shift) {
  const container = new ContainerBuilder().setAccentColor(config.EMBED_COLOR);

  const horas = Math.floor(shift.totalMinutos / 60);
  const mins = shift.totalMinutos % 60;

  // Últimas 10 sesiones
  const sesiones = shift.sesiones.slice(-10).reverse();
  const sesionesTexto = sesiones.length > 0
    ? sesiones.map((s, i) => {
        const entrada = new Date(s.entrada).toLocaleString('es-ES', { timeZone: 'America/Panama' });
        const salida = s.salida
          ? new Date(s.salida).toLocaleString('es-ES', { timeZone: 'America/Panama' })
          : 'En curso';
        const dur = s.duracionMinutos
          ? `${Math.floor(s.duracionMinutos / 60)}h ${s.duracionMinutos % 60}m`
          : '—';
        return `**${i + 1}.** Entrada: ${entrada}\n   Salida: ${salida} · Duración: ${dur}`;
      }).join('\n\n')
    : 'Sin sesiones registradas.';

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# 📊 Shift de ${usuario.tag}\n` +
      `**→ |  Total acumulado:** ${horas}h ${mins}m\n` +
      `**→ |  Sesiones totales:** ${shift.sesiones.length}\n` +
      `**→ |  Estado actual:** ${shift.enShift ? '🟢 En shift' : '🔴 Fuera de shift'}\n\n` +
      `**── Últimas sesiones ──**\n${sesionesTexto}`
    )
  );

  return container;
}
function buildReportePanel() {
  const container = new ContainerBuilder().setAccentColor(config.EMBED_COLOR);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      '# 🚨 Panel de Reportes\n' +
      'Si necesitas reportar a un miembro del Staff por mal comportamiento, usa el botón de abajo.\n\n' +
      '> Los reportes son revisados por **Asuntos Internos**.\n' +
      '> Reportes falsos o malintencionados pueden resultar en sanciones.'
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('reporte_abrir')
      .setLabel('🚨 Reportar miembro')
      .setStyle(ButtonStyle.Danger)
  );

  container.addActionRowComponents(row);

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('-# Sistema de Asuntos Internos · Reportes')
  );

  return container;
}

function buildReporteContainer(extra) {
  const container = new ContainerBuilder().setAccentColor(0xE74C3C);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('# 🚨 Nuevo Reporte')
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const body =
    `**→ |  Reportado por:** ${extra.reportadoPorTag} (<@${extra.reportadoPorId}>)\n\n` +
    `**→ |  Usuario reportado:** ${extra.usuarioReportado}\n\n` +
    `**→ |  Razón:** ${extra.razon}\n\n` +
    `**→ |  Evidencia:** ${extra.evidencia || 'No proporcionada'}\n\n` +
    `**→ |  Estado:** 🟡 Pendiente de revisión`;

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(body));

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`reporte_aceptar_${extra.reportadoPorId}`)
      .setLabel('✅ Aceptar')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`reporte_rechazar_${extra.reportadoPorId}`)
      .setLabel('❌ Rechazar')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`reporte_cerrar_${extra.reportadoPorId}`)
      .setLabel('🔒 Cerrar')
      .setStyle(ButtonStyle.Secondary)
  );

  container.addActionRowComponents(row);

  return container;
}
module.exports = {
  buildMainPanel,
  buildCaseContainer,
  buildAppealContainer,
  buildSimpleContainer,
  buildPostulacionPanel,
  buildPostulacionContainer,
  buildSugerenciaContainer,
  buildInactividadContainer,
  buildShiftPanel,
  buildShiftVerContainer,
  buildReportePanel,
  buildReporteContainer,
};
