# Sentient Oracle Bot

A sophisticated Discord bot that provides AI-powered cryptocurrency insights using Fireworks AI (Dobby 8B) and real-time market data from CoinGecko and DexScreener APIs.

## Features

- 💰 Real-time Price Data: Get live cryptocurrency prices, market cap, and 24h changes
- 🧠 AI-Powered Analysis: Sentient insights using Fireworks AI (Dobby 8B model)
- 🔥 Trending Cryptocurrencies: Discover trending coins and top gainers
- 🚨 Price Alerts: Set custom price alerts with DM notifications
- 📊 Daily Reports: Automated AI-generated daily market summaries
- ⚡ Slash Commands: Modern Discord slash command interface

## Commands

| Command                       | Description                | Example               |
| ----------------------------- | -------------------------- | --------------------- |
| `/price <symbol>`             | Get real-time price data   | `/price btc`          |
| `/analyze <symbol>`           | AI-powered market analysis | `/analyze sol`        |
| `/trend [type]`               | Show trending/top gainers  | `/trend gainers`      |
| `/alert set <symbol> <price>` | Set price alert            | `/alert set eth 3000` |
| `/alert list`                 | List your alerts           | `/alert list`         |
| `/alert remove <symbol>`      | Remove an alert            | `/alert remove btc`   |
| `/ta`                         | Get RSI and MACD analysis  | `/ta btc`             |
| `/dailyreport`                | Get AI daily market report | `/dailyreport`        |

## 🛠️ Installation

### Prerequisites

- Node.js 16.9.0 or higher
- Discord Bot Token
- Fireworks AI API Key

### 1. Clone the Repository

```bash
git clone https://github.com/sentient-agi/sentient-crypto-oracle-bot.git
cd sentient-crypto-oracle-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

1. Copy the example environment file:

```bash
cp env.example .env
```

2. Fill in your environment variables in `.env`:

````env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_id_here
GUILD_ID=your_test_guild_id_here

# Fireworks AI Configuration
DOBBY_API_KEY=your_fireworks_ai_api_key_here
DOBBY_API_URL=https://api.fireworks.ai/inference/v1/chat/completions

# API Configuration (Optional - defaults provided)
COINGECKO_API_URL=https://api.coingecko.com/api/v3
DEXSCREENER_API_URL=https://api.dexscreener.com/latest

### 4. Deploy Slash Commands

For development (guild-specific commands):

```bash
npm run deploy-commands
````

For production (global commands), remove `GUILD_ID` from your `.env` file and run:

```bash
npm run deploy-commands
```

### 5. Run the Bot

Development mode with auto-restart:

```bash
npm run dev
```

Production mode:

```bash
npm start
```
