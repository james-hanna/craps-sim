export const player = {
  balance: 500,
  // Pass line bet
  lineBet: 0,
  // Don't pass bet
  dontPass: 0,
  // Active come bets { amount, point, odds }
  comeBets: [],
  // Active don't come bets { amount, point, odds }
  dontComeBets: [],
  // One-roll field bet
  fieldBet: 0,
  // Hardway bets keyed by number (4,6,8,10)
  hardways: {
    4: 0,
    6: 0,
    8: 0,
    10: 0
  },

  // Place bets keyed by number (4,5,6,8,9,10)
  placeBets: {
    4: 0,
    5: 0,
    6: 0,
    8: 0,
    9: 0,
    10: 0
  },

  // Odds on the pass line
  lineOdds: 0
};

export const gameState = {
  phase: 'comeOut',
  point: null,
  lastRoll: null,
  canBet: true
};

export function updateBalanceDisplay(balanceDisplay) {
  const comeTotal = player.comeBets.reduce((t, b) => t + b.amount + (b.odds || 0), 0);
  const dontComeTotal = player.dontComeBets.reduce((t, b) => t + b.amount + (b.odds || 0), 0);
  const hardwayTotal = Object.values(player.hardways).reduce((t, v) => t + v, 0);
  const placeTotal = Object.values(player.placeBets).reduce((t, v) => t + v, 0);
  const totalBet =
    player.lineBet + player.dontPass + comeTotal + dontComeTotal + placeTotal + player.fieldBet + hardwayTotal + player.lineOdds;
  balanceDisplay.innerText = `Balance: $${player.balance} | Total Bets: $${totalBet}`;
}

export function displayMessage(messagePanel, text) {
  messagePanel.textContent = text;
}
