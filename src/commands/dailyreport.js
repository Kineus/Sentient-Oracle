const { SlashCommandBuilder } = require('discord.js')
const apiClient = require('../utils/apiClient')
const EmbedUtils = require('../utils/embeds')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dailyreport')
    .setDescription('Get AI-powered daily cryptocurrency market report'),

  async execute(interaction) {
    await interaction.deferReply()

    try {
      const topCoins = await apiClient.getTopGainers()

      if (!topCoins || topCoins.length === 0) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              '❌ Unable to fetch market data. Please try again later.'
            ),
          ],
        })
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

      await interaction.editReply({ embeds: [reportEmbed] })
    } catch (error) {
      console.error('Error in dailyreport command:', error)
      await interaction.editReply({
        embeds: [
          EmbedUtils.createErrorEmbed(
            '❌ An error occurred while generating the daily report. Please try again later.'
          ),
        ],
      })
    }
  },
}
