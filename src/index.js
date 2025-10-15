require('dotenv').config()

const {
  Client,
  Collection,
  GatewayIntentBits,
  ActivityType,
} = require('discord.js')
const fs = require('fs')
const path = require('path')
const AlertMonitor = require('./utils/alertMonitor')
const DailyReportScheduler = require('./utils/dailyReportScheduler')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.commands = new Collection()

const alertMonitor = new AlertMonitor(client)
const dailyReportScheduler = new DailyReportScheduler(client)

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
    console.log(`✅ Loaded command: ${command.data.name}`)
  } else {
    console.log(
      `⚠️  The command at ${filePath} is missing a required "data" or "execute" property.`
    )
  }
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
  console.log(`✅ Loaded event: ${event.name}`)
}

client.once('ready', () => {
  console.log(`🚀 Sentient Crypto Oracle Bot is online!`)
  console.log(`📊 Logged in as ${client.user.tag}`)
  console.log(`🔗 Serving ${client.guilds.cache.size} servers`)

  client.user.setActivity('crypto markets', { type: ActivityType.Watching })

  alertMonitor.start()
  dailyReportScheduler.start()

  console.log('✅ Background services started')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (!command) {
    console.error(` No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(`❌ Error executing ${interaction.commandName}:`, error)

    const errorMessage = {
      content: '❌ There was an error while executing this command!',
      ephemeral: true,
    }

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage)
    } else {
      await interaction.reply(errorMessage)
    }
  }
})

client.on('error', (error) => {
  console.error('Discord client error:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error)
})

process.on('SIGINT', () => {
  console.log('Shutting down Sentient Crypto Oracle Bot...')
  alertMonitor.stop()
  dailyReportScheduler.stop()
  client.destroy()
  process.exit(0)
})

client.login(process.env.DISCORD_TOKEN)
