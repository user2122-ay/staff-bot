require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");

// 🔹 Crear cliente
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🔹 Colección de comandos
client.commands = new Collection();

// 🔹 Cargar comandos
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// 🔹 Evento cuando el bot inicia
client.once("ready", () => {
  console.log(`✅ Bot encendido como ${client.user.tag}`);
});

// 🔹 Manejo de comandos
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return interaction.reply({
      content: "❌ Comando no encontrado",
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Hubo un error ejecutando el comando",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ Hubo un error ejecutando el comando",
        ephemeral: true
      });
    }
  }
});

// 🔹 Login
client.login(process.env.TOKEN);
