// src/ui/balance.js
import { player } from '../state/player.js';

let balanceDisplay;

export function initializeBalanceDisplay(parent = document.body) {
  balanceDisplay = document.createElement('div');
  balanceDisplay.id = 'balance-display';
  parent.appendChild(balanceDisplay);
  updateBalanceDisplay();
}

export function updateBalanceDisplay() {
  if (balanceDisplay) {
    const comeTotal = player.comeBets.reduce((t, b) => t + b.amount + (b.odds || 0), 0);
    const dontComeTotal = player.dontComeBets.reduce((t, b) => t + b.amount + (b.odds || 0), 0);
    const hardwayTotal = Object.values(player.hardways).reduce((t, v) => t + v, 0);
    const totalBet =
      player.lineBet + player.dontPass + comeTotal + dontComeTotal + player.fieldBet + hardwayTotal + player.lineOdds;
    balanceDisplay.innerText = `Balance: $${player.balance} | Total Bets: $${totalBet}`;
  }
}
