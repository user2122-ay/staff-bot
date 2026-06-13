require("dotenv").config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const { connectDB } = require("./utils/db");
const { handlePrefixCommand } = require('./handlers/prefixCommands');
const { handleInteraction } = require('./handlers/interactionHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();

// 📁 Cargar comandos
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

// 🚀 Cuando el bot inicia
client.once("ready", async () => {
  console.log(`✅ Bot encendido como ${client.user.tag}`);

  try {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    console.log("🔄 Registrando comandos automáticamente...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Comandos registrados automáticamente");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
});

client.on("interactionCreate", async interaction => {
  if (interaction.isButton() || interaction.isModalSubmit()) {
    try {
      return await handleInteraction(interaction, client);
    } catch (err) {
      console.error('❌ Error en interacción de botón/modal:', err.message);
      const msg = '❌ Ocurrió un error procesando esta acción.';
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: msg, ephemeral: true }).catch(() => null);
      } else {
        await interaction.reply({ content: msg, ephemeral: true }).catch(() => null);
      }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('❌ Error ejecutando comando:', error.message);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: '❌ Error ejecutando comando', ephemeral: true }).catch(() => null);
    } else {
      await interaction.reply({ content: '❌ Error ejecutando comando', ephemeral: true }).catch(() => null);
    }
  }
});

// Evitar que errores no manejados tiren el bot
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err.message);
});


// 🔌 Conectar a la BD y luego loguear el bot
(async () => {
  await connectDB();
  await client.login(process.env.TOKEN);
})();
