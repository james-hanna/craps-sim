import { messagePanel, setupMessagePanel } from './message';
import { initializeBalanceDisplay } from './balance';

let uiPanel;

export function setupUI(onRollDice, onPlaceBet) {
  // Main UI panel
  uiPanel = document.createElement('div');
  uiPanel.id = 'ui-panel';
  document.body.appendChild(uiPanel);

  initializeBalanceDisplay(uiPanel);

  // Roll Button
  const rollBtn = document.createElement('button');
  rollBtn.textContent = '🎲 Roll Dice';
  rollBtn.onclick = onRollDice;
  uiPanel.appendChild(rollBtn);

  // Chip betting buttons
  const chipContainer = document.createElement('div');
  chipContainer.id = 'chip-container';
  uiPanel.appendChild(chipContainer);

  [5, 10, 25, 100].forEach(amount => {
    const chip = document.createElement('button');
    chip.textContent = `$${amount}`;
    chip.onclick = () => onPlaceBet(amount);
    chipContainer.appendChild(chip);
  });

  // Message panel
  setupMessagePanel();
  uiPanel.appendChild(messagePanel);
}

export { setupMessagePanel, displayMessage, messagePanel } from './message.js';

