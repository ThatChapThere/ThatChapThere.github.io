window.onload=function () {

//*********************GRAPHICS SETUP***********************************

var ctx = document.getElementsByTagName('canvas')[0].getContext('2d'); // get context to draw

var canvasSize = new Position(1800, 800); //cartesian for the size of the canvas

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

var colours = { // colours for drawing
	'text' : '#000',
	'bones' : '#00CEC9',
	'joints' : '#CAC700',
	'background' : '#fff',
	'floor' : '#08BF00',
}

ctx.canvas.width = canvasSize.x;
ctx.canvas.height = canvasSize.y; // set the canvas to the size just specified

//****************CONSTANTS & BASIC FUNCTIONS & VARIABLES***************

const PI = Math.PI;
const TAU = Math.PI * 2;
const DEG = TAU / 360;

var gameDimensions = {
	'groundHeight' : 50, // how high the ground is
	'pixelsPerMetre' : 50, // for drawing dinosaurs
	'jointBallRadius' : 3,
}

const groundY = canvasSize.y - gameDimensions.groundHeight;

var gameTimer = 0; // itme since game start in milliseconds

const gameFPS = 25;

const frameDelay = Math.round(1000 / gameFPS);

function sq(a) { // square function
	return(a * a);
}

function Position(x,y){ // Cartesian point
	this.x = x;
	this.y = y;
	
	this.getRadius = function() {
		return(
			Math.sqrt(
				sq(this.x) +
				sq(this.y) 
			)
		);
	}
}

function getNormalVector(angle){
	var x = Math.cos(angle) * gameDimensions.pixelsPerMetre;
	var y = Math.sin(angle) * gameDimensions.pixelsPerMetre;
	return(new Position(x, y));
}

//*********************ADVANCED FUNCTIONS*******************************

function getSinusoidalProportion(amount) { // stays 0 - 1, but slopes
	amount *= PI; // now in angle form
	
	var newProportion = Math.cos(amount); // 1 to -1
	newProportion *= -1; // -1 to 1
	newProportion += 1; // 0 to 2
	newProportion /= 2; // 0 to 1
	
	return(newProportion);
}

function getVertebraAngle(angle, spineVertebrae, currentVertebra) { // an additive angle
	var proportionOfAngle = currentVertebra / spineVertebrae;
	
	return(angle * proportionOfAngle);
}

function getIdleAngle(angleSize, period) { // an additive angle
	var timeIntoIdle = gameTimer % period; // time compared to main time, repeats
	
	timeIntoIdle /= period; // in range 0 - 1
	timeIntoIdle *= TAU; // in range 0 - tau (waves realistically)
	angleSize *= Math.sin(timeIntoIdle); // diminish and possibly invert
	
	return(angleSize);
}

function getLimbAngle(maxBendAngle ) {
	
}

//**********************DINOSAUR OBJECTS********************************

function Bone(name, parentName, length, angle) { // bone as a point, line drawn from parent
	
	this.name = name; // name
	this.parentName = parentName; // name of parent bone
	
	this.position = new Position(0, 0); // position
	
	this.length = length; // length
	this.angle=angle; // rotation angle, clockwise from right
	
	this.setPosition = function(position) {
		this.position.x = position.x;
		this.position.y = position.y;
	}
	
	this.setAngle = function(angle) {
		this.angle = angle;
	}
	
	this.setPositionFromParent = function(parentPosition) {
		var vector = getNormalVector(this.angle); // get a normalised vector
		this.position.x = parentPosition.x + (this.length * vector.x);
		this.position.y = parentPosition.y + (this.length * vector.y);
	}
}

function SpineSection(vertebrae, length) { // a part of ths spine, defined as a number of bones and length
	this.vertebrae = vertebrae;
	this.length = length;
	this.vertebraLength = length / vertebrae;
}

function Limb(upperLength, lowerLength, jointLength, digitLength, digitAmount) { // limb detail (joint = wrist / ankle)
	this.upperLength = upperLength;
	this.lowerLength = lowerLength;
	this.jointLength = jointLength;
	this.digitLength = digitLength;
	this.digitAmount = digitAmount;
}

function Skeleton(tail, back, neck, leg, arm, jawLength) { // the details of a skeleton
	this.tail = tail;
	this.back = back;
	this.neck = neck;
	this.leg = leg;
	this.arm = arm;
	this.jawLength = jawLength;
}

//***********************DRAWING AND ANIMATION OBJECTS******************

function AnglesToInterPolateTo(angles) { // make many of these objects for animation steps
	this.angles = angles;
}

function SpineAnglesObject(main, curve) {
	this.main = main;
	this.curve = curve;
}

function LimbAnglesObject(upper, lower, joint, digit, digitGap) {
	this.upper = upper;
	this.lower = lower;
	this.joint = joint;
	this.digit = digit;
	this.digitGap = digitGap;
}

function JawAnglesObject(top, bottom) {
	this.top = top;
	this.bottom = bottom;
}

function AnglesObject(tail, spine, neck, leg, arm, jaw) { // each of these include idling details
	this.tail = tail;
	this.spine = spine;
	this.neck = neck;
	this.leg = leg;
	this.arm = arm;
	this.jaw = jaw;
}

function AllAnglesObject(main, idling, animation){
	this.main = main;
	this.idling = idling;
	this.animation = animation;
}

/*
 * Basically have a databasae of default angles to set the bones to, and
 * then the walking / breathing animations are additive to this.
*/

function DetailsObject(angles,idleTime) { // object for extra details (spines, plates, number of teeth, e.t.c)
	this.angles = angles;
	this.idleTime = idleTime;
}

function generateSkeletalArray(skeleton) { // generate an array of bones to form the skeleton described
	var array = [new Bone('pelvis', '', 0, 0)]; // start from the pelvis
	
	// start spine
	array.push(
		new Bone('spine1', 'pelvis', skeleton.back.vertebraLength, 0)
	);
	
	for(var i = 1; i < skeleton.back.vertebrae; i++) { // generate spine
		array.push(
			new Bone(
				'spine' + (i+1),
				'spine' + i,
				skeleton.back.vertebraLength,
				-TAU/17
			)
		);
	}
	
	// add shoulder, connected to spine (n)
	array.push( 
		new Bone(
			'shoulder',
			'spine' + skeleton.back.vertebrae,
			0.001,
			0)
	);
	
	// start neck
	array.push(
		new Bone('neck1', 'shoulder', skeleton.neck.vertebraLength, 0)
	);
	
	for(var i = 1; i < skeleton.neck.vertebrae; i++) { // generate neck
		array.push(
			new Bone(
				'neck' + (i+1),
				'neck' + i,
				skeleton.neck.vertebraLength,
				- TAU / 9
			)
		);
	}
	
	// add jaw, connected to neck (n)
	array.push( 
		new Bone(
			'jawtop',
			'neck' + skeleton.neck.vertebrae,
			skeleton.jawLength,
			-TAU / 12
		)
	);
	
	// add jaw, connected to neck (n)
	array.push( 
		new Bone(
			'jawbottom',
			'neck' + skeleton.neck.vertebrae,
			skeleton.jawLength,
			TAU / 12
		)
	);
	
	// start tail
	array.push(
		new Bone('tail1', 'pelvis', skeleton.tail.vertebraLength, PI)
	);
	
	for(var i = 1; i < skeleton.tail.vertebrae; i++) { // generate tail
		array.push(
			new Bone(
				'tail' + (i+1),
				'tail' + i,
				skeleton.tail.vertebraLength,
				PI
			)
		);
	}
	
	{ // left arm
		array.push(
			new Bone('armleftupper', 'shoulder', skeleton.arm.upperLength, DEG * 60)
		);
		
		array.push(
			new Bone('armleftlower', 'armleftupper', skeleton.arm.lowerLength, TAU / 4)
		);
		
		array.push(
			new Bone('armleftjoint', 'armleftlower', skeleton.arm.jointLength, TAU / 4)
		);
		
		for(var i = 1; i <= skeleton.arm.digitAmount; i++){
			array.push(
				new Bone('armleftdigit' + i, 'armleftjoint', skeleton.arm.digitLength, DEG * 10 * i)
			);
		}
	}
	
	{ // right arm
		array.push(
			new Bone('armrightupper', 'shoulder', skeleton.arm.upperLength, TAU / 4)
		);
		
		array.push(
			new Bone('armrightlower', 'armrightupper', skeleton.arm.lowerLength, TAU / 4)
		);
		
		array.push(
			new Bone('armrightjoint', 'armrightlower', skeleton.arm.jointLength, TAU / 4)
		);
		
		for(var i = 1; i <= skeleton.arm.digitAmount; i++){
			array.push(
				new Bone('armrightdigit' + i, 'armrightjoint', skeleton.arm.digitLength, 0)
			);
		}
	}
	
	{ // left leg
		array.push(
			new Bone('legleftupper', 'pelvis', skeleton.leg.upperLength, DEG * 120)
		);
		
		array.push(
			new Bone('legleftlower', 'legleftupper', skeleton.leg.lowerLength, DEG * 100)
		);
		
		array.push(
			new Bone('legleftjoint', 'legleftlower', skeleton.leg.jointLength, DEG * 70)
		);
		
		for(var i = 1; i <= skeleton.leg.digitAmount; i++){
			array.push(
				new Bone('legleftdigit' + i, 'legleftjoint', skeleton.leg.digitLength, 0)
			);
		}
	}
	
	{ // right leg
		array.push(
			new Bone('legrightupper', 'pelvis', skeleton.leg.upperLength, DEG * 60)
		);
		
		array.push(
			new Bone('legrightlower', 'legrightupper', skeleton.leg.lowerLength, DEG * 100)
		);
		
		array.push(
			new Bone('legrightjoint', 'legrightlower', skeleton.leg.jointLength, DEG * 70)
		);
		
		for(var i = 1; i <= skeleton.leg.digitAmount; i++){
			array.push(
				new Bone('legrightdigit' + i, 'legrightjoint', skeleton.leg.digitLength, 0)
			);
		}
	}
	
	return(array);
}

function Dinosaur(position, skeleton, details) {
	
	//*******************VARIABLE SETUP FROM INPUT**********************
	
	this.skeleton = skeleton; // save skeleton details
	
	this.skeletalArray = generateSkeletalArray(skeleton); // make a skeletal array
	
	this.position = position; // set position of dinosaur
	this.skeletalArray[0].position = position; // set the pelvis of the skeletal array to 
	
	this.indexOfBones={}; // index to enter a name to get the numerical index of named bone
	for(var i = 0; i < this.skeletalArray.length; i++) {
		this.indexOfBones[  this.skeletalArray[i].name  ] = i;
	}
	
	var digitNameArray = ['legleftdigit1', 'legrightdigit1', 'armleftdigit1', 'armrightdigit1']; // names of the four first digits
	
	this.lastFrameDigitPositions = {}; // this is to allow walking animations
	
	for(var i = 0; i < digitNameArray.length; i++){ // loop through digits and set up lastFRameDigitArray
		var j = digitNameArray[i]; // name of bone
		var sk = this.indexOfBones[ j ]; // numeric index of bone
		var pos = this.skeletalArray[ sk ].position; // position of bone
		
		this.lastFrameDigitPositions[ j ] = new Position(0, 0);
	}
	
	this.velocity = new Position(0, 0); // velocity of motion
	
	this.details = details;
	
	//********************************LOOPS*****************************
	
	this.draw = function() {
		
		for(var i = 1; i < this.skeletalArray.length; i++) { // set the position of each bone relative to its parent
			var parentName = this.skeletalArray[i].parentName; // name of bone
			var parentIndex = this.indexOfBones[ parentName ]; // numeric index of bone
			var parentPosition = this.skeletalArray[ parentIndex ].position; // position of bone
			
			this.skeletalArray[i].setPositionFromParent(parentPosition);
		}
		
		for(var i = 1; i < this.skeletalArray.length; i++) {
			
			ctx.beginPath(); // begin path
			
			ctx.strokeStyle = colours.bones;
			
			var parentName = this.skeletalArray[i].parentName; // name of parent
			var parentIndex = this.indexOfBones[ parentName ]; // numeric index of parent
			var parentPosition = this.skeletalArray[ parentIndex ].position; // position of parent
			
			ctx.moveTo(
				parentPosition.x,
				parentPosition.y
			); // move context to parent position
			
			ctx.lineTo(
				this.skeletalArray[i].position.x,
				this.skeletalArray[i].position.y
			); // draw line to own position
			
			ctx.stroke(); // draw line in
			
			//~ console.log(this.skeletalArray[i].position);
			//~ console.log(this.skeletalArray[i].name);
			//~ console.log('----------------');
			
			
			ctx.fillStyle = colours.text; // text colour
			
			//~ ctx.fillText(
				//~ this.skeletalArray[i].name,
				//~ this.skeletalArray[i].position.x,
				//~ this.skeletalArray[i].position.y
			//~ );
			
		} // draw a line for each bone
		
		for(var i = 1; i < this.skeletalArray.length; i++) {
			
			ctx.beginPath(); // begin path
			
			ctx.fillStyle = colours.joints;
			
			ctx.arc(
				this.skeletalArray[i].position.x,
				this.skeletalArray[i].position.y,
				gameDimensions.jointBallRadius,
				0,
				Math.PI*2,
				false
			);
			
			ctx.fill();
			
			ctx.beginPath();
			
		} // draw a circle for each joint
	}
	
	this.animate = function() {
		
		//**********************SETUP MAIN ANGLES***********************
		
		for( var i = 1; i <= this.skeleton.tail.vertebrae; i++){ // tail
			var boneName = 'tail' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle = this.details.angles.main.tail.main;
		}
		
		for( var i = 1; i <= this.skeleton.neck.vertebrae; i++){ // neck
			var boneName = 'neck' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle = this.details.angles.main.neck.main;
		}
		
		for( var i = 1; i <= this.skeleton.back.vertebrae; i++){ // spine
			var boneName = 'spine' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle = this.details.angles.main.spine.main;
		}
		
		{ // limbs
			var limbTypes = ['arm', 'leg'];
			var limbSides = ['left', 'right'];
			var limbSections = ['upper', 'lower', 'joint', 'digit'];
			
			for(var limbTypeIndex = 0;  limbTypeIndex < limbTypes.length;  limbTypeIndex++) {
				var limbType = limbTypes[limbTypeIndex];
				
				for(var limbSideIndex = 0;  limbSideIndex < limbSides.length;  limbSideIndex++) {
					var limbSide = limbSides[limbSideIndex];
					
					for(var limbSectionIndex = 0;  limbSectionIndex < limbSections.length;  limbSectionIndex++) {
						var limbSection = limbSections[limbSectionIndex];
						
						if(limbSection == 'digit') {
							for(var i = 1; i <= this.skeleton[limbType].digitAmount; i++) {
								var boneName = limbType + limbSide + limbSection + i;
								var boneIndex = this.indexOfBones[boneName];
								var digitLift = this.details.angles.main[limbType].digitGap  *  (i-1);
			
								this.skeletalArray[boneIndex].angle = this.details.angles.main[limbType][limbSection] + digitLift;
							}
						}else{
							var boneName = limbType + limbSide + limbSection;
							var boneIndex = this.indexOfBones[boneName];
		
							this.skeletalArray[boneIndex].angle = this.details.angles.main[limbType][limbSection];
						}
						
					}
				}
			}
		}
		
		{ // jaw
			var boneName = 'jawtop';
			var boneIndex = this.indexOfBones[boneName];
	
			this.skeletalArray[boneIndex].angle = this.details.angles.main.jaw.top;
			
			boneName = 'jawbottom';
			boneIndex = this.indexOfBones[boneName];
	
			this.skeletalArray[boneIndex].angle = this.details.angles.main.jaw.bottom;
		}
		
		//********************SETUP IDLING ANGLES***********************
		
		for( var i = 1; i <= this.skeleton.tail.vertebrae; i++){ // tail
			var boneName = 'tail' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle += getIdleAngle(this.details.angles.idling.tail.main, this.details.idleTime);
		}
		
		for( var i = 1; i <= this.skeleton.neck.vertebrae; i++){ // neck
			var boneName = 'neck' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle += getIdleAngle(this.details.angles.idling.neck.main, this.details.idleTime);
		}
		
		for( var i = 1; i <= this.skeleton.back.vertebrae; i++){ // spine
			var boneName = 'spine' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle += getIdleAngle(this.details.angles.idling.spine.main, this.details.idleTime);
		}
		
		{ // limbs
			var limbTypes = ['arm', 'leg'];
			var limbSides = ['left', 'right'];
			var limbSections = ['upper', 'lower', 'joint', 'digit'];
			
			for(var limbTypeIndex = 0;  limbTypeIndex < limbTypes.length;  limbTypeIndex++) {
				var limbType = limbTypes[limbTypeIndex];
				
				for(var limbSideIndex = 0;  limbSideIndex < limbSides.length;  limbSideIndex++) {
					var limbSide = limbSides[limbSideIndex];
					
					for(var limbSectionIndex = 0;  limbSectionIndex < limbSections.length;  limbSectionIndex++) {
						var limbSection = limbSections[limbSectionIndex];
						
						if(limbSection == 'digit') {
							for(var i = 1; i <= this.skeleton[limbType].digitAmount; i++) {
								var boneName = limbType + limbSide + limbSection + i;
								var boneIndex = this.indexOfBones[boneName];
								var digitLift = this.details.angles.idling[limbType].digitGap  *  (i-1);
			
								this.skeletalArray[boneIndex].angle += getIdleAngle(
									this.details.angles.idling[limbType][limbSection] + digitLift,
									this.details.idleTime
								);
							}
						}else{
							var boneName = limbType + limbSide + limbSection;
							var boneIndex = this.indexOfBones[boneName];
		
							this.skeletalArray[boneIndex].angle += getIdleAngle(
								this.details.angles.idling[limbType][limbSection],
								this.details.idleTime
							);
						}
						
					}
				}
			}
		}
		
		{ // jaw
			var boneName = 'jawtop';
			var boneIndex = this.indexOfBones[boneName];
	
			this.skeletalArray[boneIndex].angle += getIdleAngle( this.details.angles.idling.jaw.top, this.details.idleTime);
			
			boneName = 'jawbottom';
			boneIndex = this.indexOfBones[boneName];
	
			this.skeletalArray[boneIndex].angle += getIdleAngle( this.details.angles.idling.jaw.bottom, this.details.idleTime);
		}
		
		//*****************SETUP SPINAL CURVATURE***********************
		
		for( var i = 1; i <= this.skeleton.tail.vertebrae; i++){ // tail
			var boneName = 'tail' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle += getVertebraAngle(
				this.details.angles.main.tail.curve,
				this.skeleton.tail.vertebrae,
				i
			);// progressive across spine
		}
		
		for( var i = 1; i <= this.skeleton.neck.vertebrae; i++){ // neck
			var boneName = 'neck' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle += getVertebraAngle(
				this.details.angles.main.neck.curve,
				this.skeleton.neck.vertebrae,
				i
			);// progressive across spine
		}
		
		for( var i = 1; i <= this.skeleton.back.vertebrae; i++){ // spine
			var boneName = 'spine' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			this.skeletalArray[boneIndex].angle += getVertebraAngle(
				this.details.angles.main.spine.curve,
				this.skeleton.back.vertebrae,
				i
			);// progressive across spine
		}
		
		//***************SETUP IDLING SPINAL CURVATURE******************
		
		for( var i = 1; i <= this.skeleton.tail.vertebrae; i++){ // tail
			var boneName = 'tail' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			var overallAngle = getIdleAngle(this.details.angles.idling.tail.curve, this.details.idleTime);
			
			this.skeletalArray[boneIndex].angle += getVertebraAngle(
				overallAngle,
				this.skeleton.tail.vertebrae,
				i
			);// progressive across spine
		}
		
		for( var i = 1; i <= this.skeleton.neck.vertebrae; i++){ // neck
			var boneName = 'neck' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			var overallAngle = getIdleAngle(this.details.angles.idling.neck.curve, this.details.idleTime);
			
			this.skeletalArray[boneIndex].angle += getVertebraAngle(
				overallAngle,
				this.skeleton.neck.vertebrae,
				i
			);// progressive across spine
		}
		
		for( var i = 1; i <= this.skeleton.back.vertebrae; i++){ // spine
			var boneName = 'spine' + i;
			var boneIndex = this.indexOfBones[boneName];
			
			var overallAngle = getIdleAngle(this.details.angles.idling.spine.curve, this.details.idleTime);
			
			this.skeletalArray[boneIndex].angle += getVertebraAngle(
				overallAngle,
				this.skeleton.back.vertebrae,
				i
			);// progressive across spine
		}
		
		//*****************SETUP ANIMATION ANGLES***********************
		
	}
	
	this.physics = function() {
		this.position.x += this.velocity.x / gameFPS;
		this.position.y += this.velocity.y / gameFPS; // motion
		
		if(
			this.skeletalArray[   this.indexOfBones[ 'legleftjoint' ]   ].position.y < groundY &&
			this.skeletalArray[   this.indexOfBones[ 'legrightjoint' ]   ].position.y < groundY &&
			this.skeletalArray[   this.indexOfBones[ 'armleftjoint' ]   ].position.y < groundY &&
			this.skeletalArray[   this.indexOfBones[ 'armrightjoint' ]   ].position.y < groundY
		)    {
			this.velocity.y += 9.8 * gameDimensions.pixelsPerMetre / gameFPS; // gravity
		} else {
			this.velocity.y = 0;
		}
	}
	
	this.footGripLoop = function() { // checks if digits underground have moved
		
		if(this.lastFrameDigitPositions.y == 0 && this.lastFrameDigitPositions.x == 0) { // stop it from moving on first frame
			return;
		}
		
		for(var i = 0; i < digitNameArray.length; i++){ // loop through digits to stay above ground
			var j = digitNameArray[i]; // name of bone
			var sk = this.indexOfBones[ j ]; // numeric index of bone
			var pos = this.skeletalArray[ sk ].position; // position of bone
			
			if( pos.y > groundY ) { // if the digit is underground
				this.position.y += groundY - pos.y; // move the dinosaur to compensate
				
				this.velocity.y = 0;
				//~ console.log(this.lastFrameDigitPositions[ j ].x - pos.x);
			}
			
		}
		
		for(var i = 0; i < digitNameArray.length; i++){ // loop through digits to walk backward or forward
			var j = digitNameArray[i]; // name of bone
			var sk = this.indexOfBones[ j ]; // numeric index of bone
			var pos = this.skeletalArray[ sk ].position; // position of bone
			
			if( pos.y > groundY ) { // if the digit is underground
				this.position.x += this.lastFrameDigitPositions[ j ].x - pos.x ; // move the dinosaur to compensate
				//~ console.log(this.lastFrameDigitPositions[ j ].x - pos.x);
				break; // if more than one digit is underground, this will make it shake disturbingly throughout the step. Brakeing prevents this
			}
			
			this.lastFrameDigitPositions[ j ].x = pos.x;
			this.lastFrameDigitPositions[ j ].y = pos.y; // copy the position without reusing the object
		}
	}
	
	this.loop = function() {
		this.physics();
		this.animate();
		this.draw();
		this.footGripLoop();
	}
	
	this.loop();
}

//****************************DINOSAUR**********************************

var demonstratosaurus = new Dinosaur(
	new Position(500,500),
	new Skeleton(
		new SpineSection(7, 6),
		new SpineSection(7, 3),
		new SpineSection(7, 1.5),
		new Limb(2,2,0.5,0.5,3),
		new Limb(0.4,0.4,0.1,0.1,2),
		1.5
	),
	new DetailsObject(
		new AllAnglesObject(
			new AnglesObject(
				new SpineAnglesObject(PI, 0),
				new SpineAnglesObject(0, 0),
				new SpineAnglesObject(0, - DEG * 15),
				new LimbAnglesObject(DEG * 50, DEG * 170, DEG * 75, 0, DEG * -10),
				new LimbAnglesObject(DEG * 80, DEG * 65, DEG * 65, DEG * 10, DEG * 45),
				new JawAnglesObject(DEG * -5, DEG * 25),
			),
			new AnglesObject(
				new SpineAnglesObject(0, DEG * 4),
				new SpineAnglesObject(0, DEG * 4),
				new SpineAnglesObject(0, DEG * 1),
				new LimbAnglesObject(0, 0, 0, 0, 0),
				new LimbAnglesObject(0, 0, 0, 0, 0),
				new JawAnglesObject(0, 0),
			),
			new AnglesObject(
				new SpineAnglesObject(PI, 0),
				new SpineAnglesObject(0, 0),
				new SpineAnglesObject(0, - DEG * 15),
				new LimbAnglesObject(DEG * 50, DEG * 170, DEG * 75, 0, 0),
				new LimbAnglesObject(DEG * 50, DEG * 170, DEG * 75, 0, 0),
				new JawAnglesObject(0, 0),
			)
		),
		5000
	)
);

//*****************************MAIN LOOP********************************

function draw() {
	ctx.fillStyle = colours.background;
	ctx.fillRect(0,0,canvasSize.x,canvasSize.y); // fill a background
	
	ctx.fillStyle = colours.floor;
	ctx.fillRect(0, groundY, canvasSize.x, gameDimensions.groundHeight); // the floor
	
	demonstratosaurus.loop();
	
	gameTimer += frameDelay;
	setTimeout(draw, frameDelay);
}

draw();

}
