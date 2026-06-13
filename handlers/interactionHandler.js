const {
  MessageFlags,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const config = require('../config');
const SancionStaff = require('../models/SancionStaff');

const { buildReporteModal } = require('../utils/reporteModal');
const { buildAppealContainer, buildSimpleContainer, buildPostulacionContainer, buildSugerenciaContainer, buildInactividadContainer, buildShiftVerContainer, buildReporteContainer } = require('../utils/components');
const Shift = require('../models/Shift');
const { buildApelarModal } = require('../utils/modals');
const discordTranscripts = require('discord-html-transcripts');
const generateTranscript = discordTranscripts.createTranscript || discordTranscripts.default || discordTranscripts;
const { buildPostulacionModal } = require('../utils/postulacionModal');

function parseUserId(text) {
  const match = text.match(/^<@!?(\d+)>$/);
  if (match) return match[1];
  if (/^\d{15,21}$/.test(text.trim())) return text.trim();
  return null;
}

async function handleInteraction(interaction, client) {
  // ------------------ BOTONES ------------------
  if (interaction.isButton()) {
    const { customId } = interaction;

    if (customId === 'panel_apelar') {
      return interaction.showModal(buildApelarModal());
    }

    if (customId.startsWith('apelar_caso_')) {
      const caseId = customId.replace('apelar_caso_', '');
      return interaction.showModal(buildApelarModal(caseId));
    }

    if (customId.startsWith('apelacion_')) {
      return handleApelacionButton(interaction, customId);
    }
    if (customId === 'postular_staff') {
  return interaction.showModal(buildPostulacionModal());
    }
 if (customId.startsWith('sugerencia_aceptar_') || customId.startsWith('sugerencia_rechazar_')) {
  return handleSugerenciaButton(interaction, customId);
 } 
    if (customId.startsWith('inactividad_aprobar_') || customId.startsWith('inactividad_rechazar_')) {
  return handleInactividadButton(interaction, customId);
    }
    if (customId === 'shift_entrar' || customId === 'shift_salir' || customId === 'shift_ver') {
  return handleShiftButton(interaction, customId);
    }
    if (customId === 'reporte_abrir') {
  return interaction.showModal(buildReporteModal());
}

if (customId.startsWith('reporte_aceptar_') || customId.startsWith('reporte_rechazar_') || customId.startsWith('reporte_cerrar_')) {
  return handleReporteButton(interaction, customId);
}
  }
 
 

  // ------------------ MODALES ------------------
  if (interaction.isModalSubmit()) {
    const { customId } = interaction;

    if (customId.startsWith('modal_apelar_')) {
      return handleApelarModal(interaction, customId);
    }
    if (customId === 'modal_postulacion_staff') {
  return handlePostulacionModal(interaction);
    }
    if (customId === 'modal_reporte') {
  return handleReporteModal(interaction);
    } 
  }
 
}

// ========================================================
// Crear ticket de apelación
// ========================================================
async function handleApelarModal(interaction, customId) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let caseId;
  let razon;

  if (customId === 'modal_apelar_generico') {
    caseId = interaction.fields.getTextInputValue('case_id').trim().toUpperCase();
    razon = interaction.fields.getTextInputValue('razon_apelacion');
  } else {
    caseId = customId.replace('modal_apelar_', '');
    razon = interaction.fields.getTextInputValue('razon_apelacion');
  }

  const caso = await SancionStaff.findOne({ caseId });
  if (!caso) {
    return interaction.editReply(`❌ No se encontró ningún caso con el ID \`${caseId}\`.`);
  }

  // Solo el usuario sancionado puede apelar su propio caso
  if (caso.usuarioStaffId !== interaction.user.id) {
    return interaction.editReply('❌ Solo puedes apelar Advertencias/Sanciones que te hayan sido aplicadas a ti.');
  }

  if (caso.estado !== 'activo') {
    return interaction.editReply(
      `❌ Este caso ya fue procesado (estado actual: \`${caso.estado}\`). No se puede apelar de nuevo.`
    );
  }

  const guild = interaction.guild;
  const parentChannel = await guild.channels
    .fetch(config.APPEAL_CATEGORY_CHANNEL_ID)
    .catch(() => null);

  const parentId =
    parentChannel && parentChannel.type === ChannelType.GuildCategory
      ? parentChannel.id
      : parentChannel?.parentId || null;

  const ticketChannel = await guild.channels.create({
    name: `apelacion-${caso.caseId}`.toLowerCase(),
    type: ChannelType.GuildText,
    parent: parentId,
    topic: `Apelación del caso ${caso.caseId} | Usuario: ${caso.usuarioStaffId} | Abierta por: ${interaction.user.id}`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: config.INTERNAL_AFFAIRS_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  caso.estado = 'apelado';
  caso.apelacion.ticketChannelId = ticketChannel.id;
  caso.apelacion.razon = razon;
  await caso.save();

  const container = buildAppealContainer(caso, {
    razonApelacion: razon,
    abiertoPorId: interaction.user.id,
  });

  // Mención de aviso (en V2 va dentro de un TextDisplay, no en "content")
  const avisoContainer = buildSimpleContainer(
    `<@&${config.INTERNAL_AFFAIRS_ROLE_ID}> | <@${interaction.user.id}>`
  );

  await ticketChannel.send({
    components: [avisoContainer],
    flags: MessageFlags.IsComponentsV2,
  });

  await ticketChannel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  await interaction.editReply(
    `✅ Tu apelación para el caso \`${caso.caseId}\` fue creada: ${ticketChannel}`
  );
}

// ========================================================
// Botones dentro del ticket (reclamar, aceptar, negar, cerrar)
// ========================================================
async function handleApelacionButton(interaction, customId) {
  const isInternalAffairs = interaction.member.roles.cache.has(
    config.INTERNAL_AFFAIRS_ROLE_ID
  );

  if (!isInternalAffairs) {
    return interaction.reply({
      content: '❌ Solo Asuntos Internos puede gestionar esta apelación.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const parts = customId.split('_');
  const accion = parts[1];
  const caseId = parts.slice(2).join('_');

  const caso = await SancionStaff.findOne({ caseId });
  if (!caso) {
    return interaction.reply({
      content: `❌ No se encontró el caso \`${caseId}\`.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (accion === 'reclamar') {
    caso.apelacion.reclamadoPorId = interaction.user.id;
    await caso.save();

    const container = buildSimpleContainer(
      `🙋 <@${interaction.user.id}> ha reclamado este ticket de apelación.`
    );
    return interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  if (accion === 'aceptar' || accion === 'negar') {
    const resultado = accion === 'aceptar' ? 'aceptada' : 'negada';

    caso.estado = resultado === 'aceptada' ? 'aceptada_apelacion' : 'negada_apelacion';
    caso.apelacion.resultado = resultado;
    caso.apelacion.resueltoPorId = interaction.user.id;

    if (resultado === 'aceptada') {
      const member = await interaction.guild.members
        .fetch(caso.usuarioStaffId)
        .catch(() => null);

      if (member && member.roles.cache.has(caso.rolAsignadoId)) {
        await member.roles.remove(caso.rolAsignadoId).catch(() => null);
      }
    }

    await caso.save();

    const emoji = resultado === 'aceptada' ? '✅' : '❌';
    const accent = resultado === 'aceptada' ? config.EMBED_COLOR_OK : config.EMBED_COLOR_DENY;

    const texto =
      `${emoji} La apelación del caso \`${caso.caseId}\` ha sido **${resultado.toUpperCase()}** por <@${interaction.user.id}>.\n` +
      (resultado === 'aceptada'
        ? `Se ha revertido el rol asociado a <@${caso.usuarioStaffId}>.`
        : `El caso permanece activo.`) +
      `\n\nEste ticket se cerrará automáticamente en 10 segundos...`;

    const container = buildSimpleContainer(texto, accent);

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    setTimeout(() => {
      cerrarTicket(interaction, caso).catch(console.error);
    }, 10000);
    return;
  }

  if (accion === 'cerrar') {
    const container = buildSimpleContainer('🔒 Cerrando ticket y generando transcript...');
    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    return cerrarTicket(interaction, caso);
  }
}

// ========================================================
// Cerrar ticket + transcript
// ========================================================
async function cerrarTicket(interaction, caso) {
  const channel = interaction.channel;

  try {
    const attachment = await generateTranscript(channel, {
      limit: -1,
      returnType: 'attachment',
      filename: `transcript-${caso.caseId}.html`,
      saveImages: true,
      poweredBy: false,
    });

    console.log('📄 Transcript generado:', !!attachment);

    const transcriptChannel = await interaction.guild.channels
      .fetch(config.TRANSCRIPT_CHANNEL_ID)
      .catch((err) => {
        console.error('❌ Error obteniendo canal de transcripts:', err.message);
        return null;
      });

    console.log('📂 Canal de transcripts encontrado:', !!transcriptChannel);

    if (transcriptChannel) {
      const sentMsg = await transcriptChannel.send({
        content:
          `📄 **Transcript de apelación**\n` +
          `**Caso:** \`${caso.caseId}\`\n` +
          `**Usuario del Staff:** <@${caso.usuarioStaffId}>\n` +
          `**Resultado:** ${caso.apelacion.resultado || 'cerrado sin resolución'}\n` +
          `**Cerrado por:** <@${interaction.user.id}>`,
        files: [attachment],
      });

      const url = sentMsg.attachments.first()?.url || null;
      caso.apelacion.transcriptUrl = url;
    }
  } catch (err) {
    console.error('❌ Error generando/enviando el transcript:', err);
  }

  caso.apelacion.cerradoEn = new Date();
  await caso.save();

  setTimeout(() => {
    channel.delete().catch(() => null);
  }, 2000);
}
// ========================================================
// Enviar postulación de Staff al canal correspondiente
// ========================================================
async function handlePostulacionModal(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const respuestas = {
    experiencia: interaction.fields.getTextInputValue('experiencia'),
    concepto_rp: interaction.fields.getTextInputValue('concepto_rp'),
    situacion_hipotetica: interaction.fields.getTextInputValue('situacion_hipotetica'),
    caso_erlc: interaction.fields.getTextInputValue('caso_erlc'),
    manejo_presion: interaction.fields.getTextInputValue('manejo_presion'),
  };

  const canal = await interaction.guild.channels
    .fetch(config.POSTULACIONES_CHANNEL_ID)
    .catch(() => null);

  if (!canal) {
    return interaction.editReply('❌ No se pudo encontrar el canal de postulaciones. Contacta a un administrador.');
  }

  const container = buildPostulacionContainer(interaction.user, respuestas);

  await canal.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  await interaction.editReply('✅ Tu postulación fue enviada correctamente. ¡Gracias por participar!');
}

// ========================================================
// Aprobar / Rechazar sugerencia
// ========================================================
async function handleSugerenciaButton(interaction, customId) {
  if (!interaction.member.roles.cache.has(config.SUGERENCIAS_MOD_ROLE_ID)) {
    return interaction.reply({
      content: '❌ No tienes permiso para gestionar sugerencias.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const accion = customId.startsWith('sugerencia_aceptar_') ? 'aceptada' : 'rechazada';

  // Reconstruir el container con el nuevo estado
  // Extraemos la info del mensaje original
  const mensaje = interaction.message;

  // Buscar el texto de la sugerencia y autor del container actual
  // Como Components V2 no expone el texto fácilmente, lo leemos del primer TextDisplay
  const textoOriginal = mensaje.components[0]?.components
    ?.find(c => c.type === 10)?.content || '';

  // Extraer autor del texto (entre <@ y >)
  const autorMatch = textoOriginal.match(/<@(\d+)>/);
  const autorId = autorMatch ? autorMatch[1] : null;

  // Extraer sugerencia del texto (entre "Sugerencia:**\n" y "\n\n**→ |  Estado")
  const sugerenciaMatch = textoOriginal.match(/\*\*Sugerencia:\*\*\n([\s\S]+?)\n\n\*\*→/);
  const sugerenciaTexto = sugerenciaMatch ? sugerenciaMatch[1] : 'N/A';

  const usuarioFake = {
    id: autorId || '0',
    tag: autorId ? `<@${autorId}>` : 'Desconocido',
  };

  const nuevoContainer = buildSugerenciaContainer(usuarioFake, sugerenciaTexto, accion);

  await interaction.update({
    components: [nuevoContainer],
    flags: MessageFlags.IsComponentsV2,
  });
}
// ========================================================
// Aprobar / Rechazar inactividad
// ========================================================
async function handleInactividadButton(interaction, customId) {
  if (!interaction.member.roles.cache.has(config.SUGERENCIAS_MOD_ROLE_ID)) {
    return interaction.reply({
      content: '❌ No tienes permiso para gestionar inactividades.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const accion = customId.startsWith('inactividad_aprobar_') ? 'aprobada' : 'rechazada';
  const usuarioId = customId.replace('inactividad_aprobar_', '').replace('inactividad_rechazar_', '');

  const textoOriginal = interaction.message.components[0]?.components
    ?.find(c => c.type === 10)?.content || '';

  const inicioMatch = textoOriginal.match(/\*\*→ \|  Inicio:\*\* (.+)/);
  const finMatch = textoOriginal.match(/\*\*→ \|  Fin:\*\* (.+)/);
  const diasMatch = textoOriginal.match(/\*\*→ \|  Duración:\*\* (\d+)/);
  const motivoMatch = textoOriginal.match(/\*\*→ \|  Motivo:\*\* ([\s\S]+?)\n\n\*\*→ \|  Estado/);

  const inicioStr = inicioMatch ? inicioMatch[1] : '?';
  const finStr = finMatch ? finMatch[1] : '?';
  const dias = diasMatch ? parseInt(diasMatch[1]) : 0;
  const motivo = motivoMatch ? motivoMatch[1] : '?';

  const usuarioObj = { id: usuarioId, tag: `<@${usuarioId}>` };

  const nuevoContainer = buildInactividadContainer({
    usuario: usuarioObj,
    inicioStr,
    finStr,
    dias,
    motivo,
    estado: accion,
    gestedoPorTag: interaction.user.tag,
  });

  await interaction.update({
    components: [nuevoContainer],
    flags: MessageFlags.IsComponentsV2,
  });

  const member = await interaction.guild.members.fetch(usuarioId).catch(() => null);

  if (accion === 'aprobada' && member) {
    await member.roles.add(config.INACTIVIDAD_ROL_ID).catch(() => null);
  }

  const usuarioDiscord = await interaction.client.users.fetch(usuarioId).catch(() => null);
  if (usuarioDiscord) {
    const mdTexto = accion === 'aprobada'
      ? `✅ **Tu solicitud de inactividad fue aprobada.**\n**Período:** ${inicioStr} → ${finStr} (${dias} día${dias === 1 ? '' : 's'})\n**Motivo:** ${motivo}\nSe te asignó el rol de inactividad.`
      : `❌ **Tu solicitud de inactividad fue rechazada.**\n**Período:** ${inicioStr} → ${finStr}\n**Motivo:** ${motivo}\nContacta al staff para más información.`;

    await usuarioDiscord.send({ content: mdTexto }).catch(() => null);
  }

  const canalInactividad = await interaction.guild.channels
    .fetch(config.INACTIVIDAD_CHANNEL_ID)
    .catch(() => null);

  if (canalInactividad) {
    const emoji = accion === 'aprobada' ? '✅' : '❌';
    await canalInactividad.send({
      content: `${emoji} La inactividad de <@${usuarioId}> fue **${accion}** por <@${interaction.user.id}>.`,
    });
  }
}

// ========================================================
// Shift: entrar, salir, ver
// ========================================================
async function handleShiftButton(interaction, customId) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const usuarioId = interaction.user.id;

  if (customId === 'shift_entrar') {
    let shift = await Shift.findOne({ usuarioId });
    if (!shift) shift = await Shift.create({ usuarioId });

    if (shift.enShift) {
      return interaction.editReply('⚠️ Ya estás en shift. Sal primero antes de entrar de nuevo.');
    }

    shift.enShift = true;
    shift.entradaActual = new Date();
    shift.sesiones.push({ entrada: shift.entradaActual });
    await shift.save();

    const container = buildSimpleContainer(
      `🟢 Entraste al shift a las **${shift.entradaActual.toLocaleTimeString('es-ES', { timeZone: 'America/Panama' })}**. ¡Buena moderación!`
    );
    return interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  if (customId === 'shift_salir') {
    const shift = await Shift.findOne({ usuarioId });

    if (!shift || !shift.enShift) {
      return interaction.editReply('⚠️ No estás en shift actualmente.');
    }

    const ahora = new Date();
    const duracion = Math.floor((ahora - shift.entradaActual) / 60000);

    const ultimaSesion = shift.sesiones[shift.sesiones.length - 1];
    ultimaSesion.salida = ahora;
    ultimaSesion.duracionMinutos = duracion;

    shift.totalMinutos += duracion;
    shift.enShift = false;
    shift.entradaActual = null;
    shift.markModified('sesiones');
    await shift.save();

    const horas = Math.floor(duracion / 60);
    const mins = duracion % 60;
    const totalH = Math.floor(shift.totalMinutos / 60);
    const totalM = shift.totalMinutos % 60;

    const container = buildSimpleContainer(
      `🔴 Saliste del shift.\n` +
      `**Duración de esta sesión:** ${horas}h ${mins}m\n` +
      `**Total acumulado:** ${totalH}h ${totalM}m`
    );
    return interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  if (customId === 'shift_ver') {
    const shift = await Shift.findOne({ usuarioId });

    if (!shift || shift.sesiones.length === 0) {
      return interaction.editReply('❌ No tienes sesiones registradas aún.');
    }

    const container = buildShiftVerContainer(interaction.user, shift);
    return interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
} 
  // ========================================================
// Reporte: enviar al canal
// ========================================================
async function handleReporteModal(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const usuarioReportado = interaction.fields.getTextInputValue('usuario_reportado');
  const razon = interaction.fields.getTextInputValue('razon');
  const evidencia = interaction.fields.getTextInputValue('evidencia') || null;

  const canal = await interaction.guild.channels
    .fetch(config.REPORTES_CHANNEL_ID)
    .catch(() => null);

  if (!canal) {
    return interaction.editReply('❌ No se encontró el canal de reportes.');
  }

  const container = buildReporteContainer({
    reportadoPorId: interaction.user.id,
    reportadoPorTag: interaction.user.tag,
    usuarioReportado,
    razon,
    evidencia,
  });

  // Crear hilo para el seguimiento del reporte
  const msg = await canal.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  await msg.startThread({
    name: `🚨 Reporte · ${interaction.user.username}`,
    autoArchiveDuration: 1440,
  });

  await interaction.editReply('✅ Tu reporte fue enviado correctamente. Asuntos Internos lo revisará pronto.');
}

// ========================================================
// Reporte: botones aceptar/rechazar/cerrar
// ========================================================
async function handleReporteButton(interaction, customId) {
  if (!interaction.member.roles.cache.has(config.INTERNAL_AFFAIRS_ROLE_ID)) {
    return interaction.reply({
      content: '❌ Solo Asuntos Internos puede gestionar los reportes.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const reportadoPorId = customId
    .replace('reporte_aceptar_', '')
    .replace('reporte_rechazar_', '')
    .replace('reporte_cerrar_', '');

  let accion;
  if (customId.startsWith('reporte_aceptar_')) accion = 'aceptado';
  else if (customId.startsWith('reporte_rechazar_')) accion = 'rechazado';
  else accion = 'cerrado';

  // Leer info del mensaje original
  const textoOriginal = interaction.message.components[0]?.components
    ?.find(c => c.type === 10)?.content || '';

  const reportadoMatch = textoOriginal.match(/\*\*→ \|  Usuario reportado:\*\* ([\s\S]+?)\n\n/);
  const razonMatch = textoOriginal.match(/\*\*→ \|  Razón:\*\* ([\s\S]+?)\n\n/);
  const evidenciaMatch = textoOriginal.match(/\*\*→ \|  Evidencia:\*\* ([\s\S]+?)\n\n/);

  const usuarioReportado = reportadoMatch ? reportadoMatch[1] : '?';
  const razon = razonMatch ? razonMatch[1] : '?';
  const evidencia = evidenciaMatch ? evidenciaMatch[1] : null;

  const emoji = accion === 'aceptado' ? '✅' : accion === 'rechazado' ? '❌' : '🔒';
  const accent = accion === 'aceptado' ? 0x2ECC71 : accion === 'rechazado' ? 0x992D22 : 0x95A5A6;

  // Editar el mensaje con el nuevo estado
  const nuevoContainer = new (require('discord.js').ContainerBuilder)().setAccentColor(accent);
  const { TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');

  nuevoContainer.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# 🚨 Reporte · ${emoji} ${accion.toUpperCase()}\n\n` +
      `**→ |  Reportado por:** <@${reportadoPorId}>\n\n` +
      `**→ |  Usuario reportado:** ${usuarioReportado}\n\n` +
      `**→ |  Razón:** ${razon}\n\n` +
      `**→ |  Evidencia:** ${evidencia || 'No proporcionada'}\n\n` +
      `**→ |  Estado:** ${emoji} ${accion.charAt(0).toUpperCase() + accion.slice(1)}\n` +
      `**→ |  Gestionado por:** ${interaction.user.tag}`
    )
  );

  await interaction.update({
    components: [nuevoContainer],
    flags: MessageFlags.IsComponentsV2,
  });

  // MD al usuario que reportó
  const usuarioReporto = await interaction.client.users.fetch(reportadoPorId).catch(() => null);
  if (usuarioReporto) {
    const mdTexto =
      `${emoji} **Tu reporte fue ${accion}.**\n` +
      `**Usuario reportado:** ${usuarioReportado}\n` +
      `**Razón:** ${razon}\n` +
      `**Gestionado por:** ${interaction.user.tag}`;

    await usuarioReporto.send({ content: mdTexto }).catch(() => null);
  }

  // Transcript al canal de logs
  const transcriptChannel = await interaction.guild.channels
    .fetch(config.REPORTES_TRANSCRIPT_CHANNEL_ID)
    .catch(() => null);

  if (transcriptChannel) {
    await transcriptChannel.send({
      content:
        `📄 **Reporte ${accion}**\n` +
        `**Reportado por:** <@${reportadoPorId}>\n` +
        `**Usuario reportado:** ${usuarioReportado}\n` +
        `**Razón:** ${razon}\n` +
        `**Evidencia:** ${evidencia || 'No proporcionada'}\n` +
        `**Gestionado por:** ${interaction.user.tag}`,
    });
  }
                                             }


module.exports = { handleInteraction };
