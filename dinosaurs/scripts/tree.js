window.onload=function () {
/**********************************************************************
RULES:
* Must be a potentially individual genus of dinosaur. No birds or early archosaurs
* 1 x 1080p jpeg image with capitalised genus name facing left to right white bars
* extra images from 01-99
* species listed as though genus is common ancestor, even though this is not neccesarily always the case
**********************************************************************/

//~ console.log('logging');

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

var detailsImageSize = new P(
	640,
	370
)

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
		offset += element.offsetTop;
		
		offset -= pageYOffset;
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

var humanImage = document.createElement('img');
humanImage.src = 'alt_images/human.png';

var mobileZoomRatio = 2;

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
	
	mouseIsDown = true;
}

ctx.canvas.onmouseup = function() {
	mouseIsDown = false;
	
	drawTree();
	
	//~ console.log('about to fill details divider for: ' +  getPositionTaxonName(mousePosition) );
	
	fillDetailsDivider( getPositionTaxonName(mousePosition) );
	
	return false;
}

// earliest, latest, discovery, length, synonyms, possibleDuplicate, countries, describedBy, isDubious, notes

function Genus (earliest, latest, discovery, length, synonyms, possibleDuplicate, countries, describedBy, isDubious, notes) { //this is for the database, not the tree
	this.earliest = earliest; //mya
	this.latest = latest; //mya
	this.discovery = discovery; //A.D
	this.length = length; //m]
	this.synonyms = synonyms;// array
	this.possibleDuplicate = possibleDuplicate;// string
	this.countries = countries;
	this.describedBy = describedBy;
	this.isDubious = isDubious;
	this.notes = notes;
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
	'Aardonyx' :                new Genus(195,   195,   2010, 7,    [], '', ['South Africa'], 'Yates et al.',           false, 'Aardonyx has arm features that are intermediate between prosauropods and sauropods.'),
	'Abelisaurus' :             new Genus(83.6,  72.1,  1985, 7.4,  [], '', ['Argentina'],    'Bonaparte & Novas',      false, 'Possible but incredibly unlikely charcardontosaurid'),
	'Abrictosaurus' :           new Genus(200,   190,   1974, 1.2,  [], 'Lycorhinus', 
	                                                                        ['South Africa'], 'Hopson',                 true,  ''),
	'Abrosaurus' :              new Genus(170,   163,   1989, 9,    [], '', ['China'],        'Ouyang',                 false, 'Known only for its skull, which is highly unusual for a sauropod.'),
	'Abydosaurus' :             new Genus(104,   104,   2010, 20,   [], '', ['USA'],          'Chure et al.',           false, ''),
	'Acanthopholis' :           new Genus(145,   100,   1867, 5,    [], '', ['England'],      'Huxley',                 false, 
	'Known only for its skull, which is highly unusual for a sauropod.'),
	'Achelousaurus' :           new Genus(74.2,  71.2,  1994, 6,    [], '', ['USA'],          'Sampson',                false, 
		'It has been suggested that it was the direct descendant of the similar genus Einiosaurus (which has spikes but no bosses) and the direct ancestor of Pachyrhinosaurus (which has larger bosses). \
		The first two genera would be transitional forms, evolving through anagenesis from Styracosaurus.'),
	'Acheroraptor' :            new Genus(66,    66,    2013, 3,    [], '', ['USA'],          'Evans et al.',           false, ''),
	'Achillesaurus' :           new Genus(86.3,  83.6,  2007, 1.5,  [], 'Alvarezsaurus', 
	                                                                        ['Argentina'],    'Martinelli & Vera',      true,  ''),
	'Achillobator' :            new Genus(98,    83,    1999, 5.5,  [], '', ['Mongolia'],     'Perle, Norell, & Clark', false, ''),
	'Acristavus' :              new Genus(81,    76,    2011, 5.5,  [], '', ['USA'],          'Gates et al.',           false, ''),
	'Acrocanthosaurus' :        new Genus(125,   100,   1950, 11.5, ['Acracanthus'], 
	                                                                    '', ['USA'],          'Stovall & Langston',     false, ''),
	'Acrotholus' :              new Genus(86.3,  83.6,  2013, 1.8,  [], '', ['Canada'],       'Evans et al.',           false, ''),
	'Adamantisaurus' :          new Genus(93,    70,    2006, 13,   [], '', ['Brazil'],       'Santucci & Bertini',     false, ''),
	'Adasaurus' :               new Genus(71,    69,    1983, 1.8,  [], '', ['Mongolia'],     'Barsbold',               false, ''),
	'Adelolophus' :             new Genus(83.6,  72.1,  2014, 14,   [], '', ['USA'],          'Gates et al.',           false, ''),
	'Adeopapposaurus' :         new Genus(199,   174,   2009, 3,    [], '', ['Argentina'],    'Martínez',               false, ''),
	'Aegyptosaurus' :           new Genus(113,   94,    1932, 15,   [], '', ['Egypt', 'Niger'], 
	                                                                                          'Stromer',                false, ''),
	'Aeolosaurus' :             new Genus(83,    74,    1987, 14,   [], '', ['Argentina'],    'Powell',                 false, ''),
	'Aepisaurus' :              new Genus(100,   100,   1852, 18,   [], '', ['France'],       'Gervais',                false, ''),
	'Aepyornithomimus' :        new Genus(80,    10,    2017, 2,    [], '', ['Mongolia'],     'Tsogtbaatar et al.',     false, ''),
	'Aerosteon' :               new Genus(84,    83,    2009, 9,    [], '', ['Argentina'],    'Sereno',                 false, ''),
	'Afromimus' :               new Genus(140,   100,   2017, 2,    [], '', ['Niger'],        'Sereno',                 false, 'Actaully a possible Ceratosaur.'),
	'Afrovenator' :             new Genus(167,   161,   1994, 8,    [], '', ['Niger'],        'Sereno',                 false, ''),
	'Agathaumas' :              new Genus(66,    66,    1872, 9,    [], 'Triceratops', 
	                                                                        ['USA'],          'Cope',                   true,  ''),
	'Agilisaurus' :             new Genus(171.6, 161.2, 1990, 2,    [], '', ['China'],        'Peng',                   false, ''),
	'Agnosphitys' :             new Genus(205.6, 201.6, 2002, 3,    [], '', ['England'],      'Fraser et al.',          false, 'Possible non-dinosaur dinosauriform silesaurid.'),
	'Agrosaurus' :              new Genus(205.6, 201.6, 1891, 3,    [], 'Thecodontosaurus', 
	                                                                        ['England'],      'Seeley',                 true, 'Possibly, but not likely, Australian.'),
	'Agujaceratops' :           new Genus(80,    73,    2006, 4.75, [], '', ['USA'],          'Lucas et al.',           false, ''),
	'Agustinia' :               new Genus(116,   110,   1999, 15,   [], '', ['Argentina'],    'Bonaparte',              true,  ''),
	'Ahshislepelta' :           new Genus(76,    72,    2011, 4,    [], '', ['USA'],          'Burns & Sullivan',       false, ''),
	'Ajancingenia' :            new Genus(85,    66,    1981, 1.4,  [], 'Heyuannia', 
	                                                                        ['Mongolia'],     'Barsbold',               true,  ''),
	'Ajkaceratops' :            new Genus(86,    83,    2010, 1,    [], '', ['Hungary'],      'Ősi et al',              false, ''),
	'Alamosaurus' :             new Genus(67,    66,    1922, 34,   [], '', ['USA'],          'Gilmore',                false, ''),
	'Alaskacephale' :           new Genus(72,    71,    2005, 4.5,  [], 'Pachycephalosaurus', 
	                                                                        ['Alaska'],       'Sullivan',               false, ''),
	'Albalophosaurus' :         new Genus(140,   130,   2009, 2,    [], '', ['Japan'],        'Ohashi & Barrett',       false, ''),
	'Albertaceratops' :         new Genus(80,    73,    2007, 5.8,  [], '', ['Canada'],       'Ryan',                   false, ''),
	'Albertadromeus' :          new Genus(80,    73,    2013, 1.5,  [], '', ['Canada'],       'Brown et al.',           false, ''),
	'Albertavenator' :          new Genus(71,    66,    2017, 2,    [], '', ['Canada'],       'Evans et al.',           false, ''),
	'Albertonykus' :            new Genus(71,    66,    2008, 0.7,  [], '', ['Canada'],       'Longrich & Currie',      false, ''),
	'Albertosaurus' :           new Genus(73,    67,    1905, 10, ['Deinodon'], 
	                                                                    '', ['Canada'],       'Osborn',                 false, ''),
	'Albinykus' :               new Genus(86,    72,    2011, 0.5,  [], '', ['Mongolia'],     'Nesbitt et al',          false, ''),
	'Alcovasaurus' :            new Genus(156,   151,   2016, 7,    [], '', ['USA'],          'Galton and Carpenter',   false, ''),
	'Alectrosaurus' :           new Genus(84,    71,    1933, 5,    [], '', ['Mongolia'],     'Gilmore',                false, ''),
	'Aletopelta' :              new Genus(84,    71,    2001, 6,    [], '', ['USA'],          'Ford & Kirkland',        false, ''),
	'Algoasaurus' :             new Genus(145,   136,   1904, 9,    [], '', ['South Africa'], 'Bloom',                  false, ''),
	'Alioramus' :               new Genus(71,    66,    1976, 6,    [], '', ['Mongolia'],     'Kurzanov',               false, ''),
	'Allosaurus' :              new Genus(156,   145,   1877, 12, ['Creosaurus', 'Labrosaurus'], 
	                                                                    '', ['USA'],          'Marsh',                  false, 
	                                                                    'Despite its popularity, Allosaurus has been considered potentially dubious because of its incomplete holotype.'),
	'Almas' :                   new Genus(75,    71,    2017, 0.8,  [], '', ['Mongolia'],     'Pei et al.',             false, ''),
	'Alnashetri' :              new Genus(99,    94,    2012, 0.8,  [], '', ['Argentina'],    'Makovicky, Apesteguía & Gianechini', 
	                                                                                                                    false, ''),
	'Alocodon' :                new Genus(145,   157,   1975, 2,    [], '', ['Portugal'],     'Thulborn',               false, 
		'Known only from teeth. At first it was considered a member of the Fabrosauridae and then a hypsilophodontid, then Ornithischia incertae sedis. Further studies indicate it to be a probable thyreophoran.'),
	'Altirhinus' :              new Genus(120,   112,   1998, 8,    [], '', ['Mongolia'],     'Norman',                 false, ''),
	'Altispinax' :              new Genus(140,   133,   1923, 8,    
	                                                  ['Becklespinax'], '', ['England'],      'von Huene',              false, ''),
	'Alvarezsaurus' :           new Genus(86,    84,    1991, 1.4,  [], '', ['Argentina'],    'Bonaparte',              false, ''),
	'Alwalkeria' :              new Genus(235,   228,   1987, 0.5,  [], '', ['India'],        'Chatterjee & Creisler',  false, ''),
	'Alxasaurus' :              new Genus(125,   112,   1993, 3.8,  [], '', ['Mongolia'],     'Russell & Dong',         false, ''),
	'Amargasaurus' :            new Genus(130,   120,   1991, 12,   [], '', ['Argentina'],    'Salgado & Bonaparte',    false, ''),
	'Amargastegos' :            new Genus(125,   125,   2014, 5,    [], '', ['Argentina'],    'Ulansky',                true,  ''),
	'Amargatitanis' :           new Genus(130,   120,   2007, 20,   [], '', ['Argentina'],    'Apesteguía',             false, ''),
	'Amazonsaurus' :            new Genus(125,   100,   2003, 12,   [], '', ['Brazil'],       'Carvalho et al',         false, ''),
	'Ampelosaurus' :            new Genus(71,    66,    1995, 15,   [], '', ['France', 'Spain'], 
	                                                                                          'Le Loeuff',              false, ''),
	'Amphicoelias' :            new Genus(71,    66,    1878, 58,   [], '', ['USA'], 'Cope', false, ''),
	'Amtocephale' :             new Genus(98,    83,    2011, 2.5,  [], '', ['Mongolia'],     'Watabe, Tsogtbaatar & Sullivan', 
	                                                                                                                    false, 'One of the earliest pachycephalosaurs.'),
	'Amtosaurus' :              new Genus(100,   83,    1978, 5,    [], 'Talarurus', ['Mongolia'], 
	                                                                                          'Kurzanov & Tumanova',    true,  
		'Amtosaurus is a genus of ornithischian dinosaur based on a fragmentary skull and originally believed to represent an ankylosaurid. Hadrosaurid affinities have also been suggested. \
		However, this specimen is too fragmentary to be reliably classified beyond an indeterminate ornithischian.'),
	'Amurosaurus' :             new Genus(68,    66,    1991, 8,    [], '', ['Russia'],       'Bolotsky & Kurzanov',    false, 'This is the most complete Russian dinosaur.'),
	'Amygdalodon' :             new Genus(180,   172,   1947, 12,   [], '', ['Argentina'],    'Cabrera',                false, ''),
	'Anabisetia' :              new Genus(94,    91,    2002, 2.1,  [], '', ['Argentina'],    'Coria & Calvo',          false, ''),
	'Anasazisaurus' :           new Genus(80,    73,    1993, 9,    [], '', ['USA'],          'Hunt & Lucas',           false, ''),
	'Anchiceratops' :           new Genus(80,    73,    1914, 5,    [], '', ['Canada'],       'Brown',                  false, ''),
	'Anchiornis' :              new Genus(161,   156,   2009, 0.4,  [], '', ['China'],        'Xu et al.',              false, ''),
	'Anchisaurus' :             new Genus(189,   175,   1885, 2.4,  ['Megadactylus', 'Amphisaurus', 'Ammosaurus', 'Yaleosaurus'], 
	                                                                    '', ['USA'],          'Marsh',                  false, ''),
	'Andesaurus' :              new Genus(99,    94,    1991, 16,   [], '', ['Argentina'],    'Calvo & Bonaparte',      false, ''),
	'Andhrasaurus' :            new Genus(201.3, 182.7, 2014, 3,    [], '', ['India'],        'Ulansky',                true,  ''),
	'Angolatitan' :             new Genus(94,    89,    2011, 12,   [], '', ['Angola'],       'Mateus et al.',          false, ''),
	'Angulomastacator' :        new Genus(75.7,  78.1,  2009, 8,    [], '', ['USA'],          'Wagner & Lehman,',       false, 
		'The left maxilla (the main tooth-bearing bone of the upper jaw) is curved down approximately 45° at its anterior end, with the tooth row bent to fit, unlike any other hadrosaur.'),
	'Angolatitan' :             new Genus(94,    89,    2011, 12,   [], '', ['Angola'],       'Mateus et al.',          false, ''),
	'Aniksosaurus' :            new Genus(96,    91,    2006, 2.5,  [], '', ['Aregntina'],    'Martínez & Novas',       false, ''),
	'Animantarx' :              new Genus(102,   99,    1999, 3,    [], '', ['USA'],          'Carpenter et al.',       false, ''),
	'Ankylosaurus' :            new Genus(67,    66,    1908, 9,    [], '', ['USA'],          'Brown',                  false, ''),
	'Anodontosaurus' :          new Genus(73,    67,    1929, 5,    [], '', ['Canada'],       'Sternberg',              false, ''),
	'Anomalipes' :              new Genus(100.5, 93.9,  2018, 2.2,  [], '', ['China'],        'Yu et al.',              false, ''),
} // Draw Anomalipes image first

