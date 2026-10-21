const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getUser, formatCooldown } = require("../db");
const db = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work a job and earn Mochi Stars!"),

  async execute(interaction) {
    const user = getUser(interaction.guild.id, interaction.user.id);
    const now = Date.now();
    const cooldown = 60 * 1000;
    const remaining = cooldown - (now - Number(user.last_work));

    if (user.last_work && remaining > 0) {
      return interaction.reply({
        embeds: [
          buildEmbed({
            title: "Work",
            description: `You need a break before working again. Try again in ${formatCooldown(remaining)}.`,
            color: "indigo",
            footer: "Mochii work",
          }),
        ],
      });
    }

    const payout = Math.floor(Math.random() * 61) + 20;
    db.db.prepare(
      "UPDATE users SET balance = balance + ?, last_work = ? WHERE guild_id = ? AND user_id = ?"
    ).run(payout, now, interaction.guild.id, interaction.user.id);

    const embed = buildEmbed({
      title: "Work complete",
      description: `${interaction.user} worked hard and earned ${payout} Mochi Stars!`,
      color: "taro",
      footer: "Mochii work",
      fields: [{ name: "Earned", value: `${payout} Mochi Stars`, inline: true }],
    });

    return interaction.reply({ embeds: [embed] });
  },
};
