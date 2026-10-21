const fs = require("node:fs");
const path = require("node:path");

function ensureFolder() {
  const dir = path.join(__dirname, "..", "transcripts");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function buildTicketTranscript(channel) {
  const folder = ensureFolder();
  const messages = [];
  let before = null;

  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, before: before || undefined });
    if (batch.size === 0) break;

    messages.push(...batch.values());

    const last = [...batch.values()].pop();
    if (!last) break;

    before = last.id;

    if (batch.size < 100) break;
  }

  const ordered = [...messages].sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const transcript = [
    "# Ticket Transcript",
    `Guild: ${channel.guild.name}`,
    `Channel: #${channel.name}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    ...ordered.map((message) => {
      const content = message.content?.trim() || "[no text]";
      const attachments = message.attachments?.map((a) => a.url).join(" ") || "";
      const suffix = attachments ? ` ${attachments}` : "";
      return `[${new Date(message.createdTimestamp).toISOString()}] ${message.author.tag}: ${content}${suffix}`;
    }),
  ].join("\n");

  const fileName = `ticket-${channel.id}-${Date.now()}.txt`;
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, transcript, "utf8");

  return { filePath, fileName, transcript };
}

module.exports = { buildTicketTranscript };