var geologicalTimeRange = [250, 201, 145, 66];
var eraNames = ['Triassic', 'Jurassic', 'Cretaceous'];
var eraColours = ['#FF7F00', '#7F00FF', '#00FF7F'];
var discoveryTimeRange = [1800, 1900, 2000, 2050];

var tree = { // basic tree
	'@Dinosauria' : '@Dinosauria',
		'@Saurischia' : '@Dinosauria',
			'@Sauropodomorpha' : '@Saurischia',
				'@Guaibasauridae' : '@Sauropodomorpha',
					'-Guaibasauridae' : '@Guaibasauridae',
						'Agnosphitys' : '-Guaibasauridae',
							'cromhallensis' : 'Agnosphitys',
				'#Thecodontosauridae1' : '@Sauropodomorpha',
					'@Thecodontosauridae' : '#Thecodontosauridae1',
						'-Thecodontosauridae' : '@Thecodontosauridae',
							'Agrosaurus' : '-Thecodontosauridae',
								'macgillivrayi' : 'Agrosaurus',
					'#Massospondylidae1' : '#Thecodontosauridae1',
						'@Massospondylidae' : '#Massospondylidae1',
							'Adeopapposaurus' : '@Massospondylidae',
								'mognai' : 'Adeopapposaurus',
						'@Anchisauria' : '#Massospondylidae1',
							'Anchisaurus' : '@Anchisauria',
								 'polyzelus' : 'Anchisaurus',
							'#Aardonyx1' : '@Anchisauria',
								'Aardonyx' : '#Aardonyx1',
									'celestae' : 'Aardonyx',
								'@Sauropoda' : '#Aardonyx1',
									'Amygdalodon' : '@Sauropoda',
										'patagonicus' : 'Amygdalodon',
									'@Gravisauria' : '@Sauropoda',
										'@Eusauropoda' : '@Gravisauria',
											'@Neosauropoda' : '@Eusauropoda',
												'-Neosauropoda' : '@Neosauropoda',
													'Algoasaurus' : '-Neosauropoda',
														'bauri' : 'Algoasaurus',
												'@Macronaria' : '@Neosauropoda',
													'#Diplodocoidea1' : '@Macronaria',
														'@Diplodocoidea' : '#Diplodocoidea1',
															'@Diplodocimorpha' : '@Diplodocoidea',
																'@Rebbachisauridae' : '@Diplodocimorpha',
																	'Amazonsaurus' : '@Rebbachisauridae',
																		'maranhensis' : 'Amazonsaurus',
																'@Flagellicaudata' : '@Diplodocimorpha',
																	'@Diplodocidae' : '@Flagellicaudata',
																		'Amphicoelias' : '@Diplodocidae',
																			'altus' : 'Amphicoelias',
																			'fragillimus?' : 'Amphicoelias',
																	'@Dicraeosauridae' : '@Flagellicaudata',
																		'#Suuwassea1' : '@Dicraeosauridae',
																			'Amargatitanis' : '#Suuwassea1',
																				'macni' : 'Amargatitanis',
																		'Amargasaurus' : '@Dicraeosauridae',
																			'cazaui' : 'Amargasaurus',
														'#Camarasauridae1' : '#Diplodocoidea1',
															'@Camarasauridae' : '#Camarasauridae1',
																'Abrosaurus' : '@Camarasauridae',
																	'dongpoi' : 'Abrosaurus',
															'#Tehuelchesaurus1' : '#Camarasauridae1',
																'@Titanosauriformes' : '#Tehuelchesaurus1',
																	'@Brachiosauridae' : '@Titanosauriformes',
																		'-Brachiosauridae' : '@Brachiosauridae',
																			'Abydosaurus' : '-Brachiosauridae',
																				'mcintoshi' : 'Abydosaurus',
																	'@Somphospondyli' : '@Titanosauriformes',
																		'Angolatitan' : '@Somphospondyli',
																			'adamastor' : 'Angolatitan',
																		'@Titanosauria' : '@Somphospondyli',
																			'#Andesaurus1' : '@Titanosauria',
																				'Andesaurus' : '#Andesaurus1',
																					'delgadoi' : 'Andesaurus',
																				'@Lithostrotia' : '#Andesaurus1',
																					'@Lognkosauria' : '@Lithostrotia',
																						'Aegyptosaurus' : '@Lognkosauria',
																							'baharijensis' : 'Aegyptosaurus',
																					'#Saltasauroidea1' : '@Lithostrotia',
																						'@Nemegtosauridae' : '#Saltasauroidea1',
																							'Ampelosaurus' : '@Nemegtosauridae',
																								'atacis' : 'Ampelosaurus',
																						'@Saltasauroidea' : '#Saltasauroidea1' ,
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
																		'-Somphospondyli' : '@Somphospondyli',
																			'Agustinia' : '-Somphospondyli',
																				'ligabuei' : 'Agustinia',
									'-Sauropoda' : '@Sauropoda',	
										'Aepisaurus' : '-Sauropoda',
											'elephantinus' : 'Aepisaurus',
		'@Ornithoscelida' : '@Dinosauria',
			'@Ornithischia' : '@Ornithoscelida',
				'-Ornithischia' : '@Ornithischia',
					'Alocodon' : '-Ornithischia',
						'kuehnei' : 'Alocodon',
					'Amtosaurus' : '-Ornithischia',
						'magnus' : 'Amtosaurus',
				'#Heterodontosauridae1' : '@Ornithischia',
					'@Heterodontosauridae' : '#Heterodontosauridae1',
						'@Heterodontosaurinae' : '@Heterodontosauridae',
							'Abrictosaurus' : '@Heterodontosaurinae',
								'consors' : 'Abrictosaurus',
					'@Genasauria' : '#Heterodontosauridae1',
						'@Thyreophora' : '@Genasauria',
							'@Eurypoda' : '@Thyreophora',
								'@Stegosauria' : '@Eurypoda',
									'@Stegosauridae' : '@Stegosauria',
										'-Stegosauridae' : '@Stegosauridae',
											'Amargastegos' : '-Stegosauridae',
												'brevicollus' : 'Amargastegos',
											'Alcovasaurus' : '-Stegosauridae',
												'longispinus' : 'Alcovasaurus',
								'@Ankylosauria' : '@Eurypoda',
									'@Nodosauridae' : '@Ankylosauria',
										'-Nodosauridae' : '@Nodosauridae',
											'Acanthopholis' : '-Nodosauridae',
												'horrida' : 'Acanthopholis',
										'Animantarx' : '@Nodosauridae',
											'ramaljonesi' : 'Animantarx',
									'@Ankylosauridae' : '@Ankylosauria',
										'Ahshislepelta' : '@Ankylosauridae',
											'minor' : 'Ahshislepelta',
										'@Ankylosaurinae' : '@Ankylosauridae',
											'@Ankylosaurini' : '@Ankylosaurinae',
												'Ankylosaurus' : '@Ankylosaurini',
													'magniventris' : 'Ankylosaurus',
												'Anodontosaurus' : '@Ankylosaurini',
													'lambei' : 'Anodontosaurus',
													'inceptus' : 'Anodontosaurus',
										'-Ankylosauridae' : '@Ankylosauridae',
											'Aletopelta' : '-Ankylosauridae',
												'coombsi' : 'Aletopelta',
								'-Thyreophora' : '@Thyreophora',
									'Andhrasaurus' : '-Thyreophora',
										'indicus' : 'Andhrasaurus',
						'@Neornithischia' : '@Genasauria',
							'#Agilisaurus1' : '@Neornithischia',
								'Agilisaurus' : '#Agilisaurus1',
									'louderbacki' : 'Agilisaurus',
								'#Parksosauridae1' : '#Agilisaurus1',
									'@Parksosauridae' : '#Parksosauridae1',
										'@Orodrominae' : '@Parksosauridae',
											'Albertadromeus' : '@Orodrominae',
												'syntarsus' : 'Albertadromeus',
									'@Cerapoda' : '#Parksosauridae1',
										'@Marginocephalia' : '@Cerapoda',
											'@Pachycephalosauria' : '@Marginocephalia',
												 '@Pachycephalosauridae' : '@Pachycephalosauria',
													'@Pachycephalosaurinae' : '@Pachycephalosauridae',
														'Amtocephale' : '@Pachycephalosaurinae',
															'gobiensis' : 'Amtocephale',
														'#Acrotholus1' : '@Pachycephalosaurinae',
															'Acrotholus' : '#Acrotholus1',
																'audeti' : 'Acrotholus',
															'@Pachycephalosaurini' : '#Acrotholus1',
																'Alaskacephale' : '@Pachycephalosaurini',
																	'gangloffi' : 'Alaskacephale',
											'@Ceratopsia' : '@Marginocephalia',
												'Albalophosaurus' : '@Ceratopsia',
													'yamaguchiorum' : 'Albalophosaurus',
												'#Psittacosauridae1' : '@Ceratopsia',
													'@Neoceratopsia' : '#Psittacosauridae1',
														'@Coronosauria' : '@Neoceratopsia',
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
																		'Agujaceratops' : '@Chasmosaurinae',
																			'mariscalensis' : 'Agujaceratops',
																			'mavericus' : 'Agujaceratops',
																		'Anchiceratops' : '@Chasmosaurinae',
																			'ornatus' : 'Anchiceratops',
																	'-Ceratopsidae' : '@Ceratopsidae',
																		'Agathaumas' : '-Ceratopsidae',
																			'sylvestris' : 'Agathaumas',
																		
										'@Ornithopoda' : '@Cerapoda',
											'@Iguanodontia' : '@Ornithopoda',
												'Elasmaria' : '@Iguanodontia',
													'Anabisetia' : 'Elasmaria',
														'saldiviai' : 'Anabisetia',
												'@Dryomorpha' : '@Iguanodontia',
													'@Ankylopollexia' : '@Dryomorpha',
														'@Styracosterna' : '@Ankylopollexia',
															'@Hadrosauriformes' : '@Styracosterna',
																'Altirhinus' : '@Hadrosauriformes',
																	'kurzanovi' : 'Altirhinus',
																'@Hadrosauromorpha' : '@Hadrosauriformes',
																	'@Hadrosauridae' : '@Hadrosauromorpha',
																		'-Hadrosauridae' : '@Hadrosauridae',
																			'Anasazisaurus' : '-Hadrosauridae',
																				'horneri ' : 'Anasazisaurus',
																		'@Saurolophidae' : '@Hadrosauridae',
																			'@Saurolophinae' : '@Saurolophidae',
																				'@Brachylophosaurini' : '@Saurolophinae',
																					'Acristavus' : '@Brachylophosaurini',
																						'gagslarsoni' : 'Acristavus',
																			'@Lambeosaurinae' : '@Saurolophidae',
																				'@Lambeosaurini' : '@Lambeosaurinae',
																					'Amurosaurus' : '@Lambeosaurini',
																						'riabinini' : 'Amurosaurus',
																				'-Lambeosaurinae' : '@Lambeosaurinae',
																					'Adelolophus' : '-Lambeosaurinae',
																						'hutchisoni' : 'Adelolophus',
																					'Angulomastacator' : '-Lambeosaurinae',
																						'daviesi' : 'Angulomastacator',
			'@Theropoda' : '@Ornithoscelida',
				'#Eoraptor1' : '@Theropoda',
					'Alwalkeria' : '#Eoraptor1',
						'maleriensis' : 'Alwalkeria',
				'@Neotheropda' : '@Theropoda',
					'@Averostra' : '@Neotheropda',
						'@Ceratosauria' : '@Averostra',
							'@Abelisauroidea' : '@Ceratosauria',
								'@Abelisauridae' : '@Abelisauroidea',
									'Abelisaurus' : '@Abelisauridae',
										'comahuensis' : 'Abelisaurus',
						'@Tetanurae' : '@Averostra',
							'-Tetanurae' : '@Tetanurae',
								'Altispinax' : '-Tetanurae',
									'dunkeri' : 'Altispinax',
							'@Orionides' : '@Tetanurae',
								'@Megalosauroidea' : '@Orionides',
									'@Megalosauria' : '@Megalosauroidea',
										'@Megalosauridae' : '@Megalosauria',
											'@Afrovenatorinae' : '@Megalosauridae',
												'Afrovenator' : '@Afrovenatorinae',
													'abakensis' : 'Afrovenator',
								'@Avetheropoda' : '@Orionides',
									'@Allosauroidea' : '@Avetheropoda',
										'@Allosauria' : '@Allosauroidea',
											'@Allosauridae' : '@Allosauria',
												'Allosaurus' : '@Allosauridae',
													'fragilis' : 'Allosaurus',
											'@Carcharodontosauria' : '@Allosauria',
												'@Carcharodontosauridae' : '@Carcharodontosauria',
													'Acrocanthosaurus' : '@Carcharodontosauridae',
														'atokensis' : 'Acrocanthosaurus',
									'@Coelurosauria' : '@Avetheropoda',
										'@Megaraptora' : '@Coelurosauria',
											'Aerosteon' : '@Megaraptora',
												'riocoloradense' : 'Aerosteon',
										'@Tyrannoraptora' : '@Coelurosauria',
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
											'#Compsognathidae2' : '@Tyrannoraptora',
												'#Compsognathidae1' : '#Compsognathidae2',
													'Aniksosaurus' : '#Compsognathidae1',
														'darwini' : 'Aniksosaurus',
												'@Maniraptoriformes' : '#Compsognathidae2',
													'@Ornithomimosauria' : '@Maniraptoriformes',
														'-Ornithomimosauria' : '@Ornithomimosauria',
															'Afromimus' : '-Ornithomimosauria',
																'tenerensis' : 'Afromimus',
														'Aepyornithomimus' : '@Ornithomimosauria',
															'tugrikinensis' : 'Aepyornithomimus',
													'@Maniraptora' : '@Maniraptoriformes',
														'@Alvarezsauroidea' : '@Maniraptora',
															'@Alvarezsauridae' : '@Alvarezsauroidea',
																'#Parvicursorinae1' : '@Alvarezsauridae',
																	'Alvarezsaurus' : '#Parvicursorinae1',
																		'calvoi' : 'Alvarezsaurus',
																	'@Parvicursorinae' : '#Parvicursorinae1',
																		'@Ceratonykini' : '@Parvicursorinae',
																			'Albinykus' : '@Ceratonykini',
																				 'baatar' : 'Albinykus',
																	'@Mononykini' : '@Parvicursorinae',
																		'Albertonykus' : '@Mononykini',
																			'borealis' : 'Albertonykus',
																'#Patagonykinae1' : '@Alvarezsauridae',
																	'Alnashetri' : '#Patagonykinae1',
																		'cerropoliciensis' : 'Alnashetri',
																	'@Patagonykinae' : '#Patagonykinae1',
																		'Achillesaurus' : '@Patagonykinae',
																			'manazzonei' : 'Achillesaurus',
														'@Aveairfoila' : '@Maniraptora',
															'@Therizinosauria' : '@Aveairfoila',
																'@Therizinosauroidea' : '@Therizinosauria',
																	'@Alxasauridae' : '@Therizinosauroidea',
																		'Alxasaurus' : '@Alxasauridae',
																			'elesitaiensis' : 'Alxasaurus',
															'@Pennaraptora' : '@Aveairfoila',
																'@Oviraptorosauria' : '@Pennaraptora',
																	'@Caenagnathoidea' : '@Oviraptorosauria',
																		'@Caenagnathidae' : '@Caenagnathoidea',
																			'Anomalipes' : '@Caenagnathidae',
																				'zhaoi' : 'Anomalipes',
																		'@Oviraptoridae' : '@Caenagnathoidea',
																			'Ajancingenia' : '@Oviraptoridae',
																				'yanshini' : 'Ajancingenia',
																'@Paraves' : '@Pennaraptora',
																	'@Eumaniraptora' : '@Paraves',
																		'@Deinonychosauria' : '@Eumaniraptora',
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
																			'@Troodontidae' : '@Deinonychosauria',
																			
																				'-Troodontidae' : '@Troodontidae',
																					'Albertavenator' : '-Troodontidae',
																						'curriei' : 'Albertavenator',
																				 '@Jinfengopteryginae' : '@Troodontidae',
																					'Almas' : '@Jinfengopteryginae',
																						'ukhaa' : 'Almas',
																		'@Avialae' : '@Eumaniraptora',
																			'@Anchiornithidae' : '@Avialae',
																				'Anchiornis' : '@Anchiornithidae',
																					'huxleyi' : 'Anchiornis',
}

