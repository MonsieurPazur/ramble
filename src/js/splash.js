const TypeIt = require('typeit');

new TypeIt('#header', {
  speed: 100,
  startDelay: 300,
  afterComplete: () => {
    $('#header').animate({
      opacity: 0,
    }, 300, () => {
      window.location.href = './menu.html';
    });
  },
})
  .type('Ramble')
  .pause(300)
  .options({ speed: 200 })
  .type('...')
  .pause(500)
  .options({ speed: 100 })
  .delete()
  .go();
