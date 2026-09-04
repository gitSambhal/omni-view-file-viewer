/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Sample Media Generators (Video & Audio) - 100% Offline
 */

/**
 * Generates an offline synthesized 16-bit PCM WAV audio Blob
 * 6-second relaxing ambient chord loop
 */
export function generateSampleWavBlob(): Blob {
  const sampleRate = 44100;
  const duration = 6; // 6 seconds
  const numChannels = 2;
  const numSamples = sampleRate * duration;
  const blockAlign = numChannels * 2;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF Chunk Descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true); // Total file size - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM linear)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  // Musical chord frequencies (Am7 -> Fmaj7 -> Cmaj7 progression)
  const chordNotes = [
    [220.0, 261.63, 329.63, 392.0], // Am7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [130.81, 164.81, 196.0, 246.94], // Cmaj7
    [196.0, 246.94, 293.66, 392.0]   // G
  ];

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor((t / duration) * 4) % 4;
    const chord = chordNotes[chordIdx];

    // Harmonized smooth sound
    let sampleL = 0;
    let sampleR = 0;

    for (let c = 0; c < chord.length; c++) {
      const f = chord[c];
      const tone = Math.sin(2 * Math.PI * f * t);
      // Soft overtone
      const overtone = Math.sin(4 * Math.PI * f * t) * 0.25;
      const wave = (tone + overtone) * 0.15;
      sampleL += wave;
      sampleR += wave * (c % 2 === 0 ? 0.85 : 1.15); // Stereo separation
    }

    // Sub-bass root note
    const bassF = chord[0] * 0.5;
    const bass = Math.sin(2 * Math.PI * bassF * t) * 0.22;
    sampleL += bass;
    sampleR += bass;

    // Smooth envelope attack and decay at loop edges
    const loopEnv = Math.sin((t / duration) * Math.PI);
    sampleL *= loopEnv;
    sampleR *= loopEnv;

    const clampL = Math.max(-1, Math.min(1, sampleL));
    const clampR = Math.max(-1, Math.min(1, sampleR));

    view.setInt16(offset, clampL < 0 ? clampL * 0x8000 : clampL * 0x7fff, true);
    view.setInt16(offset + 2, clampR < 0 ? clampR * 0x8000 : clampR * 0x7fff, true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Generates an offline high-definition WebM/MP4 video Blob with dynamic graphics
 */
export async function generateSampleVideoBlob(): Promise<Blob> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return new Blob([], { type: 'video/webm' });
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new Blob([], { type: 'video/webm' });

    // Detect supported mime type
    let mimeType = 'video/webm;codecs=vp8';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }
    }

    // If MediaRecorder is supported and captureStream exists
    if (typeof MediaRecorder !== 'undefined' && typeof (canvas as any).captureStream === 'function') {
      const stream = (canvas as any).captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      return new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };

        recorder.start();

        let frame = 0;
        const totalFrames = 90; // 3 seconds at 30 fps

        const renderFrame = () => {
          const t = frame / 30;

          // Deep cinema dark background
          ctx.fillStyle = '#070b14';
          ctx.fillRect(0, 0, 640, 360);

          // Radial glow
          const radial = ctx.createRadialGradient(320, 160, 20, 320, 160, 240);
          radial.addColorStop(0, 'rgba(147, 51, 234, 0.45)');
          radial.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
          radial.addColorStop(1, 'rgba(7, 11, 20, 0)');
          ctx.fillStyle = radial;
          ctx.fillRect(0, 0, 640, 360);

          // Animated particle ring
          ctx.save();
          ctx.translate(320, 150);
          ctx.rotate(t * 1.5);
          for (let i = 0; i < 12; i++) {
            ctx.rotate((Math.PI * 2) / 12);
            ctx.strokeStyle = `hsl(${(t * 50 + i * 30) % 360}, 85%, 65%)`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(55, 0, 16, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();

          // Central core
          ctx.save();
          ctx.beginPath();
          ctx.arc(320, 150, 28, 0, Math.PI * 2);
          ctx.fillStyle = '#a855f7';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.restore();

          // Title
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('OmniView Cinema Player', 320, 245);

          // Timecode badge
          const seconds = Math.floor(t);
          const centiseconds = Math.floor((t % 1) * 100);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
          ctx.fillText(`00:0${seconds}:${centiseconds.toString().padStart(2, '0')} • 60 FPS • 1080p Studio Preview`, 320, 275);

          // Waveform equalizer bars at bottom
          const bars = 32;
          const barW = 10;
          const startX = 320 - (bars * (barW + 3)) / 2;
          for (let b = 0; b < bars; b++) {
            const h = Math.abs(Math.sin(t * 4 + b * 0.35)) * 32 + 4;
            const barGrad = ctx.createLinearGradient(0, 340 - h, 0, 340);
            barGrad.addColorStop(0, '#c084fc');
            barGrad.addColorStop(1, '#6366f1');
            ctx.fillStyle = barGrad;
            ctx.fillRect(startX + b * (barW + 3), 340 - h, barW, h);
          }

          frame++;
          if (frame < totalFrames) {
            requestAnimationFrame(renderFrame);
          } else {
            setTimeout(() => {
              if (recorder.state === 'recording') {
                recorder.stop();
              }
            }, 80);
          }
        };

        renderFrame();
      });
    }
  } catch (err) {
    console.warn('Could not generate canvas sample video:', err);
  }

  return new Blob([], { type: 'video/webm' });
}
