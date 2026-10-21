const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getLeaderboard } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("See the richest Mochii users."),

  async execute(interaction) {
    const rows = getLeaderboard(interaction.guild.id, 10);

    if (!rows.length) {
      return interaction.reply({
        embeds: [
          buildEmbed({
            title: "Leaderboard",
            description: "No users have started yet. Begin earning Mochi Stars!",
            color: "indigo",
            footer: "Mochii leaderboard",
          }),
        ],
      });
    }

    const fields = rows.map((row, index) => ({
      name: `${index + 1}. ${interaction.guild.members.cache.get(row.user_id)?.user?.username || "Unknown User"}`,
      value: `${row.balance} Mochi Stars`,
      inline: false,
    }));

    const embed = buildEmbed({
      title: "Top Mochii earners",
      description: "The richest players in this server.",
      color: "taro",
      footer: "Mochii leaderboard",
      fields,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
