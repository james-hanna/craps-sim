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
  onHardway,
  onPlaceBet
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

  // Chip denomination selector
  let selected = 5;
  const denom = document.createElement('div');
  denom.id = 'chip-container';
  uiPanel.appendChild(denom);
  [1,5,25,100].forEach(val => {
    const btn = document.createElement('button');
    btn.textContent = `$${val}`;
    if (val === selected) btn.classList.add('active');
    btn.onclick = () => {
      selected = val;
      Array.from(denom.children).forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
    };
    denom.appendChild(btn);
  });

  const makeBtn = (label, handler) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.onclick = () => handler(selected);
    uiPanel.appendChild(b);
  };

  makeBtn('Pass Line', onLineBet);
  makeBtn("Don't Pass", onDontPass);
  makeBtn('Come', onComeBet);
  makeBtn("Don't Come", onDontCome);
  makeBtn('Field', onFieldBet);
  makeBtn('Pass Odds', amt => onOddsLine(amt));

  const placeContainer = document.createElement('div');
  placeContainer.id = 'place-container';
  uiPanel.appendChild(placeContainer);
  [4,5,6,8,9,10].forEach(n => {
    const btn = document.createElement('button');
    btn.textContent = `Place ${n}`;
    btn.onclick = () => onPlaceBet(n, selected);
    placeContainer.appendChild(btn);
  });

  // Hardway buttons
  const hardContainer = document.createElement('div');
  hardContainer.id = 'hard-container';
  uiPanel.appendChild(hardContainer);
  [4,6,8,10].forEach(n => {
    const btn = document.createElement('button');
    btn.textContent = `Hard ${n}`;
    btn.onclick = () => onHardway(n, selected);
    hardContainer.appendChild(btn);
  });

  // Message panel
  setupMessagePanel();
  uiPanel.appendChild(messagePanel);
}

export { setupMessagePanel, displayMessage, messagePanel } from './message.js';

