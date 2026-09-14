import { GalaxyScene } from './galaxyScene.js';
import { RomanticMessages } from './romanticMessages.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D WebGL Canvas Scene
  const canvasContainer = document.getElementById('canvas-container');
  const galaxyScene = new GalaxyScene(canvasContainer);

  // 2. Initialize Romantic Messages & Hearts Overlay
  const romanticMessages = new RomanticMessages(galaxyScene);

  // 3. Connect UI Controls
  setupNavigation(galaxyScene);
});

function setupNavigation(galaxyScene) {
  // Preset Scene Selector
  const presetSelector = document.getElementById('scene-preset');

  const handlePresetChange = (e) => {
    e.stopPropagation();
    const val = presetSelector.value;
    galaxyScene.setPresetMode(val);
  };

  presetSelector.addEventListener('change', handlePresetChange);
  presetSelector.addEventListener('input', handlePresetChange);

  // Fullscreen Toggle
  const btnFullscreen = document.getElementById('btn-fullscreen');

  const toggleFullscreen = (e) => {
    if (e) {
      e.stopPropagation();
    }

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  btnFullscreen.addEventListener('click', toggleFullscreen);
  btnFullscreen.addEventListener('pointerdown', (e) => e.stopPropagation());
  btnFullscreen.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleFullscreen(e);
  });
}
