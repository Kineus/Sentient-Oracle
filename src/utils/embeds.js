const { EmbedBuilder } = require('discord.js')

class EmbedUtils {
  static getColor(type) {
    const colors = {
      primary: parseInt(process.env.EMBED_COLOR_PRIMARY || '0x00ff88', 16),
      success: parseInt(process.env.EMBED_COLOR_SUCCESS || '0x00ff00', 16),
      warning: parseInt(process.env.EMBED_COLOR_WARNING || '0xffaa00', 16),
      error: parseInt(process.env.EMBED_COLOR_ERROR || '0xff0000', 16),
      info: 0x0099ff,
    }
    return colors[type] || colors.primary
  }

  static createPriceEmbed(coinData, symbol) {
    console.log('🎨 Creating price embed with data:', coinData)

    const embed = new EmbedBuilder()
      .setColor(this.getColor('primary'))
      .setTitle(`💰 ${symbol.toUpperCase()} - ${coinData.name || symbol}`)
      .setTimestamp()
      .setFooter({ text: 'Sentient Crypto Oracle • Powered by AI' })

    if (coinData.image) {
      embed.setThumbnail(coinData.image)
    }

    const price = coinData.current_price || coinData.price || coinData.usd
    const change24h =
      coinData.price_change_percentage_24h ||
      coinData.price_change_24h ||
      coinData.usd_24h_change
    const marketCap = coinData.market_cap || coinData.usd_market_cap
    const volume =
      coinData.total_volume || coinData.volume_24h || coinData.usd_24h_vol

    console.log('📊 Extracted values:', { price, change24h, marketCap, volume })

    embed.addFields(
      {
        name: '💵 Current Price',
        value: `$${price?.toLocaleString() || 'N/A'}`,
        inline: true,
      },
      {
        name: '📊 24h Change',
        value: change24h
          ? `${change24h > 0 ? '📈' : '📉'} ${
              change24h > 0 ? '+' : ''
            }${change24h.toFixed(2)}%`
          : 'N/A',
        inline: true,
      },
      {
        name: '🏆 Market Cap',
        value: marketCap ? `$${(marketCap / 1e9).toFixed(2)}B` : 'N/A',
        inline: true,
      }
    )

    if (volume) {
      embed.addFields({
        name: '📈 24h Volume',
        value: `$${(volume / 1e6).toFixed(2)}M`,
        inline: true,
      })
    }

    console.log('✅ Price embed created successfully')
    return embed
  }

  static createAnalysisEmbed(symbol, price, analysis) {
    const embed = new EmbedBuilder()
      .setColor(this.getColor('info'))
      .setTitle(`🧠 Sentient Analysis - ${symbol.toUpperCase()}`)
      .setDescription(`**Current Price:** $${price?.toLocaleString() || 'N/A'}`)
      .addFields({
        name: '📊 AI Insight',
        value: analysis || 'Analysis unavailable at this time.',
      })
      .setTimestamp()
      .setFooter({ text: 'Sentient Crypto Oracle • Powered by Dobby 8B AI' })

    return embed
  }

  static createTrendingEmbed(trendingCoins, type = 'trending') {
    const embed = new EmbedBuilder()
      .setColor(this.getColor('success'))
      .setTitle(
        `🔥 ${
          type === 'trending' ? 'Trending' : 'Top Gainers'
        } Cryptocurrencies`
      )
      .setTimestamp()
      .setFooter({ text: 'Sentient Crypto Oracle • Real-time data' })

    const coins = trendingCoins.slice(0, 10)
    const fields = coins.map((coin, index) => {
      const price = coin.current_price || coin.price
      const change = coin.price_change_percentage_24h || coin.price_change_24h
      const symbol = coin.symbol?.toUpperCase() || coin.name

      return {
        name: `${index + 1}. ${symbol}`,
        value: `$${price?.toLocaleString() || 'N/A'} ${
          change ? `(${change > 0 ? '+' : ''}${change.toFixed(2)}%)` : ''
        }`,
        inline: true,
      }
    })

    for (let i = 0; i < fields.length; i += 3) {
      embed.addFields(fields.slice(i, i + 3))
    }

    return embed
  }

  static createAlertEmbed(symbol, price, targetPrice, isAbove) {
    const embed = new EmbedBuilder()
      .setColor(this.getColor('warning'))
      .setTitle(`🚨 Price Alert Triggered!`)
      .setDescription(
        `**${symbol.toUpperCase()}** has ${
          isAbove ? 'risen above' : 'fallen below'
        } your target price!`
      )
      .addFields(
        {
          name: '💰 Current Price',
          value: `$${price.toLocaleString()}`,
          inline: true,
        },
        {
          name: '🎯 Target Price',
          value: `$${targetPrice.toLocaleString()}`,
          inline: true,
        },
        {
          name: '📊 Price Change',
          value: `${isAbove ? '📈' : '📉'} ${(
            ((price - targetPrice) / targetPrice) *
            100
          ).toFixed(2)}%`,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({ text: 'Sentient Crypto Oracle • Alert System' })

    return embed
  }

  static createDailyReportEmbed(topCoins, marketSummary) {
    const embed = new EmbedBuilder()
      .setColor(this.getColor('primary'))
      .setTitle('📊 Daily Crypto Market Report')
      .setDescription('Your AI-powered cryptocurrency market summary for today')
      .setTimestamp()
      .setFooter({ text: 'Sentient Crypto Oracle • Daily Report' })

    const top5Coins = topCoins.slice(0, 5)
    const coinFields = top5Coins.map((coin, index) => {
      const price = coin.current_price
      const change = coin.price_change_percentage_24h
      const symbol = coin.symbol?.toUpperCase()

      return {
        name: `${index + 1}. ${symbol}`,
        value: `$${price?.toLocaleString()}\n${
          change
            ? `${change > 0 ? '📈' : '📉'} ${
                change > 0 ? '+' : ''
              }${change.toFixed(2)}%`
            : 'N/A'
        }`,
        inline: true,
      }
    })

    embed.addFields(coinFields)

    if (marketSummary) {
      embed.addFields({
        name: '🧠 Sentient Market Insight',
        value: marketSummary,
      })
    }

    return embed
  }

  static createErrorEmbed(message) {
    return new EmbedBuilder()
      .setColor(this.getColor('error'))
      .setTitle('❌ Error')
      .setDescription(message)
      .setTimestamp()
      .setFooter({ text: 'Sentient Crypto Oracle' })
  }

  static createSuccessEmbed(title, message) {
    return new EmbedBuilder()
      .setColor(this.getColor('success'))
      .setTitle(`✅ ${title}`)
      .setDescription(message)
      .setTimestamp()
      .setFooter({ text: 'Sentient Crypto Oracle' })
  }
}

module.exports = EmbedUtils
