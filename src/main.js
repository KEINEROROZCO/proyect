import { GalaxyScene } from './galaxyScene.js';
import { CodeEditor } from './codeEditor.js';
import { RomanticMessages } from './romanticMessages.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D WebGL Canvas Scene
  const canvasContainer = document.getElementById('canvas-container');
  const galaxyScene = new GalaxyScene(canvasContainer);

  // 2. Initialize Code Editor Panel
  const codeEditor = new CodeEditor(galaxyScene);

  // 3. Initialize Romantic Messages & Hearts Overlay
  const romanticMessages = new RomanticMessages(galaxyScene, null);

  // 4. Connect UI Controls
  setupNavigation(galaxyScene);
});

function setupNavigation(galaxyScene) {
  // Preset Scene Selector
  const presetSelector = document.getElementById('scene-preset');
  presetSelector.addEventListener('change', (e) => {
    galaxyScene.setPresetMode(e.target.value);
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
