const TypeIt = require('typeit');

new TypeIt('#header', {
  speed: 100,
  startDelay: 1000,
  afterComplete: () => {
    $('#header').animate({
      opacity: 0,
    }, 500, () => {
      window.location.href = './menu.html';
    });
  },
})
  .type('Ramble')
  .pause(500)
  .options({ speed: 500 })
  .type('...')
  .pause(500)
  .options({ speed: 100 })
  .delete()
  .go();
