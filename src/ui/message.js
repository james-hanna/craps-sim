export let messagePanel;

export function setupMessagePanel() {
  messagePanel = document.createElement('div');
  messagePanel.style.color = 'white';
  messagePanel.style.fontSize = '18px';
  messagePanel.style.marginTop = '10px';
  messagePanel.style.maxWidth = '320px';
}

export function displayMessage(text) {
  if (messagePanel) {
    messagePanel.textContent = text;
  }
}
