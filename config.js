module.exports = {
  // Rol que puede usar /advertencia, /sancion y !panel sancion
  STAFF_MANAGER_ROLE_ID: '1523777021166223371',

  // ID de usuario autorizado para enviar el panel con !panel sancion
  PANEL_OWNER_ID: '1237774088039170170',

  // Canal donde se abren los tickets de apelación
  APPEAL_CATEGORY_CHANNEL_ID: '1523139100595720284',

  // Rol de Asuntos Internos que puede ver y atender los tickets de apelación
  INTERNAL_AFFAIRS_ROLE_ID: '1523139015933689886',

  // Canal donde se envían los transcripts (HTML) al cerrar un ticket
  TRANSCRIPT_CHANNEL_ID: '1523776057206116412',
  // Canal donde llegan las postulaciones de Staff
  POSTULACIONES_CHANNEL_ID: '1492368430265794641',
  // Canal de sugerencias
  SUGERENCIAS_CHANNEL_ID: '1523785424387047444',

  // Rol que puede aprobar/rechazar sugerencias
  SUGERENCIAS_MOD_ROLE_ID: '1523777021166223371',
  // Canal de inactividades
  INACTIVIDAD_CHANNEL_ID: '1523785771805577276',

  // Rol de inactividad (se da al aprobar)
  INACTIVIDAD_ROL_ID: '1523139033822396549',

  // Días máximos para aprobación automática
  INACTIVIDAD_AUTO_DIAS: 2,
  // Rol autorizado para /shift admin
  SHIFT_ADMIN_ROLE_ID: '1523777021166223371',
// Canal donde llegan los reportes
  REPORTES_CHANNEL_ID: '1523139100595720284',

  // Canal de transcripts de reportes
  REPORTES_TRANSCRIPT_CHANNEL_ID: '1523776057206116412',
  // Roles de Advertencia por nivel
  ADVERTENCIA_ROLES: {
    1: '1523783889074655272',
    2: '1523784082822004817',
    3: '1523784186144624650',
  },

  // Roles de Sanción por nivel
  SANCION_ROLES: {
    1: '1523784320144113774',
    2: '1523784446514561034',
    3: '1523784528512942142',
    4: '1523784642463924364',
    5: '1523784738609959015',
    6: '1523784844465930463',
  },

  ADVERTENCIAS_POR_SANCION: 3,

  EMBED_COLOR: 0xE74C3C,
  
  staffWelcomeChannelId: '1523139109743235083',
staffWelcomeRoles: ['1523139010887946393', '1523139032673161270'],
normativaStaffChannelId: '1523139116450054184',
normativaRoleplayChannelId: '1523139119327350825',
normativaDiscordChannelId: '1523139121680486410',
};

