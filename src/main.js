import { GalaxyScene } from './galaxyScene.js';
import { CodeEditor } from './codeEditor.js';
import { RomanticMessages } from './romanticMessages.js';
import { AudioSynth } from './audioSynth.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D WebGL Canvas Scene
  const canvasContainer = document.getElementById('canvas-container');
  const galaxyScene = new GalaxyScene(canvasContainer);

  // 2. Initialize Audio Synthesizer
  const audioSynth = new AudioSynth();

  // 3. Initialize Code Editor Panel
  const codeEditor = new CodeEditor(galaxyScene);

  // 4. Initialize Romantic Messages & Hearts Overlay
  const romanticMessages = new RomanticMessages(galaxyScene, audioSynth);

  // 5. Connect UI Controls
  setupNavigation(galaxyScene, audioSynth);
});

function setupNavigation(galaxyScene, audioSynth) {
  // Preset Scene Selector
  const presetSelector = document.getElementById('scene-preset');
  presetSelector.addEventListener('change', (e) => {
    galaxyScene.setPresetMode(e.target.value);
    if (audioSynth) audioSynth.playChime();
  });

  // Audio Toggle
  const btnAudio = document.getElementById('btn-audio');
  const audioLabel = document.getElementById('audio-label');
  const audioWaves = btnAudio.querySelector('.audio-waves');

  btnAudio.addEventListener('click', () => {
    if (audioSynth.isPlaying) {
      audioSynth.stop();
      audioLabel.textContent = 'Música OFF';
      audioWaves.classList.add('hidden');
      btnAudio.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    } else {
      audioSynth.start();
      audioLabel.textContent = 'Música ON';
      audioWaves.classList.remove('hidden');
      btnAudio.style.borderColor = 'var(--accent-gold)';
    }
  });

  // Fullscreen Toggle
  const btnFullscreen = document.getElementById('btn-fullscreen');
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
}
