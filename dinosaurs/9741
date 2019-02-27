<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
	<title>Phylogeny</title>
	<meta http-equiv="content-type" content="text/html;charset=utf-8" />
	<meta name="generator" content="Geany 1.30.1" />
	<style>
body{
	margin: 0;
}
	</style>
</head>

<body>
	<canvas></canvas>
	<!--<br/>
	<button id="evo">Evolutionary model</button>
	<button id="cre">Creation model</button>
	-->
</body>
<script>
/***********************************************************************

Each creature has a genome property

There is a function for calculating distance between two genomes

Then a function creates a tree from the genomes

Then a function arranges the nodes for drawing

Properties:
	Creature:
		Parent node
		Genome
	Node:
		Child nodes
		Child creatures
		Representative child genome

***********************************************************************/

//*******************************GRAPHICS SETUP*************************

var canvasSize = {
	'x' : 1600,
	'y' : 900,
}

var ctx=document.getElementsByTagName('canvas')[0].getContext('2d');
ctx.canvas.width = canvasSize.x;
ctx.canvas.height = canvasSize.y;
//********************************VARIABLES*****************************

var nodes = [];

var creatureY = canvasSize.y * 0.95;
var treeWidth = canvasSize.x * 0.95;
var levelHeight = canvasSize.y * 0.3;

var minimunGap = levelHeight * 0.5;

var genomeSize = 9;
var mutationRate = 0.05;

var geneWeights = [1, 4, 3, 1, 1, 1, 1, 1, 1];
//********************************FUNCTIONS*****************************

function generateGenome() {
	var genome = [];
	
	for(var i = 0; i < genomeSize; i++) {
		genome.push(Math.random() > 0.5 ? true : false);
	}
	
	return(genome);
}

function mutateGenome(genome) {
	var newGenome = [];
	
	for(var i = 0; i < genomeSize; i++) {
		if(Math.random() < mutationRate) {
			newGenome.push(!genome[i]);
		}else{
			newGenome.push(genome[i]);
		}
	}
	
	return(newGenome);
}

function getGenomeDistance(genome1, genome2) {
	var distance = 0;
	
	for(var i = 0; i < genomeSize; i++) {
		if(genome1[i] != genome2[i]) {
			distance += geneWeights[i];
		}
	}
	
	return(distance);
}

function generateTree() {
	var nodesSoFar = [];
	var previousNodesSoFar = [];
	
	// fill just with all creatures
	for(var i = 0; i < nodes.length; i++) {
		nodesSoFar.push(nodes[i]);
		previousNodesSoFar.push(nodes[i]);
	}
	
	while(nodesSoFar.length > 1) {
		
		// loop through all nodes and find the closest two
	
		var minimumDistance = Infinity;
		var miniumDistanceIndices = [0, 1];
		
		for(var i = 0; i < nodesSoFar.length - 1; i++) {
			for(var j = i + 1; j < nodesSoFar.length; j++) {
				var distance = getGenomeDistance(
					nodesSoFar[i].genome,
					nodesSoFar[j].genome
				);
				
				if(distance < minimumDistance) {
					minimumDistance = distance;
					miniumDistanceIndices = [i, j];
				}
			}
		}
		
		// create a parent node
		nodes.push(new Node(
			nodesSoFar[miniumDistanceIndices[0]].genome,
			false,
			[
				nodesSoFar[miniumDistanceIndices[0]],
				nodesSoFar[miniumDistanceIndices[1]]
			]
		));
		
		// set this as the parent for both child nodes
		nodesSoFar[miniumDistanceIndices[0]].parentNode = nodes[nodes.length - 1];
		nodesSoFar[miniumDistanceIndices[1]].parentNode = nodes[nodes.length - 1];
		
		// place this in the current treeforming array
		nodesSoFar = [nodes[nodes.length - 1]];
		
		// fill up with all of the nodes except for the two children
		for(var i = 0; i < previousNodesSoFar.length; i++) {
			if(i != miniumDistanceIndices[1] && i != miniumDistanceIndices[0]) {
				nodesSoFar.push(previousNodesSoFar[i]);
			}
		}
		
		previousNodesSoFar = [];
		
		for(var i = 0; i < nodesSoFar.length; i++) {
			previousNodesSoFar.push(nodesSoFar[i]);
		}
	}
}

