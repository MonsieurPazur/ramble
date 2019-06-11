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
cytoscape.use(edgehandles)

// Initialize cytoscape.
let cy = cytoscape({
	container: $('#graph-container'),
	elements: [],
	style: style,
	layout: {
		name: 'circle'
	},
	minZoom: 0.5,
	maxZoom: 2.0,
})

// Initialize edgehandles.
const options = {
	// Saving newly created edges
	complete: function(sourceNode, targetNode, addedEles) {
		let data = sourceNode.data()
		data.target = targetNode.id()
		ramble.dialogs.update(sourceNode.id(), data, function(result) {})
	}
}
let eh = cy.edgehandles(options)

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
})
