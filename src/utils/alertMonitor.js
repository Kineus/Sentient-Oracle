const apiClient = require('./apiClient')
const EmbedUtils = require('./embeds')
const fs = require('fs')
const path = require('path')

class AlertMonitor {
  constructor(client) {
    this.client = client
    this.isRunning = false
    this.checkInterval = 60000
    this.intervalId = null
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️  Alert monitor is already running')
      return
    }

    console.log('🚨 Starting alert monitor...')
    this.isRunning = true
    this.intervalId = setInterval(() => {
      this.checkAlerts()
    }, this.checkInterval)
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Alert monitor is not running')
      return
    }

    console.log(' Stopping alert monitor...')
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  loadAlerts() {
    const alertsPath = path.join(__dirname, '../../data/alerts.json')
    try {
      if (fs.existsSync(alertsPath)) {
        return JSON.parse(fs.readFileSync(alertsPath, 'utf8'))
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
    return []
  }

  saveAlerts(alerts) {
    const alertsDir = path.join(__dirname, '../../data')
    const alertsPath = path.join(alertsDir, 'alerts.json')

    try {
      if (!fs.existsSync(alertsDir)) {
        fs.mkdirSync(alertsDir, { recursive: true })
      }

      fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2))
      return true
    } catch (error) {
      console.error('Error saving alerts:', error)
      return false
    }
  }

  async checkAlerts() {
    try {
      const alerts = this.loadAlerts()

      if (alerts.length === 0) {
        return
      }

      console.log(`🔍 Checking ${alerts.length} active alerts...`)

      const alertsBySymbol = {}
      alerts.forEach((alert) => {
        if (!alertsBySymbol[alert.symbol]) {
          alertsBySymbol[alert.symbol] = []
        }
        alertsBySymbol[alert.symbol].push(alert)
      })

      const triggeredAlerts = []
      const remainingAlerts = [...alerts]

      for (const [symbol, symbolAlerts] of Object.entries(alertsBySymbol)) {
        try {
          const searchResults = await apiClient.searchCoin(symbol)

          if (!searchResults || searchResults.length === 0) {
            console.log(`⚠️  Could not find coin data for ${symbol}`)
            continue
          }

          const coin = searchResults[0]
          const priceData = await apiClient.getCoinPrice(coin.id)

          if (!priceData || !priceData.usd) {
            console.log(`⚠️  Could not fetch price data for ${symbol}`)
            continue
          }

          const currentPrice = priceData.usd

          symbolAlerts.forEach((alert) => {
            const targetPrice = alert.targetPrice
            const condition = alert.condition
            let shouldTrigger = false

            if (condition === 'above' && currentPrice >= targetPrice) {
              shouldTrigger = true
            } else if (condition === 'below' && currentPrice <= targetPrice) {
              shouldTrigger = true
            }

            if (shouldTrigger) {
              triggeredAlerts.push({
                ...alert,
                currentPrice: currentPrice,
                coinName: coin.name,
              })

              const index = remainingAlerts.findIndex((a) => a.id === alert.id)
              if (index !== -1) {
                remainingAlerts.splice(index, 1)
              }
            }
          })
        } catch (error) {
          console.error(`Error checking alerts for ${symbol}:`, error.message)
        }
      }

      for (const alert of triggeredAlerts) {
        await this.sendAlertNotification(alert)
      }

      if (triggeredAlerts.length > 0) {
        this.saveAlerts(remainingAlerts)
        console.log(`🚨 Sent ${triggeredAlerts.length} alert notification(s)`)
      }
    } catch (error) {
      console.error('Error in alert monitoring:', error)
    }
  }

  async sendAlertNotification(alert) {
    try {
      const user = await this.client.users.fetch(alert.userId)

      if (!user) {
        console.log(
          `⚠️  Could not find user ${alert.userId} for alert notification`
        )
        return
      }

      const alertEmbed = EmbedUtils.createAlertEmbed(
        alert.symbol,
        alert.currentPrice,
        alert.targetPrice,
        alert.condition === 'above'
      )

      await user.send({ embeds: [alertEmbed] })
      console.log(
        `📧 Sent alert notification to ${user.username} for ${alert.symbol}`
      )
    } catch (error) {
      console.error(
        `Error sending alert notification to user ${alert.userId}:`,
        error.message
      )
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      alertCount: this.loadAlerts().length,
    }
  }
}

module.exports = AlertMonitor
