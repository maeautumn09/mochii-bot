const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { saveGuildSettings, getGuildSettings } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Configure the join welcome message.")
    .addBooleanOption((option) =>
      option.setName("enabled").setDescription("Turn welcome messages on or off").setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Channel for join messages").setRequired(false)
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("Role to give new members").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("Welcome message template").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const enabled = interaction.options.getBoolean("enabled");
    const channel = interaction.options.getChannel("channel");
    const role = interaction.options.getRole("role");
    const message = interaction.options.getString("message");

    const settings = getGuildSettings(interaction.guild.id);

    const next = {
      welcome_enabled: enabled ?? settings.welcome_enabled,
      welcome_channel_id: channel ? channel.id : settings.welcome_channel_id,
      welcome_role_id: role ? role.id : settings.welcome_role_id,
      welcome_message: message ?? settings.welcome_message,
    };

    saveGuildSettings(interaction.guild.id, next);

    const embed = buildEmbed({
      title: "Welcome settings updated",
      description: "Your welcome settings have been saved.",
      color: "sky",
      fields: [
        { name: "Enabled", value: next.welcome_enabled ? "Yes" : "No", inline: true },
        { name: "Channel", value: channel ? `<#${channel.id}>` : settings.welcome_channel_id ? `<#${settings.welcome_channel_id}>` : "Not set", inline: true },
        { name: "Role", value: role ? `<@&${role.id}>` : settings.welcome_role_id ? `<@&${settings.welcome_role_id}>` : "Not set", inline: true },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
