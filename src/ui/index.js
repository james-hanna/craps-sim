import { messagePanel, setupMessagePanel } from './message';
import { initializeBalanceDisplay } from './balance';

let uiPanel;

export function setupUI({
  onRollDice,
  onLineBet,
  onComeBet,
  onDontPass,
  onDontCome,
  onFieldBet,
  onOddsLine,
  onHardway
}) {

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

  // Line bet chips
  const chipContainer = document.createElement('div');
  chipContainer.id = 'chip-container';
  uiPanel.appendChild(chipContainer);

  [5, 10, 25, 100].forEach(amount => {
    const chip = document.createElement('button');
    chip.textContent = `Pass $${amount}`;
    chip.onclick = () => onLineBet(amount);
    chipContainer.appendChild(chip);
  });

  // Come bet button
  const comeBtn = document.createElement('button');
  comeBtn.textContent = 'Come Bet $5';
  comeBtn.onclick = () => onComeBet(5);
  uiPanel.appendChild(comeBtn);

  const dontPassBtn = document.createElement('button');
  dontPassBtn.textContent = "Don't Pass $5";
  dontPassBtn.onclick = () => onDontPass(5);
  uiPanel.appendChild(dontPassBtn);

  const dontComeBtn = document.createElement('button');
  dontComeBtn.textContent = "Don't Come $5";
  dontComeBtn.onclick = () => onDontCome(5);
  uiPanel.appendChild(dontComeBtn);

  const fieldBtn = document.createElement('button');
  fieldBtn.textContent = 'Field $5';
  fieldBtn.onclick = () => onFieldBet(5);
  uiPanel.appendChild(fieldBtn);

  const oddsBtn = document.createElement('button');
  oddsBtn.textContent = 'Odds $5';
  oddsBtn.onclick = () => onOddsLine(5);
  uiPanel.appendChild(oddsBtn);

  // Hardway buttons
  const hardContainer = document.createElement('div');
  hardContainer.id = 'hard-container';
  uiPanel.appendChild(hardContainer);
  [4,6,8,10].forEach(n => {
    const btn = document.createElement('button');
    btn.textContent = `Hard ${n}`;
    btn.onclick = () => onHardway(n,5);
    hardContainer.appendChild(btn);
  });

  // Message panel
  setupMessagePanel();
  uiPanel.appendChild(messagePanel);
}

export { setupMessagePanel, displayMessage, messagePanel } from './message.js';

