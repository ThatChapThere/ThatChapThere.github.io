window.onload=function () {

//*********************GRAPHICS SETUP***********************************

var ctx = document.getElementsByTagName('canvas')[0].getContext('2d'); // get context to draw

var canvasSize = new Position(1800, 800); //cartesian for the size of the canvas

// This function gets the offset either top or left for a html element,
// usually a canvas
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
	'features' : '#F5776D',
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
	'groundHeight' : 20, // how high the ground is
	'pixelsPerMetre' : 40, // for drawing dinosaurs
	'jointBallRadius' : 3, // ball joint circle drawing radius
}

const groundY = canvasSize.y - gameDimensions.groundHeight;

var gameTimer = 0; // itme since game start in milliseconds

const gameFPS = 240;

const frameDelay = Math.round(1000 / gameFPS);

var keyCodes = [];

// add a false value for every possible key
for(var i = 0; i < 225; i++){
	keyCodes.push(false);
}

//when a key is released or pressed, change the respective boolean value
document.body.onkeydown = function(event) {
	keyCodes[event.keyCode] = true;
}

document.body.onkeyup = function(event) {
	keyCodes[event.keyCode] = false;
}

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
	
	this.multiply = function(n) {
		this.x *= n;
		this.y *= n;
	}

	this.copyPosition = function(position) {
		this.x = position.x;
		this.y = position.y;
	}
}

// get a vector of radius 1 metre for an angle in radians
function getNormalVector(angle){
	var x = Math.cos(angle) * gameDimensions.pixelsPerMetre;
	var y = Math.sin(angle) * gameDimensions.pixelsPerMetre;
	return(new Position(x, y));
}

//*********************ADVANCED FUNCTIONS*******************************

// enter a value between 0 and 1 and it will return a smoothed value
function getSinusoidalProportion(amount) { // stays 0 - 1, but slopes
	amount *= PI; // now in angle form
	
	var newProportion = Math.cos(amount); // 1 to -1
	newProportion *= -1; // -1 to 1
	newProportion += 1; // 0 to 2
	newProportion /= 2; // 0 to 1
	
	return(newProportion);
}

// the angle of a specific vertebra on a curved spine
function getVertebraAngle(angle, spineVertebrae, currentVertebra) { // an additive angle
	var proportionOfAngle = currentVertebra / spineVertebrae;
	
	return(angle * proportionOfAngle);
}

// get an angle for realistic "breating" animation in a smooth form
function getIdleAngle(angleSize, period) { // an additive angle
	var timeIntoIdle = gameTimer % period; // time compared to main time, repeats
	
	timeIntoIdle /= period; // in range 0 - 1
	timeIntoIdle *= TAU; // in range 0 - tau (waves realistically)
	angleSize *= Math.sin(timeIntoIdle); // diminish and possibly invert
	
	return(angleSize);
}

//**********************DINOSAUR BODY OBJECTS***************************

function Bone(name, parentName, length, angle, health) { // bone as a point, line drawn from parent
	
	this.name = name; // name
	this.parentName = parentName; // name of parent bone
	
	this.position = new Position(0, 0); // position
	
	this.length = length; // length
	this.angle=angle; // rotation angle, clockwise from right
	
	this.health = health;
	
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

function SpineSection(vertebrae, length, health) { // a part of ths spine, defined as a number of bones and length
	this.vertebrae = vertebrae;
	this.length = length;
	this.vertebraLength = length / vertebrae;
	this.health = health;
}

function Limb(upperLength, lowerLength, jointLength, digitLengths, digitAmount, health) { // limb detail (joint = wrist / ankle)
	this.upperLength = upperLength;
	this.lowerLength = lowerLength;
	this.jointLength = jointLength;
	this.digitLengths = digitLengths;
	this.digitAmount = digitAmount;
	this.health = health;
}

function Skeleton(tail, back, neck, leg, arm, jawLength) { // the details of a skeleton
	this.tail = tail;
	this.back = back;
	this.neck = neck;
	this.leg = leg;
	this.arm = arm;
	this.jawLength = jawLength;
}

//**************************FEATURES OBJECTS****************************

/*
 * feature sizes in metres
 * angles are relative to the parent bone, not absolute like other bones
 * 
 * curved spike : two parabolas
 * spike : triangle
 * blunt spine : parabola (from two mirror parabolas)
 * dome : semicircle
 * rectangle
 * plate : rhombus
 * 
 * sail : array for tail, neck and
 * 
 */

function Spike(distanceOnBone, height, width, angle, damage) {
	this.distanceOnBone = distanceOnBone; // back toward the pelvis
	this.height = height;
	this.width = width;
	this.angle = angle;
	this.damage = damage;
	
	this.draw = function(dinosaur, parentName) {
		var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
		var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
		var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
		
		parentAngle += PI; // back toward parent of parent
		
		var vector = getNormalVector(parentAngle);
		
		var anchor1 = new Position(vector.x, vector.y); // copy direction
		var anchor1Distance = this.distanceOnBone - this.width / 2;
		anchor1.multiply(anchor1Distance); // set a distance
		
		var anchor2 = new Position(vector.x, vector.y); // copy direction
		var anchor2Distance = this.distanceOnBone;
		anchor2.multiply(anchor2Distance); // set a distance
		
		var anchor3 = new Position(vector.x, vector.y); // copy direction
		var anchor3Distance = this.distanceOnBone + this.width / 2;
		anchor3.multiply(anchor3Distance); // set a distance
		
		if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
			var centreSpine = getNormalVector(parentAngle - this.angle); // this.angle relative to parentangle
		}else{
			var centreSpine = getNormalVector(parentAngle + this.angle); // this.angle relative to parentangle
		}
		
		centreSpine.multiply(this.height);
		
		ctx.beginPath();
		
		ctx.moveTo(
			parentPosition.x + anchor1.x,
			parentPosition.y + anchor1.y,
		); // point 1
		
		ctx.lineTo(
			parentPosition.x + anchor2.x + centreSpine.x,
			parentPosition.y + anchor2.y + centreSpine.y,
		); // top of spike
		
		ctx.lineTo(
			parentPosition.x + anchor3.x,
			parentPosition.y + anchor3.y,
		); // bottom of spine
		
		ctx.stroke();
		ctx.beginPath();
		
		dinosaur.damagePoints.push(
			new DamagePoint(
				new Position(
					parentPosition.x + anchor2.x + centreSpine.x,
					parentPosition.y + anchor2.y + centreSpine.y
				),
				this.damage
			)
		);
	}
}

