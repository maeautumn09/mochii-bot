const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getShopItems } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View the Mochii shop."),

  async execute(interaction) {
    const items = getShopItems();

    const fields = items.map((item) => ({
      name: item.name,
      value: `${item.price} Mochi Stars — ${item.description}`,
      inline: false,
    }));

    const embed = buildEmbed({
      title: "Mochii shop",
      description: "Spend your Mochi Stars on cozy goodies.",
      color: "sky",
      footer: "Mochii store",
      fields,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
