require("dotenv").config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");

const client = new Client({
intents: [GatewayIntentBits.Guilds]
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
console.log(✅ Bot encendido como ${client.user.tag});

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

// 🎮 Ejecutar comandos
client.on("interactionCreate", async interaction => {
if (!interaction.isChatInputCommand()) return;

const command = client.commands.get(interaction.commandName);
if (!command) return;

try {
await command.execute(interaction);
} catch (error) {
console.error(error);
await interaction.reply({
content: "❌ Error ejecutando comando",
ephemeral: true
});
}
});

// 🔑 Login
client.login(process.env.TOKEN);

