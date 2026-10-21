const db = require("../db");

function saveEmbed({ guildId, name, data, userId }) {
  const fieldsJson = JSON.stringify(data.fields || []);

  const existing = db.db
    .prepare("SELECT id FROM saved_embeds WHERE guild_id = ? AND name = ?")
    .get(String(guildId), String(name).toLowerCase());

  if (existing) {
    db.db.prepare(`
      UPDATE saved_embeds
      SET title = ?, description = ?, color = ?, footer = ?, thumbnail = ?, image = ?, author_name = ?, author_icon = ?, fields_json = ?, created_by = ?
      WHERE id = ?
    `).run(
      data.title || "",
      data.description || "",
      data.color || "taro",
      data.footer || "",
      data.thumbnail || "",
      data.image || "",
      data.authorName || "",
      data.authorIcon || "",
      fieldsJson,
      String(userId),
      existing.id
    );

    return { saved: true, name };
  }

  db.db.prepare(`
    INSERT INTO saved_embeds (
      guild_id, name, title, description, color, footer, thumbnail, image, author_name, author_icon, fields_json, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    String(guildId),
    String(name).toLowerCase(),
    data.title || "",
    data.description || "",
    data.color || "taro",
    data.footer || "",
    data.thumbnail || "",
    data.image || "",
    data.authorName || "",
    data.authorIcon || "",
    fieldsJson,
    String(userId),
    Date.now()
  );

  return { saved: true, name };
}

function listEmbeds(guildId) {
  return db.db
    .prepare("SELECT name, title FROM saved_embeds WHERE guild_id = ? ORDER BY name ASC")
    .all(String(guildId));
}

function getEmbed(guildId, name) {
  const row = db.db
    .prepare("SELECT * FROM saved_embeds WHERE guild_id = ? AND name = ?")
    .get(String(guildId), String(name).toLowerCase());

  if (!row) return null;

  return {
    title: row.title,
    description: row.description,
    color: row.color,
    footer: row.footer,
    thumbnail: row.thumbnail,
    image: row.image,
    authorName: row.author_name,
    authorIcon: row.author_icon,
    fields: JSON.parse(row.fields_json || "[]"),
  };
}

function deleteEmbed(guildId, name) {
  const result = db.db
    .prepare("DELETE FROM saved_embeds WHERE guild_id = ? AND name = ?")
    .run(String(guildId), String(name).toLowerCase());

  return result.changes > 0;
}

module.exports = {
  saveEmbed,
  listEmbeds,
  getEmbed,
  deleteEmbed,
};
