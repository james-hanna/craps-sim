// src/game/logic.js
import { getTopFace } from '../dice';
import { player, gameState } from '../state/player';
import { clearChips } from '../betting';
import { updateBalanceDisplay } from '../ui/balance';
import { displayMessage } from '../ui/message';

let rollTimer = 0;

export function checkRoll(dice) {
  if (!dice.length || !gameState.waitingForRollToSettle) return;

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

      let message = '';

      if (gameState.phase === 'comeOut') {
        if (total === 7 || total === 11) {
          message = `🎯 You rolled ${total} — Natural! You win!`;
          player.balance += player.lineBet * 2;
          player.lineBet = 0;
          gameState.canBet = true;
          clearChips();
        } else if ([2, 3, 12].includes(total)) {
          message = `💀 You rolled ${total} — Craps! You lose.`;
          player.lineBet = 0;
          gameState.canBet = true;
          clearChips();
        } else {
          gameState.phase = 'point';
          gameState.point = total;
          gameState.canBet = false;
          message = `Point is now set to ${total}. Roll again to hit the point before a 7.`;
        }
      } else if (gameState.phase === 'point') {
        if (total === gameState.point) {
          message = `🎉 You hit the point (${total}) — You win!`;
          player.balance += player.lineBet * 2;
          player.lineBet = 0;
          gameState.phase = 'comeOut';
          gameState.point = null;
          gameState.canBet = true;
          clearChips();
        } else if (total === 7) {
          message = `💥 You rolled a 7 before the point — You lose.`;
          player.lineBet = 0;
          gameState.phase = 'comeOut';
          gameState.point = null;
          gameState.canBet = true;
          clearChips();
        } else {
          message = `You rolled ${total}. Keep going!`;
        }
      }

      displayMessage(message);
      updateBalanceDisplay();
      gameState.waitingForRollToSettle = false;
      rollTimer = 0;
    }
  } else {
    rollTimer = 0;
  }
}
