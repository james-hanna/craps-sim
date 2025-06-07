// src/ui/balance.js
import { player, gameState } from '../state/player.js';

let balanceDisplay;

export function initializeBalanceDisplay(parent = document.body) {
  balanceDisplay = document.createElement('div');
  balanceDisplay.id = 'balance-display';
  parent.appendChild(balanceDisplay);
  updateBalanceDisplay();
}

export function updateBalanceDisplay() {
  if (!balanceDisplay) return;

  const comeTotal = player.comeBets.reduce((t, b) => t + b.amount + (b.odds || 0), 0);
  const dontComeTotal = player.dontComeBets.reduce((t, b) => t + b.amount + (b.odds || 0), 0);
  const hardwayTotal = Object.values(player.hardways).reduce((t, v) => t + v, 0);
  const placeTotal = Object.values(player.placeBets).reduce((t, v) => t + v, 0);


  const parts = [
    `Pass Line: $${player.lineBet}`,
    player.lineOdds ? `Odds: $${player.lineOdds}` : null,
    player.dontPass ? `Don't Pass: $${player.dontPass}` : null,
    player.fieldBet ? `Field: $${player.fieldBet}` : null,
    comeTotal ? `Come: $${comeTotal}` : null,
    placeTotal ? `Place: $${placeTotal}` : null,

    dontComeTotal ? `Don't Come: $${dontComeTotal}` : null,
    hardwayTotal ? `Hardways: $${hardwayTotal}` : null
  ].filter(Boolean);

  const point = gameState.point ? ` | Point: ${gameState.point}` : '';

  balanceDisplay.innerText = `Balance: $${player.balance}${point}\n${parts.join(' | ')}`;
}
