let prepareForNewMove = () =>
{
	let moves = getLegalMoves(currentPosition);
	moveButtonsDiv.innerHTML = '';
	for(const m in moves)
	{
		let button = document.createElement('button');
		button.textContent = moves[m].notation;
		button.onclick = function()
		{
			for(const m in moves)
			{
				let move = moves[m];
				if(move.notation == this.textContent)
				{
					executeMove(move);
					prepareForNewMove();
				}
			}
		}
		moveButtonsDiv.appendChild(button);
	}
}

let simplifyNotation = (notation) =>
{
	notation = notation.toLowerCase();
	notation = notation.replace('x', '');
	notation = notation.replace('o-o-o', 'oq'); // This line must go before the next one!!
	notation = notation.replace('o-o', 'ok');
	const numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
	
	for(let n = 1; n <= 8; n++) {
		notation = notation.replace((n).toString(), numbers[n-1]);
	}
	return notation;
}


let getMovesFromSquare = (r, f) =>
{
	let moves = getLegalMoves(currentPosition);
	let movesFromSquare = [];
	for(m in moves)
	{
		if(
			moves[m].newPosition.boardState[r][f] == 0 &&
			currentPosition     .boardState[r][f] != 0
		){
			movesFromSquare.push(moves[m]);
		}
	}
	return movesFromSquare;
}

function canvasClick(event)
{
	let offset = this.getBoundingClientRect();
	let xOffset = offset.left;
	let yOffset = offset.top;
	let xClick = event.clientX - xOffset;
	let yClick = event.clientY - yOffset;
	let xSelectedOld = xSelected;
	let ySelectedOld = ySelected;
	xSelected = Math.floor(xClick / squareSize);
	ySelected = Math.floor(yClick / squareSize);
	let movesFromSquare = getMovesFromSquare(ySelected, xSelected);
	for(l in legalSquares)
	{
		let legalSquare = legalSquares[l];
		let r = legalSquare[0];
		let f = legalSquare[1];
		if(xSelected == f && ySelected == r)
		{
			let moves = getLegalMoves(currentPosition);
			for(m in moves)
			{
				let move = moves[m];
				if(
					move.newPosition.boardState[r][f] != currentPosition.boardState[r][f] &&
					move.newPosition.boardState[r][f] == currentPosition.boardState[ySelectedOld][xSelectedOld] &&
					move.newPosition.boardState[ySelectedOld][xSelectedOld] == 0
				){
					legalSquares = [];
					xSelected = NaN;
					ySelected = NaN;
					currentPosition = JSON.parse(JSON.stringify(move.newPosition));
					prepareForNewMove();
					return;
				}
			}
		}
	}
	legalSquares = [];
	for(m in movesFromSquare)
	{
		let move = movesFromSquare[m];

		for(let r = 0; r < 8; r++)
		for(let f = 0; f < 8; f++)
		{
			if(
				move.newPosition.boardState[r][f] != 0 &&
				move.newPosition.boardState[r][f] != currentPosition.boardState[r][f] &&
				move.newPosition.boardState[r][f] == currentPosition.boardState[ySelected][xSelected]
			){
				legalSquares.push([r, f]);
			}
		}
	}
}

let moveCount = 9;

let playRandomMove = () =>
{
	let moves = getLegalMoves(currentPosition);
	let moveNumber = moveCount % moves.length;
	if(!moves.length) return;
	executeMove(moves[moveNumber]);
	prepareForNewMove();
	moveCount++;
}

window.onload = () =>
{
	moveButtonsDiv = document.getElementById('move-buttons-div');
	boardCanvas = document.getElementById('board-canvas');
	boardCanvas.width = boardSize;
	boardCanvas.height = boardSize;
	moveButtonsDiv.style.height = boardSize + 'px';
	boardCanvas.onclick = canvasClick;
	ctx = boardCanvas.getContext('2d');
	prepareForNewMove();
	setInterval(draw, 0);
	//setInterval(playRandomMove, 0);
	const moveInput = document.getElementById('move-input');
	const moveList = document.getElementById('move-list');
	moveInput.onkeyup = function(e) {
		if(moveInput.value == '' && e.key == 'Escape') {
			if(positionList.length == 0) return;
			currentPosition = positionList.pop();
			return;
		}
		let moves = getLegalMoves(currentPosition);
		let selectedMoves = [];
		for(m in moves) {
			let move = moves[m];
			if(simplifyNotation(move.notation).startsWith(moveInput.value)) {
				selectedMoves.push(move);
			}
		}
		moveList.textContent = '';
		if(selectedMoves.length == 1) {
			console.log(simplifyNotation(selectedMoves[0].notation));
			executeMove(selectedMoves[0]);
			moveInput.value = '';
		}else{
			for(const m in selectedMoves){
				let move = selectedMoves[m];
				moveList.textContent += move.notation + '  ';
			}
		}
	}
}