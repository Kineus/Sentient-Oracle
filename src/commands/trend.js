const { SlashCommandBuilder } = require('discord.js')
const apiClient = require('../utils/apiClient')
const EmbedUtils = require('../utils/embeds')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trend')
    .setDescription('Get trending cryptocurrencies and top gainers')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type of trend to show')
        .setRequired(false)
        .addChoices(
          { name: '🔥 Trending', value: 'trending' },
          { name: '📈 Top Gainers', value: 'gainers' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply()

    try {
      const type = interaction.options.getString('type') || 'trending'

      let trendingData
      let embedTitle

      if (type === 'gainers') {
        trendingData = await apiClient.getTopGainers()
        embedTitle = 'Top Gainers'
      } else {
        const trendingCoins = await apiClient.getTrendingCoins()

        if (!trendingCoins || trendingCoins.length === 0) {
          return await interaction.editReply({
            embeds: [
              EmbedUtils.createErrorEmbed(
                '❌ Unable to fetch trending coins. Please try again later.'
              ),
            ],
          })
        }

        const coinIds = trendingCoins.map((coin) => coin.id).join(',')
        const priceData = await apiClient.getCoinPrice(coinIds)

        trendingData = trendingCoins.map((coin) => {
          const coinPriceData =
            priceData && priceData[coin.id] ? priceData[coin.id] : {}
          return {
            ...coin,
            current_price: coinPriceData.usd || 0,
            price_change_percentage_24h: coinPriceData.usd_24h_change || 0,
          }
        })

        embedTitle = 'Trending'
      }

      if (!trendingData || trendingData.length === 0) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              '❌ Unable to fetch trending data. Please try again later.'
            ),
          ],
        })
      }

      const trendingEmbed = EmbedUtils.createTrendingEmbed(trendingData, type)

      await interaction.editReply({ embeds: [trendingEmbed] })
    } catch (error) {
      console.error('Error in trend command:', error)
      await interaction.editReply({
        embeds: [
          EmbedUtils.createErrorEmbed(
            '❌ An error occurred while fetching trending data. Please try again later.'
          ),
        ],
      })
    }
  },
}
