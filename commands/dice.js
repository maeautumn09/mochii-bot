const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Roll a six-sided die."),

  async execute(interaction) {
    const roll = Math.floor(Math.random() * 6) + 1;

    const embed = buildEmbed({
      title: "Dice roll",
      description: `${interaction.user} rolled a **${roll}**!`,
      color: "taro",
      footer: "Mochii dice",
    });

    await interaction.reply({ embeds: [embed] });
  },
};
