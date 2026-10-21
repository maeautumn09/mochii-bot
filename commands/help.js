const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show the Mochii command list."),

  async execute(interaction) {
    const commands = [
      "/daily",
      "/work",
      "/balance",
      "/shop",
      "/buy",
      "/inventory",
      "/leaderboard",
      "/coinflip",
      "/dice",
      "/profile",
      "/help",
      "/embed-save",
      "/embed-list",
      "/embed-send",
      "/multi-embed",
    ];

    await interaction.reply(`Mochii commands:\n${commands.join("\n")}`);
  },
};
