const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { addModLog, getGuildSettings } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove a timeout from a user.")
    .addUserOption((option) => option.setName("user").setDescription("User to unmute").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";
    const member = interaction.guild.members.cache.get(target.id) || await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: "That user is not in this server.", ephemeral: true });
    }

    await member.timeout(null, reason);
    addModLog(interaction.guild.id, target.id, interaction.user.id, "unmute", reason);

    const settings = getGuildSettings(interaction.guild.id);
    if (settings.mod_log_channel_id) {
      const channel = interaction.guild.channels.cache.get(settings.mod_log_channel_id);
      if (channel) {
        const embed = buildEmbed({
          title: "User unmuted",
          description: `${target.tag} was unmuted by ${interaction.user.tag}.`,
          color: "indigo",
          fields: [{ name: "Reason", value: reason, inline: false }],
        });
        await channel.send({ embeds: [embed] });
      }
    }

    await interaction.reply({
      embeds: [
        buildEmbed({
          title: "User unmuted",
          description: `${target.tag} is no longer timed out.`,
          color: "sky",
        }),
      ],
    });
  },
};
