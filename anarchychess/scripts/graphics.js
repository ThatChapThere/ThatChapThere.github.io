let boardCanvas, ctx;
let xSelected, ySelected;
let legalSquares = [];
const boardSize = 800;
const squareSize = boardSize / 8;
const squareColours = {
	'light': '#ffcf9f',
	'dark':  '#d18b47',
	'selected':  '#80804080',
	'legal': '#00200080'
}

const pieceImageUrls = {
	'white': {
		'pawn':   'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
		'rook':   'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
		'knight': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
		'bishop': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
		'queen':  'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
		'king':   'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
		'knook':  'https://upload.wikimedia.org/wikipedia/commons/d/d9/Chess_clt45.svg',
		'canadian queen':  'images/pieces/white-canadian-queen.svg'
	},
	'black': {
		'pawn':   'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
		'rook':   'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
		'knight': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
		'bishop': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
		'queen':  'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
		'king':   'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
		'knook':  'https://upload.wikimedia.org/wikipedia/commons/b/b0/Chess_cdt45.svg',
		'canadian queen':  'images/pieces/black-canadian-queen3.svg'
	}
}

let pieceImages = {}
let pieceImagesLoaded = 0;

for(colour in pieceImageUrls)
for(piece in pieceImageUrls[colour])
{
	if(!pieceImages[colour]) pieceImages[colour] = {};
	pieceImages[colour][piece] = new Image();
	pieceImages[colour][piece].src = pieceImageUrls[colour][piece];
	pieceImages[colour][piece].onload = () => pieceImagesLoaded++;
}

const draw = () => {
	for(let i = 0; i < 8; i++) // board
	for(let j = 0; j < 8; j++)
	{
		// for a8, i + j = 0 + 0 => light
		ctx.fillStyle = squareColours[(i + j) % 2 ? 'dark' : 'light'];
		ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
	}
	if(!isNaN(xSelected) && !isNaN(ySelected) && legalSquares.length) // selected square
	{
		ctx.fillStyle = squareColours['selected'];
		ctx.fillRect(xSelected * squareSize, ySelected * squareSize, squareSize, squareSize);
	}
	for(s in legalSquares)
	{
		let square = legalSquares[s];
		ctx.fillStyle = squareColours['legal'];
		if(currentPosition.boardState[square[0]][square[1]] == 0)
		{
			ctx.fillRect(
				square[1] * squareSize + squareSize * 3/8,
				square[0] * squareSize + squareSize * 3/8,
				squareSize / 4,
				squareSize / 4
			);
		}
		else
		{
			ctx.fillRect(
				square[1] * squareSize,
				square[0] * squareSize,
				squareSize,
				squareSize,
			);
		}
	}
	for(let i = 0; i < 8; i++) // pieces
	for(let j = 0; j < 8; j++)
	{
		// First index determines rank, which is the y coordinate
		let currentPiece = currentPosition.boardState[j][i];
		if(currentPiece)
		{
			let currentPieceColour = currentPiece == Math.abs(currentPiece) ? 'white' : 'black';
			let currentPieceType = pieces[Math.abs(currentPiece) - 1];
			let currentPieceImage = pieceImages[currentPieceColour][currentPieceType];
			ctx.drawImage(currentPieceImage, i * squareSize, j * squareSize, squareSize, squareSize);
		}
	}
}
