const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("multi-embed")
    .setDescription("Send multiple embeds in one message."),

  async execute(interaction) {
    const embed1 = buildEmbed({
      title: "Welcome to Mochii",
      description: "A cozy little server for fun, social vibes, and rewards.",
      color: "taro",
      footer: "Mochii server",
    });

    const embed2 = buildEmbed({
      title: "Mochi Stars",
      description: "Earn by daily rewards and work!",
      color: "sky",
      fields: [
        { name: "Daily reward", value: "150 Mochi Stars", inline: true },
        { name: "Work payout", value: "20-80 Mochi Stars", inline: true },
      ],
    });

    const embed3 = buildEmbed({
      title: "Tips",
      description: "Use /shop, /balance, /leaderboard, and /profile.",
      color: "ice",
    });

    await interaction.reply({ embeds: [embed1, embed2, embed3] });
  },
};
