window.onload=function () {
/**********************************************************************
RULES:
* Must be a potentially individual genus of dinosaur. No birds or early archosaurs
* 1 x 1080p jpeg image with capitalised genus name facing left to right white bars
* extra images from 01-99
* species listed as though genus is common ancestor, even though this is not neccesarily always the case
**********************************************************************/

var url = window.location.href;

var isMainPage = url.substring(url.length - 9, url.length) == 'tree.html';

if(isMainPage) { // if it is actually the tree displayer html document
	var ctx = document.getElementsByTagName('canvas')[0].getContext('2d'); // get context to draw
}
//~ ctx.imageSmoothingQuality = "high";

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

if(isMainPage) { 	
	document.getElementById('side_divider').style.height = canvasSize.y + 'px';
}
//~ console.log(document.getElementById('side_divider').style.height);

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

var genusImageURLs = {
	'Acrocanthosaurus' : 'https://imgur.com/P5E8alt.jpg',
	'Agathaumas' : 'https://imgur.com/Dhzl62l.jpg',
	'Alcovasaurus' : 'https://imgur.com/0xPwUek.jpg',
	'Andhrasaurus' : 'https://imgur.com/Vh6cbis.jpg',
	'Anomalipes' : 'https://imgur.com/4bVLLYl.jpg',
	'Carnotaurus' : 'https://imgur.com/bZjchKA.jpg',
	'Herrerasaurus' : 'https://imgur.com/EzHj2g0.jpg',
	'Ornitholestes' : 'https://imgur.com/OrVMXAF.jpg',
	'Pachycephalosaurus' : 'https://imgur.com/vOkorDY.jpg',
	'Riojasaurus' : 'https://imgur.com/tePUCrj.jpg',
	'Spinosaurus' : 'https://imgur.com/6oXy0aR.jpg',
}

function getImageForTaxon(i) {
	var image = genusImageURLs[i];
	if(!image) {
		return('alt_images/generic.jpg');
	}
	return(image);
}

var mobileZoomRatio = 2;

function fastClickTimeUp() {
	isFastClick = false;
}

if (isMainPage) {
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
	
}

// earliest, latest, discovery, length, synonyms, possibleDuplicate, countries, describedBy, isDubious, notes

function Copyright(name, siteURL, licence, licenceURL) {
	this.name = name;
	this.siteURL = siteURL;
	this.licence = licence;
	this.licenceURL = licenceURL;
}

function Genus (earliest, latest, discovery, length, synonyms, possibleDuplicate, countries, describedBy, isDubious, notes, attribution) { //this is for the database, not the tree
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
	this.attribution = attribution;
	
	this.image = document.createElement("img");
}

function Node(name, x, y, children, alottedHeight) { // nodes for the detailed tree
	this.name = name;
	this.x = x;
	this.y = y;
	this.children = children;
	this.alottedHeight = alottedHeight; // this is
	
	this.representativeGenus = false;
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
	'Acanthopholis' :           new Genus(145,   100,   1867, 5,    [], '', ['England'],      'Huxley',                 false, ''),
	'Achelousaurus' :           new Genus(74.2,  71.2,  1994, 6,    [], '', ['USA'],          'Sampson',                false, 
		'It has been suggested that it was the direct descendant of the similar genus Einiosaurus (which has spikes but no bosses) and the direct ancestor of Pachyrhinosaurus (which has larger bosses). \
		The first two genera would be transitional forms, evolving through anagenesis from Styracosaurus.'),
	'Acheroraptor' :            new Genus(66,    66,    2013, 3,    [], '', ['USA'],          'Evans et al.',           false, ''),
	'Achillesaurus' :           new Genus(86.3,  83.6,  2007, 1.5,  [], 'Alvarezsaurus', 
	                                                                        ['Argentina'],    'Martinelli & Vera',      true,  ''),
	'Achillobator' :            new Genus(98,    83,    1999, 5.5,  [], '', ['Mongolia'],     'Perle, Norell & Clark', false, ''),
	'Acristavus' :              new Genus(81,    76,    2011, 5.5,  [], '', ['USA'],          'Gates et al.',           false, ''),
	'Acrocanthosaurus' :        new Genus(125,   100,   1950, 11.5, ['Acracanthus'], 
	                                                                    '', ['USA'],          'Stovall & Langston',     false, '', new Copyright('ThatChapThere', 'http://thatchapthere.com', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
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
	                                                                        ['USA'],          'Cope',                   true,  '', new Copyright('Charles R. Knight', 'http://www.charlesrknight.com/index.htm', 'Public Domain (CC0)', 'https://creativecommons.org/share-your-work/public-domain/')),
	'Agilisaurus' :             new Genus(171.6, 161.2, 1990, 2,    [], '', ['China'],        'Peng',                   false, ''),
	'Agnosphitys' :             new Genus(205.6, 201.6, 2002, 3,    [], '', ['England'],      'Fraser et al.',          false, 'Possible non-dinosaur dinosauriform silesaurid.'),
	'Agrosaurus' :              new Genus(205.6, 201.6, 1891, 3,    [], 'Thecodontosaurus', 
	                                                                        ['England'],      'Seeley',                 true, 'Possibly, but not likely, Australian.'),
	'Agujaceratops' :           new Genus(80,    73,    2006, 4.75, [], '', ['USA'],          'Lucas et al.',           false, ''),
	'Agustinia' :               new Genus(116,   110,   1999, 15,   [], '', ['Argentina'],    'Bonaparte',              true,  ''),
	'Ahshislepelta' :           new Genus(76,    72,    2011, 4,    [], '', ['USA'],          'Burns & Sullivan',       false, ''),
	'Ajancingenia' :            new Genus(85,    66,    1981, 1.4,  [], 'Heyuannia', 
	                                                                        ['Mongolia'],     'Barsbold',               true,  ''),
	'Ajkaceratops' :            new Genus(86,    83,    2010, 1,    [], '', ['Hungary'],      'Ősi et al.',              false, ''),
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
	'Alcovasaurus' :            new Genus(156,   151,   2016, 7,    [], '', ['USA'],          'Galton & Carpenter',   false, '', new Copyright('ThatChapThere', 'http://thatchapthere.com', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Alectrosaurus' :           new Genus(84,    71,    1933, 5,    [], '', ['Mongolia'],     'Gilmore',                false, ''),
	'Aletopelta' :              new Genus(84,    71,    2001, 6,    [], '', ['USA'],          'Ford & Kirkland',        false, ''),
	'Algoasaurus' :             new Genus(145,   136,   1904, 9,    [], '', ['South Africa'], 'Bloom',                  false, ''),
	'Alioramus' :               new Genus(71,    66,    1976, 6,    [], '', ['Mongolia'],     'Kurzanov',               false, ''),
	'Allosaurus' :              new Genus(156,   145,   1877, 12, ['Creosaurus', 'Labrosaurus', 'Antrodemus'], 
	                                                                    '', ['USA'],          'Marsh',                  false, 'Despite its popularity, Allosaurus has been considered potentially dubious because of its incomplete holotype.'),
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
	'Andhrasaurus' :            new Genus(201.3, 182.7, 2014, 3,    [], '', ['India'],        'Ulansky',                true,  '', new Copyright('ThatChapThere', 'http://thatchapthere.com', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Angolatitan' :             new Genus(94,    89,    2011, 12,   [], '', ['Angola'],       'Mateus et al.',          false, ''),
	'Angulomastacator' :        new Genus(75.7,  78.1,  2009, 8,    [], '', ['USA'],          'Wagner & Lehman,',       false, 
		'The left maxilla (the main tooth-bearing bone of the upper jaw) is curved down approximately 45° at its anterior end, with the tooth row bent to fit, unlike any other hadrosaur.'),
	'Angolatitan' :             new Genus(94,    89,    2011, 12,   [], '', ['Angola'],       'Mateus et al.',          false, ''),
	'Aniksosaurus' :            new Genus(96,    91,    2006, 2.5,  [], '', ['Argentina'],    'Martínez & Novas',       false, ''),
	'Animantarx' :              new Genus(102,   99,    1999, 3,    [], '', ['USA'],          'Carpenter et al.',       false, ''),
	'Ankylosaurus' :            new Genus(67,    66,    1908, 9,    [], '', ['USA'],          'Brown',                  false, ''),
	'Anodontosaurus' :          new Genus(73,    67,    1929, 5,    [], '', ['Canada'],       'Sternberg',              false, ''),
	'Anomalipes' :              new Genus(100.5, 93.9,  2018, 2.2,  [], '', ['China'],        'Yu et al.',              false, '', new Copyright('ThatChapThere', 'http://thatchapthere.com', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Anoplosaurus' :            new Genus(115,   100,   1879, 3.5,  [], '', ['England'],      'Seeley',                 false, ''),
	'Anserimimus' :             new Genus(71,    68,    1988, 3,    [], '', ['Mongolia'],     'Barsbold',               false, ''),
	'Antarctopelta' :           new Genus(75,    71,    2006, 4,    [], '', ['Antarctica'],   'Salgado & Gasparini',    false, ''),
	'Antarctosaurus' :          new Genus(83,    78,    1929, 12,   [], '', ['Argentina'],    'von Huene',              false, ''),
	'Antetonitrus' :            new Genus(220,   209,   2003, 10,   [], '', ['South Africa'], 'Yates & Kitching',       false, ''),
	'Anzu' :                    new Genus(71,    66,    2014, 3.5,  [], '', ['USA'],          'Lamanna et al.',         false, ''),
	'Aoniraptor' :              new Genus(96,    91,    2016, 6,    [], '', ['Argentina'],    'Motta et al.',           false, ''),
	'Aorun' :                   new Genus(164,   161,   2013, 1,    [], '', ['China'],        'Choiniere et al.',       false, ''),
	'Apatoraptor' :             new Genus(84,    71,    2016, 2,    [], '', ['Canada'],       'Funston & Currie',       false, ''),
	'Apatosaurus' :             new Genus(156,   151,   1877, 23,   [], '', ['USA'],          'Marsh',                  false, ''),
	'Appalachiosaurus' :        new Genus(82,    76,    2005, 10.5, [], '', ['USA'],          'Carr et al.',            false, ''),
	'Aquilops' :                new Genus(108,   104,   2014, 0.6,  [], '', ['USA'],          'Farke et al.',           false, ''),
	'Aragosaurus' :             new Genus(130,   125,   1987, 12,   [], '', ['Spain'],        'Sanz et al.',            false, ''),
	'Aralosaurus' :             new Genus(86,    71,    1968, 8,    [], '', ['Kazakhstan'],   'Rozhdestvensky',         false, ''),
	'Archaeoceratops' :         new Genus(130,   125,   1997, 1.5,  [], '', ['China'],        'Dong & Azuma',           false, ''),
	'Archaeodontosaurus' :      new Genus(174.1, 163.5, 2005, 3,    [], '', ['Madagascar'],   'Buffetaut',              false, 'This was probably a true sauropod, but had prosauropod like teeth.'),
	'Archaeopteryx' :           new Genus(151,   145,   1861, 0.4,  ['Griphosaurus', 'Griphornis', 'Jurapteryx', 'Archaeornis'], 
	                                                                    '', ['Germany'],      'von Meyer',              false, ''),
	'Archaeornithoides' :       new Genus(84,    71,    1992, 1,    [], 'Velociraptor',
	                                                                        ['Mongolia'],     'Elzanowksi & Wellnhofer',false, 'In 1992 Andrzej Elżanowski and Peter Wellnhofer noted that the only known specimen of Archaeornithoides sported distinct bite marks and suggested its braincase had been chewed off by a weasel-like critter, then a decade later Jim Clark and colleagues mused that it may have passed through the digestive tract of the predator before fossilization. If true, this is the first evidence of Mesozoic mammals eating dinosaurs and, as far as we know, the only example of such a journey in the entire fossil record.'),
	'Archaeornithomimus' :      new Genus(84,    71,    1972, 3.3,  [], '', ['China'],        'Russel',                 false, ''),
	'Arcovenator' :             new Genus(76,    72,    2013, 5.8,  [], '', ['France'],       'Tortosa et al.',         false, ''),
	'Arcusaurus' :              new Genus(201.3, 190.8, 2011, 6.5,  [], '', ['South Africa'], 'Yates et al.',           false, ''),
	'Arkansaurus' :             new Genus(125,   99,    2018, 3.5,  [], '', ['USA'],          'Hunt & Quinn',           false, ''),
	'Arkharavia' :              new Genus(71,    66,    2010, 10,   [], '', ['Russia'],       'Alifanov & Bolotsky',    true,  ''),
	'Arrhinoceratops' :         new Genus(73,    67,    1925, 7,    [], '', ['Canada'],       'parks',                  true,  ''),
	'Arstanosaurus' :           new Genus(86,    71,    1982, 4,    [], 'Batyrosaurus',
	                                                                        ['Kazakhstan'],   'Shilin & Suslov',        false, ''),
	'Asiaceratops' :            new Genus(100,   95,    1989, 1,    [], '', ['Uzbekistan', 'China', 'Mongolia'],
	                                                                                          'Lev Nesov, L.F. Kaznyshkina & Gennadiy Olegovich Cherepanov',
	                                                                                                                    true,  ''),
	'Asiatosaurus' :            new Genus(125,   100,   1924, 10,   [], '', ['China'],        'Osborn',                 true,  'Tooth taxon'),
	'Astrodon' :                new Genus(118,   110,   1865, 15,   ['Pleurocoelus', 'Astrodontaurus', 'Astrodonius', 'Astrodontosaurus'], 
	                                                                    '', ['USA'],          'Leidy',                  false, ''),
	'Astrophocaudia' :          new Genus(112,   99,    2012, 10,   [], '', ['USA'],          'D’Emic',                 false, ''),
	'Asylosaurus' :             new Genus(209,   201,   1936, 2,    [], '', ['England'],      'Galton',                 false, ''),
	
	'Atacamatitan' : 			new Genus(99.7,  66,    2011, 20,   [], '', ['Chile'],        'Kellner et al.',         false, 'Atacamatitan is one of the best preserved dinosaurs to be found in Chile.'),
	'Atlantosaurus' :           new Genus(156.3, 146.8, 1877, 35,   [], 
	                                                         'Apatosaurus', ['USA'],          'Marsh',                  false, 'Described during the bone wars, before modern rigour, it is practically impossible to identifty whether or not Atlantosaurus is a distinct genus. In fact, Marsh called the genus Titanosaurus, before realising that the name was already taken.'),
	'Atlasaurus' :              new Genus(167.7, 164.7, 1999, 15,   [], '', ['Morocco'],      'Monbaron, Russel & Taquet',
	                                                                                                                    false, ''),
	'Atlascopcosaurus' :        new Genus(125,   100.5, 1989, 3,    [], 
	                                                          'Anabisetia', ['Australia'],    'Rich & Vickers-Rich',    false, ''),
	'Atrociraptor' :            new Genus(83.5,  66,    2004, 2,    [], '', ['Canada'],       'Currie & Varricchio',    false, ''),
	'Atsinganosaurus' :         new Genus(72.1,  68,    2010, 12,   [], '', ['France'],       'Garcia et al.',          false, ''),
	'Aublysodon' :              new Genus(79,    74.9,  1868, 7,    [], 'Daspletosaurus',
	                                                                        ['USA'],          'Leidy',                  false, 'A dubious genus, known only from teeth.'),
	'Aucasaurus' :              new Genus(86.3,  72.1,  2002, 6.1,  [], '', ['Argentina'],    'Coria, Chiappe & Dingus',false, ''),
	'Augustynolophus' :         new Genus(74,    66,    2014, 10,   [], '', ['USA'],          'Prieto-Marquez et al.',  false, ''),
	'Auroraceratops' :          new Genus(125,   113,   2005, 2,    [], '', ['China', 'South Korea'],
	                                                                                          'You et al.',             false, ''),
	'Aurornis' :                new Genus(157.3, 163.5, 2013, 0.5,  [], '', ['China'],        'Gedefroit et al.',       false, 'This may actually not be a non-avian maniraptoran, and may simply be a bird.'),
	'Australodocus' :           new Genus(163.5, 145,   2007, 17,   [], '', ['Tanzania'],     'Remes',                  false, ''),
	'Australovenator' :         new Genus(93.9,  100.5, 2009, 6,    [], '', ['Australia'],    'Hocknull et al.',        false, ''),
	'Austrocheirus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Austroposeidon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Austroraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Austrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Avaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Aviatyrannis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Avimimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Avipes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bactrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bagaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bagaraatan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bahariasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bainoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Balaur' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Balochisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bambiraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Banji' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Baotianmansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Barapasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Barilium' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Barosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Barrosasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Barsboldia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Baryonyx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Batyrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Baurutitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bayannurosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Beibeilong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Beipiaognathus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Beipiaosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Beishanlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bellusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Berberosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Betasuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bicentenaria' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bienosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bihariosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bissektipelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bistahieversor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Blasisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Blikanasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bolong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bonapartenykus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bonapartesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bonatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bonitasaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Borealopelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Borealosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Boreonykus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Borogovia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bothriospondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brachiosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brachyceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brachylophosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brachypodosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brachytrachelopan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bradycneme' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brasilotitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bravoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Breviceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brohisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brontomerus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Brontosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Bruhathkayosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Buitreraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Burianosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Buriolestes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Byronosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Caenagnathasia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Caenagnathus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Caihong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Calamosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Calamospondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Callovosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Camarasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Camarillasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Camelotia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Camposaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Camptosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Campylodoniscus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Canardia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Carcharodontosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cardiodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Carnotaurus' : new Genus(72   , 69.9    , 1985    , 9 ,   [], '', ['Argentina'],             'Bonaparte',                       false, 'Carnotaurus was well adapted for running and was possibly one of the fastest large theropods.', new Copyright('Jacob', 'credits.html#Jacob', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Caseosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cathartesaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cathetosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Caudipteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cedarosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cedarpelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cedrorestes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Centrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cerasinops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ceratonykus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ceratosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cetiosauriscus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cetiosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Changchunsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Changyuraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chaoyangsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Charonosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chasmosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chebsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chenanisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chialingosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chiayusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chilantaisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chilesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chindesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chingkankousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chinshakiangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chirostenotes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Choconsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chondrosteosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chromogisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chuandongocoelurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chuanjiesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chuanqilong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chubutisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chungkingosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Chuxiongosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cionodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Citipati' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Claorhynchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Claosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Clasmodosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Coahuilaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Coelophysis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Coeluroides' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Coelurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Colepiocephale' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Coloradisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Comahuesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Compsognathus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Compsosuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Concavenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Conchoraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Condorraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Coronosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Corythoraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Corythosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Craspedodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Craterosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Crichtonpelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Crichtonsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cristatusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cruxicheiros' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cryolophosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cryptosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Cumnoria' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Daanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dacentrurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Daemonosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dahalokely' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dakotadon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dakotaraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Daliansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dandakosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Darwinsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dashanpusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Daspletosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Datanglong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Datousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Daxiatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Deinocheirus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Deinodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Deinonychus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Delapparentia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Deltadromeus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Demandasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Denversaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Diabloceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Diamantinasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Diclonius' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dicraeosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Didanodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dilong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dilophosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Diluvicursor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dinheirosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dinodocus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Diplodocus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Diplotomodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dolichosuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dongbeititan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dongyangopelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dongyangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Draconyx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dracopelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dracoraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dracorex' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dracovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dreadnoughtus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Drinker' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dromaeosauroides' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dromaeosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dromiceiomimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Drusilasaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dryosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dryptosauroides' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dryptosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dubreuillosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Duriatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Duriavenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dyoplosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dysalotosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dysganus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dyslocosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Dystrophaeus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Echinodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Edmontonia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Edmontosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Efraasia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Einiosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ekrixinatosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Elaltitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Elaphrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Elmisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Elopteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Elrhazosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Emausaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Embasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Enigmosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eoabelisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eocarcharia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eocursor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eodromaeus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eolambia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eomamenchisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eoplophysis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eoraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eosinopteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eotrachodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eotriceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eotyrannus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eousdryosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Epachthosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Epanterias' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Epichirostenotes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Epidexipteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Equijubus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Erectopus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Erketu' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Erliansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Erlikosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eshanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eucamerotus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eucercosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eucnemesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Euhelopus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Euoplocephalus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Euronychodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Europasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Europatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Europelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Euskelosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Eustreptospondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fabrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Falcarius' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fendusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ferganasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ferganastegos' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ferganocephale' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Foraminacephale' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fosterovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fruitadens' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fukuiraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fukuisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fukuititan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fukuivenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fulengia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fulgurotherium' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Fusuisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Futalognkosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Galeamopus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gallimimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Galvesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gannansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ganzhousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gargoyleosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Garudimimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gasosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gasparinisaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gastonia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Geminiraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Genusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Genyodectes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Geranosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gideonmantellia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Giganotosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gigantoraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gigantosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gigantspinosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gilmoreosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Giraffatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Glacialisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Glishades' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Glyptodontopelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gobiceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gobisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gobititan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gobivenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gojirasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gondwanatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gongbusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gongpoquansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gongxianosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gorgosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Goyocephale' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Graciliceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Graciliraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gravitholus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gryphoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gryponyx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gryposaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gspsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Guaibasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Gualicho' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Guanlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hadrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Haestasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hagryphus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Halszkaraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Halticosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hanssuesia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Haplocanthosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Haplocheirus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Harpymimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Haya' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Heishansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Helioceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Heptasteornis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Herrerasaurus' : new Genus(231.7, 225, 1963, 6,   [], '', ['Argentina'],             'Reig',                       false, '', new Copyright('Saffron', 'credits.html#Saffron', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Hesperonychus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hesperosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Heterodontosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hexing' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hexinlusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Heyuannia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hierosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hippodraco' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Histriasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Homalocephale' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hoplitosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Horshamosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Huabeisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hualianceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Huanansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Huanghetitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Huangshanlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Huaxiagnathus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Huayangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hudiesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Huehuecanauhtlus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hulsanpes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hungarosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Huxleysaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hylaeosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hypacrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hypselosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hypselospinus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hypsibema' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hypsilophodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Hypsirhophus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ichthyovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ignavusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Iguanacolossus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Iguanodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Iliosuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ilokelesia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Incisivosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Indosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Indosuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Inosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Irritator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Isaberrysaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Isanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ischioceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ischyrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Isisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Itemirus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Iuticosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jainosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jaklapallisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Janenschia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jaxartosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jeholosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jeyawati' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jianchangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jiangjunosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jiangshanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jiangxisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jianianhualong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jinfengopteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jingshanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jintasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jinyunpelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jinzhousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jiutaisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jobaria' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Jubbulpuria' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Judiceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Juratyrant' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Juravenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kaatedocus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kaijiangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kakuru' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kangnasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Karongasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Katepensaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kayentavenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kazaklambia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kelmayisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kentrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kerberosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Khaan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Khetranisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kileskus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kinnareemimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Klamelisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kol' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Koparion' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Koreaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Koreanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Koshisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kosmoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kotasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Koutalisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kritosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kryptops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Krzyzanowskisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kukufeldia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kulceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kulindadromeus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kunbarrasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kundurosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kunmingosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Kuszholia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Labocania' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Laevisuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Laiyangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lamaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lambeosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lametasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lamplughsaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lanzhousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Laosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lapampasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Laplatasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lapparentosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Laquintasaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Latenivenatrix' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Latirhinus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Leaellynasaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Leinkupal' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Leonerasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lepidus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Leptoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Leptorhynchos' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Leshansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lesothosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lessemsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Levnesovia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lexovisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Leyesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Liaoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Liaoningosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Liaoningvenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ligabueino' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ligabuesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Liliensternus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Limaysaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Limusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Linhenykus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Linheraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Linhevenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lirainosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Liubangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lohuecotitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Loncosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lophorhothon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lophostropheus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Loricatosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Loricosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Losillasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lourinhanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lourinhasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Luanchuanraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lucianovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lufengosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lukousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Luoyanggia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lurdusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lusitanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lusotitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lycorhinus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Lythronax' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Machairasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Machairoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Macrogryphosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Macrurosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Magnapaulia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Magnamanus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Magnirostris' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Magnosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Magyarosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mahakala' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Maiasaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Majungasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Malarguesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Malawisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Maleevus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mamenchisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Manidens' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mandschurosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mansourasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mantellisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mantellodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mapusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Marisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Marmarospondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Marshosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Martharaptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Masiakasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Massospondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Matheronodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Maxakalisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Medusaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Megalosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Megaraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mei' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Melanorosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mendozasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mercuriceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Meroktenos' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Metriacanthosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Microceratus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Microcoelus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Microhadrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Micropachycephalosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Microraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Microvenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mierasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Minmi' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Minotaurasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Miragaia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mirischia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Moabosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mochlodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mojoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mongolosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Monkonosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Monoclonius' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Monolophosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mononykus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Montanoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Morelladon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Morinosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Morrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mosaiceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Murusraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mussaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Muttaburrasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Muyelensaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Mymoorapelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Naashoibitosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nambalia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nankangia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nanningosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nanotyrannus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nanshiungosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nanuqsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nanyangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Narambuenatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nasutoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nebulasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nedcolbertia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nedoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Neimongosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nemegtomaia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nemegtosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Neosodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Neovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Neuquenraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Neuquensaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nicksaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nigersaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ningyuansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Niobrarasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nipponosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Noasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nodocephalosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nodosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nomingia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nopcsaspondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Normanniasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nothronychus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Notoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Notocolossus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Notohypsilophodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nqwebasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nuthetes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Nyasasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ohmdenosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ojoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ojoraptorsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Olorotitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Omeisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Onychosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Oohkotokia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Opisthocoelicaudia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Oplosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Orkoraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ornithodesmus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ornitholestes' :      new Genus(156.3, 146.8, 1903, 2,   [], '', ['USA'],             'Osborn',                       false, '', new Copyright('Iona', 'credits.html#Iona', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Ornithomimoides' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ornithomimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ornithopsis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Orodromeus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Orthogoniosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Orthomerus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Oryctodromeus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Osmakasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ostafrikasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ostromia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Othnielia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Othnielosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Otogosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ouranosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Overosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Oviraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Owenodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Oxalaia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ozraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pachycephalosaurus' : new Genus(72.1   , 66    , 1931    , 4.5 ,   ['Tylosteus'], '', ['USA'],             'Gilmore',                       
																								false, 'Tylosteus was actually a senior synonym, but was rejected due to its disuse. Tylosteus may actually be a senior synonym of Dracorex, but that may itself be a juvenile Pachycephalosaurus',
																								new Copyright('ThatChapThere', 'http://thatchapthere.com', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Pachyrhinosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pachyspondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pachysuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Padillasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pakisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Palaeopteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Palaeoscincus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Paludititan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pampadromaeus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pamparaptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Panamericansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pandoravenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Panguraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Panoplosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Panphagia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pantydraco' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Paralititan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Paranthodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pararhabdodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Parasaurolophus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Parksosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Paronychodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Parvicursor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Passer' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Patagonykus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Patagosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Patagotitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pawpawsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pectinodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pedopenna' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pegomastax' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Peishansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pelecanimimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pellegrinisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Peloroplites' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pelorosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Penelopognathus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pentaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Petrobrasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Phaedrolosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Philovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Phuwiangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Phyllodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Piatnitzkysaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pinacosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pisanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pitekunsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Piveteausaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Planicoxa' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Plateosauravus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Plateosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Platyceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Platypelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Plesiohadros' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pleurocoelus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pneumatoraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Podokesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Poekilopleuron' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Polacanthus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Polyodontosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Polyonax' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Powellvenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pradhania' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Prenocephale' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Prenoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Priconodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Priodontognathus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Proa' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Probactrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Probrachylophosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Proceratosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Procompsognathus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Prodeinodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Propanoplosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Proplanicoxa' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Prosaurolophus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Protarchaeopteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Protoavis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Protoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Protognathosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Protohadros' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Psittacosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pteropelyx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pterospondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Puertasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pukyongosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pulanesaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pycnonemosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Pyroraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Qantassaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Qianzhousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Qiaowanlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Qijianglong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Qinlingosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Qingxiusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Qiupalong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Qiupanykus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Quaesitosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Quetecsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Quilmesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rahiolisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rahonavis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rajasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rapator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rapetosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Raptorex' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ratchasimasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rativates' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rayososaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rebbachisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Regaliceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Regnosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rhabdodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rhadinosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rhinorex' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rhoetosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Riabininohadros' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Richardoestesia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rinchenia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rinconsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Riojasaurus' : new Genus(227, 208.5, 1969, 10 ,   [], '', ['Argentina'],             'Bonaparte',                       false, '', new Copyright('Saffron', 'credits.html#Saffron', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Rocasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rubeosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ruehleia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rugocaudia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rugops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Rukwatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ruyangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sahaliyania' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saichania' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saldamosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saltasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saltopus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sanjuansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sanpasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Santanaraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saraikimasoom' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sarahsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sarcolestes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sarcosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sarmientosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saturnalia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saurolophus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sauroniops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sauropelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saurophaganax' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sauroplites' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sauroposeidon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saurornithoides' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Saurornitholestes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Savannasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Scansoriopteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Scelidosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Scipionyx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sciurumimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Scolosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Scutellosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Secernosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sefapanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Segisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Segnosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Seitaad' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sellacoxa' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Serendipaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Serikornis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shamosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shanag' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shantungosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shanxia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shanyangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shaochilong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shenzhousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shidaisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shingopana' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shixinggia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shuangbaisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shuangmiaosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shunosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Shuvuuia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Siamodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Siamosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Siamotyrannus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Siats' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sibirotitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sigilmassasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Siluosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Silvisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Similicaudipteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinocalliopteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinocoelurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinopeltosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinornithoides' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinornithomimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinornithosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinosauropteryx' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinotyrannus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sinusonasus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sirindhorna' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Skorpiovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sonidosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sonorasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Soriatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sphaerotholus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Spiclypeus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Spinophorosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Spinops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Spinosaurus' : new Genus(112   , 93.5    , 1915    , 15 ,   [], '', ['Egypt'],             'Stromer',                       false, '', new Copyright('ThatChapThere', 'http://thatchapthere.com', 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/')),
	'Spinostropheus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Staurikosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stegoceras' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stegopelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stegosaurides' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stegosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stenonychosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stenopelix' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stephanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stokesosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Streptospondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Struthiomimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Struthiosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Stygimoloch' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Styracosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Suchomimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Suchosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Sulaimanisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Supersaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Suuwassea' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Suzhousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Szechuanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tachiraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Talarurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Talenkauen' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Talos' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tambatitanis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tangvayosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tanius' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tanycolagreus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tanystrosuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Taohelong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tapuiasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tarascosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tarbosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tarchia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tastavinsaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tatankacephalus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tatankaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tataouinea' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tatisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Taurovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Taveirosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tawa' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tazoudasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Technosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tehuelchesaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Teihivenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Teinurosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Telmatosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tendaguria' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tengrisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tenontosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Teratophoneus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tethyshadros' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Texacephale' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Texasetes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Teyuwasu' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Thecocoelurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Thecodontosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Thecospondylus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Theiophytalia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Therizinosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Therosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Thescelosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Thespesius' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tianchisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tianyulong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tianyuraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tianzhenosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tichosteus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tienshanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Timimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Timurlengia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Titanoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Titanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tochisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tonganosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tongtianlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tornieria' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Torosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Torvosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tototlmimus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Trachodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tratayenia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Traukutitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Triceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Trigonosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Trimucrodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Trinisaura' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Triunfosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Troodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tsaagan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tsagantegia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tsintaosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tugulusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tuojiangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Turanoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Turiasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tylocephale' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tyrannosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Tyrannotitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Uberabatitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Udanoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ugrunaaluk' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ultrasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Unaysaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Unenlagia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Unescoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Unquillosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Urbacodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Utahceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Utahraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Uteodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Vagaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Vahiny' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Valdoraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Valdosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Variraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Velafrons' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Velocipes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Velociraptor' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Velocisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Venenosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Veterupristisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Viavenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Vitakridrinda' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Vitakrisaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Volkheimeria' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Vouivria' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Vulcanodon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wakinosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Walgettosuchus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wannanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wellnhoferia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wendiceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wiehenvenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Willinakaqe' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wintonotitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wuerhosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wulagasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wulatelong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Wyleyia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xenoceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xenoposeidon' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xenotarsosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xianshanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xiaosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xiaotingia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xingxiulong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xinjiangovenator' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xinjiangtitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xiongguanlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xixianykus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xixiasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xixiposaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xuanhanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xuanhuaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Xuwulong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yamaceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yandusaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yangchuanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yaverlandia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yehuecauhceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yi' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yimenosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yingshanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yinlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yixianosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yongjinglong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yuanmousaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yueosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yulong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yunganglong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yunmenglong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yunnanosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yurgovuchia' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Yutyrannus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zalmoxes' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zanabazar' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zapalasaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zapsalis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zaraapelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zby' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zephyrosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhanghenglong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhejiangosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhenyuanlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhongornis' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhongjianosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhongyuansaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhuchengceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhuchengtitan' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zhuchengtyrannus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Ziapelta' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zigongosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zizhongosaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zuniceratops' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zuolong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zuoyunlong' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zupaysaurus' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
	'Zuul' : new Genus(0   , 0    , 0    , 0 ,   [], '', [''],             '',                       false, ''),
}

var countryImages = {};

var worldMapImage = document.createElement('img');
worldMapImage.src = 'alt_images/geography/world_coloured.png';

var worldMapSizeRatio = 552 / 1280;

var geologicalTimeRange = [251.9, 201.3, 140, 66];
var eraNames = ['Triassic', 'Jurassic', 'Cretaceous'];
var eraColours = ['#FF7F00', '#7F00FF', '#00FF7F'];
var discoveryTimeRange = [1800, 1900, 2000, 2050];

var tree = { // basic tree
	'@Dinosauria' : '@Dinosauria',
		'@Saurischia' : '@Dinosauria',
			'@Herrerasauridae' : '@Saurischia',
				'-Herrerasauridae' : '@Herrerasauridae',
					'Caseosaurus' : '-Herrerasauridae',
						'crosbyensis' : 'Caseosaurus',
				'#Staurikosaurus1' : '@Herrerasauridae',
					'Staurikosaurus' : '#Staurikosaurus1',
						 'pricei' : 'Staurikosaurus',
					'#Herrerasaurus1' : '#Staurikosaurus1',
						'Herrerasaurus' : '#Herrerasaurus1',
							 'ischigualastensis' : 'Herrerasaurus',
						'#Chindesaurus1' : '#Herrerasaurus1',
							'Chindesaurus' : '#Chindesaurus1',
								'bryansmalli' : 'Chindesaurus',
							'Sanjuansaurus' : '#Chindesaurus1',	
								'gordilloi' : 'Sanjuansaurus',
			'@Sauropodomorpha' : '@Saurischia',
				'-Sauropodomorpha' : '@Sauropodomorpha',
					'Asylosaurus' : '-Sauropodomorpha',
						'yalensis' : 'Asylosaurus',
				'#Guaibasauridae1' : '@Sauropodomorpha',
					'@Guaibasauridae' : '#Guaibasauridae1',
						'-Guaibasauridae' : '@Guaibasauridae',
							'Agnosphitys' : '-Guaibasauridae',
								'cromhallensis' : 'Agnosphitys',
					'#Thecodontosauridae1' : '#Guaibasauridae1',
						'@Thecodontosauridae' : '#Thecodontosauridae1',
							'-Thecodontosauridae' : '@Thecodontosauridae',
								'Agrosaurus' : '-Thecodontosauridae',
									'macgillivrayi' : 'Agrosaurus',
						'#Efraasia1' : '#Thecodontosauridae1',
							'#Efraasia2' : '#Efraasia1',
								'Arcusaurus' : '#Efraasia2',
									'pereirabdalorum' : 'Arcusaurus',
							'@Plateosauria' : '#Efraasia1',
								'@Massopoda' : '@Plateosauria',
									'#Riojasaurus1' : '@Massopoda',
										'Riojasaurus' : '#Riojasaurus1',
											'incertus' : 'Riojasaurus',
									'#Massospondylidae2' : '@Massopoda',
									'#Massospondylidae1' : '#Massospondylidae2',
										'@Massospondylidae' : '#Massospondylidae1',
											'Adeopapposaurus' : '@Massospondylidae',
												'mognai' : 'Adeopapposaurus',
										'@Anchisauria' : '#Massospondylidae2',
											'Anchisaurus' : '@Anchisauria',
												 'polyzelus' : 'Anchisaurus',
											'#Aardonyx1' : '@Anchisauria',
												'Aardonyx' : '#Aardonyx1',
													'celestae' : 'Aardonyx',
												'@Sauropoda' : '#Aardonyx1',
													'-Sauropoda' : '@Sauropoda',	
														'Aepisaurus' : '-Sauropoda',
															'elephantinus' : 'Aepisaurus',
														'Archaeodontosaurus' : '-Sauropoda',
															'descouensi' : 'Archaeodontosaurus',
														'Asiatosaurus' : '-Sauropoda',
															'mongoliensis' : 'Asiatosaurus',
															'kwangshiensis' : 'Asiatosaurus',
													'#Antetonitrus1' : '@Sauropoda',
														'Antetonitrus' : '#Antetonitrus1',
															'ingenipes': 'Antetonitrus',
														'#Gravisauria1' : '#Antetonitrus1',
															'Amygdalodon' : '#Gravisauria1',
																'patagonicus' : 'Amygdalodon',
															'@Gravisauria' : '#Gravisauria1',
																'@Eusauropoda' : '@Gravisauria',
																	'Shunosaurus' : '@Eusauropoda',
																	'#Omeisaurus1' : '@Eusauropoda',
																		'Omeisaurus' : '#Omeisaurus1',
																		'#Lapparentosaurus1' : '#Omeisaurus1',
																			'#Lapparentosaurus2' : '#Lapparentosaurus1',
																				'Lapparentosaurus' : '#Lapparentosaurus2',
																				'Jobaria' : '#Lapparentosaurus2',
																			'#Mamenchisaurus1' : '#Lapparentosaurus1',
																				'Mamenchisaurus' : '#Mamenchisaurus1' ,
																				'#Atlasaurus1' : '#Mamenchisaurus1',
																					'Atlasaurus' : '#Atlasaurus1',
																						'imelakei' : 'Atlasaurus',
																					'#Turiasauria1' : '#Atlasaurus1',
																						'@Turiasauria' : '#Turiasauria1',
																							'Losillasaurus' : '@Turiasauria',
																							'#Turiasaurus1' : '@Turiasauria',
																								'#Turiasaurus2' : '#Turiasaurus1',
																									'Turiasaurus' : '#Turiasaurus2',
																									'Zby' : '#Turiasaurus2',
																								'#Mierasaurus1' : '#Turiasaurus1',
																									'Mierasaurus' : '#Mierasaurus1',
																									'Moabosaurus' : '#Mierasaurus1',
																						'@Neosauropoda' : '#Turiasauria1',
																							'-Neosauropoda' : '@Neosauropoda',
																								'Algoasaurus' : '-Neosauropoda',
																									'bauri' : 'Algoasaurus',
																							'#Diplodocoidea1' : '@Neosauropoda',
																								'@Diplodocoidea' : '#Diplodocoidea1',
																									'@Diplodocimorpha' : '@Diplodocoidea',
																										'@Rebbachisauridae' : '@Diplodocimorpha',
																											'Amazonsaurus' : '@Rebbachisauridae',
																												'maranhensis' : 'Amazonsaurus',
																										'@Flagellicaudata' : '@Diplodocimorpha',
																											'@Diplodocidae' : '@Flagellicaudata',
																												'-Diplodocidae' : '@Diplodocidae',
																													'Atlantosaurus' : '-Diplodocidae',
																														'montanus' : 'Atlantosaurus',
																														'immanis?' : 'Atlantosaurus',
																												'#Amphicoelias1' : '@Diplodocidae',
																													'Amphicoelias' : '#Amphicoelias1',
																														'altus' : 'Amphicoelias',
																														'fragillimus?' : 'Amphicoelias',
																													'#Apatosaurinae1' : '#Amphicoelias1',
																														'@Apatosaurinae' : '#Apatosaurinae1',
																															'Apatosaurus' : '@Apatosaurinae',
																																'ajax' : 'Apatosaurus',
																																'louisae' : 'Apatosaurus',
																											'@Dicraeosauridae' : '@Flagellicaudata',
																												'#Suuwassea1' : '@Dicraeosauridae',
																													'Amargatitanis' : '#Suuwassea1',
																														'macni' : 'Amargatitanis',
																												'Amargasaurus' : '@Dicraeosauridae',
																													'cazaui' : 'Amargasaurus',
																								'@Macronaria' : '#Diplodocoidea1',
																									'#Tehuelchesaurus1' : '@Macronaria',
																										'Tehuelchesaurus' : '#Tehuelchesaurus1',
																										'#Janenschia1' : '#Tehuelchesaurus1',
																											'Janenschia' : '#Janenschia1',
																											'Haestasaurus' : '#Janenschia1',
																									'#Camarasauridae1' : '@Macronaria',
																										'@Camarasauridae' : '#Camarasauridae1',
																											'Camarasaurus' : '@Camarasauridae',
																											'Abrosaurus' : '@Camarasauridae',
																												'dongpoi' : 'Abrosaurus',
																										'#Aragosaurus1' : '#Camarasauridae1',
																											'Aragosaurus' : '#Aragosaurus1',
																												'ischiaticus' : 'Aragosaurus',
																											'#Galvesaurus1' : '#Aragosaurus1',
																												'Galvesaurus' : '#Galvesaurus1',
																												'@Titanosauriformes' : '#Galvesaurus1',
																													'@Brachiosauridae' : '@Titanosauriformes',
																														'-Brachiosauridae' : '@Brachiosauridae',
																															'Abydosaurus' : '-Brachiosauridae',
																																'mcintoshi' : 'Abydosaurus',
																													'@Somphospondyli' : '@Titanosauriformes',
																														'-Somphospondyli' : '@Somphospondyli',
																															'Agustinia' : '-Somphospondyli',
																																'ligabuei' : 'Agustinia',
																															'Arkharavia' : '-Somphospondyli',
																																'heterocoelica' : 'Arkharavia',
																															'Astrophocaudia' : '-Somphospondyli',
																																'slaughghteri' : 'Astrophocaudia',
																															'Australodocus' : '-Somphospondyli',
																																'bohetii' : 'Australodocus',
																														'#Astrodon1' : '@Somphospondyli',
																															'Astrodon' : '#Astrodon1',
																																'johnstoni' : 'Astrodon',
																															'#Angolatitan1' : '#Astrodon1',
																																'Angolatitan' : '#Angolatitan1',
																																	'adamastor' : 'Angolatitan',
																																'@Titanosauria' : '#Angolatitan1',
																																	'#Andesaurus1' : '@Titanosauria',
																																		'Andesaurus' : '#Andesaurus1',
																																			'delgadoi' : 'Andesaurus',
																																		'@Lithostrotia' : '#Andesaurus1',
																																			'-Lithostrotia' : '@Lithostrotia',
																																				'Atacamatitan' : '-Lithostrotia',
																																					'chilensis' : 'Atacamatitan',
																																				'@Antarctosauridae' : '-Lithostrotia',
																																					'Antarctosaurus' : '@Antarctosauridae',
																																						'wichmannianus' : 'Antarctosaurus',
																																			'#Lognkosauria1' : '@Lithostrotia',
																																				'@Lognkosauria' : '#Lognkosauria1',
																																					'Aegyptosaurus' : '@Lognkosauria',
																																						'baharijensis' : 'Aegyptosaurus',
																																				'#Saltasauroidea1' : '#Lognkosauria1',
																																					'@Nemegtosauridae' : '#Saltasauroidea1',
																																						'@Lirainosaurinae' : '@Nemegtosauridae',
																																							'Atsinganosaurus' : '@Lirainosaurinae',
																																								'velauciensis' : 'Atsinganosaurus',
																																							'Lirainosaurus' : '@Lirainosaurinae',
																																							'Ampelosaurus' : '@Lirainosaurinae',
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
							'-Thyreophora' : '@Thyreophora',
								'Andhrasaurus' : '-Thyreophora',
									'indicus' : 'Andhrasaurus',
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
											'Anoplosaurus' : '-Nodosauridae',
												'curtonotus' : 'Anoplosaurus',
										'#Antarctopelta1' : '@Nodosauridae',
											'Antarctopelta' : '#Antarctopelta1',
												'oliveroi' : 'Antarctopelta',
											'Animantarx' : '#Antarctopelta1',
												'ramaljonesi' : 'Animantarx',
									'@Ankylosauridae' : '@Ankylosauria',
										'-Ankylosauridae' : '@Ankylosauridae',
											'Aletopelta' : '-Ankylosauridae',
												'coombsi' : 'Aletopelta',
										'#Ankylosaurinae1' : '@Ankylosauridae',
											'Ahshislepelta' : '#Ankylosaurinae1',
												'minor' : 'Ahshislepelta',
											'@Ankylosaurinae' : '#Ankylosaurinae1',
												'@Ankylosaurini' : '@Ankylosaurinae',
													'Ankylosaurus' : '@Ankylosaurini',
														'magniventris' : 'Ankylosaurus',
													'Anodontosaurus' : '@Ankylosaurini',
														'lambei' : 'Anodontosaurus',
														'inceptus' : 'Anodontosaurus',
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
																'Pachycephalosaurus' : '@Pachycephalosaurini',
																	'wyomingenesis' : 'Pachycephalosaurus',
																'Alaskacephale' : '@Pachycephalosaurini',
																	'gangloffi' : 'Alaskacephale',
											'@Ceratopsia' : '@Marginocephalia',
												'-Ceratopsia' : '@Ceratopsia',
													'Albalophosaurus' : '-Ceratopsia',
														'yamaguchiorum' : 'Albalophosaurus',
												'#Yinlong1' : '@Ceratopsia',
													'Yinlong' : '#Yinlong1',
													'#Chaoyangsauridae1' : '#Yinlong1',
														'@Chaoyangsauridae' : '#Chaoyangsauridae1',
															'Chaoyangsaurus' : '@Chaoyangsauridae',
															'Xuanhuaceratops' : '@Chaoyangsauridae',
															'Hualianceratops' : '@Chaoyangsauridae',
														'#Psittacosauridae1' : '#Chaoyangsauridae1',
															'@Psittacosauridae' : '#Psittacosauridae1',
																'Psittacosaurus' : '@Psittacosauridae',
															'@Neoceratopsia' : '#Psittacosauridae1',
																'Liaoceratops' : '@Neoceratopsia',
																'#Ajkaceratops1' : '@Neoceratopsia',
																	'Ajkaceratops' : '#Ajkaceratops1',
																		'kozmai' : 'Ajkaceratops',
																	'#Aquilops1' : '#Ajkaceratops1',
																		'Aquilops' :  '#Aquilops1',
																			'americanus' : 'Aquilops',
																		'#Auroraceratops2' : '#Aquilops1',
																			'#Auroraceratops1' : '#Auroraceratops2',
																				'Auroraceratops' : '#Auroraceratops1',
																					'rugosus' : 'Auroraceratops',
																				'Yamaceratops' : '#Auroraceratops1',
																			'#Archaeoceratops2' : '#Auroraceratops2',
																				'#Archaeoceratops1' : '#Archaeoceratops2',
																					'Helioceratops' : '#Archaeoceratops1',
																					'Archaeoceratops' : '#Archaeoceratops1',
																						'oshimai' : 'Archaeoceratops',
																						'yujingziensis' : 'Archaeoceratops',
																				'#Koreaceratops1' : '#Archaeoceratops2',
																					'Koreaceratops' : '#Koreaceratops1',
																					'#Leptoceratopsidae1' : '#Koreaceratops1',	
																						'@Leptoceratopsidae' : '#Leptoceratopsidae1',
																							'Asiaceratops' : '@Leptoceratopsidae',
																								'salsopaludalis' : 'Asiaceratops',
																								'sulcidens?' : 'Asiaceratops',
																							'#Cerasinops1' : '@Leptoceratopsidae',
																								'Cerasinops' : '#Cerasinops1',
																								'#Montanoceratops1' : '#Cerasinops1',
																									'Montanoceratops' : '#Montanoceratops1',
																									'#Prenoceratops1' : '#Montanoceratops1',
																										'Prenoceratops' : '#Prenoceratops1',
																										'#Udanoceratops2' : '#Prenoceratops1',
																											'#Udanoceratops1' : '#Udanoceratops2',
																												'Udanoceratops' : '#Udanoceratops1',
																												'Leptoceratops' : '#Udanoceratops1',
																											'#Zhuchengceratops1' : '#Udanoceratops2',
																												'Zhuchengceratops' : '#Zhuchengceratops1',
																												'#Unescoceratops1' : '#Zhuchengceratops1',
																													'Unescoceratops' : '#Unescoceratops1',
																													'Gryphoceratops' : '#Unescoceratops1',
																						'@Coronosauria' : '#Leptoceratopsidae1',
																							'Graciliceratops' : '@Coronosauria',
																							'#Protoceratopsidae1' : '@Coronosauria',
																								'@Protoceratopsidae' : '#Protoceratopsidae1',
																									'@Bagaceratopidae' : '@Protoceratopsidae',
																										'Bagaceratops' : '@Bagaceratopidae',
																								'@Ceratopsoidea' : '#Protoceratopsidae1',
																									'Zuniceratops' : '@Ceratopsoidea',
																										'#Turanoceratops1' : '@Ceratopsoidea',
																											'Turanoceratops' : '#Turanoceratops1',
																											'@Ceratopsidae' : '#Turanoceratops1',
																												'-Ceratopsidae' : '@Ceratopsidae',
																													'Polyonax' : '-Ceratopsidae',
																													'Ceratops' : '-Ceratopsidae',
																													'Dysganus' : '-Ceratopsidae',
																													'Monoclonius' : '-Ceratopsidae',
																													'Agathaumas' : '-Ceratopsidae',
																														'sylvestris' : 'Agathaumas',
																												'#Chasmosaurinae1' : '@Ceratopsidae',
																													'@Centrosaurinae' : '#Chasmosaurinae1',
																														'@Nasutoceratopsini' : '@Centrosaurinae',
																															'Avaceratops' : '@Nasutoceratopsini',
																														'#Xenoceratops1' : '@Centrosaurinae',
																															'#Albertaceratops1' : '#Xenoceratops1',
																																'Albertaceratops' : '#Albertaceratops1',
																																	'nesmoi' : 'Albertaceratops',
																																'@Eucentrosaura' : '#Albertaceratops1',
																																	'@Pachyrhinosaurini' : '@Eucentrosaura',
																																		'@Pachyrostra' : '@Pachyrhinosaurini',
																																			'Achelousaurus' : '@Pachyrostra',
																																				'horneri' : 'Achelousaurus',
																													'@Chasmosaurinae' : '#Chasmosaurinae1',
																														'Agujaceratops' : '@Chasmosaurinae',
																															'mariscalensis' : 'Agujaceratops',
																															'mavericus' : 'Agujaceratops',
																														'#Anchiceratops1' : '@Chasmosaurinae',
																															'Anchiceratops' : '#Anchiceratops1',
																																'ornatus' : 'Anchiceratops',
																															'Arrhinoceratops' : '#Anchiceratops1',
																																'brachyops' : 'Arrhinoceratops',
										'@Ornithopoda' : '@Cerapoda',
											'@Iguanodontia' : '@Ornithopoda',
												'@Elasmaria' : '@Iguanodontia',
													'Gasparinisaura' : '@Elasmaria',
													'Qantassaurus' : '@Elasmaria',
													'Atlascopcosaurus' : '@Elasmaria',
														'loadsi' : 'Atlascopcosaurus',
													'Anabisetia' : '@Elasmaria',
														'saldiviai' : 'Anabisetia',
												'@Dryomorpha' : '@Iguanodontia',
													'@Ankylopollexia' : '@Dryomorpha',
														'@Styracosterna' : '@Ankylopollexia',
															'@Hadrosauriformes' : '@Styracosterna',
																'Altirhinus' : '@Hadrosauriformes',
																	'kurzanovi' : 'Altirhinus',
																'@Hadrosauromorpha' : '@Hadrosauriformes',
																	'@Hadrosauroidea' : '@Hadrosauromorpha',
																		'-Hadrosauroidea' : '@Hadrosauroidea',
																			'Arstanosaurus' : '-Hadrosauroidea',
																				'akkurganensis' : 'Arstanosaurus',
																		'@Hadrosauridae' : '@Hadrosauroidea',
																			'-Hadrosauridae' : '@Hadrosauridae',
																				'Anasazisaurus' : '-Hadrosauridae',
																					'horneri ' : 'Anasazisaurus',
																			'@Saurolophidae' : '@Hadrosauridae',
																				'@Saurolophinae' : '@Saurolophidae',
																					'@Brachylophosaurini' : '@Saurolophinae',
																						'Acristavus' : '@Brachylophosaurini',
																							'gagslarsoni' : 'Acristavus',
																					'@Saurolophini' : '@Saurolophinae',
																						'@Saurolophini' : '@Saurolophinae',
																							'Prosaurolophus' : '@Saurolophini',
																							'#Saurolophus1' : '@Saurolophini',
																								'Saurolophus' : '#Saurolophus1',
																								'Augustynolophus' : '#Saurolophus1',
																									'morrisi' : 'Augustynolophus',
																				'@Lambeosaurinae' : '@Saurolophidae',
																					'-Lambeosaurinae' : '@Lambeosaurinae',
																						'Adelolophus' : '-Lambeosaurinae',
																							'hutchisoni' : 'Adelolophus',
																						'Angulomastacator' : '-Lambeosaurinae',
																							'daviesi' : 'Angulomastacator',
																					'#Aralosaurini1' : '@Lambeosaurinae',
																						'@Aralosaurini' : '#Aralosaurini1',
																							'Aralosaurus' : '@Aralosaurini',
																								'tuberiferus' : 'Aralosaurus',
																						'@Lambeosaurini' : '#Aralosaurini1',
																							'Amurosaurus' : '@Lambeosaurini',
																								'riabinini' : 'Amurosaurus',
			'@Theropoda' : '@Ornithoscelida',
				'#Eoraptor1' : '@Theropoda',
					'Alwalkeria' : '#Eoraptor1',
						'maleriensis' : 'Alwalkeria',
				'@Neotheropda' : '@Theropoda',
					'@Averostra' : '@Neotheropda',
						'@Ceratosauria' : '@Averostra',
							'@Abelisauroidea' : '@Ceratosauria',
								'@Abelisauridae' : '@Abelisauroidea',
									'@Majungasaurinae' : '@Abelisauridae',
										'Arcovenator' : '@Majungasaurinae',
											'escotae' : 'Arcovenator',
									'@Brachyrostra' : '@Abelisauridae',
										'@Furileusaura' : '@Brachyrostra',
											'Abelisaurus' : '@Furileusaura',
												'comahuensis' : 'Abelisaurus',
											'@Carnotaurini' : '@Furileusaura',
												'Carnotaurus' : '@Carnotaurini',
													'sastrei' : 'Carnotaurus',
												'Aucasaurus' : '@Carnotaurini',
													'garridoi' : 'Aucasaurus',
						'@Tetanurae' : '@Averostra',
							'-Tetanurae' : '@Tetanurae',
								'Altispinax' : '-Tetanurae',
									'dunkeri' : 'Altispinax',
							'@Orionides' : '@Tetanurae',
								'@Megalosauroidea' : '@Orionides',
									'@Megalosauria' : '@Megalosauroidea',
										'@Spinosauridae' : '@Megalosauria',
											'@Spinosauridae' : '@Megalosauria',
											'@Baryonychinae' : '@Spinosauridae',
												'Baryonyx' : '@Baryonychinae',
												'Suchomimus' : '@Baryonychinae',
											'@Spinosaurinae' : '@Spinosauridae',
												'Siamosaurus' : '@Spinosaurinae',
												'#Ichthyovenator1' : '@Spinosaurinae',
													'Ichthyovenator' : '#Ichthyovenator1',
													'#Irritator1' : '#Ichthyovenator1',
														'Irritator' : '#Irritator1',
														'Oxalaia' : '#Irritator1',
														'@Spinosaurini' : '#Irritator1',
															'Sigilmassasaurus' : '@Spinosaurini',
															'Spinosaurus' : '@Spinosaurini',
																'aegyptiacus' : 'Spinosaurus',
																'maroccanus?' : 'Spinosaurus',
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
										'#Megaraptora1' : '@Coelurosauria',
											'Aoniraptor' : '#Megaraptora1',
												'libertatem' : 'Aoniraptor',
											'@Megaraptora' : '#Megaraptora1',
												'Siats' : '@Megaraptora',
												'#Australovenator1' : '@Megaraptora',
													'Fukuiraptor' : '#Australovenator1',
													'Australovenator' : '#Australovenator1',
														'wintonensis' : 'Australovenator',
												'@Megaraptoridae' : '@Megaraptora',
													'Megaraptor' : '@Megaraptoridae',
													'Aerosteon' : '@Megaraptoridae',
														'riocoloradense' : 'Aerosteon',
										'@Tyrannoraptora' : '@Coelurosauria',
											'@Tyrannosauroidea' : '@Tyrannoraptora',
												'#Alectrosaurus1' : '@Tyrannosauroidea',
													'Alectrosaurus' : '#Alectrosaurus1',
														'olseni' : 'Alectrosaurus',
													'#Appalachiosaurus1' : '#Alectrosaurus1',
														'Appalachiosaurus' : '#Appalachiosaurus1',
															'montgomeriensis' : 'Appalachiosaurus',
														'#Alioramini1' : '#Appalachiosaurus1',
															'@Alioramini' : '#Alioramini1',
																'Alioramus' : '@Alioramini',
																	'remotus' : 'Alioramus',
																	'altai' : 'Alioramus',
															'@Tyrannosauridae' : '#Alioramini1',
																'-Tyrannosauridae' : '@Tyrannosauridae',
																	'Aublysodon' : '-Tyrannosauridae',
																	'mirandus' : 'Aublysodon',
																'Albertosaurus' : '@Tyrannosauridae',
																	'sarcophagus' : 'Albertosaurus',
											'#Aorun1' : '@Tyrannoraptora',
												'Aorun' : '#Aorun1',
													'zhaoi' : 'Aorun',
												'#Scipionyx1' : '#Aorun1',
													'Scipionyx' : '#Scipionyx1',
													'#Ornitholestes1' : '#Scipionyx1',
														'Ornitholestes' : '#Ornitholestes1',
															'hermanni' : 'Ornitholestes',
														'#Compsognathidae2' : '#Ornitholestes1',
															'#Compsognathidae1' : '#Compsognathidae2',
																'Aniksosaurus' : '#Compsognathidae1',
																	'darwini' : 'Aniksosaurus',
																'@Compsognathidae' : '#Compsognathidae1',
																	'Sinosauropteryx' : '@Compsognathidae',
																	'#Compsognathus1' : '@Compsognathidae',
																		'Compsognathus' : '#Compsognathus1',
																		'#Huaxiagnathus1' : '#Compsognathus1',
																			'Huaxiagnathus' : '#Huaxiagnathus1',
																			'Juravenator' : '#Huaxiagnathus1',
															'@Maniraptoriformes' : '#Compsognathidae2',
																'-Maniraptoriformes' : '@Maniraptoriformes',
																	'Archaeornithoides' : '-Maniraptoriformes',
																		'deinosauriscus' : 'Archaeornithoides',
																'#Ornithomimosauria1' : '@Maniraptoriformes',
																'@Ornithomimosauria' : '#Ornithomimosauria1',
																	'-Ornithomimosauria' : '@Ornithomimosauria',
																		'Afromimus' : '-Ornithomimosauria',
																			'tenerensis' : 'Afromimus',
																	'#Nqwebasaurus1' : '@Ornithomimosauria',
																		'Nqwebasaurus' : '#Nqwebasaurus1',
																		'#Pelecanimimus1' : '#Nqwebasaurus1',
																			'Pelecanimimus' : '#Pelecanimimus1',
																			'#Shenzhousaurus1' : '#Pelecanimimus1',
																				'Shenzhousaurus' : '#Shenzhousaurus1',
																				'#Harpymimus1' : '#Shenzhousaurus1',
																					'Harpymimus' : '#Harpymimus1',
																					'#Deinocheiridae1' : '#Harpymimus1',
																						'@Deinocheiridae' : '#Deinocheiridae1',
																							'Beishanlong' : '@Deinocheiridae',
																							'#Garudimimus1' : '@Deinocheiridae',
																								'Garudimimus' : '#Garudimimus1',
																								'Deinocheirus' : '#Garudimimus1',
																						'@Ornithomimidae' : '#Deinocheiridae1',
																							'-Ornithomimidae' : '@Ornithomimidae',
																								'Aepyornithomimus' : '-Ornithomimidae',
																									'tugrikinensis' : 'Aepyornithomimus',
																								'Arkansaurus' : '-Ornithomimidae',
																									'fridayi' : 'Arkansaurus',
																							'#Archaeornithomimus1' : '@Ornithomimidae',
																								'Archaeornithomimus' : '#Archaeornithomimus1',
																									'asiaticus' : 'Archaeornithomimus',
																									'bissektensis?' : 'Archaeornithomimus',
																								'#Sinornithomimus1' : '#Archaeornithomimus1',
																									'Sinornithomimus' : '#Sinornithomimus1',
																									'#Anserimimus2' : '#Sinornithomimus1',
																										'#Anserimimus1' : '#Anserimimus2',
																											'Anserimimus' : '#Anserimimus1',
																												'planinychus' : 'Anserimimus',
																											'Gallimimus' : '#Anserimimus1',
																										'#Struthiomimus1' : '#Anserimimus2',
																											'Struthiomimus' : '#Struthiomimus1',
																											'#Ornithomimus1' : '#Struthiomimus1',
																												'Ornithomimus' : '#Ornithomimus1',
																												'Tototlmimus' : '#Ornithomimus1',
																'@Maniraptora' : '#Ornithomimosauria1',
																	'@Alvarezsauroidea' : '@Maniraptora',
																		'Haplocheirus' : '@Alvarezsauroidea',
																		'@Alvarezsauridae' : '@Alvarezsauroidea',
																			'-Alvarezsauridae' : '@Alvarezsauridae',
																				'Bradycneme' : '-Alvarezsauridae',
																				'Heptasteornis' : '-Alvarezsauridae',
																				'Kol' : '-Alvarezsauridae',
																				'Alnashetri' : '-Alvarezsauridae',
																						'cerropoliciensis' : 'Alnashetri',
																			'#Parvicursorinae2' : '@Alvarezsauridae',
																				'#Parvicursorinae1' : '#Parvicursorinae2',
																					'Alvarezsaurus' : '#Parvicursorinae1',
																						'calvoi' : 'Alvarezsaurus',
																					'@Parvicursorinae' : '#Parvicursorinae1',
																						'-Parvicursorinae' : '@Parvicursorinae',
																							'Qiupanykus' : '-Parvicursorinae',
																						'#Ceratonykini1' : '@Parvicursorinae',
																							'@Ceratonykini' : '#Ceratonykini1',
																								'Ceratonykus' : '@Ceratonykini',
																								'Xixianykus' : '@Ceratonykini',
																								'Albinykus' : '@Ceratonykini',
																									 'baatar' : 'Albinykus',
																							'#Parvicursor1' : '#Ceratonykini1',
																								'Parvicursor' : '#Parvicursor1',
																								'@Mononykini' : '#Parvicursor1',
																									'#Albertonykus1' : '@Mononykini',
																										'Mononykus' : '#Albertonykus1',
																										'Albertonykus' : '#Albertonykus1',
																											'borealis' : 'Albertonykus',
																									'#Linhenykus1' : '@Mononykini',
																										'Linhenykus' : '#Linhenykus1',
																										'Shuvuuia' : '#Linhenykus1',
																				'@Patagonykinae' : '#Parvicursorinae2',
																					'Achillesaurus' : '@Patagonykinae',
																						'manazzonei' : 'Achillesaurus',
																					'Patagonykus' : '@Patagonykinae',
																					'Bonapartenykus' : '@Patagonykinae',
																	'@Aveairfoila' : '@Maniraptora',
																		'@Therizinosauria' : '@Aveairfoila',
																			'Falcarius' : '@Therizinosauria',
																			'@Therizinosauroidea' : '@Therizinosauria',
																				'Jianchangosaurus' : '@Therizinosauroidea',
																				'@Therizinosauridae' : '@Therizinosauroidea',
																					'Beipiaosaurus' : '@Therizinosauridae',
																					'#Alxasaurus1' : '@Therizinosauridae',
																						'Alxasaurus' : '#Alxasaurus1',
																							'elesitaiensis' : 'Alxasaurus',
																						'#Nothronychus1' : '#Alxasaurus1',
																							'Nothronychus' : '#Nothronychus1',
																							'#Erlikosaurus1' : '#Nothronychus1',
																								'Erlikosaurus' : '#Erlikosaurus1',
																								'Segnosaurus' : '#Erlikosaurus1',
																		'@Pennaraptora' : '@Aveairfoila',
																			'@Oviraptorosauria' : '@Pennaraptora',
																				'Incisivosaurus' : '@Oviraptorosauria',
																				'#Caudipteridae1' : '@Oviraptorosauria',
																					'@Caudipteridae' : '#Caudipteridae1',
																						'Caudipteryx' : '@Caudipteridae',
																						'Similicaudipteryx' : '@Caudipteridae',
																					'#Avimimus1' : '#Caudipteridae1',
																						'Avimimus' : '#Avimimus1',
																						'@Caenagnathoidea' : '#Avimimus1',
																							'@Caenagnathidae' : '@Caenagnathoidea',
																								'Anomalipes' : '@Caenagnathidae',
																									'zhaoi ' : 'Anomalipes',
																								'#Anzu1' : '@Caenagnathidae',
																									'Anzu' : '#Anzu1',
																										'wyliei' : 'Anzu',
																									'@Elmisaurinae' : '#Anzu1',
																										'Apatoraptor' : '@Elmisaurinae',
																											'pennatus' : 'Apatoraptor',
																							'@Oviraptoridae' : '@Caenagnathoidea',
																								'Yulong' : '@Oviraptoridae',
																								'#Oviraptor1' : '@Oviraptoridae',
																									'Oviraptor' : '#Oviraptor1',
																									'#Citipati1' : '#Oviraptor1',
																										'Citipati' : '#Citipati1',
																										'#Banji1' : '#Citipati1',
																											'Banji' : '#Banji1',
																											'#Khaan1' : '#Banji1',
																												'Khaan' : '#Khaan1',
																												'Nemegtomaia' : '#Khaan1',
																												'Conchoraptor' : '#Khaan1',
																												'#Heyuannia1' : '#Khaan1',
																													'Ajancingenia' : '#Heyuannia1',
																														'yanshini' : 'Ajancingenia',
																													'Heyuannia' : '#Heyuannia1',
																			'@Paraves' : '@Pennaraptora',
																				'@Anchiornithidae' : '@Paraves',
																					'Anchiornis' : '@Anchiornithidae',
																						'huxleyi' : 'Anchiornis',
																				'@Eumaniraptora' : '@Paraves',
																					'@Deinonychosauria' : '@Eumaniraptora',
																						'@Dromaeosauridae' : '@Deinonychosauria',
																							'@Halszkaraptorinae' : '@Dromaeosauridae',
																								'Halszkaraptor' : '@Halszkaraptorinae',
																									'#Mahakala1' : '@Halszkaraptorinae',
																										'Mahakala' : '#Mahakala1',
																										'Hulsanpes' : '#Mahakala1',
																							'#Unenlagiinae1' : '@Dromaeosauridae',
																								'@Unenlagiinae' : '#Unenlagiinae1',
																									'Austroraptor' : '@Unenlagiinae',
																									'#Unenlagia1' : '@Unenlagiinae',
																										'Buitreraptor' : '#Unenlagia1',
																										'Neuquenraptor' : '#Unenlagia1',
																										'Unenlagia' : '#Unenlagia1',
																								'#Shanag1' : '#Unenlagiinae1',
																									'Shanag' : '#Shanag1',
																									'#Zhenyuanlong1' : '#Shanag1',
																										'Zhenyuanlong' : '#Zhenyuanlong1',
																										'#Microraptorinae1' : '#Zhenyuanlong1',
																											'@Microraptorinae' : '#Microraptorinae1',
																												'Microraptor' : '@Microraptorinae',
																												'Sinornithosaurus' : '@Microraptorinae',
																												'Hesperonychus' : '@Microraptorinae',
																												'Changyuraptor' : '@Microraptorinae',
																												'Graciliraptor' : '@Microraptorinae',
																											'@Eudromaeosauria' : '#Microraptorinae1',
																												'Bambiraptor' : '@Eudromaeosauria',
																												'#Tianyuraptor1' : '@Eudromaeosauria',
																													'Tianyuraptor' : '#Tianyuraptor1',
																													'#Dromaeosaurinae1' : '#Tianyuraptor1',
																														'@Dromaeosaurinae' : '#Dromaeosaurinae1',
																															'Achillobator' : '@Dromaeosaurinae',
																																 'giganticus' : 'Achillobator',
																															'Atrociraptor' : '@Dromaeosaurinae',
																																'marshalli' : 'Atrociraptor',
																															'Dromaeosaurus' : '@Dromaeosaurinae',
																															'Utahraptor' : '@Dromaeosaurinae',
																														'@Velociraptorinae' : '#Dromaeosaurinae1',
																															'-Velociraptorinae' : '@Velociraptorinae',
																																'Acheroraptor' : '-Velociraptorinae',
																																	'temertyorum' : 'Acheroraptor',
																																'Balaur' : '-Velociraptorinae',
																															'#Adasaurus1' : '@Velociraptorinae',
																																'Adasaurus' : '#Adasaurus1',
																																	'mongoliensis ' : 'Adasaurus',
																																'#Deinonychus2' : '#Adasaurus1',
																																	'#Deinonychus1' : '#Deinonychus2',
																																		'Deinonychus' : '#Deinonychus1',
																																		'Saurornitholestes' : '#Deinonychus1',
																																	'#Velociraptor1' : '#Deinonychus2',
																																		'Velociraptor' : '#Velociraptor1',
																																		'#Tsaagan1' : '#Velociraptor1',
																																			'Tsaagan' : '#Tsaagan1',
																																			'Linheraptor' : '#Tsaagan1',
																						'@Troodontidae' : '@Deinonychosauria',
																							'-Troodontidae' : '@Troodontidae',
																								'Albertavenator' : '-Troodontidae',
																									'curriei' : 'Albertavenator',
																							'#Jinfengopteryginae1' : '@Troodontidae',
																								'@Jinfengopteryginae' : '#Jinfengopteryginae1',
																									'Jinfengopteryx' : '@Jinfengopteryginae',
																									'Almas' : '@Jinfengopteryginae',
																										'ukhaa' : 'Almas',
																								'#Mei2' : '#Jinfengopteryginae1',
																									'#Mei1' : '#Mei2',
																										'Mei' : '#Mei1',
																										'Sinovenator' : '#Mei1',
																									'#Byronosaurus1' : '#Mei2',
																										'Byronosaurus' : '#Byronosaurus1',
																										'#Sinornithoides1' : '#Byronosaurus1',
																											'Sinornithoides' : '#Sinornithoides1',
																											'#Gobivenator1' : '#Sinornithoides1',
																												'Gobivenator' : '#Gobivenator1',
																												'#Troodon1' : '#Gobivenator1',
																													'Troodon' : '#Troodon1',
																													'#Saurornithoides1' : '#Troodon1',
																														'Saurornithoides' : '#Saurornithoides1',
																														'Zanabazar' : '#Saurornithoides1',
																					'@Avialae (Birds)' : '@Eumaniraptora',
																						'Archaeopteryx' : '@Avialae (Birds)',
																							'lithographica' : 'Archaeopteryx',
																							'siemensii' : 'Archaeopteryx',
																						'Passer' : '@Avialae (Birds)',
																							'domesticus' : 'Passer',
}

var treeHeight = canvasSize.y - 100; // height for the tree

if(isMainPage) {
	ctx.canvas.width = canvasSize.x;
	ctx.canvas.height = canvasSize.y; // set the canvas to the size just specified
	
	ctx.fillStyle = '#fff';//fill style white
	
	ctx.fillRect(0, 0, canvasSize.x, canvasSize.y);//draw background
}
var treeWithDetails = {};//tree with metadata added

treeWithDetails['@Dinosauria'] = new Node('@Dinosauria', 0, canvasSize.y / 2, [], canvasSize.y / 2.5); // preset the root node to avoid errors

function getHeightProportion(index, siblings) { // zero indexed
	
	var denominator = siblings * 2;
	
	var numerator = index + 1; // integers
	
	numerator *= 2; // evens
	
	numerator -= 1; // odds
	
	var fraction = numerator / denominator; // 0 to 1
	
	if(siblings == 1) {
		fraction = 0.5;
	}
	
	fraction *= 2; // 0 to 2
	
	fraction -= 1; // -1 to 1
	
	if(fraction == 0) { // stop overlap in the middle
		fraction = -0.15;
	}
	
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

var branchWidthScale = 0.5; // branch width compared to height

for(var i in tree) { // set up detailed node relations
	if(i != '@Dinosauria'){
		
		treeWithDetails[i] = new Node(i, getTreeDepth(i) * 100, 100, [] , 0); // the detailed tree now has a node for the current dinosaur
		
		if(! treeWithDetails[tree[i]] ){ // if the next ancestor does not have a node,
			
			treeWithDetails[tree[i]] = new Node(i, 100, 100, [], 0); // create one
			
		}
		
		treeWithDetails[tree[i]].children.push(i); // add the name of the current dinosaur
		
		//~ console.log(getTreeDepth(i));
	}
}

for(var i in genera) { // add all of the country images, and set up representative genera with images for taxa
	var countries = genera[i].countries;
	
	for(var j = 0; j < countries.length; j++) { // loop through the countries of a genus
		var country = countries[j];
		
		if( !countryImages[country] ){ // if not already registered
			//~ console.log(country);
			countryImages[country] = document.createElement('img');
			countryImages[country].src = 'alt_images/geography/' + country + '.png';
		}
	}
	
	if(genera[i].attribution && tree[i]) {
		var taxonName = i;
		var loops = 0;
		
		while(loops < 1000) {
			loops++; // to prevent infinite looping
			
			taxonName = tree[taxonName];
			//~ console.log(taxonName);
			
			if(!treeWithDetails[taxonName].representativeGenus) {
				treeWithDetails[taxonName].representativeGenus = i;
			}
			
			if(taxonName == '@Dinosauria') {
				break;
			}
		}
	}
}

var n = 0;

for(var i in tree) { // set up node positions
	
	n++;
	
	if(i != '@Dinosauria'){
		
		var siblings = treeWithDetails[tree[i]].children.length;
		
		//~ console.log(i + ', ' + siblings);
		
		var branchHeightDelta = getHeightProportion(
			treeWithDetails[tree[i]].children.
			indexOf(i),
			
			siblings
		); // the proportion of height
		
		treeWithDetails[i].alottedHeight = treeWithDetails[tree[i]].alottedHeight / siblings;
		
		if(siblings == 1) {
			//~ treeWithDetails[i].alottedHeight = treeWithDetails[tree[i]].alottedHeight / 2;
		}
		
		treeWithDetails[i].x = treeWithDetails[tree[i]].x + treeWithDetails[tree[i]].alottedHeight * branchWidthScale; // shift by calculated value
		treeWithDetails[i].y = treeWithDetails[tree[i]].y + treeWithDetails[tree[i]].alottedHeight * branchHeightDelta; // shift by calculated value
		
		//                                                  getPositionDelta(getTreeDepth(i))
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
		new P(position.x - textMaximumLength - canvasSize.y / 4, position.y + imageOnCanvasSize.y / 2),
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
							genera[i].image.src = getImageForTaxon(i);
							
							if(genera[i].attribution) {
								takenImagePositions.push(
									new P(
										position.x,
										position.y
									)
								); // so no new ones overlap
								ctx.drawImage(
									genera[i].image,
									position.x + textMaximumLength + canvasSize.y / 4,
									position.y - imageOnCanvasSize.y / 2,
									imageOnCanvasSize.x,
									imageOnCanvasSize.y
								);
								takenImageNames.push(i); // so that when clicked on we can find the indexed position
							}
							
						}catch(e){
							//~ console.log(e);
							//~ console.log(i);
						}
					}
			}
			
			if( !isSpaceTaken(takenTextPositions, position, new P(textMaximumLength, textSize)) ) { // check if overlapping a previously written in taxon
				
				var isDubious = false;
				
				if(genera[displayName]) {
					isDubious = genera[displayName].isDubious;
				}
				
				//~ displayName = '';
				
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
	var presetRepresentativeGenus = treeWithDetails[taxon].representativeGenus;
	if(presetRepresentativeGenus) {
		return(presetRepresentativeGenus);
	}
	
	if(getTaxonRank(taxon) == 'species') {
		while(getTaxonRank(taxon) != 'genus') {
			taxon = tree[taxon]; // first child
		}
	}else{
		while(getTaxonRank(taxon) != 'genus') {
			taxon = treeWithDetails[taxon].children[0]; // first child
		}
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

function SearchResult(taxon, text, imageSRC) {
	this.taxon = taxon;
	this.text = text;
	this.imageSRC = imageSRC;
}

function getSearchResults(string) {
	
	if(string == '') {
		return(0);
	}
	
	var results = [];
	var resultsLimit = 10;
	var nameRegExp = new RegExp('^.?' + string, 'i');
	
	for(var i in tree) {
		if(
			i.match(nameRegExp)
			&&
			i[0] != '#'
			&&
			i[0] != '-'
		) {
			console.log(i);
			
			var text = '';
			var rank = getTaxonRank(i);
			var imageGenus = '';
			
			switch(rank) {
				case 'species':
					imageGenus = getRepresentativeGenus(i);
					text = '<i>' + i + '</i>, a species of <i>' + imageGenus + '</i>';
					break;
				case 'genus':
					imageGenus = i;
					text = '<i>' + i + '</i>';
					break;
				default:
					imageGenus = getRepresentativeGenus(i);
					text = '<b>' + getTaxonRank(i) + ' ' + i.substring(1,100) + '</b>';
			}
			
			results.push( new SearchResult(
				i,
				text,
				getImageForTaxon(imageGenus)
			));
		}
		
		console.log('finished');
		if(results.length >= resultsLimit) {
			break;
		}
	}
	
	console.log('finished');
	console.log(results);
	return(results);
}

var searchInputBar = document.getElementById('search_input');

var searchResultsDivider = document.getElementById('results_divider');

if(isMainPage) {
	searchInputBar.onkeyup = function() {
		var results = getSearchResults(searchInputBar.value);
		
		searchResultsDivider.innerHTML = '';
		
		for(var i = 0; i < results.length; i++) {
			var result = results[i];
			
			searchResultsDivider.innerHTML += '\
				<table class="result_table" id="search_result_' + result.taxon + '"><tbody><tr>\
					<td>\
						<img class="result_image" src="' + result.imageSRC + '">\
					</td>\
					<td  style="width: 100%">\
						' + result.text + '\
					</td>\
				</tr></tbody></table>';
		}
		
		for(var i = 0; i < results.length; i++) {
			var result = results[i];
			
			//~ console.log(document.getElementById('search_result_' + result.taxon));
			//~ console.log(result.taxon);
			
			document.getElementById('search_result_' + result.taxon).addEventListener("click", function(){
					console.log(this.id.substring(14));
					fillDetailsDivider(this.id.substring(14));
					
					searchResultsDivider.innerHTML = '';
				}
			);
		}
	};
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
		image.src = getImageForTaxon(taxon);
		
		// add a copyright notice
		var copyright = document.createElement('span');
		var attribution = genera[taxon].attribution;
		if(attribution) {
			// name, siteURL, licence, licenceURL
			copyright.innerHTML = '<br/>Image credit: &copy;<a href="' +
				attribution.siteURL +
				'">' +
				attribution.name +
				'</a> under <a href="' +
				attribution.licenceURL +
				'">' +
				attribution.licence +
				'</a><br/><br/>';
		}
		copyright.style.fontSize = '5px';
		
		imageBox.appendChild(image);
		imageBox.appendChild(copyright);
	}else{
		var representativeGenus = getRepresentativeGenus(taxon);
		image.src = getImageForTaxon(representativeGenus);
		
		// add a copyright notice
		var copyright = document.createElement('span');
		var attribution = genera[representativeGenus].attribution;
		if(attribution) {
			// name, siteURL, licence, licenceURL
			copyright.innerHTML = '<br/>Image credit: &copy;<a href="' +
				attribution.siteURL +
				'">' +
				attribution.name +
				'</a> under <a href="' +
				attribution.licenceURL +
				'">' +
				attribution.licence +
				'</a><br/><br/>';
		}
		copyright.style.fontSize = '5px';
		
		//specify representative genus
		var genusSpecifier = document.createElement('div');
		genusSpecifier.innerHTML = '<span class="genus name-link">' + representativeGenus + '</span>, a member of ' + taxon.substring(1, taxon.length); // remove @ or #
		
		imageBox.appendChild(image);
		imageBox.appendChild(copyright);
		imageBox.appendChild(genusSpecifier);
	}
	image.width = detailsImageSize.x;
	image.height = detailsImageSize.y;
	
	//classify from dinosauria, excluding # ranks in table rows
	var classificationTable = document.createElement('table');
	classificationTable.className = 'classification_table';
	
	classificationTable.innerHTML += '<tr class="details_header">Classification:</tr>';
	
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
		classificationTable.innerHTML += '<tr><td class="classification_rank">species: </td><td class="species">' + speciesArray[0] + '</td></tr>';
		
		for(var i = 1; i < speciesArray.length; i++) {
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
		
		synonymTable.innerHTML += '<table> <tr> <td class="classification_rank">Described by: </td> <td> ' + details.describedBy + ' </td> </tr> </table>';
		if(details.notes) {
			synonymTable.innerHTML += '<table> <tr> <td class="classification_rank">Notes: </td> <td> ' + details.notes + ' </td> </tr> </table>';
		}
		// scientist who described it
		
		if(details.synonyms.length == 0) { // junior synonyms
			//~ synonymTable.innerHTML += '<tr> <td class="classification_rank">Junior synonyms:</td> <td> none </td> </tr>';
		}else{
			synonymTable.innerHTML += '<tr> <td class="classification_rank">Junior synonyms:</td></tr>';
			for(var i = 0; i < details.synonyms.length; i++) {
				synonymTable.innerHTML += '<tr> <td></td> <td class="genus">' + details.synonyms[i] + '</td> </tr>';
			}
		}
		
		if(! details.possibleDuplicate) { // possible senior synonym
			//~ synonymTable.innerHTML += '<tr> <td class="classification_rank">Possible duplicate of: </td> <td> none </td> </tr>';
		}else{
			synonymTable.innerHTML += '<tr> <td class="classification_rank">Possible duplicate of: </td> <td class="genus name-link"> ' + details.possibleDuplicate + '</td> </tr>';
		}
		
		detailsTable.innerHTML += '<tr class="details_header"><td>Details:</td></tr>';
		
		detailsTable.appendChild(synonymTable);
		
		// possible duplicate of (link genus) (none if none)
		
		
		// FOLLOWING LINES ALL DRAWN ON ONE CANVAS
		var timelineHeight = 20;
		
		var detailsCanvas = document.createElement('canvas');
		
		detailsCanvas.width = detailsImageSize.x;
		detailsCanvas.height = timelineHeight * 10 + detailsImageSize.x / 2 + detailsImageSize.x * worldMapSizeRatio;
		
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
		
		if(details.latest < 201.3) { // if it survided past the end of the triassic
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
		}else{ // if extinct before the end of the triassic
			// level 1 : line to start time
			detailsCTX.beginPath();
			detailsCTX.moveTo(taxonTimePositions[0], timelineHeight * 1);
			detailsCTX.lineTo(taxonTimePositions[0], timelineHeight * 4);
			detailsCTX.stroke();
			
			detailsCTX.fillText(
				details.earliest + ' mya',
				taxonTimePositions[0] + textSize * 1,
				timelineHeight + textSize * 1.5
			);
			
			// level 2 : line to end time
			detailsCTX.beginPath();
			detailsCTX.moveTo(taxonTimePositions[1], timelineHeight * 2);
			detailsCTX.lineTo(taxonTimePositions[1], timelineHeight * 4);
			detailsCTX.stroke();
			
			detailsCTX.fillText(
				details.latest + ' mya',
				taxonTimePositions[1] + textSize * 1,
				timelineHeight * 2 + textSize * 1.5
			);
		}
		
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
		detailsCTX.fillRect( // background for the size comparison
			0,
			timelineHeight * 8,
			detailsCanvas.width,
			detailsImageSize.x / 2
		);
		
		var pixelsPerMetre;
		
		if(totalSize.x > totalSize.y * 2) { // if on the wide side
			pixelsPerMetre = detailsCanvas.width / totalSize.x;
		}else{ // if tall
			pixelsPerMetre = detailsCanvas.width / 2 / totalSize.y;
		}
		
		try{ // draw dinosaur
			var image = document.createElement('img');
			image.src = getImageForTaxon(taxon);
			
			var imageStartPosition = new P(
				0,
				( timelineHeight * 7 + textSize * 1.5 + detailsImageSize.x / 2 )  - mainImageSize.y * pixelsPerMetre
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
				( timelineHeight * 7 + textSize * 1.5 + detailsImageSize.x / 2 )  - personImageSize.y * pixelsPerMetre
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
		
		var countries = genera[taxon].countries;
		var wordEnding = countries.length == 1 ? 'y' : 'ies'; // singular or plural
		
		detailsCTX.drawImage( // the world map image
			worldMapImage,
			0,
			timelineHeight * 9 + detailsImageSize.x / 2,
			detailsImageSize.x,
			detailsImageSize.x * worldMapSizeRatio,
		);
		
		var countriesString = '';
		var isUSAorAlaska = false;
		
		for(var i = 0; i < countries.length; i++) {
			
			var country = countries[i];
			
			if(i == 0) { // connectors
				
			}else if(i == countries.length - 1) {
				countriesString += ' and ';
			}else{
				countriesString += ', ';
			} // connectors
			
			countriesString += country;
			
			try{
				detailsCTX.drawImage( // the world map image
					countryImages[country],
					0,
					timelineHeight * 9 + detailsImageSize.x / 2,
					detailsImageSize.x,
					detailsImageSize.x * worldMapSizeRatio,
				);
			}catch(e) {};
			
			if(countries[i] == 'USA' || countries[i] == 'Alaska') {
				isUSAorAlaska = true;
			}
		}
		
		detailsCTX.font = textSize + "pt Georgia";
		
		detailsCTX.fillText('Countr' + wordEnding + ' discovered in: ' + countriesString, textSize / 2, timelineHeight * 8 + textSize * 1.5 + detailsImageSize.x / 2);
		
		if(isUSAorAlaska) {
			detailsCTX.fillText('Alaska is displayed separately from the rest of the USA.', textSize / 2, timelineHeight * 9 + textSize * 1.5 + detailsImageSize.x / 2 + detailsImageSize.x * worldMapSizeRatio);
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
	translation.zoom = canvasSize.y / treeWithDetails[taxon].alottedHeight / 2.1; // power of two, doubles each taxon depth
	
	translation.y += canvasSize.y / translation.zoom / 2; // power of two, doubles each taxon depth
	
	//~ translation.y += canvasSize.y / 2;
	drawTree();
}

if(isMainPage) {
	fillDetailsDivider('@Dinosauria');
	//~ fillDetailsDivider('@Centrosaurinae');
	
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
	
	setInterval(drawTree, 500);
}


var numberOfGenera = 1;
function getPercentage(n) {
	return(Math.round(n * 100 / numberOfGenera));
}

function doReferenceList() {
	var classified = 0;
	var detailed = 0;
	var images = 0;
	
	var listElement = document.getElementById('reference_list');
	var fullHTMLstring = '';
	for(var i in genera) {
		numberOfGenera ++;
		//*
		var HTMLstring = '';
		HTMLstring += i + ':';
		HTMLstring += tree[i] ? '<span class="positive"> classified,</span> ' : '<span class="negative"> unclassified,</span> ';
		HTMLstring += genera[i].describedBy ? '<span class="positive"> details filled in,</span> ' : '<span class="negative"> details not filled in,</span> ';
		HTMLstring += genera[i].attribution ? 
			'<span class="positive"> image drawn.</span> <img src="' + getImageForTaxon(i) + '" width="32" height="18"/>' : 
			'<span class="negative"> image not drawn.</span> ';
		HTMLstring += '<br/>';
		fullHTMLstring += HTMLstring;
		
		if(tree[i]) {
			classified ++;
		}
		
		if(genera[i].describedBy) {
			detailed ++;
		}
		
		if(genera[i].attribution) {
			images ++;
		}
		// */
		
		/*
		if(genera[i].describedBy) {
			fullHTMLstring += i + ' ';
		}
		//*/
	}
	listElement.innerHTML = fullHTMLstring;
	
	console.log('Classified: ' + classified + ' (' + getPercentage(classified) + '%)');
	console.log('Detailed: ' + detailed + ' (' + getPercentage(detailed) + '%)');
	console.log('Drawn: ' + images + ' (' + getPercentage(images) + '%)');
}

if(!isMainPage) { // if the reference page
	setTimeout(doReferenceList,10);
}

//**********************************************************************
}
