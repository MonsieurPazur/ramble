// Main file that handles all the necessary logic.
const Ramble = require('./ramble.js')
let ramble = new Ramble()

const style = [
	{
		selector: 'node',
		style: {
			'background-color': '#666',
			'label': 'data(name)'
		}
	},
	{
		selector: 'edge',
		style: {
			'width': 3,
			'line-color': '#ccc',
			'target-arrow-color': '#ccc',
			'target-arrow-shape': 'triangle-backcurve',
			'curve-style': 'unbundled-bezier'
		}
	}
]
const cytoscape = require('cytoscape')

// Register extensions.
const edgehandles = require('cytoscape-edgehandles')
const cxtmenu = require('cytoscape-cxtmenu')
cytoscape.use(edgehandles)
cytoscape.use(cxtmenu)

// Initialize cytoscape.
let cy = cytoscape({
	container: $('#graph-container'),
	elements: [],
	style: style,
	minZoom: 0.5,
	maxZoom: 2.0,
})

// Initialize edgehandles.
const ehOptions = {
	// Saving newly created edges
	complete: function(sourceNode, targetNode, addedEles) {
		let data = sourceNode.data()
		data.target = targetNode.id()
		ramble.dialogs.update(sourceNode.id(), data, function(result) {})
	}
}
let eh = cy.edgehandles(ehOptions)

// Initialize cxtmenu.
const menuOptions = {
	selector: 'edge',
	commands: [
		{
			content: 'Remove',
			select: function(edge) {
				let data = edge.source().data()
				data.target = null
				ramble.dialogs.update(edge.source().id(), data, function(result) {
					cy.remove(edge)
				})
			}
		}
	]
}
let menu = cy.cxtmenu(menuOptions)

ramble.dialogs.list(function(result) {
	result.forEach(function(dialog) {
		let data = dialog
		data.id = dialog._id
		cy.add({
			group: 'nodes',
			data: data
		})
	})
	result.forEach(function(dialog) {

		// If has specified target, create edge.
		if (dialog.target) {
			cy.add({
				group: 'edges',
				data: {
					id: (dialog.id + '_' + dialog.target),
					source: dialog.id,
					target: dialog.target
				}
			})
		}
	})

	// Redrawing layout after adding nodes and edges.
 	cy.layout({
		name: 'circle'
	}).run()
})

