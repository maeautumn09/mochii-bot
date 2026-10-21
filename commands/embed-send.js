const { SlashCommandBuilder } = require("discord.js");
const { getEmbed } = require("../utils/embedStore");
const { buildEmbed } = require("../utils/embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed-send")
    .setDescription("Send one of your saved embeds.")
    .addStringOption((option) => option.setName("name").setDescription("Saved embed name").setRequired(true)),

  async execute(interaction) {
    const name = interaction.options.getString("name");
    const data = getEmbed(interaction.guild.id, name);

    if (!data) {
      return interaction.reply(`No saved embed named \`${name}\` was found.`);
    }

    const embed = buildEmbed(data);
    await interaction.reply({ embeds: [embed] });
  },
};