function BluntSpike(distanceOnBone, height, width, angle, damage) {
	this.distanceOnBone = distanceOnBone; // back toward the pelvis
	this.height = height;
	this.width = width;
	this.angle = angle;
	this.damage = damage;
	
	this.draw = function(dinosaur, parentName) {
		var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
		var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
		var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
		
		parentAngle += PI; // back toward parent of parent
		
		var vector = getNormalVector(parentAngle);
		
		var anchor1 = new Position(vector.x, vector.y); // copy direction
		var anchor1Distance = this.distanceOnBone - this.width / 2;
		anchor1.multiply(anchor1Distance); // set a distance
		
		var anchor2 = new Position(vector.x, vector.y); // copy direction
		var anchor2Distance = this.distanceOnBone;
		anchor2.multiply(anchor2Distance); // set a distance
		
		var anchor3 = new Position(vector.x, vector.y); // copy direction
		var anchor3Distance = this.distanceOnBone + this.width / 2;
		anchor3.multiply(anchor3Distance); // set a distance
		
		if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
			var centreSpine = getNormalVector(parentAngle - this.angle); // this.angle relative to parentangle
		}else{
			var centreSpine = getNormalVector(parentAngle + this.angle); // this.angle relative to parentangle
		}
		
		centreSpine.multiply(this.height);
		
		ctx.beginPath();
		
		ctx.moveTo(
			parentPosition.x + anchor1.x,
			parentPosition.y + anchor1.y,
		); // point 1
		
		ctx.quadraticCurveTo(
			parentPosition.x + anchor1.x + centreSpine.x,
			parentPosition.y + anchor1.y + centreSpine.y,
			
			parentPosition.x + anchor2.x + centreSpine.x,
			parentPosition.y + anchor2.y + centreSpine.y,
		); // top of spike
		
		ctx.quadraticCurveTo(
			parentPosition.x + anchor3.x + centreSpine.x,
			parentPosition.y + anchor3.y + centreSpine.y,
			
			parentPosition.x + anchor3.x,
			parentPosition.y + anchor3.y,
		); // bottom of spine
		
		ctx.stroke();
		ctx.beginPath();
		
		dinosaur.damagePoints.push(
			new DamagePoint(
				new Position(
					parentPosition.x + anchor2.x + centreSpine.x,
					parentPosition.y + anchor2.y + centreSpine.y
				),
				this.damage
			)
		);
	}
}

function CurvedSpike(distanceOnBone, height, width, guidePointDistanceOnBone, guidePointHeight, angle, damage) {
	this.distanceOnBone = distanceOnBone; // back toward the pelvis
	this.height = height;
	this.width = width;
	this.angle = angle;
	this.damage = damage;
	
	this.guidePointDistanceOnBone = guidePointDistanceOnBone;
	this.guidePointHeight = guidePointHeight;
	
	// guide point is rotated by the same angle as the spike
	// the guide point is used a a centre for quadratic curves
	
	this.draw = function(dinosaur, parentName) {
		var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
		var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
		var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
		
		parentAngle += PI; // back toward parent of parent
		
		var vector = getNormalVector(parentAngle);
		
		var anchor1 = new Position(vector.x, vector.y); // copy direction
		var anchor1Distance = this.distanceOnBone - this.width / 2;
		anchor1.multiply(anchor1Distance); // set a distance
		
		var anchor2 = new Position(vector.x, vector.y); // copy direction
		var anchor2Distance = this.distanceOnBone;
		anchor2.multiply(anchor2Distance); // set a distance
		
		var anchor3 = new Position(vector.x, vector.y); // copy direction
		var anchor3Distance = this.distanceOnBone + this.width / 2;
		anchor3.multiply(anchor3Distance); // set a distance
		
		
		if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
			var centreSpine = getNormalVector(parentAngle - this.angle); // this.angle relative to parentangle
		}else{
			var centreSpine = getNormalVector(parentAngle + this.angle); // this.angle relative to parentangle
		}
		
		centreSpine.multiply(this.height);
		
		var guidePointAnchor = new Position(vector.x, vector.y); // copy direction
		guidePointAnchor.multiply(guidePointDistanceOnBone);
		
		var guidePoint = getNormalVector(parentAngle + this.angle); // this.angle relative to parentangle
		guidePoint.multiply(this.guidePointHeight);
		
		ctx.beginPath();
		
		ctx.moveTo(
			parentPosition.x + anchor1.x,
			parentPosition.y + anchor1.y,
		); // point 1
		
		ctx.quadraticCurveTo(
			parentPosition.x + guidePointAnchor.x + guidePoint.x,
			parentPosition.y + guidePointAnchor.y + guidePoint.y,
			
			parentPosition.x + anchor2.x + centreSpine.x,
			parentPosition.y + anchor2.y + centreSpine.y,
		); // top of spike
		
		ctx.quadraticCurveTo(
			parentPosition.x + guidePointAnchor.x + guidePoint.x,
			parentPosition.y + guidePointAnchor.y + guidePoint.y,
			
			parentPosition.x + anchor3.x,
			parentPosition.y + anchor3.y,
		); // bottom of spine
		
		ctx.stroke();
		ctx.beginPath();
		
		var anchor2 = new Position(vector.x, vector.y); // copy direction
		var anchor2Distance = this.distanceOnBone;
		anchor2.multiply(anchor2Distance); // set a distance
		
		dinosaur.damagePoints.push(
			new DamagePoint(
				new Position(
					parentPosition.x + anchor2.x + centreSpine.x,
					parentPosition.y + anchor2.y + centreSpine.y
				),
				this.damage
			)
		);
	}
}

function Dome(distanceOnBone, radius, angle, damage) {
	this.distanceOnBone = distanceOnBone;
	this.radius = radius * gameDimensions.pixelsPerMetre;
	this.angle = angle;
	this.damage = damage;
	
	this.draw = function(dinosaur, parentName) {
		var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
		var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
		var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
		
		parentAngle += PI; // back toward parent of parent
		
		var vector = getNormalVector(parentAngle);
		
		var centre = new Position(vector.x, vector.y); // copy direction
		centre.multiply(this.distanceOnBone); // set a distance
		
		ctx.beginPath();
		
		ctx.arc(
			parentPosition.x + centre.x,
			parentPosition.y + centre.y,
			this.radius,
			parentAngle + this.angle,
			parentAngle + this.angle + PI,
			false
		);
		
		ctx.stroke();
		ctx.beginPath();
		
		// The following variables are purely for the damage point, as the furthest point on the dome surface from the actual bone
		
		var anchor = new Position(vector.x, vector.y); // copy direction
		var anchorDistance = this.distanceOnBone;
		anchor.multiply(anchorDistance); // set a distance
		
		var damagePointSpineVector = getNormalVector(parentAngle + this.angle + DEG * 90);
		var damagePointSpine = new Position(
			damagePointSpineVector.x,
			damagePointSpineVector.y
		);
		damagePointSpine.multiply(this.radius);
		// copy direction
		
		dinosaur.damagePoints.push(
			new DamagePoint(
				new Position(
					parentPosition.x + anchor.x + centreSpine.x,
					parentPosition.y + anchor.y + centreSpine.y
				),
				this.damage
			)
		);
	}
}

