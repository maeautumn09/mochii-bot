# Mochii Bot

A cozy Discord economy and fun bot built with Node.js, SQLite, and Discord.js.

## Features

- Mochi Stars economy system
- Daily and work rewards
- Balance, shop, shop buys, inventory, and leaderboard
- Welcome system
- Moderation tools
- Ticket system
- Auto-responders
- Saved embedded templates and multi-embed support
- Webhook helper
- Taro & Sky color palette

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add your Discord bot token:

```bash
cp .env.example .env
```

```env
DISCORD_TOKEN=your_discord_bot_token_here
BOT_PREFIX=!
```

3. Start the bot:

```bash
npm start
```

4. Start the dashboard (optional):

```bash
npm run dashboard
```

## Main commands

- `/daily`
- `/work`
- `/balance`
- `/shop`
- `/buy <item>`
- `/inventory`
- `/leaderboard`
- `/profile`
- `/coinflip`
- `/dice`
- `/embed-save`
- `/embed-list`
- `/embed-send`
- `/multi-embed`
- `/welcome`
- `/ticket create`
- `/ticket close`
- `/ticket list`
- `/warn`
- `/mute`
- `/unmute`
- `/kick`
- `/ban`
- `/autoresponder add`
- `/autoresponder list`
- `/autoresponder remove`

## Dashboard

The dashboard is a basic Express app for simple admin checks. It is optional and reads the same SQLite database.

## Taro & Sky palette

- Primary purple: `#C7CEEA`
- Secondary light blue: `#B5D8EB`
- Highlight soft blue: `#E0F7FA`
- Dark neutral: `#3B3852`

## Notes

This project is designed to be a strong starter bot and includes a clean basis for future expansion into more advanced moderation, admin tools, and automation.
