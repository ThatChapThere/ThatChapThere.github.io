window.onload=function () {
/**********************************************************************
RULES:
* Must be a potentially individual genus of dinosaur. No birds or early archosaurs
* 1 x 1080p jpeg image with capitalised genus name facing left to right white bars
* extra images from 01-99
* species listed as though genus is common ancestor, even though this is not neccesarily always the case
**********************************************************************/

var ctx = document.getElementsByTagName('canvas')[0].getContext('2d'); // get context to draw

var canvasSize = new P(1800, 800); //cartesian for the size of the canvas

var colours = {
	'text' : '#000',
	'branches' : '#FFEB00',
	'background' : '#fff',
}

function getOffset(left) {//true=left, false=top
	var offset=0;
	if(left){
		var element=ctx.canvas;
		while(element != document.body){
			offset+=element.offsetLeft;
			element=element.offsetParent;
		}
		offset+=element.offsetLeft;
	}else{
		var element=ctx.canvas;
		while(element != document.body){
			offset+=element.offsetTop;
			element=element.offsetParent;
		}
		offset+=element.offsetTop;
	}
	return(offset);
}

var translation = {
	'x':0,
	'y':22.5,
	'zoom':1,
}//for zoom and dragging

function P(x,y){this.x=x;this.y=y} // Cartesian point

var dragStart = new P(0,0); // start of mouse drag
var dragStartTranslation = new P(0,0); // how far mouse dragged
var mousePosition = new P(0,0); // mouse position relative to canvas
var mouseIsDown = false; // if the mouse is held down

document.body.onmousemove = function (event) {
	mousePosition.x = event.clientX - getOffset(true);
	mousePosition.y = event.clientY - getOffset(false); // set up mouse position variable
	
	if(mouseIsDown) {
		translation.x = (mousePosition.x - dragStart.x) / translation.zoom + dragStartTranslation.x;
		translation.y = (mousePosition.y - dragStart.y) / translation.zoom + dragStartTranslation.y; // drag canvas by correct amount
		drawTree();
	}
}

document.body.onmousedown = function() { // when mouse is pressed
	dragStart.x = mousePosition.x;
	dragStart.y = mousePosition.y; // set up where the drag started on the screen
	
	dragStartTranslation.x = translation.x;
	dragStartTranslation.y = translation.y; // the translation at the start of the drag
	
	mouseIsDown = true;
}

document.body.onmouseup = function() {
	mouseIsDown = false;
	drawTree();
}

function Genus (earliest, latest, discovery, length, synonyms, possibleDuplicate) { //this is for the database, not the tree
	this.earliest = earliest; //mya
	this.latest = latest; //mya
	this.discovery = discovery; //A.D
	this.length = length; //m]
	this.synonyms = synonyms;// array
	this.possibleDuplicate = possibleDuplicate;// string
	this.image = document.createElement("img");
}

function Node(name, x, y, children) { // nodes for the detailed tree
	this.name = name;
	this.x = x;
	this.y = y;
	this.children = children;
}

/***********************************************************************
 * CONVENTION:
 * A - Genus
 * a - Species
 * # - Hidden name
 * @ - shown name
************************************************************************/

var genera = { //genera database
	'Aardonyx' : new Genus(195, 195, 2010, 7, [], ''),
	'Abelisaurus' : new Genus(83.6, 72.1, 1985, 7.4, [], ''),
	'Abrictosaurus' : new Genus(200, 190, 1974, 1.2, [], 'Lycorhinus'),
	'Abrosaurus' : new Genus(170, 163, 1989, 9, [], ''),
	'Abydosaurus' : new Genus(104, 104, 2010, 20, [], ''),
	'Acanthopholis' : new Genus(145, 100, 1867, 5, [], ''),
	'Achelousaurus' : new Genus(74.2, 71.2, 1994, 6, [], ''),
	'Acheroraptor' : new Genus(66, 66, 2013, 3, [], ''),
	'Achillesaurus' : new Genus(86.3, 83.6, 2007, 1.5, [], 'Alvarezsaurus'),
	'Achillobator' : new Genus(98, 83, 1999, 5.5, [], ''),
	'Acristavus' : new Genus(81, 76, 2011, 5.5, [], ''),
	'Acrocanthosaurus' : new Genus(125, 100, 1950, 11.5, ['Acracanthus'], ''),
	'Acrotholus' : new Genus(86.3, 83.6, 2013, 1.8, [''], ''),
	'Adamantisaurus' : new Genus(93, 70, 2006, 13, [''], ''),
	'Adasaurus' : new Genus(71, 69, 1983, 1.8, [''], ''),
	'Adelolophus' : new Genus(83.6, 72.1, 2014, 14, [''], ''),
	'Adeopapposaurus' : new Genus(199, 174, 2009, 3, [''], ''),
	'Aegyptosaurus' : new Genus(113, 94, 1932, 15, [''], ''),
	'Aeolosaurus' : new Genus(83, 74, 1987, 14, [''], ''),
	'Aepisaurus' : new Genus(100, 100, 1852, 18, [''], ''),
	'Aepyornithomimus' : new Genus(80, 10, 2017, 2, [''], ''),
}

var tree = { // basic tree
	'@Dinosauria' : '@Dinosauria',
		'@Saurischia' : '@Dinosauria',
			'@Sauropodomorpha' : '@Saurischia',
				'#Plateosauridae1' : '@Sauropodomorpha',
					'#Riojasauridae1' : '#Plateosauridae1',
						'#Massospondylidae1' : '#Riojasauridae1',
							'#Yunnanosaurus1' : '#Massospondylidae1',
								'@Anchisauria' : '#Yunnanosaurus1',
									'#Aardonyx1' : '@Anchisauria',
										'Aardonyx' : '#Aardonyx1',
											'celestae' : 'Aardonyx',
							'@Massospondylidae' : '#Massospondylidae1',
								'Adeopapposaurus' : '@Massospondylidae',
									'mognai' : 'Adeopapposaurus',
				'@Sauropoda' : '@Sauropodomorpha',
					'#Antetonitrus1' : '@Sauropoda',
						'#Vulcanodon1' : '#Antetonitrus1',
							'#Spinophorosaurus1' : '#Vulcanodon1',
								'@Eusauropoda' : '#Spinophorosaurus1',
									'#Barapasaurus1' : '@Eusauropoda',
										'#Patagosaurus1' : '#Barapasaurus1',
											'#Mamenchisauridae1' : '#Patagosaurus1',
												'#Cetiosaurus1' : '#Mamenchisauridae1',
													'#Jobaria1' : '#Cetiosaurus1',
														'@Neosauropoda' : '#Jobaria1',
															'@Macronaria' : '@Neosauropoda',
																'Aepisaurus' : '@Macronaria',
																	'elephantinus' : 'Aepisaurus',
																'#Camarasauridae1' : '@Macronaria',
																	'@Camarasauridae' : '#Camarasauridae1',
																		'Abrosaurus' : '@Camarasauridae',
																			'dongpoi' : 'Abrosaurus',
																	'#Tehuelchesaurus1' : '#Camarasauridae1',
																		'@Titanosauriformes' : '#Tehuelchesaurus1',
																			'@Brachiosauridae' : '@Titanosauriformes',
																				'#Europasaurus1' : '@Brachiosauridae',
																					'#Giraffatitan2' : '#Europasaurus1',
																						'#Brachiosaurus1' : '#Giraffatitan2',
																							'Abydosaurus' : '#Brachiosaurus1',
																								'mcintoshi' : 'Abydosaurus',
																			'@Titanosauria' : '@Titanosauriformes',
																				'@Lithostrotia' : '@Titanosauria',
																					'@Saltasauroidea' : '@Lithostrotia',
																						'@Aeolosaurini' : '@Saltasauroidea',
																							'Adamantisaurus' : '@Aeolosaurini',
																								'mezzalirai' : 'Adamantisaurus',
																							'Aeolosaurus' : '@Aeolosaurini',
																								'maximus' : 'Aeolosaurus',
																								'#colhuehuapensis1' : 'Aeolosaurus',
																									'colhuehuapensis' : '#colhuehuapensis1',
																									'rionegrinus' : '#colhuehuapensis1',
																					'@Lognkosauria' : '@Lithostrotia',
																						'Aegyptosaurus' : '@Lognkosauria',
																							'baharijensis' : 'Aegyptosaurus',
		'@Ornithoscelida' : '@Dinosauria',
			'@Theropoda' : '@Ornithoscelida',
				'#Eoraptor1' : '@Theropoda',
					'#Eodromaeus1' : '#Eoraptor1',
						'#Daemonosaurus1' : '#Eodromaeus1',
							'#Tawa1' : '#Daemonosaurus1',
								'@Neotheropda' : '#Tawa1',
									'#Dilophosauridae1' : '@Neotheropda',
										'@Averostra' : '#Dilophosauridae1',
											'@Ceratosauria' : '@Averostra',
												'@Abelisauroidea' : '@Ceratosauria',
													'@Abelisauridae' : '@Abelisauroidea',
														'#Ceratosauridae1' : '@Abelisauridae',
															'#Rugops1' : '#Ceratosauridae1',
																'#Abelisaurus1' : '#Rugops1',
																	'Abelisaurus' : '#Abelisaurus1',
																		'comahuensis' : 'Abelisaurus',
											'@Tetanurae' : '@Averostra',
												'@Orionides' : '@Tetanurae',
													'@Avetheropoda' : '@Orionides',
														'@Coelurosauria' : '@Avetheropoda',
															'@Tyrannoraptora' : '@Coelurosauria',
																'@Maniraptoriformes' : '@Tyrannoraptora',
																	'@Maniraptora' : '@Maniraptoriformes',
																		'@Aveairfoila' : '@Maniraptora',
																			'@Pennaraptora' : '@Aveairfoila',
																				'@Paraves' : '@Pennaraptora',
																					'@Eumaniraptora' : '@Paraves',
																						'@Dromaeosauridae' : '@Eumaniraptora',
																							'@Eudromaeosauria' : '@Dromaeosauridae',
																								'@Velociraptorinae' : '@Eudromaeosauria',
																									'Adasaurus' : '@Velociraptorinae',
																										'mongoliensis' : 'Adasaurus',
																									'#Acheroraptor1' : '@Velociraptorinae',
																										'Acheroraptor' : '#Acheroraptor1',
																											'temertyorum' : 'Acheroraptor',
																								'@Dromaeosaurinae' : '@Eudromaeosauria',
																									'Achillobator' : '@Dromaeosaurinae',
																										 'giganticus' : 'Achillobator',
																		'@Alvarezsauroidea' : '@Maniraptora',
																			'@Alvarezsauridae' : '@Alvarezsauroidea',
																				'#Alvarezsaurus1' : '@Alvarezsauridae',
																					'#Achillesaurus1' : '#Alvarezsaurus1',
																						'Achillesaurus' : '#Achillesaurus1',
																							'manazzonei' : 'Achillesaurus',
																	'@Ornithomimosauria' : '@Maniraptoriformes',
																		'Aepyornithomimus' : '@Ornithomimosauria',
																			'tugrikinensis' : 'Aepyornithomimus',
														'@Allosauroidea' : '@Avetheropoda',
															'@Allosauria' : '@Allosauroidea',
																'@Carcharodontosauria' : '@Allosauria',
																	'@Carcharodontosauridae' : '@Carcharodontosauria',
																		'Acrocanthosaurus' : '@Carcharodontosauridae',
																			'atokensis' : 'Acrocanthosaurus',
			'@Ornithischia' : '@Ornithoscelida',
				'#Heterodontosauridae1' : '@Ornithischia',
					'@Heterodontosauridae' : '#Heterodontosauridae1',
						'@Heterodontosaurinae' : '@Heterodontosauridae',
							'#Heterodontosaurus2' : '@Heterodontosaurinae',
								'#Heterodontosaurus1' : '#Heterodontosaurus2',
									'Abrictosaurus' : '#Heterodontosaurus1',
										'consors' : 'Abrictosaurus',
					'#Eocursor1' : '#Heterodontosauridae1',
						'@Genasauria' : '#Eocursor1',
							'#Lesothosaurus1' : '@Genasauria',
								'#Thyreophora1' : '#Lesothosaurus1',
									'@Thyreophora' : '#Thyreophora1',
										'#Scutellosaurus1' : '@Thyreophora',
											'#Emausaurus1' : '#Scutellosaurus1',
												'#Scelidosaurus1' : '#Emausaurus1',
													'#Stegosauria1' : '#Scelidosaurus1',
														'@Ankylosauria' : '#Stegosauria1',
															'@Nodosauridae' : '@Ankylosauria',
																'#Acanthopholis1' : '@Nodosauridae',
																	'Acanthopholis' : '#Acanthopholis1',
																		'horrida' : 'Acanthopholis',
							'@Neornithischia' : '@Genasauria',
								'#Agilisaurus1' : '@Neornithischia',
									'#Hexinlusaurus1' : '#Agilisaurus1',
										'#Jeholosauridae1' : '#Hexinlusaurus1',
											'#Othnielosaurus1' : '#Jeholosauridae1',
												'#Parksosauridae1' : '#Othnielosaurus1',
													'@Cerapoda' : '#Parksosauridae1',
														'@Marginocephalia' : '@Cerapoda',
															'@Ceratopsia' : '@Marginocephalia',
																'#Psittacosauridae1' : '@Ceratopsia',
																	'@Neoceratopsia' : '#Psittacosauridae1',
																		 '#Liaoceratops1' : '@Neoceratopsia',
																			'#Archaeoceratops1' : '#Liaoceratops1',
																				 '#Auroraceratops1' : '#Archaeoceratops1',
																					'@Coronosauria' : '#Auroraceratops1',
																						 '#Leptoceratopsidae1' : '@Coronosauria',
																							'@Ceratopsidae' : '#Leptoceratopsidae1',
																								'#Ceratops1' : '@Ceratopsidae',
																									 '#Centrosaurinae1' : '#Ceratops1',
																										 '@Centrosaurinae' : '#Centrosaurinae1',
																											'#Nasutoceratopsini1' : '@Centrosaurinae',
																												'#Xenoceratops1' : '#Nasutoceratopsini1',
																													'#Albertaceratops1' : '#Xenoceratops1',
																														'@Eucentrosaura' : '#Albertaceratops1',
																															'@Pachyrhinosaurini' : '@Eucentrosaura',
																																'@Pachyrostra' : '@Pachyrhinosaurini',
																																	'Achelousaurus' : '@Pachyrostra',
																																		'horneri' : 'Achelousaurus',
															'@Pachycephalosauria' : '@Marginocephalia',
																 '@Pachycephalosauridae' : '@Pachycephalosauria',
																	'Acrotholus' : '@Pachycephalosauridae',
																		'audeti' : 'Acrotholus',
														'@Ornithopoda' : '@Cerapoda',
															'@Iguanodontia' : '@Ornithopoda',
																'@Dryomorpha' : '@Iguanodontia',
																	'@Ankylopollexia' : '@Dryomorpha',
																		'@Styracosterna' : '@Ankylopollexia',
																			'@Hadrosauriformes' : '@Styracosterna',
																				'@Hadrosauromorpha' : '@Hadrosauriformes',
																					'@Hadrosauridae' : '@Hadrosauromorpha',
																						'@Saurolophidae' : '@Hadrosauridae',
																							'@Saurolophinae' : '@Saurolophidae',
																								'@Brachylophosaurini' : '@Saurolophinae',
																									'Acristavus' : '@Brachylophosaurini',
																										'gagslarsoni' : 'Acristavus',
																							'@Lambeosaurinae' : '@Saurolophidae',
																								'Adelolophus' : '@Lambeosaurinae',
																										'hutchisoni' : 'Adelolophus',
}

var treeHeight = canvasSize.y - 20; // height for the tree

ctx.canvas.width = canvasSize.x;
ctx.canvas.height = canvasSize.y; // set the canvas to the size just specified

ctx.fillStyle = '#fff';//fill style white

ctx.fillRect(0, 0, canvasSize.x, canvasSize.y);//draw background

var treeWithDetails = {};//tree with metadata added

treeWithDetails['@Dinosauria'] = new Node('@Dinosauria', 0, canvasSize.y / 2, [] ); // preset the root node to avoid errors

function getTreeDepth(name) { // get the depth of a node
	var depth = 1;
	
	while(name != '@Dinosauria' && depth < 30) {
		depth ++;
		name = tree[name];
	}
	
	return(depth);
}

function getPositionDelta(depth) { // height of a node vs its ancestor
	return( Math.pow(0.5 , depth)  *  treeHeight); // halves for each depth level
}

function getIntermediate(a, b) {
	return( (a+b) / 2 );
}

var branchWidthScale = 1; // branch width compared to height

for(var i in tree) { // set up detailed tree
	if(i != '@Dinosauria'){
		
		treeWithDetails[i] = new Node(i, getTreeDepth(i) * 100, 100, [] ); // the detailed tree now has a node for the current dinosaur
		
		if(! treeWithDetails[tree[i]] ){ // if the next ancestor does not have a node,
			
			treeWithDetails[tree[i]] = new Node(i, 100, 100, [] ); // create one
			
		}else if( treeWithDetails[tree[i]].children.length ){ // if ancestor already has a child
			
			treeWithDetails[i].x = treeWithDetails[tree[i]].x + getPositionDelta(getTreeDepth(i)) * branchWidthScale; // shift by calculated value
			treeWithDetails[i].y = treeWithDetails[tree[i]].y + getPositionDelta(getTreeDepth(i)); // shift by calculated value
			
		}else{ // if first child
			
			treeWithDetails[i].x = treeWithDetails[tree[i]].x + getPositionDelta(getTreeDepth(i)) * branchWidthScale; // shift by calculated value
			treeWithDetails[i].y = treeWithDetails[tree[i]].y - getPositionDelta(getTreeDepth(i)); // shift by calculated value
			
		}
		
		treeWithDetails[tree[i]].children.push(i); // add the name of the current dinosaur
		
		//~ console.log(getTreeDepth(i));
	}
}

function drawTree() {
	
	if(translation.zoom < 1){
		translation.zoom = 1;
	}
	
	if(translation.x > 0){
		translation.x = 0;
	}
	
	if(translation.y > 50){
		translation.y = 50;
	}
	
	if(translation.y < 0 - canvasSize.y){
		translation.y = 0 - canvasSize.y;
	}
	
	if(translation.x < 0 - canvasSize.x){
		translation.x = 0 - canvasSize.x;
	}
	
	ctx.fillStyle = colours.background;//fill style white
	ctx.fillRect(0, 0, canvasSize.x, canvasSize.y);//draw background
	
	for(var i in tree) {
		
		if(i != '@Dinosauria'){
			ctx.strokeStyle = colours.branches;
			ctx.beginPath();
			
			ctx.moveTo(
				(treeWithDetails[tree[i]].x + translation.x) * translation.zoom,
				(treeWithDetails[tree[i]].y + translation.y) * translation.zoom
			);
			//point of ancestor, apply zoom
			ctx.bezierCurveTo(
				(getIntermediate(treeWithDetails[i].x, treeWithDetails[tree[i]].x) + translation.x) * translation.zoom,
				(treeWithDetails[tree[i]].y + translation.y) * translation.zoom,
				(getIntermediate(treeWithDetails[i].x, treeWithDetails[tree[i]].x) + translation.x) * translation.zoom,
				(treeWithDetails[i].y + translation.y) * translation.zoom,
				(treeWithDetails[i].x + translation.x) * translation.zoom,
				(treeWithDetails[i].y + translation.y) * translation.zoom,
			);
			ctx.stroke();
			ctx.beginPath(); // draw a line to next ancestor
		}
	}
	
	for(var i in tree) {
		ctx.fillStyle=colours.text;
		
		var displayName = '';
		
		switch(i[0]){
			case '@':
				displayName = i.substring(1);
				ctx.font = "bold 10pt Georgia";
				break;
			case '#':
				displayName = '';
				break;
			default:
				displayName = i;
				ctx.font = "italic 10pt Georgia";
				try{
					genera[i].image.src = 'images/' + i + '.jpg';
					ctx.drawImage(
						genera[i].image,
						(treeWithDetails[i].x + translation.x) * translation.zoom + 150,
						(treeWithDetails[i].y + translation.y) * translation.zoom - 45,
						160,
						90
						
					);
				}catch(e){
					//~ console.log(e);
				}
		}
		ctx.fillText(
			displayName,
			(treeWithDetails[i].x + translation.x) * translation.zoom,
			(treeWithDetails[i].y + translation.y) * translation.zoom
		);
	}
	
}

drawTree();
setTimeout(drawTree, 50); // so images are loaded

ctx.canvas.onmousewheel = function(e) {
	//~ console.log(e.wheelDelta);
	
	var mousePositionOnTree = new P(
		translation.x + (mousePosition.x / translation.zoom),
		translation.y + (mousePosition.y / translation.zoom)
	);
	
	translation.zoom *= 1 + e.wheelDelta / 1000;
	
	var newMousePositionOnTree = new P(
		translation.x + (mousePosition.x / translation.zoom),
		translation.y + (mousePosition.y / translation.zoom)
	);
	
	translation.x += newMousePositionOnTree.x - mousePositionOnTree.x;
	translation.y += newMousePositionOnTree.y - mousePositionOnTree.y;
	
	//~ console.log(mousePositionOnTree.x - newMousePositionOnTree.x);
	
	drawTree();
}

//**********************************************************************
}
