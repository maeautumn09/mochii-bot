const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getGuildSettings, createTicket, findOpenTicketByChannel, getOpenTickets, closeTicket } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Manage support tickets.")
    .addSubcommand((sub) =>
      sub.setName("create").setDescription("Create a support ticket")
    )
    .addSubcommand((sub) =>
      sub.setName("close").setDescription("Close an open ticket")
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List open tickets")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const settings = getGuildSettings(interaction.guild.id);

      if (!settings.ticket_enabled) {
        return interaction.reply({ content: "Ticket creation is disabled on this server.", ephemeral: true });
      }

      const channelName = `${settings.ticket_prefix || "ticket"}-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

      let category = null;
      if (settings.ticket_category_id) {
        category = interaction.guild.channels.cache.get(settings.ticket_category_id) || await interaction.guild.channels.fetch(settings.ticket_category_id).catch(() => null);
      }

      if (!category) {
        category = await interaction.guild.channels.create({
          name: "tickets",
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            { id: interaction.guild.roles.everyone, deny: ["ViewChannel"] },
            { id: interaction.user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
          ],
        });

        settings.ticket_category_id = category.id;
      }

      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: ["ViewChannel"] },
          { id: interaction.user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
        ],
      });

      createTicket(interaction.guild.id, interaction.user.id, channel.id);

      const embed = buildEmbed({
        title: "Ticket created",
        description: `Your ticket is ready: <#${channel.id}>`,
        color: "sky",
        footer: "Mochii tickets",
      });

      await channel.send({
        embeds: [embed],
        content: `${interaction.user} ticket opened. Please describe your issue.`
      });

      return interaction.reply({ content: `Your ticket has been created: <#${channel.id}>`, ephemeral: true });
    }

    if (subcommand === "close") {
      const ticket = findOpenTicketByChannel(interaction.guild.id, interaction.channel.id);

      if (!ticket) {
        return interaction.reply({ content: "This channel is not an active ticket.", ephemeral: true });
      }

      closeTicket(interaction.guild.id, interaction.channel.id, interaction.user.id);

      const embed = buildEmbed({
        title: "Ticket closed",
        description: `This ticket was closed by ${interaction.user.tag}.`,
        color: "indigo",
      });

      await interaction.reply({ embeds: [embed] });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
      return;
    }

    if (subcommand === "list") {
      const tickets = getOpenTickets(interaction.guild.id);

      if (!tickets.length) {
        return interaction.reply({ content: "No open tickets right now.", ephemeral: true });
      }

      const lines = tickets.map((ticket) => `• <@${ticket.creator_id}> — <#${ticket.channel_id}>`).join("\n");
      return interaction.reply({ content: `Open tickets:\n${lines}` });
    }

    return interaction.reply({ content: "Unknown ticket action.", ephemeral: true });
  },
};