var treeHeight = canvasSize.y - 100; // height for the tree

ctx.canvas.width = canvasSize.x;
ctx.canvas.height = canvasSize.y; // set the canvas to the size just specified

ctx.fillStyle = '#fff';//fill style white

ctx.fillRect(0, 0, canvasSize.x, canvasSize.y);//draw background

var treeWithDetails = {};//tree with metadata added

treeWithDetails['@Dinosauria'] = new Node('@Dinosauria', 0, canvasSize.y / 2, [] ); // preset the root node to avoid errors

function getHeightProportion(index) { // zero indexed
	var nextPowerOfTwo = Math.pow(2, Math.ceil( Math.log2(index) ) );
	var lastPowerOfTwo = nextPowerOfTwo / 2;
	
	var denominator = nextPowerOfTwo;
	
	var numerator = index - lastPowerOfTwo; // integers
	
	numerator *= 2; // evens
	
	numerator -= 1; // odds
	
	var fraction = numerator / denominator; // 0 to 1
	
	if(index == 0) {
		fraction = 0;
	}else if(index == 1) {
		fraction = 1;
	}
	
	fraction *= 2; // 0 to 2
	
	fraction -= 1; // -1 to 1
	
	return(fraction);
}

//~ alert(getHeightProportion(prompt()));

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
			
		}
		
		var branchHeightDelta = getHeightProportion(treeWithDetails[tree[i]].children.length); // the proportion of height
			
		treeWithDetails[i].x = treeWithDetails[tree[i]].x + getPositionDelta(getTreeDepth(i)) * branchWidthScale; // shift by calculated value
		treeWithDetails[i].y = treeWithDetails[tree[i]].y + getPositionDelta(getTreeDepth(i)) * branchHeightDelta; // shift by calculated value
		
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
				case '-':
					displayName = 'Incertae sedis';
					ctx.font = "bold italic " + textSize + "pt Georgia";
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
				
				var isDubious = false;
				
				if(genera[displayName]) {
					isDubious = genera[displayName].isDubious;
				}
				
				ctx.fillText(
					displayName + ( isDubious ? '?' : '' ) ,
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
	}else if(name.match(/^-/)) {
		return('Incertae sedis');
	}else if(name.match(/oidea$/)) {
		return('superfamily');
	}else if(name.match(/oidae$/)) {
		return('epifamily');
	}else if(name.match(/idae$/)) {
		return('family');
	}else if(name.match(/inae$/)) {
		return('subfamily');
	}else if(name.match(/odd$/)) {
		return('infrafamily');
	}else if(name.match(/ini$/)) {
		return('tribe');
	}else if(name.match(/ina$/)) {
		return('subtribe');
	}else if(name.match(/ad$/)) {
		return('infratribe');
	}else if(name.match(/iti$/)) {
		return('infratribe');
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
	
	//~ console.log('attempted to fill details divider');
	
	var htmlElement = document.getElementById('details_divider');
	htmlElement.innerHTML = '';
	htmlElement.style.height = canvasSize.y + 'px';
	
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
		
		taxonTypeName = taxonTypeName[0].toUpperCase() + taxonTypeName.substring(1, taxonTypeName.length) + ' '; // capitalise first letter and add colon
		
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
	image.width = detailsImageSize.x;
	image.height = detailsImageSize.y;
	
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
		var details = genera[taxon];
		// varibles are: earliest, latest, discovery, length, synonyms, possibleDuplicate
		
		var synonymTable = document.createElement('table');
		// table listing junior synonyms (none if none)
		
		if(details.synonyms.length == 0) { // junior synonyms
			synonymTable.innerHTML += '<tr> <td class="classification_rank">Junior synonyms:</td> <td> none </td> </tr>';
		}else{
			synonymTable.innerHTML += '<tr> <td class="classification_rank">Junior synonyms:</td></tr>';
			for(var i = 0; i < details.synonyms.length; i++) {
				synonymTable.innerHTML += '<tr> <td></td> <td class="genus">' + details.synonyms[i] + '</td> </tr>';
			}
		}
		
		if(! details.possibleDuplicate) { // possible senior synonym
			synonymTable.innerHTML += '<tr> <td class="classification_rank">Possible duplicate of: </td> <td> none </td> </tr>';
		}else{
			synonymTable.innerHTML += '<tr> <td class="classification_rank">Possible duplicate of: </td> <td class="genus name-link"> ' + details.possibleDuplicate + '</td> </tr>';
		}
		
		detailsTable.innerHTML += '<tr><td>Details:</td></tr>';
		detailsTable.appendChild(synonymTable);
		
		// possible duplicate of (link genus) (none if none)
		
		
		// FOLLOWING LINES ALL DRAWN ON ONE CANVAS
		var timelineHeight = 20;
		
		var detailsCanvas = document.createElement('canvas');
		
		detailsCanvas.width = detailsImageSize.x;
		detailsCanvas.height = timelineHeight * 10 + detailsImageSize.x / 2;
		
		var detailsCTX = detailsCanvas.getContext('2d');
		// draw a canvas with the width of the image and with the geological eras written on the respective colours, and a transparent grey mark for when the current genus lived
		var geologicalEraTime = geologicalTimeRange[0] - geologicalTimeRange[3];
		var pixelsPerMillionYears = detailsImageSize.x / geologicalEraTime;
		
		detailsCTX.fillStyle = colours.text;
		
		detailsCTX.font = "bold " + textSize + "pt Georgia";
		detailsCTX.fillText('Time lived:', textSize / 2, textSize * 1.5);
		
		var geologicalTimePositions = [
			0,
			(geologicalTimeRange[0] - geologicalTimeRange[1]) * pixelsPerMillionYears,
			(geologicalTimeRange[0] - geologicalTimeRange[2]) * pixelsPerMillionYears,
			(geologicalTimeRange[0] - geologicalTimeRange[3]) * pixelsPerMillionYears
		];
		
		var geologicalTimeGaps = [
			geologicalTimePositions[1] - geologicalTimePositions[0],
			geologicalTimePositions[2] - geologicalTimePositions[1],
			geologicalTimePositions[3] - geologicalTimePositions[2]
		];
		
		var taxonTimePositions = [
			(geologicalTimeRange[0] - details.earliest) * pixelsPerMillionYears,
			(geologicalTimeRange[0] - details.latest) * pixelsPerMillionYears,
		];
		
		var taxonTimeGap = taxonTimePositions[1] - taxonTimePositions[0];
		
		// level 3 : actual period timing
		
		detailsCTX.font = "bold " + textSize + "pt Georgia";
			
		for(var i = 0; i < geologicalTimeGaps.length; i++) { // Triassic, Jurassic and Cretaceous
			
			detailsCTX.fillStyle = eraColours[i];
			
			detailsCTX.fillRect(
				geologicalTimePositions[i],
				timelineHeight * 3,
				geologicalTimeGaps[i],
				timelineHeight
			);
			
			//~ console.log(geologicalTimeGaps[i]);
			
			detailsCTX.fillStyle = colours.text;
			
			detailsCTX.fillText(
				eraNames[i],
				textSize / 2 + geologicalTimePositions[i],
				timelineHeight * 3 + textSize * 1.5
			);
		}
		
		detailsCTX.fillStyle = '#0000007F';
		
		detailsCTX.fillRect(
			taxonTimePositions[0],
			timelineHeight * 3,
			taxonTimeGap,
			timelineHeight
		); // transparent rectangle for when it lived
		
		detailsCTX.fillStyle = colours.text;
		detailsCTX.font = textSize + "pt Georgia";
		
		// level 1 : line to start time
		detailsCTX.beginPath();
		detailsCTX.moveTo(taxonTimePositions[0], timelineHeight * 2);
		detailsCTX.lineTo(taxonTimePositions[0], timelineHeight * 4);
		detailsCTX.stroke();
		
		detailsCTX.fillText(
			details.earliest + ' mya',
			taxonTimePositions[0] - textSize * 7,
			timelineHeight * 2 + textSize * 1.5
		);
		
		// level 2 : line to end time
		detailsCTX.beginPath();
		detailsCTX.moveTo(taxonTimePositions[1], timelineHeight * 1);
		detailsCTX.lineTo(taxonTimePositions[1], timelineHeight * 4);
		detailsCTX.stroke();
		
		detailsCTX.fillText(
			details.latest + ' mya',
			taxonTimePositions[1] - textSize * 7,
			timelineHeight + textSize * 1.5
		);
		
		// draw a canvas for the discovery time
		
		detailsCTX.fillStyle = colours.text;
		
		detailsCTX.font = "bold " + textSize + "pt Georgia";
		detailsCTX.fillText('Time described:', textSize / 2, timelineHeight * 4 + textSize * 1.5);
		
		var realEraTime = discoveryTimeRange[3] - discoveryTimeRange[0];
		
		var pixelsPerYear = detailsImageSize.x / realEraTime;
		
		var timePositions = [
			0,
			(discoveryTimeRange[1] - discoveryTimeRange[0]) * pixelsPerYear,
			(discoveryTimeRange[2] - discoveryTimeRange[0]) * pixelsPerYear,
			(discoveryTimeRange[3] - discoveryTimeRange[0]) * pixelsPerYear
		];
		
		var taxonTimePosition = (details.discovery - discoveryTimeRange[0])  * pixelsPerYear;
		
		// level 3 : actual period timing
		
		detailsCTX.font = "bold " + textSize + "pt Georgia";
		
		detailsCTX.fillStyle = colours.background;
		detailsCTX.fillRect(
			0,
			timelineHeight * 6,
			detailsImageSize.x,
			timelineHeight
		);
		
		detailsCTX.fillStyle = colours.text;
		for(var i = 0; i < timePositions.length - 1; i++) { // 1800, 1900, 2000
			detailsCTX.fillText(
				discoveryTimeRange[i],
				textSize / 2 + timePositions[i],
				timelineHeight * 6 + textSize * 1.5
			);
			
			//~ console.log(timePositions[i]);
			
			detailsCTX.beginPath();
			detailsCTX.moveTo(timePositions[i], timelineHeight * 6);
			detailsCTX.lineTo(timePositions[i], timelineHeight * 7);
			detailsCTX.stroke();
		}
		
		detailsCTX.fillStyle = colours.text;
		detailsCTX.font = textSize + "pt Georgia";
		
		// level 1 : line to start time
		detailsCTX.beginPath();
		detailsCTX.moveTo(taxonTimePosition, timelineHeight * 5);
		detailsCTX.lineTo(taxonTimePosition, timelineHeight * 7);
		detailsCTX.stroke();
		
		detailsCTX.fillText(
			details.discovery + ' A.D.',
			taxonTimePosition - textSize * 6,
			timelineHeight * 5 + textSize * 1.5
		);
		
		// size comparison image
		
		mainImageSize = new P(
			details.length,
			details.length * 8 / 16,
		);
		
		personImageSize = new P(
			1.8 * 2 / 3,
			1.8
		);
		
		totalSize = new P(
			personImageSize.x + mainImageSize.x,
			Math.max(personImageSize.y, mainImageSize.y),
		)
		
		detailsCTX.font = "bold " + textSize + "pt Georgia";
		detailsCTX.fillText('Size comparison:', textSize / 2, timelineHeight * 7 + textSize * 1.5);
		
		detailsCTX.fillStyle = colours.background;
		detailsCTX.fillRect(
			0,
			timelineHeight * 8,
			detailsCanvas.width,
			detailsCanvas.height
		);
		
		var pixelsPerMetre;
		
		if(totalSize.x > totalSize.y * 2) { // if on the wide side
			pixelsPerMetre = detailsCanvas.width / totalSize.x;
		}else{ // if tall
			pixelsPerMetre = detailsCanvas.width / 2 / totalSize.y;
		}
		
		try{ // draw dinosaur
			var image = document.createElement('img');
			image.src = 'images/' + taxon + '.jpg';
			
			var imageStartPosition = new P(
				0,
				detailsCanvas.height - mainImageSize.y * pixelsPerMetre
			);
			
			//~ console.log(image);
			
			var imageOnCanvasSize = new P(
				mainImageSize.x * pixelsPerMetre,
				mainImageSize.y * pixelsPerMetre
			);
			
			detailsCTX.drawImage(
				image,
				imageStartPosition.x,
				imageStartPosition.y,
				imageOnCanvasSize.x,
				imageOnCanvasSize.y
			);
			
			detailsCTX.beginPath();
			detailsCTX.moveTo(2, imageStartPosition.y - timelineHeight);
			detailsCTX.lineTo(2, imageStartPosition.y);
			detailsCTX.stroke();
			
			detailsCTX.beginPath();
			detailsCTX.moveTo(imageOnCanvasSize.x, imageStartPosition.y - timelineHeight);
			detailsCTX.lineTo(imageOnCanvasSize.x, imageStartPosition.y);
			detailsCTX.stroke();
			
			detailsCTX.beginPath();
			detailsCTX.moveTo(2, imageStartPosition.y - timelineHeight / 2);
			detailsCTX.lineTo(imageOnCanvasSize.x, imageStartPosition.y - timelineHeight / 2);
			detailsCTX.stroke();
			
			detailsCTX.fillStyle = colours.text;
			
			detailsCTX.fillText(
				details.length + 'm',
				imageOnCanvasSize.x / 2,
				imageStartPosition.y - timelineHeight 
			);
			
		}catch(e){
			//~ console.log(e);
		}
		
		try{ // draw human
			
			var humanImageStartPosition = new P(
				detailsCanvas.width - personImageSize.x * pixelsPerMetre,
				detailsCanvas.height - personImageSize.y * pixelsPerMetre
			);
			
			var humanImageOnCanvasSize = new P(
				personImageSize.x * pixelsPerMetre,
				personImageSize.y * pixelsPerMetre
			);
			
			detailsCTX.drawImage(
				humanImage,
				humanImageStartPosition.x,
				humanImageStartPosition.y,
				humanImageOnCanvasSize.x,
				humanImageOnCanvasSize.y
			);
			
		}catch(e){
			console.log(e);
		}
		
		detailsTable.appendChild(detailsCanvas);
	}
	
	htmlElement.appendChild(titleBar);
	htmlElement.appendChild(imageBox);
	htmlElement.appendChild(classificationTable);
	htmlElement.appendChild(detailsTable);
	
	//********************MAKE THE NAMES LINKS**************************
	
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
					fillDetailsDivider(this.textContent);
				}
			}
		}
	}
	
	//*********************ZOOM AND TRANSLATE***************************
	
	translation.x = 0 - treeWithDetails[taxon].x;
	translation.y = 0 - treeWithDetails[taxon].y;
	var depthOfTaxon = getTreeDepth(taxon);
	translation.zoom  = Math.pow(2, depthOfTaxon - 1.1); // power of two, doubles each taxon depth
	
	translation.y += canvasSize.y / Math.pow(2, depthOfTaxon ); // power of two, doubles each taxon depth
	
	//~ translation.y += canvasSize.y / 2;
	drawTree();
}

fillDetailsDivider('@Dinosauria');

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