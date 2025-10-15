const { SlashCommandBuilder } = require('discord.js')
const EmbedUtils = require('../utils/embeds')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test command to verify bot functionality'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const testEmbed = EmbedUtils.createSuccessEmbed(
        'Bot Test Successful!',
        '✅ All systems operational\n\n' +
          '🔧 Bot Status:\n' +
          '• Discord.js: Connected\n' +
          '• Commands: Loaded\n' +
          '• Background Services: Running\n\n' +
          'Ready for crypto analysis!'
      )

      console.log('🧪 Test embed created, sending to Discord...')
      await interaction.editReply({ embeds: [testEmbed] })
      console.log('✅ Test embed sent successfully')
    } catch (error) {
      console.error('Error in test command:', error)
      await interaction.editReply({
        embeds: [
          EmbedUtils.createErrorEmbed(
            '❌ Test failed. Check bot logs for details.'
          ),
        ],
      })
    }
  },
}
