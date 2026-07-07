const {
  Events,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  MessageFlags,
} = require('discord.js');
const path = require('node:path');
const config = require('../config');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      // 1. Asignar roles de staff automáticamente
      for (const roleId of config.staffWelcomeRoles) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
          await member.roles.add(role).catch((err) =>
            console.error(`[Bienvenida Staff] No se pudo asignar el rol ${roleId}:`, err)
          );
        } else {
          console.warn(`[Bienvenida Staff] Rol ${roleId} no encontrado en el servidor.`);
        }
      }

      // 2. Canal donde se envía la bienvenida
      const welcomeChannel = member.guild.channels.cache.get(config.staffWelcomeChannelId);
      if (!welcomeChannel) {
        console.warn('[Bienvenida Staff] Canal de bienvenida no encontrado.');
        return;
      }

      // 3. Imagen local del repo (assets/bienvenida.png)
      const attachment = new AttachmentBuilder(
        path.join(__dirname, '../assets/bienvenida.png'),
        { name: 'bienvenida.png' }
      );

      // 4. Construcción del mensaje en Components V2 (cajón único con todo integrado)
      const container = new ContainerBuilder()
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL('attachment://bienvenida.png')
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 🚨 ¡Bienvenido/a al staff, ${member}!\n\n` +
              `Hoy se suma un nuevo miembro al equipo de **Panamá Metro Roleplay**, ` +
              `y eso nos llena de orgullo. Este proyecto crece gracias a personas comprometidas ` +
              `como tú, que deciden dar un paso al frente y aportar tiempo, criterio y buena actitud ` +
              `para que la comunidad funcione de la mejor manera.\n\n` +
              `No estás solo/a en esto: cuentas con todo el equipo para resolver dudas y apoyarte ` +
              `en tus primeros pasos. **¡Bienvenido/a a bordo, vamos a construir algo grande juntos!** 💪`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `### 📋 Guía rápida de inicio\n\n` +
              `Antes de empezar a ejercer tus funciones es **obligatorio** que leas la normativa correspondiente. ` +
              `Ahí encontrarás tus responsabilidades, límites y todo lo que el equipo espera de ti:\n\n` +
              `• **Normativa Staff** → reglas internas y responsabilidades del cargo.\n` +
              `• **Normativa Roleplay** → cómo se maneja el roleplay dentro del servidor.\n` +
              `• **Normativa Discord** → reglas generales que aplican a todos los miembros.`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel('Normativa Staff')
              .setEmoji('📜')
              .setStyle(ButtonStyle.Link)
              .setURL(
                `https://discord.com/channels/${member.guild.id}/${config.normativaStaffChannelId}`
              ),
            new ButtonBuilder()
              .setLabel('Normativa Roleplay')
              .setEmoji('🎭')
              .setStyle(ButtonStyle.Link)
              .setURL(
                `https://discord.com/channels/${member.guild.id}/${config.normativaRoleplayChannelId}`
              ),
            new ButtonBuilder()
              .setLabel('Normativa Discord')
              .setEmoji('💬')
              .setStyle(ButtonStyle.Link)
              .setURL(
                `https://discord.com/channels/${member.guild.id}/${config.normativaDiscordChannelId}`
              )
          )
        );

      await welcomeChannel.send({
        components: [container],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error('[Bienvenida Staff] Error en el sistema de bienvenida:', error);
    }
  },
};

