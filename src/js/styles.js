const style = [
  {
    selector: 'node',
    style: {
      width: 60,
      height: 60,
      shape: 'round-rectangle',
    },
  },
  {
    selector: 'node.default',
    style: {
      label: 'data(name)',
      'text-halign': 'center',
      'text-valign': 'bottom',
      'text-margin-y': 5,
      'font-style': 'bold',
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
      'font-style': 'italic',
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
      'border-width': 4,
      'border-color': 'yellow',
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
      'line-color': '#ccc',
      'target-arrow-color': '#ccc',
      'target-arrow-shape': 'triangle-backcurve',
      'curve-style': 'unbundled-bezier',
    },
  },
  {
    selector: '.eh-source',
    style: {
      'border-width': 2,
      'border-color': 'red',
    },
  },
  {
    selector: '.eh-target',
    style: {
      'background-color': 'red',
    },
  },
  {
    selector: '.eh-handle',
    style: {
      'background-color': 'red',
      width: 20,
      height: 20,
      'border-width': 5,
      'border-opacity': 0,
      shape: 'diamond',
    },
  },
];

module.exports.style = style;
