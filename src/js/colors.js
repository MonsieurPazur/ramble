const colors = {
  list: [
    '#341256',
    '#00aa23',
    '#76f10b',
    '#00ff44',
    '#99aa1f',
  ],
  getRandom: (excluded) => {
    const available = this.colors.list
      .filter(x => !excluded.includes(x))
      .concat(excluded.filter(x => !this.colors.list.includes(x)));
    return available[Math.floor(Math.random() * available.length)];
  },
};

module.exports.colors = colors;
