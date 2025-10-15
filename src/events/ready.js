const { Events } = require('discord.js')

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`)

    client.user.setPresence({
      activities: [
        {
          name: 'crypto markets',
          type: 3,
        },
      ],
      status: 'online',
    })
  },
}
