const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getUser, formatCooldown } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily Mochi Stars reward!"),

  async execute(interaction) {
    const user = getUser(interaction.guild.id, interaction.user.id);
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;
    const remaining = cooldown - (now - Number(user.last_daily));

    if (user.last_daily && remaining > 0) {
      return interaction.reply({
        embeds: [
          buildEmbed({
            title: "Daily reward",
            description: `You already claimed your daily reward. Try again in ${formatCooldown(remaining)}.`,
            color: "indigo",
            footer: "Mochii daily reward",
          }),
        ],
      });
    }

    const reward = 150;
    require("../db").db.prepare(
      "UPDATE users SET balance = balance + ?, last_daily = ? WHERE guild_id = ? AND user_id = ?"
    ).run(reward, now, interaction.guild.id, interaction.user.id);

    const embed = buildEmbed({
      title: "Daily reward",
      description: `${interaction.user} claimed their daily reward of ${reward} Mochi Stars!`,
      color: "sky",
      footer: "Mochii reward",
      fields: [{ name: "Reward", value: `${reward} Mochi Stars`, inline: true }],
    });

    return interaction.reply({ embeds: [embed] });
  },
};
