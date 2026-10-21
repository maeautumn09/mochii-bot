const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getUser } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your Mochi Stars balance."),

  async execute(interaction) {
    const user = getUser(interaction.guild.id, interaction.user.id);

    const embed = buildEmbed({
      title: `${interaction.user.username}'s balance`,
      description: `Your wallet and bank status in Mochii.`,
      color: "taro",
      footer: "Mochii balance",
      fields: [
        { name: "Wallet", value: `${user.balance} Mochi Stars`, inline: true },
        { name: "Bank", value: `${user.bank} Mochi Stars`, inline: true },
        { name: "Level", value: `${user.level}`, inline: true },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
