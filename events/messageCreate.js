const { Events } = require("discord.js");
const { getGuildSettings } = require("../db");
const { buildEmbed } = require("../utils/embedBuilder");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const settings = getGuildSettings(member.guild.id);
    if (!settings.welcome_enabled || !settings.welcome_channel_id) return;

    const channel = member.guild.channels.cache.get(settings.welcome_channel_id) || await member.guild.channels.fetch(settings.welcome_channel_id).catch(() => null);
    if (!channel) return;

    const welcomeMessage = (settings.welcome_message || "Welcome {user} to {guild}!")
      .replace(/\{user\}/gi, `<@${member.id}>`)
      .replace(/\{guild\}/gi, member.guild.name)
      .replace(/\{name\}/gi, member.user.username);

    const embed = buildEmbed({
      title: "Welcome!",
      description: welcomeMessage,
      color: "sky",
      footer: "Mochii welcomes you",
    });

    await channel.send({ embeds: [embed] });

    if (settings.welcome_role_id) {
      const role = member.guild.roles.cache.get(settings.welcome_role_id) || await member.guild.roles.fetch(settings.welcome_role_id).catch(() => null);
      if (role) {
        await member.roles.add(role).catch(() => {});
      }
    }
  },
};
