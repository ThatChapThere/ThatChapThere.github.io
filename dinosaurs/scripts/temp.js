		var parentIndex = dinosaur.indexOfBones[ parentName ]; // numeric index of bone
		var parentPosition = dinosaur.skeletalArray[ parentIndex ].position; // position of bone
		var parentAngle = dinosaur.skeletalArray[ parentIndex ].angle;
		
		parentAngle += PI; // back toward parent of parent
		
		var vector = getNormalVector(parentAngle);
		
		
		
		if(dinosaur.flipped) {  // when the entire body is flipped, rotate in the opposite direction
			var centreSpine = getNormalVector(parentAngle - PI / 2); // this.angle relative to parentangle
		}else{
			var centreSpine = getNormalVector(parentAngle + PI / 2); // this.angle relative to parentangle
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
