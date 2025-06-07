// src/logic/rollHandler.js
import { getTopFace } from '../dice/index';
import { player, gameState } from '../state/player';
import { updateBalanceDisplay } from '../ui/balance';
import { displayMessage } from '../ui/message';
import { clearChips, updateAllBetChips } from '../betting';

let rollTimer = 0;

function payoutOdds(point, amount) {
  switch (point) {
    case 4:
    case 10:
      return amount * 2;
    case 5:
    case 9:
      return Math.round(amount * 1.5);
    case 6:
    case 8:
      return Math.round(amount * 1.2);
    default:
      return amount;
  }
}

function payoutPlace(point, amount) {
  switch (point) {
    case 4:
    case 10:
      return Math.round(amount * 9 / 5);
    case 5:
    case 9:
      return Math.round(amount * 7 / 5);
    case 6:
    case 8:
      return Math.round(amount * 7 / 6);
    default:
      return 0;
  }
}

function resolveBets(r1, r2, total) {
  let messages = [];

  // Field bet (one roll)
  if (player.fieldBet > 0) {
    if ([3, 4, 9, 10, 11].includes(total)) {
      player.balance += player.fieldBet * 2;
      messages.push(`Field bet wins on ${total}!`);
    } else if (total === 2 || total === 12) {
      player.balance += player.fieldBet * 3;
      messages.push(`Field bet pays double on ${total}!`);
    } else {
      messages.push('Field bet loses.');
    }
    player.fieldBet = 0;
  }

  // Hardways
  const hardNumbers = [4, 6, 8, 10];
  for (const n of hardNumbers) {
    const amt = player.hardways[n];
    if (!amt) continue;
    const pair = n / 2;
    if (r1 === pair && r2 === pair) {
      const payout = n === 6 || n === 8 ? amt * 9 : amt * 7;
      player.balance += payout;
      messages.push(`Hard ${n} pays ${payout}!`);
      player.hardways[n] = 0;
    } else if (total === 7 || total === n) {
      player.hardways[n] = 0;
      messages.push(`Hard ${n} loses.`);
    }
  }

  // Place bets
  const placeNumbers = [4, 5, 6, 8, 9, 10];
  for (const n of placeNumbers) {
    const amt = player.placeBets[n];
    if (!amt) continue;
    if (total === n) {
      player.balance += payoutPlace(n, amt);
      messages.push(`Place ${n} pays!`);
    } else if (total === 7) {
      player.placeBets[n] = 0;
      messages.push(`Place ${n} loses.`);
    }
  }

  // Come bets
  player.comeBets = player.comeBets.filter(bet => {
    if (!bet.point) {
      if (total === 7 || total === 11) {
        player.balance += bet.amount * 2;
        messages.push(`Come bet wins on ${total}.`);
        return false;
      }
      if ([2, 3, 12].includes(total)) {
        messages.push(`Come bet loses on ${total}.`);
        return false;
      }
      bet.point = total;
      messages.push(`Come bet moves to ${total}.`);
      return true;
    }

    if (total === bet.point) {
      let win = bet.amount * 2;
      if (bet.odds) win += payoutOdds(bet.point, bet.odds) + bet.odds;
      player.balance += win;
      messages.push(`Come bet on ${bet.point} wins.`);
      return false;
    }
    if (total === 7) {
      messages.push(`Come bet on ${bet.point} loses.`);
      return false;
    }
    return true;
  });

  // Don't come bets
  player.dontComeBets = player.dontComeBets.filter(bet => {
    if (!bet.point) {
      if ([2, 3].includes(total)) {
        player.balance += bet.amount * 2;
        messages.push(`Don't come wins on ${total}.`);
        return false;
      }
      if (total === 7 || total === 11) {
        messages.push("Don't come loses.");
        return false;
      }
      if (total === 12) {
        player.balance += bet.amount;
        messages.push("Don't come pushes on 12.");
        return false;
      }
      bet.point = total;
      messages.push(`Don't come moves behind ${total}.`);
      return true;
    }

    if (total === 7) {
      let win = bet.amount * 2;
      if (bet.odds) win += payoutOdds(bet.point, bet.odds) + bet.odds;
      player.balance += win;
      messages.push(`Don't come on ${bet.point} wins.`);
      return false;
    }
    if (total === bet.point) {
      messages.push(`Don't come on ${bet.point} loses.`);
      return false;
    }
    return true;
  });

  // Pass line
  if (gameState.phase === 'comeOut') {
    if (player.lineBet > 0 || player.dontPass > 0) {
      if (total === 7 || total === 11) {
        if (player.lineBet > 0) {
          player.balance += player.lineBet * 2 + payoutOdds(total, player.lineOdds);
          player.lineBet = 0;
          player.lineOdds = 0;
          messages.push('Pass line wins.');
        }
        if (player.dontPass > 0) {
          messages.push("Don't pass loses.");
          player.dontPass = 0;
        }
        gameState.canBet = true;
        clearChips();
        updateAllBetChips();
      } else if ([2, 3, 12].includes(total)) {
        if (player.lineBet > 0) {
          messages.push('Pass line loses.');
          player.lineBet = 0;
          player.lineOdds = 0;
          clearChips();
          updateAllBetChips();
        }
        if (total === 12 && player.dontPass > 0) {
          player.balance += player.dontPass; // push
          messages.push("Don't pass pushes on 12.");
          player.dontPass = 0;
        } else if ([2, 3].includes(total) && player.dontPass > 0) {
          player.balance += player.dontPass * 2;
          messages.push("Don't pass wins.");
          player.dontPass = 0;
        }
        gameState.canBet = true;
      } else {
        gameState.phase = 'point';
        gameState.point = total;
        gameState.canBet = true; // allow odds/come
        messages.push(`Point is ${total}.`);
      }
    }
  } else if (gameState.phase === 'point') {
    if (total === gameState.point) {
      if (player.lineBet > 0) {
        let win = player.lineBet * 2;
        if (player.lineOdds) win += payoutOdds(gameState.point, player.lineOdds) + player.lineOdds;
        player.balance += win;
        messages.push('Pass line wins!');
      }
      if (player.dontPass > 0) {
        messages.push("Don't pass loses.");
      }
      player.lineBet = 0;
      player.dontPass = 0;
      player.lineOdds = 0;
      gameState.phase = 'comeOut';
      gameState.point = null;
      gameState.canBet = true;
      clearChips();
      updateAllBetChips();
    } else if (total === 7) {
      if (player.lineBet > 0) messages.push('Pass line loses.');
      if (player.dontPass > 0) {
        player.balance += player.dontPass * 2;
        messages.push("Don't pass wins!");
      }
      player.lineBet = 0;
      player.dontPass = 0;
      player.lineOdds = 0;
      gameState.phase = 'comeOut';
      gameState.point = null;
      gameState.canBet = true;
      clearChips();
      updateAllBetChips();
    }
  }

  return messages.join(' ');
}

export function checkRoll(dice) {
  if (!dice || dice.length !== 2) return false;

  const [d1, d2] = dice;
  const still1 = d1.body.velocity.length() < 0.1 && d1.body.angularVelocity.length() < 0.1;
  const still2 = d2.body.velocity.length() < 0.1 && d2.body.angularVelocity.length() < 0.1;

  if (still1 && still2) {
    rollTimer += 1 / 60;
    if (rollTimer >= 1.2) {
      const r1 = getTopFace(d1);
      const r2 = getTopFace(d2);
      const total = r1 + r2;
      gameState.lastRoll = total;

      const message = resolveBets(r1, r2, total) || `You rolled ${total}.`;

      displayMessage(message);
      updateBalanceDisplay();
      updateAllBetChips();
      return true; // roll resolved
    }
  } else {
    rollTimer = 0;
  }

  return false; // still rolling
}

