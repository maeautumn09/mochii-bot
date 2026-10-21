const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { addResponder, deleteResponder, listResponders } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoresponder")
    .setDescription("Manage automatic responses for your server.")
    .addSubcommand((sub) =>
      sub.setName("add").setDescription("Add a trigger and response")
        .addStringOption((option) => option.setName("trigger").setDescription("Phrase to respond to").setRequired(true))
        .addStringOption((option) => option.setName("response").setDescription("Reply text").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("remove").setDescription("Remove an autoresponder")
        .addStringOption((option) => option.setName("trigger").setDescription("Trigger phrase to remove").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List autosponders")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const trigger = interaction.options.getString("trigger");
      const response = interaction.options.getString("response");

      addResponder(interaction.guild.id, trigger, response, interaction.user.id);

      const embed = buildEmbed({
        title: "Autoresponder added",
        description: `Trigger: \`${trigger}\`\nResponse: \`${response}\``,
        color: "sky",
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === "remove") {
      const trigger = interaction.options.getString("trigger");
      const removed = deleteResponder(interaction.guild.id, trigger);

      return interaction.reply({
        content: removed ? `Removed autoresponder for \`${trigger}\`.` : `No autoresponder was found for \`${trigger}\`.`,
        ephemeral: true,
      });
    }

    if (subcommand === "list") {
      const entries = listResponders(interaction.guild.id);
      if (!entries.length) {
        return interaction.reply({ content: "No autoresponders are set up yet.", ephemeral: true });
      }

      const text = entries.map((entry) => `• \`${entry.trigger}\` → ${entry.response}`).join("\n");
      return interaction.reply(`Autoresponders:\n${text}`);
    }

    return interaction.reply({ content: "Unknown autoresponder action.", ephemeral: true });
  },
};
