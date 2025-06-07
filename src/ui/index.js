import { updateBalanceDisplay } from '../state/player';
import { placeBet } from '../betting/index';
import { spawnDice } from '../dice/index';
import { messagePanel, setupMessagePanel } from './message';

let uiPanel;

export function setupUI(playerX, throwZ, scene) {
  // Main UI panel
  uiPanel = document.createElement('div');
  uiPanel.style.position = 'absolute';
  uiPanel.style.top = '10px';
  uiPanel.style.left = '10px';
  uiPanel.style.background = 'rgba(0, 0, 0, 0.5)';
  uiPanel.style.padding = '10px';
  uiPanel.style.borderRadius = '8px';
  uiPanel.style.display = 'flex';
  uiPanel.style.flexDirection = 'column';
  uiPanel.style.gap = '10px';
  document.body.appendChild(uiPanel);

  // Roll Button
  const rollBtn = document.createElement('button');
  rollBtn.textContent = '🎲 Roll Dice';
  rollBtn.onclick = () => spawnDice(playerX, throwZ, scene);
  uiPanel.appendChild(rollBtn);

  // Chip betting buttons
  const chipContainer = document.createElement('div');
  chipContainer.style.display = 'flex';
  chipContainer.style.gap = '8px';
  uiPanel.appendChild(chipContainer);

  [5, 10, 25, 100].forEach(amount => {
    const chip = document.createElement('button');
    chip.textContent = `$${amount}`;
    chip.onclick = () => placeBet(amount, playerX, throwZ, scene, updateBalanceDisplay);
    chipContainer.appendChild(chip);
  });

  // Message panel
  setupMessagePanel();
  uiPanel.appendChild(messagePanel);
}

export { setupMessagePanel, displayMessage, messagePanel } from './message.js';

