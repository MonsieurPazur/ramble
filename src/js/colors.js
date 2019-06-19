const colors = {
  list: [
    '#efd78d',
    '#e97e2e',
    '#898886',
    '#874338',
    '#73a1b0',
    '#87806d',
    '#ff7e57',
    '#3c3642',
    '#85496f',
    '#a49375',
    '#c6612b',
    '#a23419',
  ],
  getRandom: (excluded) => {
    const available = this.colors.list
      .filter(x => !excluded.includes(x))
      .concat(excluded.filter(x => !this.colors.list.includes(x)));
    return available[Math.floor(Math.random() * available.length)];
  },
};

module.exports.colors = colors;
