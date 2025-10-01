# RecordingPlayer Component

A feature-rich, modern audio player component for FieldLink v5 with transcript synchronization and advanced playback controls.

## Features

### Audio Playback
- Play/pause controls with loading states
- Skip forward/backward (10 seconds)
- Seek bar with visual feedback
- Current time and total duration display

### Playback Controls
- **Speed Control**: 0.5x, 1x, 1.5x, 2x playback speeds
- **Volume Control**: Slider with mute/unmute button
- **Waveform Visualization**: Animated waveform showing playback progress

### Transcript Features
- Synchronized transcript display
- Click transcript segments to jump to timestamp
- Active segment highlighting with visual indicator
- Speaker labels with color-coded avatars
- Confidence scores for each segment
- Time range display for each segment

### Additional Features
- Download button for audio file
- Share button for recording link
- Participant metadata display
- Responsive design with smooth animations
- Gradient-based FieldLink v5 design system integration

## Installation & Usage

### Basic Usage

```tsx
import RecordingPlayer, { Recording } from '@/components/recording/RecordingPlayer'

const MyPage = () => {
  const recording: Recording = {
    id: 'rec_001',
    title: 'Foundation Inspection',
    audioUrl: '/path/to/audio.mp3',
    duration: 120,
    createdAt: new Date().toISOString(),
    metadata: {
      recordingType: 'Field Inspection',
      location: 'Construction Site A',
      participants: ['John Doe', 'Jane Smith'],
    },
  }

  return (
    <RecordingPlayer
      recording={recording}
      onShare={() => console.log('Share clicked')}
      onDownload={() => console.log('Download clicked')}
    />
  )
}
```

### With Custom Transcript

```tsx
import RecordingPlayer, { Recording, TranscriptSegment } from '@/components/recording/RecordingPlayer'

const customTranscript: TranscriptSegment[] = [
  {
    id: '1',
    startTime: 0,
    endTime: 5.5,
    text: 'Welcome to the inspection.',
    speaker: 'Inspector John',
    confidence: 0.95,
  },
  // ... more segments
]

const recording: Recording = {
  // ... other fields
  transcript: customTranscript,
}

<RecordingPlayer recording={recording} />
```

## TypeScript Interfaces

### Recording
```typescript
interface Recording {
  id: string
  title: string
  audioUrl: string
  duration: number
  createdAt: string
  transcript?: TranscriptSegment[]
  metadata?: {
    recordingType?: string
    location?: string
    participants?: string[]
  }
}
```

### TranscriptSegment
```typescript
interface TranscriptSegment {
  id: string
  startTime: number      // in seconds
  endTime: number        // in seconds
  text: string
  speaker?: string
  confidence?: number    // 0-1 range
}
```

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `recording` | `Recording` | Yes | The recording data to display |
| `onShare` | `() => void` | No | Callback when share button is clicked |
| `onDownload` | `() => void` | No | Callback when download button is clicked |

## Styling & Design

The component uses:
- **FieldLink v5 Design System**: Colorful gradients (cyan, blue, purple)
- **Tailwind CSS**: Utility-first styling
- **Lucide React Icons**: Modern, consistent iconography
- **Smooth Animations**: Transitions and hover effects

### Color Scheme
- Primary gradient: `from-brand-cyan to-brand-blue`
- Speaker avatars: Rotates through brand colors (cyan, blue, purple, orange, pink)
- Active states: Primary cyan with blue accents
- Neutral backgrounds: Gray scale with subtle gradients

## Mock Data

The component includes comprehensive mock transcript data for demonstration purposes. If no transcript is provided, it will automatically use the mock data showing a field inspection conversation.

## Accessibility

- Keyboard navigation support
- ARIA labels for controls
- Visual feedback for all interactive elements
- Screen reader friendly time displays

## Browser Compatibility

- Modern browsers with HTML5 audio support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile Safari and Chrome mobile

## Performance

- Optimized re-renders with proper React hooks
- Efficient time updates (throttled to frame rate)
- Lazy loading for transcript segments
- Smooth animations using CSS transitions

## Integration Examples

### In RecordingDetailPage
```tsx
import RecordingPlayer from '@/components/recording/RecordingPlayer'

const RecordingDetailPage = () => {
  const { recordingId } = useParams()
  const { data: recording } = useRecording(recordingId)

  if (!recording) return <LoadingSpinner />

  return (
    <PageLayout>
      <RecordingPlayer
        recording={recording}
        onShare={handleShare}
        onDownload={handleDownload}
      />
    </PageLayout>
  )
}
```

### Standalone Usage
See `RecordingPlayerExample.tsx` for a complete working example.

## Customization

To customize the appearance:

1. Modify gradient colors in the header section
2. Adjust speaker avatar colors in `getSpeakerColor` function
3. Change waveform visualization algorithm
4. Update time skip intervals (currently 10 seconds)
5. Modify playback speed options (currently 0.5x-2x)

## Future Enhancements

Potential additions:
- Playlist support for multiple recordings
- Bookmarks/markers on timeline
- Comment annotations at specific timestamps
- Export transcript as text/PDF
- Keyboard shortcuts
- Loop/repeat functionality
- A-B repeat between timestamps
- Audio filters/equalizer
