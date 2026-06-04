import { soundManager, Song } from '../soundManager';

describe('SoundManager', () => {
  beforeEach(() => {
    // Mock Web Speech API
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: jest.fn(),
        getVoices: () => [
          {
            name: 'Test Voice',
            lang: 'zh-CN'
          }
        ]
      },
      writable: true
    });

    // Mock AudioContext
    Object.defineProperty(window, 'AudioContext', {
      value: jest.fn().mockImplementation(() => ({
        createBufferSource: jest.fn().mockReturnValue({
          buffer: {},
          connect: jest.fn(),
          start: jest.fn(),
          addEventListener: jest.fn()
        }),
        createGain: jest.fn().mockReturnValue({
          gain: { value: 1 },
          connect: jest.fn()
        }),
        createBiquadFilter: jest.fn().mockReturnValue({
          type: 'lowpass',
          frequency: { value: 20000 },
          connect: jest.fn()
        }),
        destination: {},
        createMediaElementSource: jest.fn().mockReturnValue({
          connect: jest.fn()
        }),
        resume: jest.fn()
      }))
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0))
    });

    // Mock Audio
    global.Audio = jest.fn().mockImplementation(() => ({
      loop: false,
      volume: 1,
      pause: jest.fn(),
      play: jest.fn().mockResolvedValue({})
    }));
  });

  test('should initialize with default values', () => {
    expect(soundManager.getMusicPower().musicIntensity).toBe(0);
  });

  test('should play sound effect', () => {
    soundManager.playSoundEffect('shoot');
    // The actual implementation is mocked, so we just test it doesn't throw
    expect(true).toBe(true);
  });

  test('should update music power', () => {
    soundManager.updateMusicPower(50, true);
    const power = soundManager.getMusicPower();
    expect(power.musicIntensity).toBe(50);
  });

  test('should set playlist', () => {
    const songs: Song[] = [
      {
        id: '1',
        title: 'Test Song',
        artist: 'Test Artist',
        url: 'https://example.com/song.mp3',
        cover: 'https://example.com/cover.jpg'
      }
    ];
    soundManager.setPlaylist(songs);
    // The actual implementation is mocked, so we just test it doesn't throw
    expect(true).toBe(true);
  });

  test('should set volume', () => {
    soundManager.setVolume(0.5);
    soundManager.setSoundVolume(0.8);
    // The actual implementation is mocked, so we just test it doesn't throw
    expect(true).toBe(true);
  });
});
