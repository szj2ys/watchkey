import { extractYouTubeId, isValidYouTubeUrl } from '@/lib/youtube/parser'

describe('YouTube URL Parser', () => {
  it('should extract video ID from standard YouTube URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    expect(extractYouTubeId(url)).toBe('dQw4w9WgXcQ')
  })

  it('should extract video ID from shortened YouTube URL', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ'
    expect(extractYouTubeId(url)).toBe('dQw4w9WgXcQ')
  })

  it('should extract video ID from embed URL', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    expect(extractYouTubeId(url)).toBe('dQw4w9WgXcQ')
  })

  it('should return null for invalid URL', () => {
    const url = 'https://example.com'
    expect(extractYouTubeId(url)).toBeNull()
  })

  it('should validate YouTube URL', () => {
    expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
    expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
    expect(isValidYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true)
    expect(isValidYouTubeUrl('https://example.com')).toBe(false)
  })
})
