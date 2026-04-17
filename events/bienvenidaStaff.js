const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

    const CANAL_STAFF = "1413742519552053369";

    client.on("guildMemberAdd", async (member) => {

        const canal = await member.guild.channels.fetch(CANAL_STAFF).catch(() => null);
        if (!canal) return;

        // 🎨 Colores aleatorios
        const colores = [
            0x2ecc71, // verde
            0x3498db, // azul
            0x9b59b6, // morado
            0xe67e22, // naranja
            0xe74c3c, // rojo
            0xf1c40f, // amarillo
            0x1abc9c  // turquesa
        ];

        const colorRandom = colores[Math.floor(Math.random() * colores.length)];

        // 👋 Mensaje fuera del embed
        await canal.send(`🚨 | <@${member.id}> se ha unido al equipo de **Staff**`);

        // 📦 Embed
        const embed = new EmbedBuilder()
            .setColor(colorRandom)
            .setTitle("👮 Nuevo Miembro del Staff")
            .setDescription(
`Bienvenido/a al equipo de **Staff de Velaryon RP**.

A partir de ahora formas parte del grupo encargado de mantener el orden, la calidad del rol y el respeto dentro de la comunidad.

📌 **Responsabilidades:**
• Velar por el cumplimiento de las normas  
• Actuar con imparcialidad  
• Mantener una conducta profesional  
• Apoyar a los usuarios en todo momento  

⚖️ Recuerda: tu comportamiento representa al servidor.`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: "Velaryon RP | Sistema de Staff",
                iconURL: member.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        await canal.send({ embeds: [embed] });
    });

};
