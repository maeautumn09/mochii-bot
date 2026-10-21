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

module.exports = {
  db,
  ensureUser,
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
};
