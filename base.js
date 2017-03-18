
var url = "https://api.spotify.com/v1/search?q={name}&type=artist";
var relatedArtist = "https://api.spotify.com/v1/artists/{id}/related-artists"
var artistOne = "Death Cab";
var artistTwo = "Vince Staples";
var artistIdOne; 
var maxRelated = 3;

var queueNewArtistsOne = [];
//var queueNewArtistsTwo = [];
//queueNewArtistsTwo.push(artistIdTwo);


function processQueue(queue, graph) {
	var newArtistId = queue.shift();
	if (graph.nodes.get(newArtistId) === null) {
		getNameFromId(newArtistId, function (data) {
			if (graph.nodes.get(newArtistId) === null) {
				graph.nodes.add({
					label: data,
					id:    newArtistId,
				});
			}
			console.log(graph)
		});
		getRelatedArtists(newArtistId, function (relatedArtists) {
			if (relatedArtists !== undefined) {
				for(var k = 0; k < Math.min(relatedArtists.length, maxRelated); k++) {
					var relatedArtist = relatedArtists[k];
					graph.edges.add({
						from: newArtistId,
						to:   relatedArtist.id
					})
					queue.push(relatedArtist.id);
				}
				console.log(graph);
			}
		});
	}
}

function getIdFromName(name, callback) {
	var ajax = new XMLHttpRequest();
	var searchUrl = "https://api.spotify.com/v1/search?q={name}&type=artist";
	searchUrl = searchUrl.replace("{name}", name);
	ajax.open("GET", searchUrl, true);
	ajax.send(null);
	ajax.onload = function() {
		var data = JSON.parse(ajax.responseText).artists.items[0].id;
		console.log(data);
		callback(data);
	}
}

function getRelatedArtists(baseArtistId, callback) {
	var ajax = new XMLHttpRequest();
	if (baseArtistId !== undefined) {
		var relatedArtistUrl = "https://api.spotify.com/v1/artists/{id}/related-artists"
		relatedArtistUrl = relatedArtistUrl.replace("{id}", baseArtistId);
		ajax.open("GET", relatedArtistUrl, true);
		ajax.send(null);
		ajax.onload = function () {
			var data = JSON.parse(ajax.responseText).artists;
			callback(data);
		}
	}
}

function getNameFromId(id, callback) {
	var ajax = new XMLHttpRequest();
	var searchUrl = "https://api.spotify.com/v1/artists/{id}";
	searchUrl = searchUrl.replace("{id}", id);
	ajax.open("GET", searchUrl, true);
	ajax.send(null);
	ajax.onload = function () {
		var data = JSON.parse(ajax.responseText).name;
		callback(data);
	}
}

var options = {
  autoResize: true,
  height: '100%',
  width: '100%',
  locale: 'en',
  clickToUse: false,
  layout: {
  	  improvedLayout: false,
  },
  physics: {
       enabled: true,
       stabilization: {
       	enabled: true,
       },
  	   timestep: 0.2,
  },
}

// create a network
var container = document.getElementById('mynetwork');

function addNodesAndEdges(graph, nodes, edges) {
	for(var id in graph) {
		nodes.push({
			id: id,
			label: graph[id].name,
		});
		var artistAndRelated = graph[id];
		for (var relatedId in artistAndRelated.related) {
			// console.log(artistAndRelated.related);
			// console.log(relatedId);
			edges.push({
				from: id,
				to:   relatedId,
			});
		}
	}
}

var nodes = [];
var edges = [];

var nodesSet = new vis.DataSet(nodes);
var edgesSet = new vis.DataSet(edges);

// provide the data in the vis format
var dataSet = {
    nodes: nodesSet,
    edges: edgesSet,
};

// initialize your network!
var network = new vis.Network(container, dataSet, options);


document.getElementById("search").addEventListener("click", function(){
    artistOne = document.getElementById("musician").value;

    getIdFromName(artistOne, function(data) {
	artistIdOne = data;
	queueNewArtistsOne.push(artistIdOne);

	var intervalCalls = 0;
	var interval = setInterval(function () { 
		processQueue(queueNewArtistsOne, dataSet); 
		intervalCalls++;

		if(intervalCalls > (document.getElementById("time") || 100)) {
			window.clearInterval(interval);
		}
	}, 1000);
});
});
