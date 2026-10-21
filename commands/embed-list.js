const { SlashCommandBuilder } = require("discord.js");
const { listEmbeds } = require("../utils/embedStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed-list")
    .setDescription("List saved Mochii embeds."),

  async execute(interaction) {
    const rows = listEmbeds(interaction.guild.id);

    if (!rows.length) {
      return interaction.reply("No saved embeds yet.");
    }

    const message = rows.map((row) => `• \`${row.name}\` — ${row.title || "Untitled"}`).join("\n");
    await interaction.reply(`Saved embeds:\n${message}`);
  },
};
