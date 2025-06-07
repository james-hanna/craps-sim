export let messagePanel;

export function setupMessagePanel() {
  messagePanel = document.createElement('div');
  messagePanel.id = 'messagePanel';
}

export function displayMessage(text) {
  if (messagePanel) {
    messagePanel.textContent = text;
  }
}
