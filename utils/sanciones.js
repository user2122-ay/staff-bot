const SancionStaff = require('../models/SancionStaff');
const StaffContador = require('../models/StaffContador');
const { generateCaseId } = require('./ids');
const config = require('../config');

async function limpiarRolesAnteriores(member, tipo) {
  const roles = tipo === 'advertencia' ? config.ADVERTENCIA_ROLES : config.SANCION_ROLES;
  const idsAQuitar = Object.values(roles).filter((id) => member.roles.cache.has(id));
  if (idsAQuitar.length > 0) {
    await member.roles.remove(idsAQuitar).catch(() => null);
  }
}

async function aplicarAdvertencia(member, { rangoStaff, motivo, notaAdicional, aplicadoPorId }) {
  let contador = await StaffContador.findOne({ usuarioStaffId: member.id });
  if (!contador) {
    contador = await StaffContador.create({ usuarioStaffId: member.id });
  }

  contador.advertenciasActivas += 1;
  contador.totalAdvertenciasHistoricas += 1;

  let conversionASancion = false;
  let casoSancion = null;

  if (contador.advertenciasActivas >= config.ADVERTENCIAS_POR_SANCION) {
    conversionASancion = true;
    contador.advertenciasActivas = 0;

    const nuevoNivelSancion = Math.min(contador.sancionesActivas + 1, 6);
    contador.sancionesActivas = nuevoNivelSancion;
    contador.totalSancionesHistoricas += 1;

    await limpiarRolesAnteriores(member, 'advertencia');
    await limpiarRolesAnteriores(member, 'sancion');

    const rolSancionId = config.SANCION_ROLES[nuevoNivelSancion];
    await member.roles.add(rolSancionId).catch(() => null);

    casoSancion = await SancionStaff.create({
      caseId: generateCaseId('sancion'),
      tipo: 'sancion',
      nivel: nuevoNivelSancion,
      usuarioStaffId: member.id,
      rangoStaff,
      motivo: `Conversión automática: 3 advertencias acumuladas. Motivo de la última advertencia: ${motivo}`,
      notaAdicional: notaAdicional || '',
      aplicadoPorId,
      rolAsignadoId: rolSancionId,
    });
  } else {
    await limpiarRolesAnteriores(member, 'advertencia');
    const rolAdvertenciaId = config.ADVERTENCIA_ROLES[contador.advertenciasActivas];
    await member.roles.add(rolAdvertenciaId).catch(() => null);
  }

  await contador.save();

  let caso;
  if (conversionASancion) {
    caso = casoSancion;
  } else {
    caso = await SancionStaff.create({
      caseId: generateCaseId('advertencia'),
      tipo: 'advertencia',
      nivel: contador.advertenciasActivas,
      usuarioStaffId: member.id,
      rangoStaff,
      motivo,
      notaAdicional: notaAdicional || '',
      aplicadoPorId,
      rolAsignadoId: config.ADVERTENCIA_ROLES[contador.advertenciasActivas],
    });
  }

  return { caso, contador, conversionASancion, casoSancion };
}

async function aplicarSancion(member, { rangoStaff, motivo, notaAdicional, aplicadoPorId }) {
  let contador = await StaffContador.findOne({ usuarioStaffId: member.id });
  if (!contador) {
    contador = await StaffContador.create({ usuarioStaffId: member.id });
  }

  const nuevoNivel = Math.min(contador.sancionesActivas + 1, 6);
  contador.sancionesActivas = nuevoNivel;
  contador.totalSancionesHistoricas += 1;
  await contador.save();

  await limpiarRolesAnteriores(member, 'sancion');
  const rolId = config.SANCION_ROLES[nuevoNivel];
  await member.roles.add(rolId).catch(() => null);

  const caso = await SancionStaff.create({
    caseId: generateCaseId('sancion'),
    tipo: 'sancion',
    nivel: nuevoNivel,
    usuarioStaffId: member.id,
    rangoStaff,
    motivo,
    notaAdicional: notaAdicional || '',
    aplicadoPorId,
    rolAsignadoId: rolId,
  });

  return { caso, contador };
}

module.exports = { aplicarAdvertencia, aplicarSancion, limpiarRolesAnteriores };
