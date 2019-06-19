// Main file that handles all the necessary logic.
const cytoscape = require('cytoscape');
const cxtmenu = require('cytoscape-cxtmenu');
const edgehandles = require('cytoscape-edgehandles');

const Ramble = require('./Ramble.js');
const MessageComponent = require('./component/MessageComponent.js');

const { style } = require('./styles.js');
const { colors } = require('./colors.js');

const ramble = new Ramble();
const messages = new MessageComponent();

// Initialize dialogs.
const nodeDialogBox = $('#node-dialog');
$(() => {
  nodeDialogBox.dialog({
    autoOpen: false,
  });
});

const generateCharacterList = () => {
  $('#characters').empty();
  ramble.characters.list().then((results) => {
    $.each(results, (i, character) => {
      $('#characters').append($('<option>').text(character.name));
    });
  });
};

let mouseX = 0;
let mouseY = 0;
$('#graph-container').mousedown((e) => {
  if (e.button === 2) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
});

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
  hoverDelay: 50,
  snap: true,
  // Saving newly created edges
  complete(sourceNode, targetNode) {
    const data = { $addToSet: { targets: targetNode.id() } };
    ramble.dialogs.update(sourceNode.id(), data);
  },
};
cy.edgehandles(ehOptions);

const generateCharacter = name => new Promise(((resolve) => {
  ramble.characters.list().then((characters) => {
    const excludedColors = [];
    $.each(characters, (i, character) => {
      excludedColors.push(character.color);
    });
    const color = colors.getRandom(excludedColors);
    const data = {
      name,
      color,
    };
    resolve(data);
  });
}));

const getCharacter = character => new Promise(((resolve) => {
  ramble.characters.get(character.name).then((existingCharacter) => {
    if (existingCharacter) {
      resolve(existingCharacter);
    } else {
      ramble.characters.add(character).then((newCharacter) => {
        resolve(newCharacter);
      });
    }
  });
}));

const saveDialog = (dialog, character) => new Promise(((resolve) => {
  const data = dialog;
  data.character = character;
  data.targets = [];
  ramble.dialogs.add(data).then((result) => {
    resolve(result);
  });
}));

const updateNodeColors = (node) => {
  node.addClass('default');
  if (node.data('character')) {
    node.data('color', node.data('character').color);
    node.addClass('colored');
  }
};

const spawnDialog = dialog => new Promise(((resolve) => {
  ramble.dialogs.update(dialog._id, dialog).then((updatedDialog) => {
    const data = updatedDialog;
    data.id = updatedDialog._id;
    const node = cy.add({
      group: 'nodes',
      data,
      position: {
        x: mouseX,
        y: mouseY,
      },
    });

    updateNodeColors(node);
    resolve(updatedDialog);
  });
}));

const editDialog = (dialog, character) => new Promise(((resolve) => {
  const _id = dialog.id;
  let data = dialog;
  data.character = character;

  // Removing this, so we don't accidentally set id.
  delete data.id;

  // Used to update node in graph.
  const updateData = data;
  data = { $set: data };
  ramble.dialogs.update(_id, data).then((updatedDialog) => {
    const node = cy.$id(_id);
    node.data(updateData);
    updateNodeColors(node);
    resolve(updatedDialog);
  });
}));

const updatePosition = node => new Promise(((resolve) => {
  const data = { $set: { position: node.position() } };
  ramble.dialogs.update(node.id(), data).then((updatedDialog) => {
    resolve(updatedDialog);
  });
}));

const getDataFromForm = form => form.serializeArray().reduce((obj, item) => {
  const result = obj;
  result[item.name] = item.value;
  return result;
}, {});

// Initialize forms.
const nodeForm = $('#node-form');
const searchForm = $('#search-form');

const populateNodeForm = (data) => {
  $.each(data, (name, value) => {
    nodeForm.find(`[name="${name}"]`).val(value);
  });
  nodeForm.find('[name="character"]').val(data.character.name);
};

