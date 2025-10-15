const { SlashCommandBuilder } = require('discord.js')
const axios = require('axios')
const { RSI, MACD } = require('technicalindicators')
const EmbedUtils = require('../utils/embeds')

async function fetchBinanceKlines(symbol) {
  const url = 'https://api.binance.com/api/v3/klines'
  const params = {
    symbol: `${symbol.toUpperCase()}USDT`,
    interval: '1h',
    limit: 100,
  }

  const response = await axios.get(url, { params, timeout: 20000 })
  return response.data
}

function computeIndicators(closePrices) {
  const rsiValues = RSI.calculate({ period: 14, values: closePrices })

  const macdValues = MACD.calculate({
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  })

  const latestRSI = rsiValues[rsiValues.length - 1]
  const latestMACD = macdValues[macdValues.length - 1]

  return { latestRSI, latestMACD }
}

function deriveSentiment(latestRSI, latestMACD) {
  let rsiText = 'Neutral zone'
  if (latestRSI > 70) rsiText = 'Overbought – potential pullback'
  else if (latestRSI < 30) rsiText = 'Oversold – potential rebound'

  let macdText = 'Neutral momentum'
  if (
    latestMACD &&
    typeof latestMACD.MACD === 'number' &&
    typeof latestMACD.signal === 'number'
  ) {
    if (latestMACD.MACD > latestMACD.signal) macdText = 'Bullish momentum'
    else if (latestMACD.MACD < latestMACD.signal) macdText = 'Bearish momentum'
  }

  let overall = 'Neutral'
  if (rsiText.includes('Overbought') && macdText.includes('Bearish'))
    overall = 'Bearish'
  else if (rsiText.includes('Oversold') && macdText.includes('Bullish'))
    overall = 'Bullish'
  else if (macdText.includes('Bullish')) overall = 'Bullish'
  else if (macdText.includes('Bearish')) overall = 'Bearish'

  return { rsiText, macdText, overall }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ta')
    .setDescription(
      'Performs technical analysis for a given crypto pair using live market data'
    )
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
          content:
            '❌ Please provide a valid cryptocurrency symbol (at least 2 characters).',
        })
      }

      const klines = await fetchBinanceKlines(symbol)
      if (!Array.isArray(klines) || klines.length < 35) {
        return await interaction.editReply({
          content:
            '❌ Not enough data returned from Binance to compute indicators. Try again later.',
        })
      }

      const closePrices = klines.map((k) => parseFloat(k[4]))
      const lastClose = closePrices[closePrices.length - 1]

      const { latestRSI, latestMACD } = computeIndicators(closePrices)

      if (typeof latestRSI !== 'number' || !latestMACD) {
        return await interaction.editReply({
          content: '❌ Failed to compute indicators. Please try again later.',
        })
      }

      const macdVal = latestMACD.MACD
      const signalVal = latestMACD.signal
      const histogramVal = latestMACD.histogram

      const { rsiText, macdText, overall } = deriveSentiment(
        latestRSI,
        latestMACD
      )

      const emoji =
        overall === 'Bullish' ? '🐂' : overall === 'Bearish' ? '🐻' : '🌀'

      const embed = EmbedUtils.createTAEmbed({
        symbol,
        timeframe: '1h',
        price: lastClose,
        rsiValue: latestRSI,
        macd: macdVal,
        signal: signalVal,
        histogram: histogramVal,
        rsiText,
        macdText,
        overall,
      })

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error('Error in /ta command:', error)
      await interaction.editReply({
        content:
          '❌ An error occurred while performing technical analysis. Please try again later.',
      })
    }
  },
}
