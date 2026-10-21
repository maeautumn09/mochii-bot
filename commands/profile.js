const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getUser } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your Mochii profile card."),

  async execute(interaction) {
    const user = getUser(interaction.guild.id, interaction.user.id);

    const embed = buildEmbed({
      title: `${interaction.user.username}'s Mochii Profile`,
      description: "A cozy profile card for your little adventure.",
      color: "taro",
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      footer: "Mochii profile",
      fields: [
        { name: "Mochi Stars", value: `${user.balance}`, inline: true },
        { name: "Bank", value: `${user.bank}`, inline: true },
        { name: "Level", value: `${user.level}`, inline: true },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
