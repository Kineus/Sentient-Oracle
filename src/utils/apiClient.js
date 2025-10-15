const axios = require('axios')

class APIClient {
  constructor() {
    this.coinGeckoBaseURL =
      process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'
    this.dexScreenerBaseURL =
      process.env.DEXSCREENER_API_URL || 'https://api.dexscreener.com/latest'
    this.dobbyAPIURL =
      process.env.DOBBY_API_URL ||
      'https://api.fireworks.ai/inference/v1/chat/completions'
    this.dobbyAPIKey = process.env.DOBBY_API_KEY

    console.log('🔧 API Client initialized with:')
    console.log(
      `  - DOBBY_API_KEY: ${
        this.dobbyAPIKey
          ? 'Set (' + this.dobbyAPIKey.substring(0, 10) + '...)'
          : 'Not set'
      }`
    )
    console.log(`  - DOBBY_API_URL: ${this.dobbyAPIURL}`)

    this.coinGecko = axios.create({
      baseURL: this.coinGeckoBaseURL,
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Sentient-Crypto-Oracle-Bot/1.0',
      },

      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
        keepAlive: true,
        maxSockets: 5,
      }),

      retry: 3,
      retryDelay: 1000,
    })

    this.dexScreener = axios.create({
      baseURL: this.dexScreenerBaseURL,
      timeout: 15000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Sentient-Crypto-Oracle-Bot/1.0',
      },

      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
      }),
    })

    this.dobbyAI = axios.create({
      baseURL: this.dobbyAPIURL,
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${this.dobbyAPIKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Sentient-Crypto-Oracle-Bot/1.0',
      },

      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
      }),
    })
  }

  async getCoinPrice(coinId) {
    try {
      const response = await this.coinGecko.get(`/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_change: true,
          include_24hr_vol: true,
        },
      })

      if (coinId.includes(',')) {
        return response.data
      }

      return response.data[coinId]
    } catch (error) {
      console.error('Error fetching coin price:', error.message)
      console.error('Error code:', error.code)

      if (
        error.code === 'UND_ERR_SOCKET' ||
        error.message.includes('other side closed')
      ) {
        throw new Error('Network connection error. Please try again.')
      }

      throw new Error('Failed to fetch coin price')
    }
  }

  async searchCoin(query, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(
          `Searching for coin: ${query} (attempt ${attempt}/${retries})`
        )

        const response = await this.coinGecko.get(`/search`, {
          params: { query: query.trim() },
        })

        if (!response.data || !response.data.coins) {
          console.error('Unexpected API response structure:', response.data)
          if (attempt === retries) {
            throw new Error('Invalid API response structure')
          }
          continue
        }

        console.log(
          `Found ${response.data.coins.length} coins for query: ${query}`
        )
        return response.data.coins
      } catch (error) {
        console.error(
          `Error searching coins (attempt ${attempt}/${retries}):`,
          error.message
        )
        console.error('Full error:', error.response?.data || error.message)

        if (error.response?.status === 429) {
          if (attempt < retries) {
            console.log('Rate limited, waiting 2 seconds before retry...')
            await new Promise((resolve) => setTimeout(resolve, 2000))
            continue
          }
          throw new Error('API rate limit exceeded. Please try again later.')
        }

        if (
          error.code === 'ECONNABORTED' ||
          error.code === 'ENOTFOUND' ||
          error.code === 'UND_ERR_SOCKET' ||
          error.message.includes('other side closed') ||
          error.message.includes('socket hang up')
        ) {
          if (attempt < retries) {
            console.log(
              `Network error (${error.code}), waiting 2 seconds before retry...`
            )
            await new Promise((resolve) => setTimeout(resolve, 2000))
            continue
          }
        }

        if (attempt === retries) {
          throw new Error(`Failed to search coins: ${error.message}`)
        }
      }
    }
  }

  async getTrendingCoins() {
    try {
      const response = await this.coinGecko.get('/search/trending')
      return response.data.coins.map((coin) => coin.item)
    } catch (error) {
      console.error('Error fetching trending coins:', error.message)
      throw new Error('Failed to fetch trending coins')
    }
  }

  async getTopGainers() {
    try {
      const response = await this.coinGecko.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'price_change_percentage_24h_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching top gainers:', error.message)
      throw new Error('Failed to fetch top gainers')
    }
  }

  async getGlobalMarketData() {
    try {
      const response = await this.coinGecko.get('/global')
      return response.data.data
    } catch (error) {
      console.error('Error fetching global market data:', error.message)
      throw new Error('Failed to fetch global market data')
    }
  }

  async searchTokenBySymbol(symbol) {
    try {
      const response = await this.dexScreener.get(`/dex/search/?q=${symbol}`)
      return response.data.pairs?.slice(0, 5) || []
    } catch (error) {
      console.error('Error searching token:', error.message)
      throw new Error('Failed to search token')
    }
  }

  async getTokenPrice(address) {
    try {
      const response = await this.dexScreener.get(`/dex/tokens/${address}`)
      return response.data.pairs?.[0] || null
    } catch (error) {
      console.error('Error fetching token price:', error.message)
      throw new Error('Failed to fetch token price')
    }
  }

  async getAIAnalysis(prompt, context = '') {
    if (!this.dobbyAPIKey) {
      throw new Error('Dobby API key not configured')
    }

    try {
      console.log('🤖 Sending AI analysis request to Fireworks AI...')
      console.log(
        `Model: accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b`
      )
      console.log(`Prompt: ${prompt.substring(0, 100)}...`)

      const response = await this.dobbyAI.post('', {
        model:
          'accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b',
        messages: [
          {
            role: 'system',
            content:
              'You are Sentient Crypto Oracle, an AI that provides insightful cryptocurrency market analysis. Keep responses concise, professional, and informative. Focus on market trends, technical analysis, and practical insights.',
          },
          {
            role: 'user',
            content: `${prompt}\n\nContext: ${context}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
      })

      console.log('✅ AI analysis received successfully')
      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Error getting AI analysis:', error.message)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)

      if (error.response?.status === 404) {
        throw new Error('AI model not found. Please check the model name.')
      } else if (error.response?.status === 401) {
        throw new Error(
          'Invalid AI API key. Please check your Fireworks AI credentials.'
        )
      } else if (error.response?.status === 429) {
        throw new Error('AI API rate limit exceeded. Please try again later.')
      }

      throw new Error(`Failed to get AI analysis: ${error.message}`)
    }
  }

  async getMarketSummary(coins) {
    const context = coins
      .map(
        (coin) =>
          `${coin.symbol}: $${coin.current_price} (${
            coin.price_change_percentage_24h > 0 ? '+' : ''
          }${coin.price_change_percentage_24h?.toFixed(2)}%)`
      )
      .join(', ')

    const prompt = `Provide a brief market summary for these top cryptocurrencies: ${context}. Include overall market sentiment and key insights.`

    return await this.getAIAnalysis(prompt, 'Daily crypto market summary')
  }
}

module.exports = new APIClient()
