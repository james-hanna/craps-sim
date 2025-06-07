// src/ui/balance.js
import { player } from '../state/player.js';

let balanceDisplay;

export function initializeBalanceDisplay() {
  balanceDisplay = document.createElement('div');
  balanceDisplay.style.position = 'absolute';
  balanceDisplay.style.top = '120px';
  balanceDisplay.style.left = '20px';
  balanceDisplay.style.color = 'white';
  balanceDisplay.style.fontSize = '18px';
  document.body.appendChild(balanceDisplay);
  updateBalanceDisplay();
}

export function updateBalanceDisplay() {
  if (balanceDisplay) {
    balanceDisplay.innerText = `Balance: $${player.balance} | Bet: $${player.currentBet}`;
  }
}
