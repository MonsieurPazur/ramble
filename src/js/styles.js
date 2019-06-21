const style = [
  {
    selector: 'node',
    style: {
      width: 60,
      height: 60,
      shape: 'round-rectangle',
      'transition-property': 'background-color',
      'transition-duration': '0.3s',
    },
  },
  {
    selector: 'node.default',
    style: {
      label: 'data(name)',
      'text-halign': 'center',
      'text-valign': 'bottom',
      'text-margin-y': 5,
      'font-size': '1.3em',
      'font-family': 'Montserrat',
    },
  },
  {
    selector: 'node.hover',
    style: {
      label: 'data(text)',
      'text-halign': 'right',
      'text-valign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': 200,
      'text-margin-x': 5,
      'font-size': '1.2em',
      'font-style': 'italic',
      'font-family': 'Merriweather',
    },
  },
  {
    selector: 'node.colored',
    style: {
      'background-color': 'data(color)',
    },
  },
  {
    selector: 'node.highlight',
    style: {
      'background-color': '#f8efb6',
    },
  },
  {
    selector: 'node.start',
    style: {
      shape: 'ellipse',
    },
  },
  {
    selector: 'edge',
    style: {
      width: 3,
      'line-color': '#546e7a',
      'target-arrow-color': '#546e7a',
      'arrow-scale': 1.5,
      'target-arrow-shape': 'triangle-backcurve',
      'curve-style': 'unbundled-bezier',
    },
  },
  {
    selector: '.eh-source',
    style: {
      'border-width': 4,
      'border-color': '#a23419',
    },
  },
  {
    selector: '.eh-target',
    style: {
      'background-color': '#a23419',
    },
  },
  {
    selector: '.eh-handle',
    style: {
      'background-color': '#a23419',
      width: 20,
      height: 20,
      'border-width': 5,
      'border-opacity': 0,
      shape: 'diamond',
    },
  },
];

module.exports.style = style;