function RectangularPlate(distanceOnBone, height, width, angle) {
	this.distanceOnBone = distanceOnBone; // back toward the pelvis
	this.height = height;
	this.width = width;
	this.angle = angle;
	
	this.draw = function(dinosaur, parentName) {
		var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
		var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
		var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
		
		parentAngle += PI; // back toward parent of parent
		
		var vector = getNormalVector(parentAngle);
		
		var anchor1 = new Position(vector.x, vector.y); // copy direction
		var anchor1Distance = this.distanceOnBone - this.width / 2;
		anchor1.multiply(anchor1Distance); // set a distance
		
		var anchor2 = new Position(vector.x, vector.y); // copy direction
		var anchor2Distance = this.distanceOnBone + this.width / 2;
		anchor2.multiply(anchor2Distance); // set a distance
		
		
		if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
			var centreSpine = getNormalVector(parentAngle - this.angle); // this.angle relative to parentangle
		}else{
			var centreSpine = getNormalVector(parentAngle + this.angle); // this.angle relative to parentangle
		}
		
		centreSpine.multiply(this.height);
		
		ctx.beginPath();
		
		ctx.moveTo(
			parentPosition.x + anchor1.x,
			parentPosition.y + anchor1.y,
		); // point 1
		
		ctx.lineTo(
			parentPosition.x + anchor1.x + centreSpine.x,
			parentPosition.y + anchor1.y + centreSpine.y,
		); // top point1
		
		ctx.lineTo(
			parentPosition.x + anchor2.x + centreSpine.x,
			parentPosition.y + anchor2.y + centreSpine.y,
		); // top point two
		
		ctx.lineTo(
			parentPosition.x + anchor2.x,
			parentPosition.y + anchor2.y,
		); // bottom of plate
		
		ctx.stroke();
		ctx.beginPath();
	}
}

function RhombicPlate(distanceOnBone, height, width, angle) {
	this.distanceOnBone = distanceOnBone; // back toward the pelvis
	this.height = height;
	this.width = width;
	this.angle = angle;
	
	this.draw = function(dinosaur, parentName) {
		var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
		var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
		var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
		
		parentAngle += PI; // back toward parent of parent
		
		var vector = getNormalVector(parentAngle);
		
		var anchor1 = new Position(vector.x, vector.y); // copy direction
		var anchor1Distance = this.distanceOnBone - this.width / 2;
		anchor1.multiply(anchor1Distance); // set a distance
		
		var anchor2 = new Position(vector.x, vector.y); // copy direction
		var anchor2Distance = this.distanceOnBone;
		anchor2.multiply(anchor2Distance); // set a distance
		
		var anchor3 = new Position(vector.x, vector.y); // copy direction
		var anchor3Distance = this.distanceOnBone + this.width / 2;
		anchor3.multiply(anchor3Distance); // set a distance
		
		if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
			var centreSpine = getNormalVector(parentAngle - this.angle); // this.angle relative to parentangle
		}else{
			var centreSpine = getNormalVector(parentAngle + this.angle); // this.angle relative to parentangle
		}
		
		centreSpine.multiply(this.height);
		
		ctx.beginPath();
		
		ctx.moveTo(
			parentPosition.x + anchor2.x,
			parentPosition.y + anchor2.y,
		); // point 1
		
		ctx.lineTo(
			parentPosition.x + anchor1.x + centreSpine.x/2,
			parentPosition.y + anchor1.y + centreSpine.y/2,
		); // top of spike
		
		
		ctx.lineTo(
			parentPosition.x + anchor2.x + centreSpine.x,
			parentPosition.y + anchor2.y + centreSpine.y,
		); // top of spike
		
		
		ctx.lineTo(
			parentPosition.x + anchor3.x + centreSpine.x/2,
			parentPosition.y + anchor3.y + centreSpine.y/2,
		); // top of spike
		
		ctx.lineTo(
			parentPosition.x + anchor2.x,
			parentPosition.y + anchor2.y,
		); // bottom of spine
		
		ctx.stroke();
		ctx.beginPath();
	}
}

function Feathers(angle, number, length) {
	this.angle = angle;
	this.number = number;
	this.length = length;
	
	this.draw = function(dinosaur, parentName) {
		var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
		var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
		var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
		
		parentAngle += PI; // back toward parent of parent
		
		var vector = getNormalVector(parentAngle);
		
		
		
		if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
			var centreSpine = getNormalVector(parentAngle - this.angle); // this.angle relative to parentangle
		}else{
			var centreSpine = getNormalVector(parentAngle + this.angle); // this.angle relative to parentangle
		}
		
		centreSpine.multiply(this.length);
		
		for(var i = 0; i < this.number; i++) {
			var proportionAlongBone = i / this.number;
			var distanceOnBone = dinosaur.skeletalArray[ parentIndex ].length * proportionAlongBone;
			
			var anchor = new Position(vector.x, vector.y); // copy direction
			anchor.multiply(distanceOnBone); // set a distance
			
			ctx.beginPath();
			
			ctx.moveTo(
				parentPosition.x + anchor.x,
				parentPosition.y + anchor.y,
			); // point 1
			
			ctx.lineTo(
				parentPosition.x + anchor.x + centreSpine.x,
				parentPosition.y + anchor.y + centreSpine.y,
			); // top of feather
			
			ctx.stroke();
			ctx.beginPath();
		}
	}
}

function Feature(feature, parentName, damage, colour) {//*****MAIN FEATURES*****
	this.feature = feature;
	this.parentName = parentName;
	this.colour = colour;
	
	this.draw = function (dinosaur) {
		ctx.strokeStyle = colours.features;
		this.feature.draw(dinosaur, parentName);
	}
}

function SailSpine(bone, length, angle) {
	this.bone = bone;
	this.length = length;
	this.angle = angle;
}

