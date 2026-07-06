module.exports = {
  // Rol que puede usar /advertencia, /sancion y !panel sancion
  STAFF_MANAGER_ROLE_ID: '1523777021166223371',

  // ID de usuario autorizado para enviar el panel con !panel sancion
  PANEL_OWNER_ID: '1523777021166223371',

  // Canal donde se abren los tickets de apelación
  APPEAL_CATEGORY_CHANNEL_ID: '1523139100595720284',

  // Rol de Asuntos Internos que puede ver y atender los tickets de apelación
  INTERNAL_AFFAIRS_ROLE_ID: '1413737213094658099',

  // Canal donde se envían los transcripts (HTML) al cerrar un ticket
  TRANSCRIPT_CHANNEL_ID: '1413917513720271013',
  // Canal donde llegan las postulaciones de Staff
  POSTULACIONES_CHANNEL_ID: '1492368430265794641',
  // Canal de sugerencias
  SUGERENCIAS_CHANNEL_ID: '1413746104306237571',

  // Rol que puede aprobar/rechazar sugerencias
  SUGERENCIAS_MOD_ROLE_ID: '1435795663710453860',
  // Canal de inactividades
  INACTIVIDAD_CHANNEL_ID: '1474918228429115573',

  // Rol de inactividad (se da al aprobar)
  INACTIVIDAD_ROL_ID: '1415574506881159230',

  // Días máximos para aprobación automática
  INACTIVIDAD_AUTO_DIAS: 2,
  // Rol autorizado para /shift admin
  SHIFT_ADMIN_ROLE_ID: '1435795663710453860',
// Canal donde llegan los reportes
  REPORTES_CHANNEL_ID: '1413747645318696970',

  // Canal de transcripts de reportes
  REPORTES_TRANSCRIPT_CHANNEL_ID: '1413917513720271013',
  // Roles de Advertencia por nivel
  ADVERTENCIA_ROLES: {
    1: '1458617234783076457',
    2: '1492370076907868250',
    3: '1492370245141397565',
  },

  // Roles de Sanción por nivel
  SANCION_ROLES: {
    1: '1457532739740766330',
    2: '1457532797785735229',
    3: '1457532935774142677',
    4: '1457533075570294825',
    5: '1457533161083764797',
    6: '1457544772414603327',
  },

  ADVERTENCIAS_POR_SANCION: 3,

  EMBED_COLOR: 0xE74C3C,
};
