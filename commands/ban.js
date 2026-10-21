const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { addModLog, getGuildSettings } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server.")
    .addUserOption((option) => option.setName("user").setDescription("User to kick").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Reason").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";
    const member = interaction.guild.members.cache.get(target.id) || await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: "That user is not in this server.", ephemeral: true });
    }

    await member.kick(reason);
    addModLog(interaction.guild.id, target.id, interaction.user.id, "kick", reason);

    const settings = getGuildSettings(interaction.guild.id);
    if (settings.mod_log_channel_id) {
      const channel = interaction.guild.channels.cache.get(settings.mod_log_channel_id);
      if (channel) {
        const embed = buildEmbed({
          title: "User kicked",
          description: `${target.tag} was kicked by ${interaction.user.tag}.`,
          color: "indigo",
          fields: [{ name: "Reason", value: reason, inline: false }],
        });
        await channel.send({ embeds: [embed] });
      }
    }

    await interaction.reply({
      embeds: [
        buildEmbed({
          title: "User kicked",
          description: `${target.tag} has been kicked.`,
          color: "taro",
          fields: [{ name: "Reason", value: reason, inline: false }],
        }),
      ],
    });
  },
};
