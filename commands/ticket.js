const Database = require("better-sqlite3");

const db = new Database("./mochii.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT,
    guild_id TEXT,
    balance INTEGER DEFAULT 100,
    bank INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_daily INTEGER DEFAULT 0,
    last_work INTEGER DEFAULT 0,
    inventory TEXT DEFAULT '{}',
    PRIMARY KEY (user_id, guild_id)
  );

  CREATE TABLE IF NOT EXISTS shop_items (
    name TEXT PRIMARY KEY,
    price INTEGER NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saved_embeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    description TEXT,
    color TEXT DEFAULT 'taro',
    footer TEXT,
    thumbnail TEXT,
    image TEXT,
    author_name TEXT,
    author_icon TEXT,
    fields_json TEXT DEFAULT '[]',
    created_by TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_embeds_unique
  ON saved_embeds(guild_id, name);

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    welcome_enabled INTEGER DEFAULT 0,
    welcome_channel_id TEXT,
    welcome_message TEXT DEFAULT 'Welcome {user} to {guild}! We hope you enjoy your stay!',
    welcome_role_id TEXT,
    mod_log_channel_id TEXT,
    ticket_category_id TEXT,
    ticket_enabled INTEGER DEFAULT 1,
    ticket_prefix TEXT DEFAULT 'ticket'
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    closed INTEGER DEFAULT 0,
    closed_by TEXT,
    closed_at INTEGER,
    transcript_path TEXT
  );

  CREATE TABLE IF NOT EXISTS mod_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT,
    action TEXT NOT NULL,
    reason TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS autoresponders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    trigger TEXT NOT NULL,
    response TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    created_by TEXT,
    created_at INTEGER NOT NULL
  );
`);

const defaultItems = [
  ["coffee", 75, "A quick energy boost"],
  ["lucky_charm", 150, "A charm that brings a little luck"],
  ["starter_pet", 300, "A tiny furry friend for your adventures"],
  ["mochi_box", 225, "A box of snacks and cozy vibes"],
  ["star_badge", 500, "A shiny badge that shows your style"],
];

for (const [name, price, description] of defaultItems) {
  db.prepare(
    "INSERT OR IGNORE INTO shop_items (name, price, description) VALUES (?, ?, ?)"
  ).run(name, price, description);
}

function parseInventory(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function serializeInventory(inv) {
  return JSON.stringify(inv || {});
}

function ensureUser(guildId, userId) {
  const existing = db
    .prepare("SELECT * FROM users WHERE guild_id = ? AND user_id = ?")
    .get(String(guildId), String(userId));

  if (existing) return existing;

  db.prepare(`
    INSERT INTO users (
      user_id, guild_id, balance, bank, xp, level, last_daily, last_work, inventory
    ) VALUES (?, ?, 100, 0, 0, 1, 0, 0, '{}')
  `).run(String(userId), String(guildId));

  return db
    .prepare("SELECT * FROM users WHERE guild_id = ? AND user_id = ?")
    .get(String(guildId), String(userId));
}

function ensureGuildSettings(guildId) {
  const existing = db
    .prepare("SELECT * FROM guild_settings WHERE guild_id = ?")
    .get(String(guildId));

  if (existing) return existing;

  db.prepare(`
    INSERT INTO guild_settings (
      guild_id, welcome_enabled, welcome_channel_id, welcome_message, welcome_role_id,
      mod_log_channel_id, ticket_category_id, ticket_enabled, ticket_prefix
    ) VALUES (?, 0, NULL, 'Welcome {user} to {guild}! We hope you enjoy your stay!', NULL, NULL, NULL, 1, 'ticket')
  `).run(String(guildId));

  return db
    .prepare("SELECT * FROM guild_settings WHERE guild_id = ?")
    .get(String(guildId));
}

function getGuildSettings(guildId) {
  return ensureGuildSettings(guildId);
}

function saveGuildSettings(guildId, updates) {
  const settings = getGuildSettings(guildId);
  const values = {
    welcome_enabled: updates.welcome_enabled ?? settings.welcome_enabled,
    welcome_channel_id: updates.welcome_channel_id ?? settings.welcome_channel_id,
    welcome_message: updates.welcome_message ?? settings.welcome_message,
    welcome_role_id: updates.welcome_role_id ?? settings.welcome_role_id,
    mod_log_channel_id: updates.mod_log_channel_id ?? settings.mod_log_channel_id,
    ticket_category_id: updates.ticket_category_id ?? settings.ticket_category_id,
    ticket_enabled: updates.ticket_enabled ?? settings.ticket_enabled,
    ticket_prefix: updates.ticket_prefix ?? settings.ticket_prefix,
  };

  db.prepare(`
    UPDATE guild_settings
    SET welcome_enabled = ?, welcome_channel_id = ?, welcome_message = ?, welcome_role_id = ?,
        mod_log_channel_id = ?, ticket_category_id = ?, ticket_enabled = ?, ticket_prefix = ?
    WHERE guild_id = ?
  `).run(
    Number(values.welcome_enabled),
    values.welcome_channel_id,
    values.welcome_message,
    values.welcome_role_id,
    values.mod_log_channel_id,
    values.ticket_category_id,
    Number(values.ticket_enabled),
    values.ticket_prefix,
    String(guildId)
  );

  return getGuildSettings(guildId);
}

function getUser(guildId, userId) {
  return ensureUser(guildId, userId);
}

function setUserBalance(guildId, userId, amount) {
  db.prepare(
    "UPDATE users SET balance = ? WHERE guild_id = ? AND user_id = ?"
  ).run(Number(amount), String(guildId), String(userId));
}

function addBalance(guildId, userId, amount) {
  db.prepare(
    "UPDATE users SET balance = balance + ? WHERE guild_id = ? AND user_id = ?"
  ).run(Number(amount), String(guildId), String(userId));
}

function addBank(guildId, userId, amount) {
  db.prepare(
    "UPDATE users SET bank = bank + ? WHERE guild_id = ? AND user_id = ?"
  ).run(Number(amount), String(guildId), String(userId));
}

function removeBalance(guildId, userId, amount) {
  db.prepare(
    "UPDATE users SET balance = balance - ? WHERE guild_id = ? AND user_id = ?"
  ).run(Number(amount), String(guildId), String(userId));
}

function getShopItems() {
  return db.prepare("SELECT * FROM shop_items ORDER BY price ASC").all();
}

function getItemByName(name) {
  return db
    .prepare("SELECT * FROM shop_items WHERE LOWER(name) = LOWER(?)")
    .get(String(name));
}

function addItemToInventory(guildId, userId, itemName, quantity = 1) {
  const user = getUser(guildId, userId);
  const inventory = parseInventory(user.inventory);
  inventory[itemName] = (inventory[itemName] || 0) + quantity;

  db.prepare(
    "UPDATE users SET inventory = ? WHERE guild_id = ? AND user_id = ?"
  ).run(serializeInventory(inventory), String(guildId), String(userId));
}

function getLeaderboard(guildId, limit = 10) {
  return db
    .prepare(
      "SELECT user_id, balance FROM users WHERE guild_id = ? ORDER BY balance DESC LIMIT ?"
    )
    .all(String(guildId), Number(limit));
}

function formatCooldown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function addModLog(guildId, userId, moderatorId, action, reason) {
  db.prepare(`
    INSERT INTO mod_logs (guild_id, user_id, moderator_id, action, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(String(guildId), String(userId), moderatorId ? String(moderatorId) : null, action, reason || "No reason provided", Date.now());
}

