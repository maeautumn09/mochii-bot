const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin and win or lose a bet."),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    const embed = buildEmbed({
      title: "Coin flip",
      description: `${interaction.user} flipped a coin and got **${result}**!`,
      color: "sky",
      footer: "Mochii coinflip",
    });

    await interaction.reply({ embeds: [embed] });
  },
};
