window.onload=function () {
/**********************************************************************
RULES:
* Must be a potentially individual genus of dinosaur. No birds or early archosaurs
* 1 x 1080p jpeg image with capitalised genus name facing left to right white bars
* extra images from 01-99
* species listed as though genus is common ancestor, even though this is not neccesarily always the case
**********************************************************************/

var ctx = document.getElementsByTagName('canvas')[0].getContext('2d'); // get context to draw

function P(x,y) {
	this.x=x;
	this.y=y;
} // Cartesian point

var imageOnCanvasSize = new P(
	160,
	90
);

var textMaximumLength = 150;
var textSize = 10;

var canvasSize = new P(
	window.innerWidth / 2.5 + imageOnCanvasSize.x + textMaximumLength,
	window.innerWidth / 2.5
); //cartesian for the size of the canvas

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

var dragStart = new P(0,0); // start of mouse drag
var dragStartTranslation = new P(0,0); // how far mouse dragged
var mousePosition = new P(0,0); // mouse position relative to canvas
var mouseIsDown = false; // if the mouse is held down

var mobileZoomRatio = 2;

var clickDelayTime = 200;
var isFastClick = false;
function fastClickTimeUp() {
	isFastClick = false;
}

ctx.canvas.onmousemove = function (event) {
	mousePosition.x = event.clientX - getOffset(true);
	mousePosition.y = event.clientY - getOffset(false); // set up mouse position variable
	
	if(mouseIsDown) {
		translation.x = (mousePosition.x - dragStart.x) / translation.zoom + dragStartTranslation.x;
		translation.y = (mousePosition.y - dragStart.y) / translation.zoom + dragStartTranslation.y; // drag canvas by correct amount
		drawTree();
	}
}

ctx.canvas.onmousedown = function() { // when mouse is pressed
	dragStart.x = mousePosition.x;
	dragStart.y = mousePosition.y; // set up where the drag started on the screen
	
	dragStartTranslation.x = translation.x;
	dragStartTranslation.y = translation.y; // the translation at the start of the drag
	
	isFastClick = true;
	setTimeout(fastClickTimeUp, clickDelayTime);
	
	mouseIsDown = true;
}

ctx.canvas.onmouseup = function() {
	mouseIsDown = false;
	
	if(isFastClick){
		var mousePositionOnTree = new P(
			translation.x + (mousePosition.x / translation.zoom),
			translation.y + (mousePosition.y / translation.zoom)
		);
		
		translation.zoom *= mobileZoomRatio;
		
		var newMousePositionOnTree = new P(
			translation.x + (mousePosition.x / translation.zoom),
			translation.y + (mousePosition.y / translation.zoom)
		);
		
		translation.x += newMousePositionOnTree.x - mousePositionOnTree.x;
		translation.y += newMousePositionOnTree.y - mousePositionOnTree.y;
	}
	
	drawTree();
	
	fillDetailsDivider( getPositionTaxonName(mousePosition) );
	
	return false;
}

document.getElementById('zoom_out_button').onclick = function() {
	
	mousePosition.x = canvasSize.x / 2;
	mousePosition.y = canvasSize.y / 2;
	
	var mousePositionOnTree = new P(
		translation.x + (mousePosition.x / translation.zoom),
		translation.y + (mousePosition.y / translation.zoom)
	);
	
	translation.zoom /= mobileZoomRatio;
	
	var newMousePositionOnTree = new P(
		translation.x + (mousePosition.x / translation.zoom),
		translation.y + (mousePosition.y / translation.zoom)
	);
	
	translation.x += newMousePositionOnTree.x - mousePositionOnTree.x;
	translation.y += newMousePositionOnTree.y - mousePositionOnTree.y;
	
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
	'Acrotholus' : new Genus(86.3, 83.6, 2013, 1.8, [], ''),
	'Adamantisaurus' : new Genus(93, 70, 2006, 13, [], ''),
	'Adasaurus' : new Genus(71, 69, 1983, 1.8, [], ''),
	'Adelolophus' : new Genus(83.6, 72.1, 2014, 14, [], ''),
	'Adeopapposaurus' : new Genus(199, 174, 2009, 3, [], ''),
	'Aegyptosaurus' : new Genus(113, 94, 1932, 15, [], ''),
	'Aeolosaurus' : new Genus(83, 74, 1987, 14, [], ''),
	'Aepisaurus' : new Genus(100, 100, 1852, 18, [], ''),
	'Aepyornithomimus' : new Genus(80, 10, 2017, 2, [], ''),
	'Aerosteon' : new Genus(84, 83, 2009, 9, [], ''),
	'Afromimus' : new Genus(140, 100, 2017, 2, [], ''),
	'Afrovenator' : new Genus(167, 161, 1994, 8, [], ''),
	'Agathaumas' : new Genus(66, 66, 1872, 9, [], 'Triceratops'),
	'Agilisaurus' : new Genus(171.6, 161.2, 1990, 2, [], ''),
	'Agnosphitys' : new Genus(205.6, 201.6, 2002, 3, [], ''),
	'Agrosaurus' : new Genus(205.6, 201.6, 1891, 3, [], 'Thecodontosaurus'),
	'Agujaceratops' : new Genus(205.6, 201.6, 1989, 4.75, [''], ''),
	'Agustinia' : new Genus(116, 110, 1999, 15, [], ''),
	'Ahshislepelta' : new Genus(76, 72, 2011, 4, [], ''),
	'Ajancingenia' : new Genus(85, 66, 1981, 1.4, [], 'Heyuannia'),
	'Ajkaceratops' : new Genus(86, 83, 2010, 1, [], ''),
	'Alamosaurus' : new Genus(67, 66, 1922, 34, [], ''),
	'Alaskacephale' : new Genus(72, 71, 2005, 4.5, [], 'Pachycephalosaurus'),
	'Albalophosaurus' : new Genus(140, 130, 2009, 2, [], ''),
	'Albertaceratops' : new Genus(80, 73, 2007, 5.8, [], ''),
	'Albertadromeus' : new Genus(80, 73, 2013, 1.5, [], ''),
	'Albertavenator' : new Genus(71, 66, 2017, 2, [], ''),
	'Albertonykus' : new Genus(71, 66, 2008, 0.7, [], ''),
	'Albertonykus' : new Genus(71, 66, 2008, 0.7, [], ''),
	'Albertosaurus' : new Genus(73, 67, 1905, 10, ['Deinodon'], ''),
	'Albinykus' : new Genus(86, 72, 2011, 0.5, [], ''),
	'Alcovasaurus' : new Genus(156, 151, 2016, 7, [], ''),
	'Alectrosaurus' : new Genus(84, 71, 1933, 5, [], ''),
	'Aletopelta' : new Genus(84, 71, 2001, 6, [], ''),
	'Algoasaurus' : new Genus(145, 136, 1904, 9, [], ''),
	'Alioramus' : new Genus(71, 66, 1976, 6, [], ''),
} 

var geologicalTimeRange = [250, 201, 145, 66];
var discoveryTimeRange = [1824, 2020];

var tree = { // basic tree
	'@Dinosauria' : '@Dinosauria',
		'@Saurischia' : '@Dinosauria',
			'@Sauropodomorpha' : '@Saurischia',
				'@Guaibasauridae' : '@Sauropodomorpha',
					'Agnosphitys' : '@Guaibasauridae',
						'cromhallensis' : 'Agnosphitys',
				'#Thecodontosauridae1' : '@Sauropodomorpha',
					'@Thecodontosauridae' : '#Thecodontosauridae1',
						'Agrosaurus' : '@Thecodontosauridae',
							'macgillivrayi' : 'Agrosaurus',
					'#Plateosauridae1' : '#Thecodontosauridae1',
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
						'@Sauropoda' : '#Plateosauridae1',
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
																	'Algoasaurus' : '@Neosauropoda',
																		'bauri' : 'Algoasaurus',
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
																					'@Somphospondyli' : '@Titanosauriformes',
																						'Agustinia' : '@Somphospondyli',
																							'ligabuei' : 'Agustinia',
																						'@Titanosauria' : '@Somphospondyli',
																							'@Lithostrotia' : '@Titanosauria',
																								'@Saltasauroidea' : '@Lithostrotia',
																									'@Saltasauridae' : '@Saltasauroidea',
																										'@Opisthocoelicaudiinae' : '@Saltasauridae',
																											'Alamosaurus' : '@Opisthocoelicaudiinae',
																												'sanjuanensis' : 'Alamosaurus',
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
																				'@Oviraptorosauria' : '@Pennaraptora',
																					'@Caenagnathoidea' : '@Oviraptorosauria',
																						'@Oviraptoridae' : '@Caenagnathoidea',
																							'Ajancingenia' : '@Oviraptoridae',
																								'yanshini' : 'Ajancingenia',
																				'@Paraves' : '@Pennaraptora',
																					'@Eumaniraptora' : '@Paraves',
																						'@Deinonychosauria' : '@Eumaniraptora',
																							'Troodontidae' : '@Deinonychosauria',
																								'Albertavenator' : 'Troodontidae',
																									'curriei' : 'Albertavenator',
																							'@Dromaeosauridae' : '@Deinonychosauria',
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
																				'@Parvicursorinae' : '@Alvarezsauridae',
																					'@Ceratonykini' : '@Parvicursorinae',
																						'Albinykus' : '@Ceratonykini',
																							 'baatar' : 'Albinykus',
																					'@Mononykini' : '@Parvicursorinae',
																						'Albertonykus' : '@Mononykini',
																							'borealis' : 'Albertonykus',
																				'@Patagonykinae' : '@Alvarezsauridae',
																					'Achillesaurus' : '@Patagonykinae',
																						'manazzonei' : 'Achillesaurus',
																	'@Ornithomimosauria' : '@Maniraptoriformes',
																		'Afromimus' : '@Ornithomimosauria',
																			'tenerensis' : 'Afromimus',
																		'Aepyornithomimus' : '@Ornithomimosauria',
																			'tugrikinensis' : 'Aepyornithomimus',
																'@Tyrannosauroidea' : '@Tyrannoraptora',
																	'#Alectrosaurus1' : '@Tyrannosauroidea',
																		'Alectrosaurus' : '#Alectrosaurus1',
																			'olseni' : 'Alectrosaurus',
																			'#Alioramini1' : '#Alectrosaurus1',
																				'@Alioramini' : '#Alioramini1',
																					'Alioramus' : '@Alioramini',
																						'remotus' : 'Alioramus',
																						'altai' : 'Alioramus',
																			'@Tyrannosauridae' : '#Alioramini1',
																				'Albertosaurus' : '@Tyrannosauridae',
																					'sarcophagus' : 'Albertosaurus',
																	'@Megaraptora' : '@Tyrannosauroidea',
																		'Aerosteon' : '@Megaraptora',
																			'riocoloradense' : 'Aerosteon',
														'@Allosauroidea' : '@Avetheropoda',
															'@Allosauria' : '@Allosauroidea',
																'@Carcharodontosauria' : '@Allosauria',
																	'@Carcharodontosauridae' : '@Carcharodontosauria',
																		'Acrocanthosaurus' : '@Carcharodontosauridae',
																			'atokensis' : 'Acrocanthosaurus',
													'@Megalosauroidea' : '@Orionides',
														'@Megalosauria' : '@Megalosauroidea',
															'@Megalosauridae' : '@Megalosauria',
																'@Afrovenatorinae' : '@Megalosauridae',
																	'Afrovenator' : '@Afrovenatorinae',
																		'abakensis' : 'Afrovenator',
			'@Ornithischia' : '@Ornithoscelida',
				'#Heterodontosauridae1' : '@Ornithischia',
					'@Heterodontosauridae' : '#Heterodontosauridae1',
						'@Heterodontosaurinae' : '@Heterodontosauridae',
							'#Heterodontosaurus2' : '@Heterodontosaurinae',
								'#Heterodontosaurus1' : '#Heterodontosaurus2',
									'Abrictosaurus' : '#Heterodontosaurus1',
										'consors' : 'Abrictosaurus',
					'@Genasauria' : '#Heterodontosauridae1',
						'#Lesothosaurus1' : '@Genasauria',
							'#Thyreophora1' : '#Lesothosaurus1',
								'@Thyreophora' : '#Thyreophora1',
									'#Scutellosaurus1' : '@Thyreophora',
										'#Emausaurus1' : '#Scutellosaurus1',
											'#Scelidosaurus1' : '#Emausaurus1',
												'@Eurypoda' : '#Scelidosaurus1',
													'@Stegosauria' : '@Eurypoda',
														'@Stegosauridae' : '@Stegosauria',
															'Alcovasaurus' : '@Stegosauridae',
																'longispinus' : 'Alcovasaurus',
													'@Ankylosauria' : '@Eurypoda',
														'@Nodosauridae' : '@Ankylosauria',
															'#Acanthopholis1' : '@Nodosauridae',
																'Acanthopholis' : '#Acanthopholis1',
																	'horrida' : 'Acanthopholis',
														'@Ankylosauridae' : '@Ankylosauria',
															'Aletopelta' : '@Ankylosauridae',
																'coombsi' : 'Aletopelta',
															'@Ankylosaurinae' : '@Ankylosauridae',
																'Ahshislepelta' : '@Ankylosaurinae',
																	'minor' : 'Ahshislepelta',
						'@Neornithischia' : '@Genasauria',
							'#Agilisaurus1' : '@Neornithischia',
								'Agilisaurus' : '#Agilisaurus1',
									'louderbacki' : 'Agilisaurus',
								'#Hexinlusaurus1' : '#Agilisaurus1',
									'#Jeholosauridae1' : '#Hexinlusaurus1',
										'#Othnielosaurus1' : '#Jeholosauridae1',
											'#Parksosauridae1' : '#Othnielosaurus1',
												'@Parksosauridae' : '#Parksosauridae1',
													'@Orodrominae' : '@Parksosauridae',
														'Albertadromeus' : '@Orodrominae',
															'syntarsus' : 'Albertadromeus',
												'@Cerapoda' : '#Parksosauridae1',
													'@Marginocephalia' : '@Cerapoda',
														'@Ceratopsia' : '@Marginocephalia',
															'Albalophosaurus' : '@Ceratopsia',
																'yamaguchiorum' : 'Albalophosaurus',
															'#Psittacosauridae1' : '@Ceratopsia',
																'@Neoceratopsia' : '#Psittacosauridae1',
																	 '#Liaoceratops1' : '@Neoceratopsia',
																		'#Archaeoceratops1' : '#Liaoceratops1',
																			'#Auroraceratops1' : '#Archaeoceratops1',
																				'@Coronosauria' : '#Auroraceratops1',
																					'@Protoceratopsidae' : '@Coronosauria',
																						'@Bagaceratopidae' : '@Protoceratopsidae',
																							'Ajkaceratops' : '@Bagaceratopidae',
																								'kozmai' : 'Ajkaceratops',
																					'#Leptoceratopsidae1' : '@Coronosauria',
																						'@Ceratopsidae' : '#Leptoceratopsidae1',
																							'@Centrosaurinae' : '@Ceratopsidae',
																								'#Nasutoceratopsini1' : '@Centrosaurinae',
																									'#Xenoceratops1' : '#Nasutoceratopsini1',
																										'#Albertaceratops1' : '#Xenoceratops1',
																											'Albertaceratops' : '#Albertaceratops1',
																												'nesmoi' : 'Albertaceratops',
																											'@Eucentrosaura' : '#Albertaceratops1',
																												'@Pachyrhinosaurini' : '@Eucentrosaura',
																													'@Pachyrostra' : '@Pachyrhinosaurini',
																														'Achelousaurus' : '@Pachyrostra',
																															'horneri' : 'Achelousaurus',
																							'@Chasmosaurinae' : '@Ceratopsidae',
																								'@Triceratopsini' : '@Chasmosaurinae',
																									'Agathaumas' : '@Triceratopsini',
																										'sylvestris' : 'Agathaumas',
																								'Agujaceratops' : '@Chasmosaurinae',
														'@Pachycephalosauria' : '@Marginocephalia',
															 '@Pachycephalosauridae' : '@Pachycephalosauria',
																'@Pachycephalosaurinae' : '@Pachycephalosauridae',
																	'@Pachycephalosaurini' : '@Pachycephalosaurinae',
																		'Alaskacephale' : '@Pachycephalosaurini',
																			'gangloffi' : 'Alaskacephale',
																	'Acrotholus' : '@Pachycephalosaurinae',
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

var treeHeight = canvasSize.y - 100; // height for the tree

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

var takenTextPositions = [];
var takenTextNames = [];

var takenImagePositions = [];
var takenImageNames = [];

function isSpaceTaken(array, ownP, unitSize) {
	for(var i = 0; i < array.length; i++) {
		var yDifference = Math.abs( array[i].y - ownP.y);
		
		var xDifference = Math.abs( array[i].x - ownP.x);
		// diffrences is position
		
		if(xDifference < unitSize.x && yDifference < unitSize.y) { /// if both in range, they overlap
			return(true); // return index
		}
	}
	return(false);
}

function getPositionTaxon(array, ownP, unitSize) { // differences are positive values going from the top left
	for(var i = 0; i < array.length; i++) {
		var yDifference = ownP.y - array[i].y;
		
		var xDifference = ownP.x - array[i].x; 
		// diffrences is position
		
		if(
			xDifference < unitSize.x
			&&
			xDifference > 0
			&&
			yDifference < unitSize.y
			&&
			yDifference > 0
		) { /// if both in range, they overlap
			return(i); // return index
		}
	}
	return(NaN);
}

function getPositionTaxonName(position) {
	var textTaxonIndex = getPositionTaxon(
		takenTextPositions,
		new P(position.x, position.y + textSize),
		new P(textMaximumLength, textSize)
	);
	var textTaxon;
	
	if(isNaN(textTaxonIndex)) {
		textTaxon = '';
	}else{
		var textTaxon = takenTextNames[textTaxonIndex];
		return(textTaxon);
	}
	
	var imageTaxonIndex = getPositionTaxon(
		takenImagePositions,
		new P(position.x - textMaximumLength, position.y + imageOnCanvasSize.y / 2),
		imageOnCanvasSize
	);
	var imageTaxon;
	
	if(isNaN(imageTaxonIndex)) {
		imageTaxon = '';
		return(imageTaxon);
	}else{
		var imageTaxon = takenImageNames[imageTaxonIndex];
		return(imageTaxon);
	}
	
}

function drawTree() {
	
	takenTextPositions = [];
	takenTextNames = [];
	
	takenImagePositions = [];
	takenImageNames = [];
	
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
	
	for(var i in tree) { // draw the tree branches
		
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
	
	for(var i in tree) { // draw text and images
		var position = new P(
			(treeWithDetails[i].x + translation.x) * translation.zoom,
			(treeWithDetails[i].y + translation.y) * translation.zoom
		); // position of drawing point
		
		if(
			position.y < canvasSize.y + imageOnCanvasSize.y
			&&
			position.y > 0 - imageOnCanvasSize.y
		){ // if within the height of the canvas
			ctx.fillStyle=colours.text;
			
			var displayName = '';
			
			switch(i[0]){
				case '@':
					displayName = i.substring(1);
					ctx.font = "bold " + textSize + "pt Georgia";
					break;
				case '#':
					displayName = '';
					break;
				default:
					displayName = i;
					ctx.font = "italic " + textSize + "pt Georgia";
					
					if( !isSpaceTaken(takenImagePositions, position, imageOnCanvasSize)) { // test for image overlap
						try{
							genera[i].image.src = 'images/' + i + '.jpg';
							ctx.drawImage(
								genera[i].image,
								position.x + textMaximumLength,
								position.y - imageOnCanvasSize.y / 2,
								imageOnCanvasSize.x,
								imageOnCanvasSize.y
							);
							
							takenImagePositions.push(
								new P(
									position.x,
									position.y
								)
							); // so no new ones overlap
							
							takenImageNames.push(i); // so that when clicked on we can find the indexed position
						}catch(e){
							//~ console.log(e);
						}
					}
			}
			
			if( !isSpaceTaken(takenTextPositions, position, new P(textMaximumLength, textSize)) ) { // check if overlapping a previously written in taxon
				ctx.fillText(
					displayName,
					(treeWithDetails[i].x + translation.x) * translation.zoom,
					(treeWithDetails[i].y + translation.y) * translation.zoom
				); // write name
				
				if(displayName != ''){
					takenTextPositions.push(
						new P(
							position.x,
							position.y
						)
					); // so no new ones overlap
					
					takenTextNames.push(
						i
					); // so that when clicked on we can find the indexed taxon
				}
			}
		}
	}
	
}

function getTaxonRank(name) {
	if(name.match(/^[A-Z]/)) {
		return('genus');
	}else if(name.match(/^[a-z]/)) {
		return('species');
	}else if(name.match(/idae$/)) {
		return('family');
	}else if(name.match(/inae$/)) {
		return('subfamily');
	}else if(name.match(/ini$/)) {
		return('tribe');
	}else{
		return('clade');
	}
}

function getDescent(taxon) {
	
	var currentTaxon = taxon;
	var taxaArray = [];
	
	while(currentTaxon != '@Dinosauria') {
		taxaArray.push(currentTaxon);
		currentTaxon = tree[currentTaxon]; // parent name
	}
	taxaArray.push('@Dinosauria');
	
	for(var i = 0; i < taxaArray.length; i++) {
		if(taxaArray[i][0] == '#') {
			taxaArray.splice(i,1);
			//~ console.log('cut');
			
			i--; // go back one after cutting
		}
	}
	
	return(taxaArray);
}

function getTextName(taxon) { // remove @ symbol
	var rank = getTaxonRank(taxon);
	if(rank == 'species' || rank == 'genus'){
		return(taxon);
	}else{
		return(taxon.substring(1, taxon.length));
	}
}

function getRepresentativeGenus(taxon) {
	while(getTaxonRank(taxon) != 'genus') {
		taxon = treeWithDetails[taxon].children[0]; // first child
	}
	return(taxon);
}

function getSpecies(genus, array) {
	var childrenArray = treeWithDetails[genus].children;
	for(var i = 0; i < childrenArray.length; i++) {
		if(getTaxonRank(childrenArray[i]) == 'species') { // if Tt's a species
			array.push(childrenArray[i]);
		}else{ // smaller rank
			getSpecies(childrenArray[i], array); // add members of that
		}
	}
}

function fillDetailsDivider(taxon) {
	if(taxon == '') { // do nothing if empty taxon
		return null;
	}
	
	console.log(taxon);
	
	var htmlElement = document.getElementById('details_divider');
	htmlElement.innerHTML = '';
	
	//if species, get genus
	if(getTaxonRank(taxon) == 'species') {
		while(getTaxonRank(taxon) != 'genus') {
			taxon = tree[taxon]; // get parent
		}
	}
	
	//test for genus
	var isGenus = false;
	if(getTaxonRank(taxon) == 'genus') {
		isGenus = true;
	}
	
	//draw title, taxa rank normal font with upper class name, no rank if genus, name of taxa italised if genus
	var titleBar = document.createElement('div');
	titleBar.id = 'title_bar';
	var taxonTypeSpan = document.createElement('span');
	var taxonSpan = document.createElement('span');
	
	if(isGenus) {
		taxonSpan.className = 'genus';
		taxonSpan.textContent = taxon;
		titleBar.appendChild( taxonSpan );
	}else{
		var taxonName = taxon.substring(1, taxon.length); // remove @ or #
		
		taxonSpan.textContent = taxonName;
		
		var taxonTypeName = getTaxonRank(taxon); // rank of taxon
		
		taxonTypeName = taxonTypeName[0].toUpperCase() + taxonTypeName.substring(1, taxon.length) + ' '; // capitalise first letter and add colon
		
		taxonTypeSpan.textContent = taxonTypeName;
		
		titleBar.appendChild( taxonTypeSpan );
		titleBar.appendChild( taxonSpan );
	}
	
	//image, representative genus if not genus
	
	var imageBox = document.createElement('div');
	var image = document.createElement('img');
	if(isGenus) {
		image.src = 'images/' + taxon + '.jpg';
		imageBox.appendChild(image);
	}else{
		var representativeGenus = getRepresentativeGenus(taxon);
		image.src = 'images/' + representativeGenus + '.jpg';
		//specify representative genus
		var genusSpecifier = document.createElement('div');
		genusSpecifier.innerHTML = '<span class="genus name-link">' + representativeGenus + '</span>, a member of ' + taxon.substring(1, taxon.length); // remove @ or #
		
		imageBox.appendChild(image);
		imageBox.appendChild(genusSpecifier);
	}
	image.width = 640;
	image.height = 370;
	
	//classify from dinosauria, excluding # ranks in table rows
	var classificationTable = document.createElement('table');
	classificationTable.className = 'classification_table';
	
	classificationTable.innerHTML += '<tr>Classification:</tr>';
	
	var descent = getDescent(taxon);
	//each rank bold, taxa bold if family or subfamily, italisized if genus or species
	//each rank goes to itself when clicked on
	for(var i = descent.length - 1; i >= 0; i--) {
		classificationTable.innerHTML += '<tr>'+
			'<td class="classification_rank">' + getTaxonRank(descent[i]) + ':</td>' +
			'<td class="' + getTaxonRank(descent[i]) + ' name-link"> ' + getTextName(descent[i]) + '</td>';
	}
	
	//list species if a genus (on right-hand table row)
	if(isGenus) {
		var speciesArray = [];
		getSpecies(taxon, speciesArray);
		classificationTable.innerHTML += '<tr><td class="classification_rank">species: </td></tr>';
		
		for(var i = 0; i < speciesArray.length; i++) {
			classificationTable.innerHTML += '<tr><td></td><td class="species">' + speciesArray[i] + '</td></tr>';
		}
	}
	
	//details if genus (earliest, latest, discovery, length, synonyms, possibleDuplicate)
	var detailsTable = document.createElement('table');
	if(isGenus) {
		detailsTable
	}
	
	htmlElement.appendChild(titleBar);
	htmlElement.appendChild(imageBox);
	htmlElement.appendChild(classificationTable);
	htmlElement.appendChild(detailsTable);
	
	var nameLinks = document.getElementsByClassName('name-link');
	
	for(var i = 0; i < nameLinks.length; i++) {
		nameLinks[i].onclick = function() {
			//~ console.log(this.textContent);
			try{
				fillDetailsDivider('@' + this.textContent.substring(1, this.textContent.length)); // substring, because they start with a space
			}catch(e){ // if a genus (error is thrown as a genus with an @ sign will not find any actual taxon)
				try{
					fillDetailsDivider(this.textContent.substring(1, this.textContent.length)); // substring, because they start with a space
				}catch(e){ // if not preceeded by a space
					fillDetailsDivider(this.textContent); // substring, because they start with a space
				}
			}
		}
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
