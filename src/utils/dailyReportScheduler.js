const cron = require('node-cron')
const apiClient = require('./apiClient')
const EmbedUtils = require('./embeds')

class DailyReportScheduler {
  constructor(client) {
    this.client = client
    this.isRunning = false
    this.cronJob = null
    this.scheduleTime = '09:00'
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️  Daily report scheduler is already running')
      return
    }

    console.log(
      `📅 Starting daily report scheduler (${this.scheduleTime} UTC)...`
    )

    this.cronJob = cron.schedule(
      '0 9 * * *',
      async () => {
        await this.sendDailyReport()
      },
      {
        scheduled: false,
        timezone: 'UTC',
      }
    )

    this.cronJob.start()
    this.isRunning = true
    console.log('✅ Daily report scheduler started')
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Daily report scheduler is not running')
      return
    }

    console.log('🛑 Stopping daily report scheduler...')

    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
    }

    this.isRunning = false
    console.log('✅ Daily report scheduler stopped')
  }

  async sendDailyReport() {
    try {
      console.log('📊 Generating daily crypto report...')

      const topCoins = await apiClient.getTopGainers()

      if (!topCoins || topCoins.length === 0) {
        console.log('❌ Failed to fetch market data for daily report')
        return
      }

      let marketSummary
      try {
        marketSummary = await apiClient.getMarketSummary(topCoins.slice(0, 5))
      } catch (error) {
        console.error('Error getting AI market summary:', error)
        marketSummary = 'AI market analysis is currently unavailable.'
      }

      const reportEmbed = EmbedUtils.createDailyReportEmbed(
        topCoins,
        marketSummary
      )

      const guilds = this.client.guilds.cache

      for (const [guildId, guild] of guilds) {
        try {
          const channel = this.findBestChannel(guild)

          if (channel) {
            await channel.send({ embeds: [reportEmbed] })
            console.log(
              `📤 Sent daily report to ${guild.name} (#${channel.name})`
            )
          } else {
            console.log(`⚠️  No suitable channel found in ${guild.name}`)
          }
        } catch (error) {
          console.error(
            `Error sending daily report to guild ${guild.name}:`,
            error.message
          )
        }
      }

      console.log('✅ Daily report sent successfully')
    } catch (error) {
      console.error('Error in daily report scheduler:', error)
    }
  }

  findBestChannel(guild) {
    const channelPriorities = [
      'general',
      'crypto',
      'trading',
      'bot-commands',
      'announcements',
      'news',
    ]

    for (const priority of channelPriorities) {
      const channel = guild.channels.cache.find(
        (ch) =>
          ch.type === 0 &&
          ch.permissionsFor(guild.members.me).has('SendMessages') &&
          ch.name.toLowerCase().includes(priority)
      )

      if (channel) {
        return channel
      }
    }

    const defaultChannel = guild.channels.cache.find(
      (ch) =>
        ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages')
    )

    return defaultChannel
  }

  async sendTestReport(channel) {
    try {
      console.log('🧪 Sending test daily report...')

      const topCoins = await apiClient.getTopGainers()

      if (!topCoins || topCoins.length === 0) {
        await channel.send({
          embeds: [
            EmbedUtils.createErrorEmbed(
              '❌ Failed to fetch market data for test report'
            ),
          ],
        })
        return
      }

      let marketSummary
      try {
        marketSummary = await apiClient.getMarketSummary(topCoins.slice(0, 5))
      } catch (error) {
        marketSummary = 'AI market analysis is currently unavailable.'
      }

      const reportEmbed = EmbedUtils.createDailyReportEmbed(
        topCoins,
        marketSummary
      )
      reportEmbed.setTitle('🧪 Test Daily Crypto Market Report')
      reportEmbed.setFooter({ text: 'Sentient Crypto Oracle • Test Report' })

      await channel.send({ embeds: [reportEmbed] })
      console.log('✅ Test daily report sent successfully')
    } catch (error) {
      console.error('Error sending test daily report:', error)
      await channel.send({
        embeds: [
          EmbedUtils.createErrorEmbed('❌ Failed to send test daily report'),
        ],
      })
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduleTime: this.scheduleTime,
      nextRun: this.cronJob ? this.cronJob.nextDate() : null,
    }
  }
}

module.exports = DailyReportScheduler
