let prepareForNewMove = () =>
{
	let moves = getLegalMoves(currentPosition);
	moveButtonsDiv.innerHTML = '';
	for(m in moves)
	{
		let button = document.createElement('button');
		button.textContent = moves[m].notation;
		button.onclick = function()
		{
			for(m in moves)
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
	setInterval(playRandomMove, 0);
}
