class MessageComponent {
  constructor() {
    this.container = $('#message-container');
    this.timeout = [];
    this.effectDuration = 300;
    this.timeout.error = 4000 + this.effectDuration;
    this.timeout.success = 2000 + this.effectDuration;
  }

  addMessage(type, text) {
    const message = $(`<div class="message ${type}">${text}</div>`);
    this.container.append(message);
    message.hide();
    message.show('drop', { direction: 'up' }, this.effectDuration, () => {
      setTimeout(() => {
        message.fadeOut(this.effectDuration, () => {
          $(this).remove();
        });
      }, this.timeout[type]);
    });
  }

  success(text) {
    this.addMessage('success', text);
  }

  error(text) {
    this.addMessage('error', text);
  }
}

module.exports = MessageComponent;