function Sail(spines) {
	this.spines = spines;
	
	this.draw = function(dinosaur) {
		
		ctx.strokeStyle = colours.features;
		
		ctx.beginPath();
		
		for(var i = 0; i < this.spines.length; i++) { // draw the top of the sail
			
			var parentName = this.spines[i].bone;
			
			var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
			var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
			var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
			
			parentAngle += PI; // back toward parent of parent
			
			var vector = getNormalVector(parentAngle);
			
			if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
				var centreSpine = getNormalVector(parentAngle - this.spines[i].angle); // this.angle relative to parentangle
			}else{
				var centreSpine = getNormalVector(parentAngle + this.spines[i].angle); // this.angle relative to parentangle
			}
			
			centreSpine.multiply(this.spines[i].length);
			
			if(i == 0) {
				ctx.moveTo(
					parentPosition.x + centreSpine.x,
					parentPosition.y + centreSpine.y,
				);
			}else{
				ctx.lineTo(
					parentPosition.x + centreSpine.x,
					parentPosition.y + centreSpine.y,
				); // top of spine
			}
		}
		
		ctx.stroke();
		
		for(var i = 0; i < this.spines.length; i++) { // draw the sail spines
			
			var parentName = this.spines[i].bone;
			
			var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
			var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
			var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
			
			parentAngle += PI; // back toward parent of parent
			
			var vector = getNormalVector(parentAngle);
			
			if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
				var centreSpine = getNormalVector(parentAngle - this.spines[i].angle); // this.angle relative to parentangle
			}else{
				var centreSpine = getNormalVector(parentAngle + this.spines[i].angle); // this.angle relative to parentangle
			}
			
			centreSpine.multiply(this.spines[i].length);
			
			ctx.beginPath();
			
			ctx.moveTo(
				parentPosition.x,
				parentPosition.y,
			);
		
			ctx.lineTo(
				parentPosition.x + centreSpine.x,
				parentPosition.y + centreSpine.y,
			); // top of spine
			
			ctx.stroke();
			
		}
	}
}

//***********************DRAWING AND ANIMATION OBJECTS******************

function AnglesToInterPolateTo(angles) { // make many of these objects for animation steps
	this.angles = angles;
}

function SpineAnglesObject(main, curve) { // store the angle of a spine section with the curvature and the main rotation
	this.main = main;
	this.curve = curve;
}

function LimbAnglesObject(upper, lower, joint, digit, digitGap) { // store all of the angles of a limb
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

function AnglesObject(tail, back, neck, leg, arm, jaw) { // each of these include idling details
	this.tail = tail;
	this.back = back;
	this.neck = neck;
	this.leg = leg;
	this.arm = arm;
	this.jaw = jaw;
}

function AllAnglesObject(main, idling, animation){ // object for storing all of the angles
	this.main = main;
	this.idling = idling;
	this.animation = animation;
}

/*
 * Basically have a databasae of default angles to set the bones to, and
 * then the walking / breathing animations are additive to this.
*/

//************************ANIMATION KEYFRAMING**************************

function KeyFramesObject(last, next, startTime, period) { // stores keyframes for a dinosaur
	this.last = last;
	this.next = next;
	this.startTime = startTime;
	this.period = period;
	
	this.getSmoothAngle = function(boneName) { // get the angle of a bone
		
		var timeThrough = gameTimer - this.startTime; // how far in milliseconds
		
		timeThrough /= this.period; // how far as a proportion
		
		var proportionThrough = getSinusoidalProportion(timeThrough); // angle proportion, smoothed
		var angleGap = this.next[boneName] - this.last[boneName]; // the difference in angle
		var angleDelta = angleGap * proportionThrough;
		
		return(this.last[boneName] + angleDelta);
		
	}
	
	this.isFinished = function() {
		if(gameTimer > this.startTime + this.period) { // keyframe finished
			return true;
		}
		return false;
	}
	
	this.storeLastFrame = function() { // set last frame to current frame
		for(var i in this.next) { // copy angle values
			this.last[i] = this.next[i];
		}
	}
	
	this.startToReset = function() { // next keyframe is the standing position
		this.storeLastFrame();
		
		for(var i in this.next) { // set every keyframed bit to 0
			this.next[i] = 0;
		}
		
		this.startTime = gameTimer; // reset timer for keyframing
	}
	
	this.addNewFrame = function(frame) {
		this.storeLastFrame();
		
		for(var i in this.next) {
			this.next[i] = 0;
		}
		
		for(var i in frame) { // copy angle values
			if(    isNaN( this.last[i] )    ) { // if last frame does not have a number index, set it to 0
				this.last[i] = 0;
				
				//~ console.log('new number set to 0');
			}
			this.next[i] = frame[i];
		}
		
		this.startTime = gameTimer; // reset timer for keyframing
	}

}

function WalkAnimation(steps) { // for storing the details of a walk animation
	
	this.steps = steps;
	this.currentStep = 0;
	
	this.nextStep = function() {
		if(this.currentStep == this.steps.length - 1) { // if on last step
			this.currentStep = 0; // reset
		}else{ //otherwise
			this.currentStep ++; // next step
		}
	}
	
	this.previousStep = function() {
		if(this.currentStep == 0) { // if on first step
			this.currentStep = this.steps.length - 1; // reset
		}else{ //otherwise
			this.currentStep --; // last step
		}
	}
}

//**************FINAL DINOSAUR GENERATING FUNCTIONS*********************

function DetailsObject(angles, idleTime, animationSpeed, jumpSpeed, features, sail) { // object for extra details (spines, plates, number of teeth, e.t.c)
	this.angles = angles;
	this.idleTime = idleTime;
	this.animationSpeed = animationSpeed;
	this.jumpSpeed = jumpSpeed;
	this.features = features;
	this.sail = sail;
}

function generateSpineSection(skeleton, sectionName, array) { // generate a section of spine, used by generateSkeletalArray
	
	var parentMainBone = ''; // the joint at which the spine starts
	
	switch(sectionName) {
		case 'neck':
			parentNameBone = 'shoulder';
			break;
		default:
			parentNameBone = 'pelvis';
	}
	
	array.push(
		new Bone(sectionName + '1', parentNameBone, skeleton[sectionName].vertebraLength, 0, skeleton[sectionName].health)
	);
	
	for(var i = 1; i < skeleton[sectionName].vertebrae; i++) { // generate spine
		array.push(
			new Bone(
				sectionName + (i+1),
				sectionName + i,
				skeleton[sectionName].vertebraLength,
				0,
				skeleton[sectionName].health
			)
		);
	}
	
}

// generate a jaw, used by generateSkeletalArray
function addJawSection(skeleton, sectionName, array) {
	array.push( 
		new Bone(
			'jaw' + sectionName,
			'neck' + skeleton.neck.vertebrae,
			skeleton.jawLength,
			0
		)
	);
}

// generate a limb, used by generateSkeletalArray
function generateLimb(skeleton, limbName, array) {
	
	var limbType = limbName.substring(0,3);
	
	if(limbType == 'leg'){ // if a leg
		var parentJointName = 'pelvis'; // connect to pelvis
	}else{ // if an arm
		var parentJointName = 'shoulder'; // connect to shoulder
	}
	
	array.push(
		new Bone(limbName + 'upper', parentJointName, skeleton[limbType].upperLength, DEG * 60, skeleton[limbType].health)
	);
	
	array.push(
		new Bone(limbName + 'lower', limbName + 'upper', skeleton[limbType].lowerLength, TAU / 4, skeleton[limbType].health)
	);
	
	array.push(
		new Bone(limbName + 'joint', limbName + 'lower', skeleton[limbType].jointLength, TAU / 4, skeleton[limbType].health)
	);
	
	for(var i = 1; i <= skeleton[limbType].digitAmount; i++){
		array.push(
			new Bone(limbName + 'digit' + i, limbName + 'joint', skeleton[limbType].digitLengths[i - 1], DEG * 10 * i, skeleton[limbType].health)
		);
	}

}

function generateLimbPair(skeleton, limbName, array) {
	generateLimb(skeleton, limbName + 'left', array);
	generateLimb(skeleton, limbName + 'right', array);
}

function generateSkeletalArray(skeleton) { // generate an array of bones to form the skeleton described
	var array = [new Bone('pelvis', '', 0, 0)]; // start from the pelvis
	
	// make back
	generateSpineSection(skeleton, 'back', array);
	
	// add shoulder, connected to back (n)
	array.push( 
		new Bone(
			'shoulder',
			'back' + skeleton.back.vertebrae,
			0.001,
			0)
	);
	
	// make neck
	generateSpineSection(skeleton, 'neck', array);
	
	// add jaw, connected to neck (n)
	addJawSection(skeleton, 'top', array);
	addJawSection(skeleton, 'bottom', array);
	
	// make tail
	generateSpineSection(skeleton, 'tail', array);
	
	generateLimbPair(skeleton, 'leg', array);
	generateLimbPair(skeleton, 'arm', array);
	
	return(array);
}

//*************FUNCTIONS FOR USE WITHIN Dinosaur.animate****************

function spineAnglesSetUp(dinosaur, spineName) {
	for( var i = 1; i <= dinosaur.skeleton[spineName].vertebrae; i++ ){ // tail
		
		var boneName = spineName + i;
		var boneIndex = dinosaur.indexOfBones[boneName];
		
		dinosaur.skeletalArray[boneIndex].angle = dinosaur.details.angles.main[spineName].main; // main angle
		
		dinosaur.skeletalArray[boneIndex].angle += getVertebraAngle(
			dinosaur.details.angles.main[spineName].curve,
			dinosaur.skeleton[spineName].vertebrae,
			i
		); // curvature
		
		if(dinosaur.isAlive){
			dinosaur.skeletalArray[boneIndex].angle += getIdleAngle(dinosaur.details.angles.idling[spineName].main, dinosaur.details.idleTime); // idling angle
			
			var overallAngle = getIdleAngle(dinosaur.details.angles.idling[spineName].curve, dinosaur.details.idleTime);
			
			dinosaur.skeletalArray[boneIndex].angle += getVertebraAngle(
				overallAngle,
				dinosaur.skeleton[spineName].vertebrae,
				i
			); // idling curvature
		}
		
	}
}

function limbAnglesSetUp(dinosaur) {
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
					for(var i = 1; i <= dinosaur.skeleton[limbType].digitAmount; i++) {
						var boneName = limbType + limbSide + limbSection + i;
						var boneIndex = dinosaur.indexOfBones[boneName];
						var digitLift = dinosaur.details.angles.main[limbType].digitGap  *  (i-1);
						var idlingDigitLift = dinosaur.details.angles.idling[limbType].digitGap  *  (i-1);
	
						dinosaur.skeletalArray[boneIndex].angle = dinosaur.details.angles.main[limbType][limbSection] + digitLift;
						
						if(dinosaur.isAlive){
							dinosaur.skeletalArray[boneIndex].angle += getIdleAngle(
								dinosaur.details.angles.idling[limbType][limbSection] + idlingDigitLift,
								dinosaur.details.idleTime
							); // idling
						}
					}
				}else{
					var boneName = limbType + limbSide + limbSection;
					var boneIndex = dinosaur.indexOfBones[boneName];

					dinosaur.skeletalArray[boneIndex].angle = dinosaur.details.angles.main[limbType][limbSection];
					
					if(dinosaur.isAlive) {
						dinosaur.skeletalArray[boneIndex].angle += getIdleAngle(
							dinosaur.details.angles.idling[limbType][limbSection],
							dinosaur.details.idleTime
						); // idling
					}
					
				}
				
			}
		}
	}
}

