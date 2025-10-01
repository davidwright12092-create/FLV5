import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearMockData() {
  console.log('🗑️  Starting to clear mock data...\n')

  try {
    // Delete in order to respect foreign key constraints
    console.log('Deleting analysis results...')
    const analysisCount = await prisma.analysisResult.deleteMany({})
    console.log(`✅ Deleted ${analysisCount.count} analysis results`)

    console.log('Deleting transcriptions...')
    const transcriptionCount = await prisma.transcription.deleteMany({})
    console.log(`✅ Deleted ${transcriptionCount.count} transcriptions`)

    console.log('Deleting recordings...')
    const recordingCount = await prisma.recording.deleteMany({})
    console.log(`✅ Deleted ${recordingCount.count} recordings`)

    console.log('\n✨ All mock data cleared successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Recordings: ${recordingCount.count}`)
    console.log(`   - Transcriptions: ${transcriptionCount.count}`)
    console.log(`   - Analysis Results: ${analysisCount.count}`)
  } catch (error) {
    console.error('❌ Error clearing mock data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearMockData()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
