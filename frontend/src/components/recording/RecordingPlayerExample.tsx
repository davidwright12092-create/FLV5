import RecordingPlayer, { Recording } from './RecordingPlayer'

/**
 * Example usage of the RecordingPlayer component
 *
 * This demonstrates how to use the RecordingPlayer with sample data.
 * You can integrate this into your RecordingDetailPage or any other page.
 */

const RecordingPlayerExample = () => {
  // Sample recording data
  const sampleRecording: Recording = {
    id: 'rec_001',
    title: 'Foundation Inspection - Construction Site A',
    audioUrl: '/path/to/audio.mp3', // Replace with actual audio URL
    duration: 42, // Duration in seconds
    createdAt: new Date().toISOString(),
    metadata: {
      recordingType: 'Field Inspection',
      location: 'Construction Site A - 123 Main Street',
      participants: [
        'Inspector Sarah Chen',
        'Foreman Mike Torres',
      ],
    },
    // Transcript is optional - the component includes mock data for demonstration
  }

  const handleShare = () => {
    console.log('Share recording:', sampleRecording.id)
    // Implement share functionality
    // Example: Copy link to clipboard, open share dialog, etc.
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  const handleDownload = () => {
    console.log('Download recording:', sampleRecording.id)
    // Implement download functionality
    // Example: Trigger audio file download
    const link = document.createElement('a')
    link.href = sampleRecording.audioUrl
    link.download = `${sampleRecording.title}.mp3`
    link.click()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <RecordingPlayer
        recording={sampleRecording}
        onShare={handleShare}
        onDownload={handleDownload}
      />

      {/* Additional content can go here */}
      <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Integration Notes
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Replace audioUrl with your actual audio file path or URL</li>
          <li>• The component includes mock transcript data for demonstration</li>
          <li>• Pass your own transcript data via the recording.transcript prop</li>
          <li>• Customize onShare and onDownload handlers for your needs</li>
          <li>• The player automatically handles audio playback state</li>
          <li>• All UI elements are responsive and accessible</li>
        </ul>
      </div>
    </div>
  )
}

export default RecordingPlayerExample
