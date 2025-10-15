const { SlashCommandBuilder } = require('discord.js')
const apiClient = require('../utils/apiClient')
const EmbedUtils = require('../utils/embeds')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('analyze')
    .setDescription('Get AI-powered analysis and insights for a cryptocurrency')
    .addStringOption((option) =>
      option
        .setName('symbol')
        .setDescription(
          'The cryptocurrency symbol to analyze (e.g., btc, eth, sol)'
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply()

    try {
      const symbol = interaction.options
        .getString('symbol')
        .toLowerCase()
        .trim()

      if (!symbol || symbol.length < 2) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              ' Please provide a valid cryptocurrency symbol (at least 2 characters).'
            ),
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
      const coinId = coin.id

      const priceData = await apiClient.getCoinPrice(coinId)

      if (!priceData) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              `❌ Unable to fetch data for ${symbol}. Please try again later.`
            ),
          ],
        })
      }

      const context = {
        symbol: symbol.toUpperCase(),
        name: coin.name,
        price: priceData.usd,
        marketCap: priceData.usd_market_cap,
        change24h: priceData.usd_24h_change,
        volume: priceData.usd_24h_vol,
      }

      const prompt = `Analyze ${context.symbol} (${
        context.name
      }) with current price $${context.price}, market cap $${(
        context.marketCap / 1e9
      ).toFixed(2)}B, and 24h change ${
        context.change24h > 0 ? '+' : ''
      }${context.change24h?.toFixed(
        2
      )}%. Provide a brief technical analysis and market sentiment.`

      const analysis = await apiClient.getAIAnalysis(
        prompt,
        `Current market data for ${context.symbol}`
      )

      const analysisEmbed = EmbedUtils.createAnalysisEmbed(
        symbol,
        context.price,
        analysis
      )

      await interaction.editReply({ embeds: [analysisEmbed] })
    } catch (error) {
      console.error('Error in analyze command:', error)

      let errorMessage =
        '❌ An error occurred while analyzing the cryptocurrency.'

      if (error.message.includes('Dobby API key')) {
        errorMessage =
          '❌ AI analysis is currently unavailable. Please check the configuration.'
      } else if (error.message.includes('Failed to get AI analysis')) {
        errorMessage =
          '❌ Unable to generate AI analysis at this time. Please try again later.'
      }

      await interaction.editReply({
        embeds: [EmbedUtils.createErrorEmbed(errorMessage)],
      })
    }
  },
}
