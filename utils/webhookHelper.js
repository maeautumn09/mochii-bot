async function sendWebhookMessage(channel, { username, avatarURL, content = "", embeds = [] }) {
  const webhooks = await channel.fetchWebhooks();
  let webhook = webhooks.find((w) => w.name === "Mochii Webhook");

  if (!webhook) {
    webhook = await channel.createWebhook({
      name: "Mochii Webhook",
      avatar: avatarURL || undefined,
    });
  }

  await webhook.send({
    content,
    username,
    avatarURL,
    embeds,
  });
}

module.exports = { sendWebhookMessage };