function generateNodePositions(node, depth, xPosition) {
	var children = node.childNodes;
	
	if(children) {
		var child0 = children[0];
		var child1 = children[1];
		
		child0.position.x = 
			xPosition - Math.pow(0.5, depth) * treeWidth/4;
		child0.position.y = (depth + 1) * levelHeight;
		
		child1.position.x = 
			xPosition + Math.pow(0.5, depth) * treeWidth/4;
		child1.position.y = (depth + 1) * levelHeight;
		
		generateNodePositions(
			child0, depth + 1, child0.position.x
		);
		generateNodePositions(
			child1, depth + 1, child1.position.x
		);
		
		node.position.y = 
			creatureY -
			levelHeight * 
			getGenomeDistance(child0.genome, child1.genome) -
			minimunGap / Math.pow(1.2, depth);
	}
	
	if(node.isCreature) {
		node.position.y = creatureY;
	}
}

function normaliseNodePositions() {
	var scaleFactor = creatureY / 
		(creatureY - nodes[nodes.length - 1].position.y);
	
	var creatures = 0;
	
	for(var i = 0; i < nodes.length; i++) {
		nodes[i].position.y = 
			creatureY -
			((creatureY - nodes[i].position.y) * scaleFactor);
			
		if(nodes[i].isCreature) {
			creatures++;
		}
	}
	/*
	var i;
	
	for(i = 0; nodes[i].isCreature; i++) {
		nodes[i].position.x = treeWidth * (i+1) / (creatures + 1);
	}
	
	for(void(0); i < nodes.length; i++) {
		var node = nodes[i];
		var children = node.childNodes;
		
		var child0 = children[0];
		var child1 = children[1];
		
		node.position.x = (child0.position.x + child1.position.x) / 2;
	}
	//*/
}

function drawTree() {
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].parentNode) {
			ctx.beginPath();
			ctx.moveTo(nodes[i].position.x, nodes[i].position.y);
			ctx.lineTo(
				nodes[i].parentNode.position.x,
				nodes[i].parentNode.position.y
			);
			ctx.stroke();
		}
		
		var name = nodes[i].name;
		if(name) {
			ctx.fillStyle = '#000';
			ctx.fillText(name, nodes[i].position.x, nodes[i].position.y + 30);
		}
	}
}

//***************************OBJECT PROTOTYPES**************************

function Node(genome, isCreature, childNodes, name) {
	this.genome = genome;
	this.isCreature = isCreature;
	this.childNodes = childNodes;
	this.name = name;
	
	this.parentNode = undefined;
	
	this.position = {
		'x' : canvasSize.x * 0.5,
		'y' : 0
	}
}

//******************************TREE GENERATION*************************

function createTree(background) {
	nodes = [
		new Node([0, 1, 1, 1, 0, 1, 1, 1, 1], true, false, 'Cat'),
		new Node([1, 0, 0, 0, 0, 1, 0, 1, 0], true, false, 'Spider'),
		new Node([0, 1, 1, 1, 0, 1, 1, 1, 1], true, false, 'Horse'),
		new Node([0, 1, 0, 0, 0, 0, 0, 1, 0], true, false, 'Shark'),
		new Node([0, 1, 1, 0, 0, 0, 0, 1, 0], true, false, 'Haddock'),
		new Node([1, 0, 0, 0, 0, 1, 0, 1, 0], true, false, 'Fly'),
		new Node([0, 1, 1, 0, 1, 0, 1, 1, 1], true, false, 'Bird'),
		new Node([0, 1, 1, 0, 1, 0, 0, 1, 1], true, false, 'Crocodile'),
	];
	
	nodes = [];
	
	var genomes = [generateGenome()];
	
	for(var i = 0; i < 5; i++) {
		for(var j = 0; j < genomes.length / 2; j++) {
			var genome = genomes[j];
			genome = mutateGenome(genome);
			genomes.push(mutateGenome(genome));
		}
	}
	
	for(var i = 0; i < 32; i++) {
		nodes.push(
			new Node(
				genomes[i],
				true,
				false,
				''
			)
		);
	}
	
	generateTree();
	
	if(background) {
		ctx.fillStyle = '#E0E0E0';
		ctx.fillRect(0,0,canvasSize.x,canvasSize.y);
	}
	
	generateNodePositions(nodes[nodes.length - 1], 0, canvasSize.x * 0.5);
	
	normaliseNodePositions();
	
	drawTree();
}

createTree(true);

onkeyup = function(event) {
	if(event.keyCode == 32) {
		createTree(false);
	}
}

/*
document.getElementById('evo').onclick = function() {
	mutationRate = 0.005;
	createTree(true);
}

document.getElementById('cre').onclick = function() {
	mutationRate = 0.5;
	createTree(true);
}
//*/

</script>
</html>