function jawAnglesSetUp(dinosaur) {
	var boneName = 'jawtop';
	var boneIndex = dinosaur.indexOfBones[boneName];

	dinosaur.skeletalArray[boneIndex].angle = dinosaur.details.angles.main.jaw.top;
	if(dinosaur.isAlive){
		dinosaur.skeletalArray[boneIndex].angle += getIdleAngle( dinosaur.details.angles.idling.jaw.top, dinosaur.details.idleTime);
	}
	
	boneName = 'jawbottom';
	boneIndex = dinosaur.indexOfBones[boneName];

	dinosaur.skeletalArray[boneIndex].angle = dinosaur.details.angles.main.jaw.bottom;
	
	if(dinosaur.isAlive) {
		dinosaur.skeletalArray[boneIndex].angle += getIdleAngle( dinosaur.details.angles.idling.jaw.bottom, dinosaur.details.idleTime);
	}
}

function addSpineToKeyFrame(dinosaur, keyFrame, spineName) {
	for(var i = 1; i <= dinosaur.skeleton[spineName].vertebrae; i++) {
		
		var main = dinosaur.details.angles.animation[spineName].main;
		
		var curve = getVertebraAngle(
			dinosaur.details.angles.animation[spineName].curve,
			dinosaur.skeleton[spineName].vertebrae,
			i
		); //curvature
		
		//~ console.log(main + '   ' + curve);
		
		keyFrame[ spineName + i ] = main + curve;
	}
}

//********************FUNCTIONS FOR DAMAGE******************************

function DamagePoint(position, damage) {
	this.position = position;
	this.damage = damage;
}

var damageRange = 1; // 1000 cm

