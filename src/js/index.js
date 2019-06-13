// Main file that handles all the necessary logic.
const cytoscape = require('cytoscape');
const cxtmenu = require('cytoscape-cxtmenu');
const edgehandles = require('cytoscape-edgehandles');
const Ramble = require('./ramble.js');

const { style } = require('./styles.js');
const { colors } = require('./colors.js');

const ramble = new Ramble();

// Initialize dialog.
const dialogBox = $('#dialog');
$(() => {
  dialogBox.dialog({
    autoOpen: false,
  });
});

function generateCharacterList() {
  ramble.characters.list().then((results) => {
    $.each(results, (i, character) => {
      $('#characters').append($('<option>').text(character.name));
    });
  });
}

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
    const data = sourceNode.data();
    data.target = targetNode.id();
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
  ramble.dialogs.add(data).then((result) => {
    resolve(result);
  });
}));

const updateDialog = dialog => new Promise(((resolve) => {
  ramble.dialogs.update(dialog._id, dialog).then((updatedDialog) => {
    const node = cy.add({
      group: 'nodes',
      data: updatedDialog,
      position: {
        x: mouseX,
        y: mouseY,
      },
    });

    node.addClass('default');
    if (node.data('character')) {
      node.data('color', node.data('character').color);
      node.addClass('colored');
    }
    resolve();
  });
}));

const getDataFromForm = form => form.serializeArray().reduce((obj, item) => {
  const result = obj;
  result[item.name] = item.value;
  return result;
}, {});

$('#add-form').submit((e) => {
  e.preventDefault();

  const form = $(e.currentTarget);
  const data = getDataFromForm(form);
  const characterName = data.character;
  delete data.character;

  generateCharacter(characterName)
    .then(getCharacter)
    .then(character => saveDialog(data, character))
    .then(updateDialog)
    .then(() => {
      generateCharacterList();
      dialogBox.dialog('close');
      form.trigger('reset');
    });
});

const removeNode = node => new Promise(((resolve) => {
  ramble.dialogs.remove(node.id).then(() => {
    resolve(node);
  });
}));

const removeEdge = edge => new Promise(((resolve) => {
  const data = edge.source().data();
  data.target = null;
  ramble.dialogs.update(edge.source().id(), data).then(() => {
    cy.remove(edge);
    resolve();
  });
}));

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
        data.name = 'Some new name';
        ramble.dialogs.update(node.id(), data).then(() => {
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

cy.on('mouseover', 'node', (e) => {
  const node = e.target;
  node.removeClass('default').addClass('hover');
});

cy.on('mouseout', 'node', (e) => {
  const node = e.target;
  node.removeClass('hover').addClass('default');
});

ramble.dialogs.list().then((result) => {
  result.forEach((dialog) => {
    const data = dialog;
    data.id = dialog._id;
    const node = cy.add({
      group: 'nodes',
      data,
    });
    node.addClass('default');
    if (node.data('character')) {
      node.data('color', node.data('character').color);
      node.addClass('colored');
    }
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

  generateCharacterList();

  // Redrawing layout after adding nodes and edges.
  cy.layout({
    name: 'circle',
  }).run();
});