nodeForm.submit((e) => {
  e.preventDefault();

  const form = $(e.currentTarget);
  const data = getDataFromForm(form);
  const characterName = data.character;
  delete data.character;

  if (data.id) {
    // Edit
    generateCharacter(characterName)
      .then(getCharacter)
      .then(character => editDialog(data, character))
      .then(() => {
        generateCharacterList();
        nodeDialogBox.dialog('close');
        form.trigger('reset');
      });
  } else {
    // Add
    delete data.id;
    generateCharacter(characterName)
      .then(getCharacter)
      .then(character => saveDialog(data, character))
      .then(spawnDialog)
      .then(() => {
        generateCharacterList();
        nodeDialogBox.dialog('close');
        form.trigger('reset');
      });
  }
});

searchForm.submit((e) => {
  e.preventDefault();

  const form = $(e.currentTarget);
  const data = getDataFromForm(form);

  ramble.search(data.phrase)
    .then((results) => {
      if (results.length === 0) {
        messages.error('Nothing found.');
      } else {
        $.each(results, (i, result) => {
          const node = cy.$id(result._id);
          node.addClass('highlight');
        });
      }
    })
    .then(() => {
      form.trigger('reset');
    });
});
$(document).keyup((e) => {
  if (e.key === 'Escape') {
    $.each(cy.nodes(), (i, node) => {
      node.removeClass('highlight');
    });
  }
});

const removeNode = node => new Promise(((resolve) => {
  ramble.dialogs.remove(node.id()).then(() => {
    resolve(node);
  });
}));

const removeEdge = edge => new Promise(((resolve) => {
  const data = { $pull: { targets: edge.target().id() } };
  ramble.dialogs.update(edge.source().id(), data).then(() => {
    cy.remove(edge);
    resolve();
  });
}));

const updateNodeTypes = () => {
  $.each(cy.nodes(), (i, node) => {
    if (node.data('start')) {
      node.addClass('start');
    } else {
      node.removeClass('start');
    }
  });
};

const unmarkStart = () => new Promise((resolve) => {
  $.each(cy.nodes(), (i, node) => {
    node.data({ start: false });
  });
  resolve();
});

const markAsStart = (node) => {
  ramble.dialogs.markAsStart(node.id()).then(() => {
    node.data({ start: true });
    updateNodeTypes();
  });
};

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
          resolve(node);
        });
        promise.then(removeNode);
        node.connectedEdges().forEach((edge) => {
          promise.then(removeEdge(edge));
        });
        promise.then(() => {
          cy.remove(node);
        });
      },
    },
    {
      content: 'Edit',
      select(node) {
        const data = node.data();
        nodeDialogBox.dialog('open');
        populateNodeForm(data);
      },
    },
    {
      content: 'Mark as <strong>Start</strong>',
      select(node) {
        unmarkStart()
          .then(markAsStart(node));
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
const menuCoreOptions = {
  selector: 'core',
  commands: [
    {
      content: 'New',
      select() {
        nodeDialogBox.dialog('open');
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

cy.on('mouseover', 'node', (e) => {
  const node = e.target;
  node.removeClass('default').addClass('hover');
});

cy.on('mouseout', 'node', (e) => {
  const node = e.target;
  node.removeClass('hover').addClass('default');
});

cy.on('dragfree', 'node', (e) => {
  const node = e.target;
  updatePosition(node);
});

cy.on('add', 'node', (e) => {
  const node = e.target;
  updatePosition(node);
});

ramble.dialogs.list().then((result) => {
  result.forEach((dialog) => {
    const data = dialog;
    data.id = dialog._id;

    const nodeData = {
      group: 'nodes',
      data,
    };
    if (data.position) {
      nodeData.position = data.position;
    }
    const node = cy.add(nodeData);
    updateNodeColors(node);
  });
  result.forEach((dialog) => {
    // If has specified target, create edge.
    if (dialog.targets) {
      dialog.targets.forEach((target) => {
        cy.add({
          group: 'edges',
          data: {
            id: (`${dialog.id}_${target}`),
            source: dialog.id,
            target,
          },
        });
      });
    }
  });

  generateCharacterList();
  updateNodeTypes();

  // Redrawing layout after adding nodes and edges.
  const options = {
    name: 'preset',
    zoom: 1,
    fit: false,
  };
  cy.layout(options).run();
});