//****************************DINOSAUR**********************************

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
	
	for(var i = 0; i < digitNameArray.length; i++){ // loop through digits and set up lastFrameDigitArray
		var j = digitNameArray[i]; // name of bone
		var sk = this.indexOfBones[ j ]; // numeric index of bone
		var pos = this.skeletalArray[ sk ].position; // position of bone
		
		this.lastFrameDigitPositions[ j ] = new Position(0, 0);
	}
	
	this.velocity = new Position(0, 0); // velocity of motion in m/s
	this.lastFramePosition = new Position(this.position.x, this.position.y);
	
	this.details = details;
	
	this.damagePoints = [];
	
	//**************************ANIMATION VALUES************************
	
	this.flipped = false;
	this.lastFlipTime = 0;
	this.flipDelay = 1000; // so it can only flip once per second
	this.isAlive = true;
	
	this.keyFrames = new KeyFramesObject({}, {}, 0, 1000 / this.details.animationSpeed);
	
	// three muscles relaxed on each step
	this.walking = new WalkAnimation( [
		{
			'legrightupper' : 0,
			'legrightlower' : this.details.angles.animation.leg.lower,
			'legleftupper' : this.details.angles.animation.leg.upper,
			'legleftlower' : this.details.angles.animation.leg.lower,
			
			'armrightupper' : 0,
			'armrightlower' : this.details.angles.animation.arm.lower,
			'armleftupper' : this.details.angles.animation.arm.upper,
			'armleftlower' : this.details.angles.animation.arm.lower,
		},
		{
			'legrightupper' : this.details.angles.animation.leg.upper,
			'legrightlower' : this.details.angles.animation.leg.lower,
			'legleftupper' : this.details.angles.animation.leg.upper,
			'legleftlower' : 0,
			
			'armrightupper' : this.details.angles.animation.arm.upper,
			'armrightlower' : this.details.angles.animation.arm.lower,
			'armleftupper' : this.details.angles.animation.arm.upper,
			'armleftlower' : 0,
		},
		{
			'legrightupper' : this.details.angles.animation.leg.upper,
			'legrightlower' : this.details.angles.animation.leg.lower,
			'legleftupper' : 0,
			'legleftlower' : this.details.angles.animation.leg.lower,
			
			'armrightupper' : this.details.angles.animation.arm.upper,
			'armrightlower' : this.details.angles.animation.arm.lower,
			'armleftupper' : 0,
			'armleftlower' : this.details.angles.animation.arm.lower,
		},
		{
			'legrightupper' : this.details.angles.animation.leg.upper,
			'legrightlower' : 0,
			'legleftupper' : this.details.angles.animation.leg.upper,
			'legleftlower' : this.details.angles.animation.leg.lower,
			
			'armrightupper' : this.details.angles.animation.arm.upper,
			'armrightlower' : 0,
			'armleftupper' : this.details.angles.animation.arm.upper,
			'armleftlower' : this.details.angles.animation.arm.lower,
		},
		
	] );
	
	this.standing = {
		'legrightupper' : 0,
		'legrightlower' : this.details.angles.animation.leg.lower * 0.7,
		'legleftupper' : 0,
		'legleftlower' : this.details.angles.animation.leg.lower * 0.7,
		
		'armrightupper' : 0,
		'armrightlower' : this.details.angles.animation.arm.lower * 0.7,
		'armleftupper' : 0,
		'armleftlower' : this.details.angles.animation.arm.lower * 0.7,
		
		'jawtop' : 0,
		'jawbottom' : 0,
	};
	
	this.crouching = {
		'legrightupper' : 0,
		'legrightlower' : 0,
		'legleftupper' : 0,
		'legleftlower' : 0,
	};
	
	this.death = {
		'legrightupper' : 0 - this.details.angles.main.leg.upper,
		'legrightlower' : PI - this.details.angles.main.leg.lower,
		'legrightjoint' : 0 - this.details.angles.main.leg.joint,
		'legleftupper' : 0 - this.details.angles.main.leg.upper,
		'legleftlower' : PI - this.details.angles.main.leg.lower,
		'legleftjoint' : 0 - this.details.angles.main.leg.joint,
		
		'armrightupper' : 0 - this.details.angles.main.arm.upper,
		'armrightlower' : 0 - this.details.angles.main.arm.lower,
		'armrightjoint' : 0 - this.details.angles.main.arm.joint,
		'armleftupper' : 0 - this.details.angles.main.arm.upper,
		'armleftlower' : 0 - this.details.angles.main.arm.lower,
		'armleftjoint' : 0 - this.details.angles.main.arm.joint,
	}
	
	this.roar = {
		'legrightupper' : 0,
		'legrightlower' : this.details.angles.animation.leg.lower * 0.5,
		'legleftupper' : 0,
		'legleftlower' : this.details.angles.animation.leg.lower * 0.5,
		
		'armrightupper' : 0,
		'armrightlower' : this.details.angles.animation.arm.lower * 0.5,
		'armleftupper' : 0,
		'armleftlower' : this.details.angles.animation.arm.lower * 0.5,
		
		
		'jawtop' : this.details.angles.animation.jaw.top,
		'jawbottom' : this.details.angles.animation.jaw.bottom,
	}
	
	addSpineToKeyFrame(this, this.roar, 'neck');
	addSpineToKeyFrame(this, this.roar, 'back');
	
	//~ console.log(this.roar.neck3);
	
	this.canJump = false; // variable for jumping
	
	this.isTouchingGround = function() { // so it can only jump when on the ground
		
		var touching = false;
		
		for(var i = 0; i < digitNameArray.length; i++){ // loop through digits to walk backward or forward
			var j = digitNameArray[i]; // name of bone
			var sk = this.indexOfBones[ j ]; // numeric index of bone
			var pos = this.skeletalArray[ sk ].position; // position of bone
			
			if( Math.round(pos.y) >= groundY ) { // if the digit is underground
				touching = true;
			}
		}
		
		return(touching);
	}
	
	//********************************LOOPS*****************************
	
	this.draw = function() { // set up positions and draw onto canvas
		
		for(var i = 1; i < this.skeletalArray.length; i++) { // set the position of each bone relative to its parent
			var parentName = this.skeletalArray[i].parentName; // name of bone
			var parentIndex = this.indexOfBones[ parentName ]; // numeric index of bone
			var parentPosition = this.skeletalArray[ parentIndex ].position; // position of bone
			
			this.skeletalArray[i].setPositionFromParent(parentPosition);
		}
		
		for(var i = 1; i < this.skeletalArray.length; i++) { // draw a line for each bone
			
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
			
		}
		
		for(var i = 1; i < this.skeletalArray.length; i++) { // draw a circle for each joint
			
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
			
			ctx.fillStyle = 'black';
			
			ctx.fillText(
				this.skeletalArray[i].health,
				this.skeletalArray[i].position.x,
				this.skeletalArray[i].position.y
			);
			
		}
		
		this.damagePoints = [];
		
		for(var i = 0; i < this.details.features.length; i++) { // draw all of the features
			this.details.features[i].draw(this);
		}
		
		for(var i = 0; i < this.damagePoints.length; i++) { // draw a circle for all of the damage points
			
			ctx.beginPath(); // begin path
			
			ctx.fillStyle = colours.features;
			
			ctx.arc(
				this.damagePoints[i].position.x,
				this.damagePoints[i].position.y,
				gameDimensions.jointBallRadius,
				0,
				Math.PI*2,
				false
			);
			
			ctx.fill();
			
			ctx.beginPath();
			
			ctx.fillStyle = 'black';
			
			ctx.fillText(
				this.damagePoints[i].damage,
				this.damagePoints[i].position.x,
				this.damagePoints[i].position.y,
			);
			
		}
		
		this.details.sail.draw(this);
	}
	
	this.animate = function() { // set up angles
		
		//**********************SETUP MAIN ANGLES***********************
		
		spineAnglesSetUp(this, 'back');
		spineAnglesSetUp(this, 'tail');
		spineAnglesSetUp(this, 'neck');
		
		limbAnglesSetUp(this);
		
		jawAnglesSetUp(this);
		
		//*****************SETUP ANIMATION ANGLES***********************
		
		for(var i in this.keyFrames.next) {
			var boneIndex = this.indexOfBones[i]; // get index for bone
			this.skeletalArray[boneIndex].angle += this.keyFrames.getSmoothAngle(i);
		}
		
		if(this.keyFrames.isFinished()) { // when the last keyframe has finished in motion
			if(!this.isAlive){ //************DEAD DINOSAUR**************
				this.keyFrames.addNewFrame(this.death);
			}else if(keyCodes[39]){ //***********************************RIGHT
				//~ console.log('animation');
				this.keyFrames.addNewFrame(this.walking.steps[this.walking.currentStep]);
				
				if(this.flipped){
					this.walking.previousStep();
				}else{
					this.walking.nextStep();
				}
				
				this.canJump = false; // cannot jump after walking
				
			}else if(keyCodes[37]){ //******************************LEFT
				
				this.keyFrames.addNewFrame(this.walking.steps[this.walking.currentStep]);
				
				if(this.flipped){
					this.walking.nextStep();
				}else{
					this.walking.previousStep();
				}
				
				this.canJump = false; // cannot jump after walking
				
			}else if(keyCodes[40]){ //******************************DOWN
				
				this.keyFrames.addNewFrame(this.crouching);
				
				this.canJump = true; // can jump after crouching
				
			}else if(keyCodes[38]){ //*****************************SPACE
				
				this.keyFrames.addNewFrame(this.roar);
				
			}else if(keyCodes[32]){ //*****************************SPACE
				
				if(gameTimer > this.lastFlipTime + this.flipDelay) { // so it can only flip once per second
					this.flipped = ! this.flipped;
					this.lastFlipTime = gameTimer;
				}
				
				this.keyFrames.addNewFrame(this.standing); // so it doesn't wiggle whe flipping
				
			}else{
				
				if(this.canJump) {
					this.canJump = false; // don't jump twice and fly off the screen
					if(this.isTouchingGround()) {
						
						//~ console.log('asdg');
						
						this.position.y -= 5; // move up, otherwise the physics loop will set the velocity to 0
						
						if(this.flipped){
							this.velocity.x -= this.details.jumpSpeed.x;
						}else{
							this.velocity.x += this.details.jumpSpeed.x;
						}
						
						this.velocity.y += this.details.jumpSpeed.y;
						
						// obviously divide by how short each frame is, because the velocity is in m/s
					}
				}
				
				this.keyFrames.addNewFrame(this.standing);
				
				//~ this.keyFrames.period = 1000 / this.details.animationSpeed; // normal animation speed
			}
		}
		
		if(this.flipped) {
			for(var i in this.skeletalArray) {
				this.skeletalArray[i].angle = DEG * 180 - this.skeletalArray[i].angle;
			}
		}
	}
	
	this.physics = function() { // gravity and motion
		
		this.position.x += this.velocity.x * gameDimensions.pixelsPerMetre / gameFPS;
		this.position.y += this.velocity.y * gameDimensions.pixelsPerMetre / gameFPS; // motion
		
		//~ console.log(this.velocity.y);
		
		this.lastFramePosition.x = this.position.x;
		this.lastFramePosition.y = this.position.y; // store the current position
		
		if(
			this.skeletalArray[   this.indexOfBones[ 'legleftjoint' ]   ].position.y < groundY &&
			this.skeletalArray[   this.indexOfBones[ 'legrightjoint' ]   ].position.y < groundY &&
			this.skeletalArray[   this.indexOfBones[ 'armleftjoint' ]   ].position.y < groundY &&
			this.skeletalArray[   this.indexOfBones[ 'armrightjoint' ]   ].position.y < groundY
		)    { // gravity
			this.velocity.y += 9.8 / gameFPS;
		} else {
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
	}
	
	this.footGripLoop = function() { // checks if digits underground have moved
		
		if(this.lastFrameDigitPositions.y == 0 && this.lastFrameDigitPositions.x == 0) { // stop it from moving on first frame
			return;
		}
		
		for(var i = 0; i < digitNameArray.length; i++){ // loop through digits to walk backward or forward
			var j = digitNameArray[i]; // name of bone
			var sk = this.indexOfBones[ j ]; // numeric index of bone
			var pos = this.skeletalArray[ sk ].position; // position of bone
			
			if( Math.round(pos.y) >= groundY ) { // if the digit is underground
				
				this.position.x += this.lastFrameDigitPositions[ j ].x - pos.x ; // move the dinosaur to compensate
				
				pos.x += this.lastFrameDigitPositions[ j ].x - pos.x; // move the digit itself to store the correct number later
				
				break; // if more than one digit is underground, this will make it shake disturbingly throughout the step. Breaking prevents this
			}else{
				
			}
		}
		
		for(var i = 0; i < digitNameArray.length; i++){ // loop through digits to stay above ground
			var j = digitNameArray[i]; // name of bone
			var sk = this.indexOfBones[ j ]; // numeric index of bone
			var pos = this.skeletalArray[ sk ].position; // position of bone
			
			if( Math.round(pos.y) > groundY) { // if the digit is underground
				
				this.position.y += groundY - pos.y; // move the dinosaur to compensate
				
			}
			
		}
		
		for(var i = 0; i < digitNameArray.length; i++){ // loop through digits to store this frame's digit positions
			var j = digitNameArray[i]; // name of bonebone
			var sk = this.indexOfBones[ j ]; // numeric index of bone
			var pos = this.skeletalArray[ sk ].position; // position of bone
			
			this.lastFrameDigitPositions[ j ].x = pos.x;
			this.lastFrameDigitPositions[ j ].y = pos.y; // copy the position without reusing the object
		}
	}
	
	this.damage = function(damagePoint) { // damage points from a specific point
		for(var i = 1; i < this.skeletalArray.length; i++) {
			if(! isNaN(this.skeletalArray[i].health)) { // if bone actually has a health value
				var distance = new Position(
					this.skeletalArray[i].position.x - damagePoint.position.x,
					this.skeletalArray[i].position.y - damagePoint.position.y
				);
				
				var range = distance.getRadius();
				
				if(range < damageRange * gameDimensions.pixelsPerMetre) {
					var damage = damagePoint.damage / gameFPS;
					
					this.skeletalArray[i].health -= damage;
					
					if(this.skeletalArray[i].health < 0) {
						this.isAlive = false;
					}
				}
			}
		}
	}
	
	this.loop = function() {
		this.animate(); // angles
		this.draw(); // positions
		this.footGripLoop(); // foot friction
		this.physics(); // move
		
		if(this.position.x > canvasSize.x) {
			this.position.x = 0;
		}
		
		if(this.position.x < 0) {
			this.position.x = canvasSize.x;
		}
	}
	
	this.loop();
}

