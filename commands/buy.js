const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { getUser, getItemByName, addItemToInventory } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the Mochii shop.")
    .addStringOption((option) =>
      option.setName("item").setDescription("Item name to buy").setRequired(true)
    ),

  async execute(interaction) {
    const itemName = interaction.options.getString("item");
    const item = getItemByName(itemName);

    if (!item) {
      return interaction.reply({
        content: `That item does not exist. Try checking \`/shop\`.`,
        ephemeral: true,
      });
    }

    const user = getUser(interaction.guild.id, interaction.user.id);

    if (user.balance < item.price) {
      return interaction.reply({
        content: `You need ${item.price - user.balance} more Mochi Stars to buy ${item.name}.`,
        ephemeral: true,
      });
    }

    require("../db").db.prepare(
      "UPDATE users SET balance = balance - ? WHERE guild_id = ? AND user_id = ?"
    ).run(item.price, interaction.guild.id, interaction.user.id);

    addItemToInventory(interaction.guild.id, interaction.user.id, item.name, 1);

    const embed = buildEmbed({
      title: "Purchase complete",
      description: `${interaction.user} bought ${item.name} for ${item.price} Mochi Stars.`,
      color: "taro",
      footer: "Mochii shop",
      fields: [{ name: "Item", value: item.name, inline: true }],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
