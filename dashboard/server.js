const { Events } = require("discord.js");
const { findAutoResponses } = require("../db");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const matches = findAutoResponses(message.guild.id, message.content);
    if (!matches.length) return;

    const reply = matches[0];
    await message.reply(reply.response);
  },
};