var tyrannosaurus = new Dinosaur(
	new Position(1500, 600),
	new Skeleton(
		new SpineSection(7, 6, 10),
		new SpineSection(7, 3, 10),
		new SpineSection(7, 1.5, 10),
		new Limb(2,2,0.5,[0.5, 0.5, 0.5],3, 10),
		new Limb(0.4,0.4,0.1,[0.1, 0.1],2, 10),
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
				new JawAnglesObject(0, 0),
			),
			new AnglesObject(
				new SpineAnglesObject(DEG * 2, 0),
				new SpineAnglesObject(0, DEG * 4),
				new SpineAnglesObject(0, DEG * 1),
				new LimbAnglesObject(DEG * 2, DEG * 2, 0, 0, 0),
				new LimbAnglesObject(DEG * 2, DEG * 2, 0, 0, 0),
				new JawAnglesObject(0, 0),
			),
			new AnglesObject(
				new SpineAnglesObject(0, 0),
				new SpineAnglesObject(0, 0),
				new SpineAnglesObject(0,  DEG * 30),
				new LimbAnglesObject(DEG * 50, DEG * -67, DEG * 75, 0, 0),
				new LimbAnglesObject(0, 0, 0, 0, 0),
				new JawAnglesObject(DEG * -5, DEG * 25),
			)
		),
		5500,
		4,
		new Position(0, 0),
		[],
		new Sail([])
	)
);

