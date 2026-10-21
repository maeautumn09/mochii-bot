const { EmbedBuilder } = require("discord.js");

function normalizeColor(input = "taro") {
  const colors = {
    taro: "#C7CEEA",
    sky: "#B5D8EB",
    ice: "#E0F7FA",
    indigo: "#3B3852",
    purple: "#C7CEEA",
    blue: "#B5D8EB",
    white: "#E0F7FA",
    dark: "#3B3852",
  };

  if (!input) return "#C7CEEA";
  if (input.startsWith("#")) return input;
  return colors[input.toLowerCase()] || "#C7CEEA";
}

function buildEmbed({
  title = "",
  description = "",
  color = "taro",
  footer = "",
  thumbnail = "",
  image = "",
  authorName = "",
  authorIcon = "",
  fields = [],
} = {}) {
  const embed = new EmbedBuilder().setColor(normalizeColor(color)).setTimestamp();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image) embed.setImage(image);

  if (authorName) {
    embed.setAuthor({
      name: authorName,
      iconURL: authorIcon || undefined,
    });
  }

  if (footer) embed.setFooter({ text: footer, iconURL: authorIcon || undefined });

  if (Array.isArray(fields) && fields.length > 0) {
    embed.addFields(
      fields.map((field) => ({
        name: field.name || "Field",
        value: field.value || "",
        inline: !!field.inline,
      }))
    );
  }

  return embed;
}

module.exports = { buildEmbed };
