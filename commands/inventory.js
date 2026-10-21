const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getUser, parseInventory } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View your Mochii inventory."),

  async execute(interaction) {
    const user = getUser(interaction.guild.id, interaction.user.id);
    const inventory = parseInventory(user.inventory);
    const entries = Object.entries(inventory);

    if (!entries.length) {
      return interaction.reply({
        embeds: [
          buildEmbed({
            title: "Inventory",
            description: "Your inventory is empty.",
            color: "indigo",
            footer: "Mochii inventory",
          }),
        ],
      });
    }

    const fields = entries.map(([name, quantity]) => ({
      name,
      value: `x${quantity}`,
      inline: true,
    }));

    const embed = buildEmbed({
      title: `${interaction.user.username}'s inventory`,
      description: "Your collected items and goodies.",
      color: "sky",
      footer: "Mochii inventory",
      fields,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
