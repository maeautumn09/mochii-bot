const { SlashCommandBuilder } = require("discord.js");
const { buildEmbed } = require("../utils/embedBuilder");
const { saveEmbed, listEmbeds, getEmbed, deleteEmbed } = require("../utils/embedStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed-save")
    .setDescription("Save a custom Mochii embed.")
    .addStringOption((option) => option.setName("name").setDescription("Embed name").setRequired(true))
    .addStringOption((option) => option.setName("title").setDescription("Title").setRequired(false))
    .addStringOption((option) => option.setName("description").setDescription("Description").setRequired(false))
    .addStringOption((option) => option.setName("color").setDescription("taro, sky, ice, indigo, purple, blue, white, dark").setRequired(false))
    .addStringOption((option) => option.setName("footer").setDescription("Footer text").setRequired(false))
    .addStringOption((option) => option.setName("thumbnail").setDescription("Thumbnail URL").setRequired(false))
    .addStringOption((option) => option.setName("image").setDescription("Image URL").setRequired(false)),

  async execute(interaction) {
    const name = interaction.options.getString("name");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const color = interaction.options.getString("color");
    const footer = interaction.options.getString("footer");
    const thumbnail = interaction.options.getString("thumbnail");
    const image = interaction.options.getString("image");

    saveEmbed({
      guildId: interaction.guild.id,
      name,
      userId: interaction.user.id,
      data: {
        title,
        description,
        color,
        footer,
        thumbnail,
        image,
        fields: [],
      },
    });

    await interaction.reply(`Saved embed: \`${name}\``);
  },
};
