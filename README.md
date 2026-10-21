# Mochii Bot

A cozy Discord economy and fun bot built with Node.js, SQLite, and Discord.js. It includes:

- Mochi Stars currency economy
- daily and work rewards
- balance, shop, buy, inventory, leaderboard
- fun commands like coinflip and dice
- saved embed system and webhook helper
- Taro & Sky themed embeds

## Features

- Economy system with wallet and bank support
- Daily and work claims with cooldowns
- Shop items and inventory management
- Balance and leaderboard commands
- Custom saved embeds for reuse
- Multi-embed messages
- Webhook helper for sending messages cleanly
- Soft Taro & Sky color palette

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example` and add your Discord bot token:

```bash
cp .env.example .env
```

Then fill in:

```env
DISCORD_TOKEN=your_discord_bot_token_here
BOT_PREFIX=!
```

3. Start the bot:

```bash
npm start
```

## Commands

- `/daily`
- `/work`
- `/balance`
- `/shop`
- `/buy <item>`
- `/inventory`
- `/leaderboard`
- `/coinflip`
- `/dice`
- `/profile`
- `/help`
- `/embed-save`
- `/embed-list`
- `/embed-send`
- `/multi-embed`

## Project structure

- `index.js` — bot startup and command registration
- `db.js` — SQLite database setup and helper functions
- `utils/embedBuilder.js` — reusable embed builder
- `utils/embedStore.js` — saved embed storage
- `utils/webhookHelper.js` — cleaner webhook sending
- `commands/` — slash command modules

## Color palette

- Primary purple: `#C7CEEA`
- Secondary light blue: `#B5D8EB`
- Highlight soft blue: `#E0F7FA`
- Dark neutral: `#3B3852`

## Invite the bot

Create a Discord bot in the Developer Portal, then generate an invite URL with the bot scope and permissions you need.

## License

MIT
