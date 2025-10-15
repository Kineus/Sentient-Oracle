const { SlashCommandBuilder } = require('discord.js')
const apiClient = require('../utils/apiClient')
const EmbedUtils = require('../utils/embeds')
const {
  getFallbackPrice,
  getFallbackSearchResults,
} = require('../utils/fallbackData')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('price')
    .setDescription('Get real-time price information for a cryptocurrency')
    .addStringOption((option) =>
      option
        .setName('symbol')
        .setDescription('The cryptocurrency symbol (e.g., btc, eth, sol)')
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
              '❌ Please provide a valid cryptocurrency symbol (at least 2 characters).'
            ),
          ],
        })
      }

      let searchResults = null
      let searchAttempts = 0
      const maxSearchAttempts = 3

      while (!searchResults && searchAttempts < maxSearchAttempts) {
        searchAttempts++
        console.log(
          `🔍 Searching for ${symbol} (attempt ${searchAttempts}/${maxSearchAttempts})`
        )

        try {
          searchResults = await apiClient.searchCoin(symbol)
          if (searchResults && searchResults.length > 0) {
            console.log(
              `✅ Found ${searchResults.length} results for ${symbol}`
            )
            break
          }
        } catch (error) {
          console.error(
            `❌ Search attempt ${searchAttempts} failed:`,
            error.message
          )
          if (searchAttempts < maxSearchAttempts) {
            console.log(`⏳ Waiting 1 second before retry...`)
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }
      }

      if (!searchResults || searchResults.length === 0) {
        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              `❌ No cryptocurrency found with symbol "${symbol}" after ${maxSearchAttempts} attempts. Please check the symbol and try again.`
            ),
          ],
        })
      }

      const coin = searchResults[0]
      const coinId = coin.id

      let priceData = null
      let priceAttempts = 0
      const maxPriceAttempts = 3

      while (!priceData && priceAttempts < maxPriceAttempts) {
        priceAttempts++
        console.log(
          `💰 Fetching price for ${coinId} (attempt ${priceAttempts}/${maxPriceAttempts})`
        )

        try {
          priceData = await apiClient.getCoinPrice(coinId)
          if (priceData && (priceData.usd || priceData.price)) {
            console.log(
              `✅ Price data retrieved for ${symbol}: $${
                priceData.usd || priceData.price
              }`
            )
            break
          }
        } catch (error) {
          console.error(
            `❌ Price fetch attempt ${priceAttempts} failed:`,
            error.message
          )
          console.error(`Error code: ${error.code || 'unknown'}`)

          const waitTime =
            error.code === 'UND_ERR_SOCKET' ||
            error.message.includes('other side closed')
              ? 3000
              : 1500

          if (priceAttempts < maxPriceAttempts) {
            console.log(`⏳ Waiting ${waitTime / 1000} seconds before retry...`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
          }
        }
      }

      if (!priceData) {
        console.log('🔄 Trying fallback data...')
        const fallbackPrice = getFallbackPrice(coinId)

        if (fallbackPrice) {
          console.log('✅ Using fallback data for', coinId)
          const fallbackEmbed = EmbedUtils.createPriceEmbed(
            {
              ...fallbackPrice,
              name: coin.name,
              image: coin.thumb,
            },
            symbol
          )

          fallbackEmbed.setFooter({
            text: ' Using cached data - API unavailable',
          })

          return await interaction.editReply({ embeds: [fallbackEmbed] })
        }

        return await interaction.editReply({
          embeds: [
            EmbedUtils.createErrorEmbed(
              `❌ Unable to fetch price data for ${symbol} after ${maxPriceAttempts} attempts.\n\n` +
                `Possible causes:**\n` +
                `• Network connectivity issues\n` +
                `• API rate limiting\n` +
                `• Temporary service outage\n\n` +
                `Please try again in a few moments.`
            ),
          ],
        })
      }

      console.log('📊 Price data for embed:', {
        symbol: symbol,
        coinName: coin.name,
        priceData: priceData,
        coinThumb: coin.thumb,
      })

      const embedData = {
        ...priceData,
        name: coin.name,
        image: coin.thumb,
      }

      console.log(' Embed data:', embedData)

      const priceEmbed = EmbedUtils.createPriceEmbed(embedData, symbol)

      console.log('✅ Embed created successfully, sending to Discord...')

      await interaction.editReply({ embeds: [priceEmbed] })
    } catch (error) {
      console.error('Error in price command:', error)
      await interaction.editReply({
        embeds: [
          EmbedUtils.createErrorEmbed(
            '❌ An error occurred while fetching price data. Please try again later.'
          ),
        ],
      })
    }
  },
}
