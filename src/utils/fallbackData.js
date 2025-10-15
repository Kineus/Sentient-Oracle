const fallbackPrices = {
  bitcoin: {
    usd: 45000,
    usd_market_cap: 850000000000,
    usd_24h_change: 2.5,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  ethereum: {
    usd: 2800,
    usd_market_cap: 340000000000,
    usd_24h_change: 1.8,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  solana: {
    usd: 150,
    usd_market_cap: 65000000000,
    usd_24h_change: 3.4,
    name: 'Solana',
    symbol: 'SOL',
  },
}

const fallbackSearchResults = {
  btc: [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      thumb:
        'https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png',
    },
  ],
  eth: [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      thumb:
        'https://coin-images.coingecko.com/coins/images/279/thumb/ethereum.png',
    },
  ],
  sol: [
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      thumb:
        'https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png',
    },
  ],
}

function getFallbackPrice(coinId) {
  return fallbackPrices[coinId] || null
}

function getFallbackSearchResults(query) {
  const normalizedQuery = query.toLowerCase()
  return fallbackSearchResults[normalizedQuery] || []
}

module.exports = {
  getFallbackPrice,
  getFallbackSearchResults,
}
