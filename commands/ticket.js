const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { addModLog, getGuildSettings } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .addUserOption((option) => option.setName("user").setDescription("User to ban").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    await interaction.guild.members.ban(target, { reason });
    addModLog(interaction.guild.id, target.id, interaction.user.id, "ban", reason);

    const settings = getGuildSettings(interaction.guild.id);
    if (settings.mod_log_channel_id) {
      const channel = interaction.guild.channels.cache.get(settings.mod_log_channel_id);
      if (channel) {
        const embed = buildEmbed({
          title: "User banned",
          description: `${target.tag} was banned by ${interaction.user.tag}.`,
          color: "indigo",
          fields: [{ name: "Reason", value: reason, inline: false }],
        });
        await channel.send({ embeds: [embed] });
      }
    }

    await interaction.reply({
      embeds: [
        buildEmbed({
          title: "User banned",
          description: `${target.tag} has been banned.`,
          color: "taro",
          fields: [{ name: "Reason", value: reason, inline: false }],
        }),
      ],
    });
  },
};
