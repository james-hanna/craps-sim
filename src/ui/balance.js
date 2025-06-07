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
    balanceDisplay.innerText = `Balance: $${player.balance} | Bet: $${player.currentBet}`;
  }
}
