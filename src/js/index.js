// Main file that handles all the necessary logic.
const cytoscape = require('cytoscape');
const cxtmenu = require('cytoscape-cxtmenu');
const edgehandles = require('cytoscape-edgehandles');
const Ramble = require('./ramble.js');

const ramble = new Ramble();

// Initialize dialog.
const dialogBox = $('#dialog');
$(() => {
  dialogBox.dialog({
    autoOpen: false,
  });
});

let mouseX = 0;
let mouseY = 0;
$('#graph-container').mousedown((e) => {
  if (e.button === 2) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
});

const style = [
  {
    selector: 'node',
    style: {
      'background-color': '#666',
      label: 'data(name)',
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
];

// Register extensions.
cytoscape.use(edgehandles);
cytoscape.use(cxtmenu);

// Initialize cytoscape.
const cy = cytoscape({
  container: $('#graph-container'),
  elements: [],
  style,
  minZoom: 0.5,
  maxZoom: 2.0,
});

// Initialize edgehandles.
const ehOptions = {
  // Saving newly created edges
  complete(sourceNode, targetNode) {
    const data = sourceNode.data();
    data.target = targetNode.id();
    ramble.dialogs.update(sourceNode.id(), data, () => {});
  },
};
cy.edgehandles(ehOptions);

function removeEdge(edge) {
  const data = edge.source().data();
  data.target = null;
  ramble.dialogs.update(edge.source().id(), data, () => {
    cy.remove(edge);
  });
}

$('#add-form').submit((e) => {
  e.preventDefault();
  const form = $(e.currentTarget);

  const data = form.serializeArray().reduce((obj, item) => {
    obj[item.name] = item.value;
    return obj;
  }, {});

  ramble.dialogs.add(data, (created) => {
    created.id = created._id;
    ramble.dialogs.update(created._id, created, (updated) => {
      cy.add({
        group: 'nodes',
        data: updated,
        position: {
          x: mouseX,
          y: mouseY,
        },
      });
    });
  });

  dialogBox.dialog('close');
  form.trigger('reset');
});

// Initialize cxtmenu.
const menuEdgeOptions = {
  selector: 'edge',
  commands: [
    {
      content: 'Remove',
      select: removeEdge,
    },
    {
      content: '',
      select: null,
      enabled: false,
    },
    {
      content: '',
      select: null,
      enabled: false,
    },
  ],
};
const menuNodeOptions = {
  selector: 'node',
  commands: [
    {
      content: 'Remove',
      select(node) {
        const promise = new Promise((resolve) => {
          ramble.dialogs.remove(node.id(), () => {
            resolve();
          });
        });
        node.connectedEdges().forEach((edge) => {
          promise.then((result) => {
            removeEdge(edge);
            return result;
          });
        });
        promise.then((result) => {
          cy.remove(node);
          return result;
        });
      },
    },
    {
      content: 'Edit',
      select(node) {
        const data = node.data();
        data.name = 'Some new name';
        ramble.dialogs.update(node.id(), data, () => {
          node.data(data);
        });
      },
    },
    {
      content: '',
      select: null,
      enabled: false,
    },
  ],
};
const menuCoreOptions = {
  selector: 'core',
  commands: [
    {
      content: 'New',
      select() {
        dialogBox.dialog('open');
      },
    },
    {
      content: '',
      select: null,
      enabled: false,
    },
    {
      content: '',
      select: null,
      enabled: false,
    },
  ],
};
cy.cxtmenu(menuEdgeOptions);
cy.cxtmenu(menuNodeOptions);
cy.cxtmenu(menuCoreOptions);

ramble.dialogs.list((result) => {
  result.forEach((dialog) => {
    const data = dialog;
    data.id = dialog._id;
    cy.add({
      group: 'nodes',
      data,
    });
  });
  result.forEach((dialog) => {
    // If has specified target, create edge.
    if (dialog.target) {
      cy.add({
        group: 'edges',
        data: {
          id: (`${dialog.id}_${dialog.target}`),
          source: dialog.id,
          target: dialog.target,
        },
      });
    }
  });

  // Redrawing layout after adding nodes and edges.
  cy.layout({
    name: 'circle',
  }).run();
});
