const { SlashCommandBuilder } = require('discord.js')
const apiClient = require('../utils/apiClient')
const EmbedUtils = require('../utils/embeds')
const fs = require('fs')
const path = require('path')

function loadAlerts() {
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

function saveAlerts(alerts) {
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alert')
    .setDescription('Set up price alerts for cryptocurrencies')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Set a new price alert')
        .addStringOption((option) =>
          option
            .setName('symbol')
            .setDescription('Cryptocurrency symbol (e.g., btc, eth)')
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName('price')
            .setDescription('Target price to alert at')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('condition')
            .setDescription('Alert condition')
            .setRequired(false)
            .addChoices(
              { name: 'Above', value: 'above' },
              { name: 'Below', value: 'below' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List your active alerts')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove an alert')
        .addStringOption((option) =>
          option
            .setName('symbol')
            .setDescription('Cryptocurrency symbol to remove alert for')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()

    try {
      if (subcommand === 'set') {
        await this.handleSetAlert(interaction)
      } else if (subcommand === 'list') {
        await this.handleListAlerts(interaction)
      } else if (subcommand === 'remove') {
        await this.handleRemoveAlert(interaction)
      }
    } catch (error) {
      console.error('Error in alert command:', error)

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              ' An error occurred while processing the alert. Please try again later.'
            ),
          ],
        })
      } else {
        await interaction.reply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              ' An error occurred while processing the alert. Please try again later.'
            ),
          ],
          ephemeral: true,
        })
      }
    }
  },

  async handleSetAlert(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const symbol = interaction.options.getString('symbol').toLowerCase()
      const targetPrice = interaction.options.getNumber('price')
      const condition = interaction.options.getString('condition') || 'above'
      const userId = interaction.user.id

      if (targetPrice <= 0) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed('❌ Price must be greater than 0.'),
          ],
        })
      }

      const searchResults = await apiClient.searchCoin(symbol)

      if (!searchResults || searchResults.length === 0) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              `❌ No cryptocurrency found with symbol "${symbol}". Please check the symbol and try again.`
            ),
          ],
        })
      }

      const coin = searchResults[0]

      const alerts = loadAlerts()

      const filteredAlerts = alerts.filter(
        (alert) => !(alert.userId === userId && alert.symbol === symbol)
      )

      const newAlert = {
        id: Date.now().toString(),
        userId: userId,
        symbol: symbol,
        coinName: coin.name,
        targetPrice: targetPrice,
        condition: condition,
        createdAt: new Date().toISOString(),
      }

      filteredAlerts.push(newAlert)

      if (saveAlerts(filteredAlerts)) {
        await interaction.editReply({
          embeds: [
            EmbedUtils.createSuccessEmbed(
              'Alert Set Successfully!',
              `✅ You will be notified when **${
                coin.name
              } (${symbol.toUpperCase()})** goes **${condition}** $${targetPrice.toLocaleString()}.`
            ),
          ],
        })
      } else {
        await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              ' Failed to save alert. Please try again.'
            ),
          ],
        })
      }
    } catch (error) {
      console.error('Error in handleSetAlert:', error)
      await interaction.editReply({
        embeds: [
          EmbedUtils.createErrorEmbed(
            ' An error occurred while setting the alert. Please try again later.'
          ),
        ],
      })
    }
  },

  async handleListAlerts(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const userId = interaction.user.id
      const alerts = loadAlerts()
      const userAlerts = alerts.filter((alert) => alert.userId === userId)

      if (userAlerts.length === 0) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              ' You have no active alerts. Use `/alert set` to create one.'
            ),
          ],
        })
      }

      const embed = EmbedUtils.createSuccessEmbed(
        'Your Active Alerts',
        `You have ${userAlerts.length} active alert(s):`
      )

      userAlerts.forEach((alert, index) => {
        embed.addFields({
          name: `${index + 1}. ${
            alert.coinName
          } (${alert.symbol.toUpperCase()})`,
          value: `Alert when price goes **${
            alert.condition
          }** $${alert.targetPrice.toLocaleString()}`,
          inline: false,
        })
      })

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error('Error in handleListAlerts:', error)
      await interaction.editReply({
        embeds: [
          EmbedUtils.createErrorEmbed(
            '❌ An error occurred while listing alerts. Please try again later.'
          ),
        ],
      })
    }
  },

  async handleRemoveAlert(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const symbol = interaction.options.getString('symbol').toLowerCase()
      const userId = interaction.user.id

      const alerts = loadAlerts()
      const initialLength = alerts.length

      const filteredAlerts = alerts.filter(
        (alert) => !(alert.userId === userId && alert.symbol === symbol)
      )

      if (filteredAlerts.length === initialLength) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              ` No alert found for ${symbol.toUpperCase()}.`
            ),
          ],
        })
      }

      if (saveAlerts(filteredAlerts)) {
        await interaction.editReply({
          embeds: [
            EmbedUtils.createSuccessEmbed(
              'Alert Removed',
              `✅ Alert for **${symbol.toUpperCase()}** has been removed.`
            ),
          ],
        })
      } else {
        await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              '❌ Failed to remove alert. Please try again.'
            ),
          ],
        })
      }
    } catch (error) {
      console.error('Error in handleRemoveAlert:', error)
      await interaction.editReply({
        embeds: [
          EmbedUtils.createErrorEmbed(
            '❌ An error occurred while removing the alert. Please try again later.'
          ),
        ],
      })
    }
  },
}
