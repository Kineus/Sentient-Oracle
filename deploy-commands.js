const { REST, Routes } = require('discord.js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const commands = []

// Load all command files
const commandsPath = path.join(__dirname, 'src/commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON())
    console.log(`✅ Loaded command: ${command.data.name}`)
  } else {
    console.log(
      `  The command at ${filePath} is missing a required "data" or "execute" property.`
    )
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

;(async () => {
  try {
    console.log(
      ` Started refreshing ${commands.length} application (/) commands.`
    )

    let data

    if (process.env.GUILD_ID) {
      data = await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      )
      console.log(`✅ Successfully reloaded ${data.length} guild commands.`)
    } else {
      data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      })
      console.log(`✅ Successfully reloaded ${data.length} global commands.`)
    }

    console.log(' Commands deployed successfully!')

    console.log('\n📋 Deployed Commands:')
    commands.forEach((cmd) => {
      console.log(`  • /${cmd.name} - ${cmd.description}`)
    })
  } catch (error) {
    console.error('Error deploying commands:', error)
  }
})()
