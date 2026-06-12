const { MessageFlags } = require('discord.js');
const config = require('../config');
const { buildMainPanel } = require('../utils/components');
const { buildPostulacionPanel } = require('../utils/components');

async function handlePrefixCommand(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();
  const sub = args.shift()?.toLowerCase();

  if (cmd === 'panel' && sub === 'sancion') {
    if (message.author.id !== config.PANEL_OWNER_ID) {
      return message.reply('❌ No tienes permiso para usar este comando.');
    }

    const container = buildMainPanel();

    await message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    await message.delete().catch(() => null);
  }
  if (cmd === 'panel' && sub === 'staff') {
  if (message.author.id !== config.PANEL_OWNER_ID) {
    return message.reply('❌ No tienes permiso para usar este comando.');
  }

  const container = buildPostulacionPanel();

  await message.channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  await message.delete().catch(() => null);
  }
}

module.exports = { handlePrefixCommand };