function getModLogs(guildId, userId) {
  return db.prepare(
    "SELECT * FROM mod_logs WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 10"
  ).all(String(guildId), String(userId));
}

function createTicket(guildId, creatorId, channelId) {
  db.prepare(`
    INSERT INTO tickets (guild_id, channel_id, creator_id, created_at, closed, transcript_path)
    VALUES (?, ?, ?, ?, 0, NULL)
  `).run(String(guildId), String(channelId), String(creatorId), Date.now());
}

function getOpenTickets(guildId) {
  return db.prepare(
    "SELECT * FROM tickets WHERE guild_id = ? AND closed = 0 ORDER BY created_at DESC"
  ).all(String(guildId));
}

function closeTicket(guildId, channelId, closedBy, transcriptPath = null) {
  db.prepare(`
    UPDATE tickets
    SET closed = 1, closed_by = ?, closed_at = ?, transcript_path = ?
    WHERE guild_id = ? AND channel_id = ? AND closed = 0
  `).run(String(closedBy), Date.now(), transcriptPath, String(guildId), String(channelId));
}

function findOpenTicketByChannel(guildId, channelId) {
  return db.prepare(
    "SELECT * FROM tickets WHERE guild_id = ? AND channel_id = ? AND closed = 0"
  ).get(String(guildId), String(channelId));
}

function addResponder(guildId, trigger, response, createdBy) {
  db.prepare(`
    INSERT INTO autoresponders (guild_id, trigger, response, enabled, created_by, created_at)
    VALUES (?, ?, ?, 1, ?, ?)
  `).run(String(guildId), String(trigger).toLowerCase(), String(response), String(createdBy), Date.now());
}

function deleteResponder(guildId, trigger) {
  const result = db.prepare(
    "DELETE FROM autoresponders WHERE guild_id = ? AND LOWER(trigger) = LOWER(?)"
  ).run(String(guildId), String(trigger));

  return result.changes > 0;
}

function listResponders(guildId) {
  return db.prepare(
    "SELECT * FROM autoresponders WHERE guild_id = ? ORDER BY created_at DESC"
  ).all(String(guildId));
}

function findAutoResponses(guildId, messageText) {
  const text = String(messageText).toLowerCase();
  return db.prepare(
    "SELECT * FROM autoresponders WHERE guild_id = ? AND enabled = 1"
  ).all(String(guildId)).filter((entry) => text.includes(entry.trigger.toLowerCase()));
}

module.exports = {
  db,
  ensureUser,
  ensureGuildSettings,
  getGuildSettings,
  saveGuildSettings,
  getUser,
  addBalance,
  addBank,
  removeBalance,
  setUserBalance,
  parseInventory,
  serializeInventory,
  addItemToInventory,
  getShopItems,
  getItemByName,
  getLeaderboard,
  formatCooldown,
  addModLog,
  getModLogs,
  createTicket,
  getOpenTickets,
  closeTicket,
  findOpenTicketByChannel,
  addResponder,
  deleteResponder,
  listResponders,
  findAutoResponses,
};