//*
var deinonychus = new Dinosaur(
	new Position(500, 700),
	new Skeleton(
		new SpineSection(7, 2, 1),
		new SpineSection(7, 0.75, 1),
		new SpineSection(7, 0.22, 1),
		new Limb(0.5,0.4,0.15,[0.1, 0.1, 0.2],3, 1),
		new Limb(0.25,0.25,0.1,[0.2, 0.1, 0.1],3, 1),
		0.5
	),
	new DetailsObject(
		new AllAnglesObject(
			new AnglesObject(
				new SpineAnglesObject(PI, 0),
				new SpineAnglesObject(DEG * -20, 0),
				new SpineAnglesObject(0, - DEG * 15),
				new LimbAnglesObject(DEG * 50, DEG * 170, DEG * 75, 0, DEG * -20),
				new LimbAnglesObject(DEG * 80, DEG * 65, DEG * 65, DEG * 10, DEG * 15),
				new JawAnglesObject(0, 0),
			),
			new AnglesObject(
				new SpineAnglesObject(DEG * 2, 0),
				new SpineAnglesObject(0, DEG * 4),
				new SpineAnglesObject(0, DEG * 1),
				new LimbAnglesObject(DEG * 2, DEG * 2, 0, 0, 0),
				new LimbAnglesObject(DEG * 2, DEG * 2, 0, 0, 0),
				new JawAnglesObject(0, 0),
			),
			new AnglesObject(
				new SpineAnglesObject(PI, 0),
				new SpineAnglesObject(0, 0),
				new SpineAnglesObject(0, - DEG * 15),
				new LimbAnglesObject(DEG * 50, DEG * -67, DEG * 75, 0, 0),
				new LimbAnglesObject(0, 0, 0, 0, 0),
				new JawAnglesObject(DEG * -5, DEG * 25),
			)
		),
		5500,
		15,
		new Position(3, -6),
		[],
		new Sail([])
	)
);

//*/

var argentinosaurus = new Dinosaur(
	new Position(200, 500),
	new Skeleton(
		new SpineSection(7, 15, 1),
		new SpineSection(7, 7, 1),
		new SpineSection(7, 13, 1),
		new Limb(2.5,2.5,1,[0.1, 0.1, 0.1, 0.1],4, 1),
		new Limb(2,2,1,[0.1, 0.1, 0.1, 0.1],4, 1),
		0.8
	),
	new DetailsObject(
		new AllAnglesObject(
			new AnglesObject(
				new SpineAnglesObject(DEG * 180, DEG * -15),
				new SpineAnglesObject(DEG * 8.5, 0),
				new SpineAnglesObject(DEG * 0, - DEG * 30),
				new LimbAnglesObject(DEG * 70, DEG * 120, DEG * 75, 0, DEG * -10),
				new LimbAnglesObject(DEG * 110, DEG * 90, DEG * 75, 0, DEG * -10),
				new JawAnglesObject(0, 0),
			),
			new AnglesObject(
				new SpineAnglesObject(DEG * 2, DEG * 10),
				new SpineAnglesObject(0, 0),
				new SpineAnglesObject(0, DEG * 1),
				new LimbAnglesObject(DEG * 2, DEG * 2, 0, 0, 0),
				new LimbAnglesObject(DEG * 2, DEG * 2, 0, 0, 0),
				new JawAnglesObject(0, 0),
			),
			new AnglesObject(
				new SpineAnglesObject(0, 0),
				new SpineAnglesObject(DEG * - 15, DEG * - 15),
				new SpineAnglesObject(0, - DEG * 15),
				new LimbAnglesObject(DEG * 20, DEG * -30, DEG * 75, 0, 0),
				new LimbAnglesObject(DEG * -10, DEG * -40, DEG * 0, 0, 0),
				new JawAnglesObject(DEG * -5, DEG * 25),
			)
		),
		6500,
		3,
		new Position(0, 0),
		[new Feature(new Spike(0, 6, 0.5, DEG * 250, 1), 'neck6', '#512222')],
		new Sail([])
	)
);

var dinosaurs = [
	tyrannosaurus,
	deinonychus,
	argentinosaurus
];

//*****************************MAIN LOOP********************************

function draw() {
	ctx.fillStyle = colours.background;
	ctx.fillRect(0,0,canvasSize.x,canvasSize.y); // fill a background
	
	ctx.fillStyle = colours.floor;
	ctx.fillRect(0, groundY, canvasSize.x, gameDimensions.groundHeight); // the floor
	
	for(var i = 0; i < dinosaurs.length; i++) {
		dinosaurs[i].loop();
		
		for(var j = 0; j < dinosaurs.length; j++) { // go through dinosaurs again
			if(i != j) { // if it isn't itself
				for(var k = 0; k < dinosaurs[i].damagePoints.length; k++) {
					var damagePoint = dinosaurs[i].damagePoints[k];
					
					dinosaurs[j].damage(damagePoint);
				}
			}
		}
	}
	
	gameTimer += frameDelay;
	setTimeout(draw, frameDelay);
}

draw();

}
