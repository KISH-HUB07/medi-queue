// Web Audio API & Speech Synthesis for MediQueue Hospital Loudspeaker Chimes

export const playHospitalChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Tone 1 (High chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Tone 2 (Lower harmonic chime after 0.2s)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.2); // C5
    gain2.gain.setValueAtTime(0.35, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.warn('Audio chime unsupported or blocked:', err);
  }
};

export const announceTokenVoice = (tokenNumber, roomName, doctorName) => {
  // First trigger bell chime
  playHospitalChime();

  // Then speak text announcement if Web Speech API is supported
  if ('speechSynthesis' in window) {
    setTimeout(() => {
      window.speechSynthesis.cancel();
      const text = `Attention please. Token ${tokenNumber}, please proceed to ${roomName}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }, 400);
  }
};
