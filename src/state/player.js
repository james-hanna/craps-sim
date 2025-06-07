export const player = {
  balance: 500,
  currentBet: 0
};

export const gameState = {
  phase: 'comeOut',
  point: null,
  lastRoll: null,
  canBet: true
};

export function updateBalanceDisplay(balanceDisplay) {
  balanceDisplay.innerText = `Balance: $${player.balance} | Bet: $${player.currentBet}`;
}

export function displayMessage(messagePanel, text) {
  messagePanel.textContent = text;
}
