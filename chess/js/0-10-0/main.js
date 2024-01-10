const notationBody = document.getElementById('tbody_notation');

//*********************COORDINATE <-> INDEX CONVERSION******************

const Cartesian = (x, y) => ({x, y});
const getIndexFromCartesian = (x, y) => (y * 8) + x;
const getCartesianFromIndex = (i) => Cartesian(i % 8, Math.floor(i / 8));

//*********KNPS GLOBAL BECAUSE I'M TOO LAZY TO DO THIS PROPERLY*********

let node_counter = 0;

//**********************MOVE TABLE GENERATION***************************

// this object is instantiated for every combination of piece and start square
const EndSquare = (square, blockingSquares) => ({square, blockingSquares});

// this function stores all of the moves from a given square
const PossibleMoves = () => ({
	rook : [],
	queen : [],
	king : [],
	bishop : [],
	knight : [],
	whitePawn : [],
	whitePawnCapture : [],
	blackPawn : [],
	blackPawnCapture : []
});

// the object that stores all of the posssible moves
let possibleMoves = [];

// add an object for every square
for(let i = 0; i < 64; i++) possibleMoves.push(PossibleMoves());

const castlingKingMoves = [
	[4, 2],
	[4, 6],
	[60, 58],
	[60, 62]
];

const castlingRookMoves = [
	[0, 3],
	[7, 5],
	[56, 59],
	[63, 61]
];

const castlingBlockingSquares = [
	[1, 2, 3],
	[5, 6],
	[57, 58, 59],
	[61, 62]
];

const castlingCheckBlockingSquares = [
	[2, 3, 4],
	[4, 5, 6],
	[58, 59, 60],
	[60, 61, 62]
];

// loop through all possible moves
for(let x1 = 0; x1 < 8; x1++)
for(let y1 = 0; y1 < 8; y1++)
for(let x2 = 0; x2 < 8; x2++)
for(let y2 = 0; y2 < 8; y2++)
{
	let thisSquare = possibleMoves[getIndexFromCartesian(x1, y1)];
	let thisMove = EndSquare(getIndexFromCartesian(x2, y2), []);

	// make sure the start and end square are not the same
	if(x1 == x2 && y1 == y2) continue;

	// if it is a orthagonal move
	if(x1 - x2 == 0 || y1 - y2 == 0)
	{
		// if it is over a file
		if(x1 - x2 == 0)
		{
			let delta = y2 - y1;
			let direction = delta / Math.abs(delta);
			for(
				let i = y1 + direction;
				i != y2;
				i += direction
			){
				let blockingSquare = getIndexFromCartesian(x1, i);
				thisMove.blockingSquares.push(blockingSquare);
			}
		}
		// if it is over a rank
		else
		{
			let delta = x2 - x1;
			let direction = delta / Math.abs(delta);
			for(
				let i = x1 + direction;
				i != x2;
				i += direction
			){
				let blockingSquare = getIndexFromCartesian(i, y1);
				thisMove.blockingSquares.push(blockingSquare);
			}
		}
		thisSquare.rook.push(thisMove);
		thisSquare.queen.push(thisMove);
	}

	// if it is a bishop move
	if(Math.abs(x1 - x2) == Math.abs(y1 - y2))
	{
		let xDelta = x2 - x1;
		let xDirection = xDelta / Math.abs(xDelta);
		let yDelta = y2 - y1;
		let yDirection = yDelta / Math.abs(yDelta);

		for(let i = 1; i < Math.abs(xDelta); i ++)
		{
			let blockingSquare = getIndexFromCartesian(
				x1 + i*xDirection,
				y1 + i*yDirection
			);
			thisMove.blockingSquares.push(blockingSquare);
		}
		thisSquare.bishop.push(thisMove);
		thisSquare.queen.push(thisMove);
	}

	// if it is a king move
	if(Math.abs(x1 - x2) < 2 && Math.abs(y1 - y2) < 2)
		thisSquare.king.push(thisMove);

	// if it is a knight move
	if(
		(Math.abs(x1 - x2) + Math.abs(y1 - y2) == 3)
		&&
		(Math.abs(x1 - x2) * Math.abs(y1 - y2) == 2)
	) {
		thisSquare.knight.push(thisMove);
	}

	// if it is a  pawn move

	// if up a file
	if(x1 - x2 == 0)
	{
		// if two-square move
		// (direction is irrelevant since 9 and -1
		// ranks do not exist)
		// we don't have to worry about the intermediate squares since they
		// are set in the orthagonal move generation
		if(Math.abs(y1 - y2) == 2)
		{
			if(y1 == 1) thisSquare.blackPawn.push(thisMove);
			if(y1 == 6) thisSquare.whitePawn.push(thisMove);
		}
		// if a one-square move
		if(Math.abs(y1 - y2) == 1)
		{
			if(y1 > y2) thisSquare.whitePawn.push(thisMove);
			if(y1 < y2) thisSquare.blackPawn.push(thisMove);
		}
	}
	// if a one square diagonal move
	if(
		Math.abs(x1 - x2) == 1 &&
		Math.abs(y1 - y2) == 1
	) {
		if(y1 > y2) thisSquare.whitePawnCapture.push(thisMove);
		if(y1 < y2) thisSquare.blackPawnCapture.push(thisMove);
	}
}

//***************VARIABLES USED BY POSITION FUNCTIONS*******************

const pieceValues = {
	'p' : -100,
	'n' : -300,
	'b' : -320,
	'r' : -500,
	'q' : -900,
	'k' : -10000,
	'P' : 100,
	'N' : 300,
	'B' : 320,
	'R' : 500,
	'Q' : 900,
	'K' : 10000,
	' ' : 0
}

const centralSquares = [27, 28, 35, 36];

// the hyphens are for en passant in FEN
const fileLetters = 'abcdefgh----';

const promotionPieces = 'nbrq';

// these two must correspond, because the
const coloursToMove = {
	'WHITE' : 0,
	'BLACK' : 1,
	'END' : 2,
}

const pieceColours = {
	'WHITE' : 0,
	'BLACK' : 1,
	'EMPTY' : 3,
}

//***************FUNCTIONS USED BY POSITION FUNCTIONS*******************

function getColourOfPiece(piece)
{
	if(piece == ' ') return pieceColours.EMPTY;
	if(piece.toUpperCase() == piece) return pieceColours.WHITE;
	return pieceColours.BLACK;
}

// takes in the end square of an en passant capture and outputs the
// position of the pawn being captured
function getSquareToEmptyEnPassant(endSquare)
{
	if(endSquare < 32) return endSquare + 8;
	else return endSquare - 8;
}

// generates a new position string, without en passant or castling
function basicPositionStringMove(positionString, move)
{
	let piece = positionString[move[0]];

	// if promotion
	if(move[2]) piece = move[2];

	// empty  the old square
	let newPiecePositions =
		positionString.substring(0,move[0]) +
		' ' +
		positionString.substring(move[0] + 1, 64);

	// place down the piece
	newPiecePositions =
		newPiecePositions.substring(0,move[1]) +
		piece +
		newPiecePositions.substring(move[1] + 1, 64);

	return(newPiecePositions);
}

//**************************POSITION FUNCTIONS**************************

function addMoveToList(position, move, notation)
{
	//add it to the possible positions
	if(notation)
	{
		let notationForMove = getNotationForMove(position, move);
		position.subsequentPositionsNotation.push(notationForMove);
	}
	else
	{
		// normal code, for when not getting notation
		let positionFromMove = generateNewPositionFromMove(position, move);
		position.subsequentPositions.push(positionFromMove);
	}
}

let getColourToMove = (position) =>
	position.whiteToMove ?
		coloursToMove.WHITE:
		coloursToMove.BLACK;

// if the 'simple' argument is true, then we will remove the 50-move
// and move counters
function getFEN(position, simple) {
	let FEN = '';
	let fileCounter = 0;
	let emptySquaresRow = 0;

	// loop through all squares
	for(let i = 0; i < position.piecePositions.length; i++)
	{
		// if we are on the a file
		if(fileCounter > 0 && fileCounter % 8 == 0)
		{
			if(emptySquaresRow) FEN += emptySquaresRow;
			fileCounter = 0;
			emptySquaresRow = 0;
			FEN += '/';
		}
		if(position.piecePositions[i] == ' ')
		{
			emptySquaresRow++;
		}
		else
		{
			if(emptySquaresRow) FEN += emptySquaresRow;
			FEN += position.piecePositions[i];
			emptySquaresRow = 0;
		}
		fileCounter ++;
	}
	FEN += position.whiteToMove ? ' w ' : ' b ';
	FEN += position.whichCornersCanCastle[3] ? 'K' : '';
	FEN += position.whichCornersCanCastle[2] ? 'Q' : '';
	FEN += position.whichCornersCanCastle[1] ? 'k' : '';
	FEN += position.whichCornersCanCastle[0] ? 'q' : '';

	// add a hyphen if no castling move is possible
	if(!(
		position.whichCornersCanCastle[3] ||
		position.whichCornersCanCastle[2] ||
		position.whichCornersCanCastle[1] ||
		position.whichCornersCanCastle[0]
	)) FEN += '-';

	FEN += ' ';
	FEN += fileLetters[position.enPassantFile];

	if(!simple)
	{
		FEN += ' ';
		FEN += position.fiftyMoveCounter;
		FEN += ' ';
		FEN += position.moveNumber;
	}
	return(FEN);
}

function getNotationForMove(position, move)
{
	let notation = '';

	// get coordinates for squares
	let startSquareCoordinates = getCartesianFromIndex(move[0]);
	let endSquareCoordinates = getCartesianFromIndex(move[1]);
	let startSquarePiece = position.piecePositions[move[0]];
	let endSquarePiece = position.piecePositions[move[1]];

	// if castling
	if(
		startSquarePiece.toUpperCase() == 'K' &&
		Math.abs(startSquareCoordinates.x - endSquareCoordinates.x) == 2
	){
		if(startSquareCoordinates.x - endSquareCoordinates.x == 2)
		{
			notation += 'O-O-O';
		}
		if(startSquareCoordinates.x - endSquareCoordinates.x == -2)
		{
			notation += 'O-O';
		}
	}
	// if not castling
	else
	{
		// get notation for start square

		// if a pawn
		if(startSquarePiece.toUpperCase() == 'P')
		{
			// if a capture
			if(endSquareCoordinates.x != startSquareCoordinates.x)
			{
				// add the letter of the file
				notation += fileLetters[startSquareCoordinates.x];
				// and an 'x'
				notation += 'x';
			}
		}
		// if not a pawn
		else
		{
			// add the character for the piece
			notation += startSquarePiece.toUpperCase();

			// check for other pieces of the same colour and type
			// that can move to that square
			let identicalPieceCoordinates = [];

			for(let i = 0; i < 64; i++)
			{
				// obviously don't check the square it's already on
				if(i == move[0]) continue;

				// if it is the same piece type
				if(
					position.piecePositions[i] == startSquarePiece
				){
					// if it can be moved to the end square
					if(isMoveLegal(position, [i, move[1]]))
					{
						identicalPieceCoordinates.push(
							getCartesianFromIndex(i)
						);
					}
				}
			}
			// if there are other identical pieces that can move to
			// the same square
			if(identicalPieceCoordinates.length)
			{
				let isIdenticalPieceOnTheSame = {
					'rank' : false,
					'file' : false
				}
				// check if they are on the same rank or file
				for(
					let i = 0;
					i < identicalPieceCoordinates.length;
					i++
				){
					if(
						identicalPieceCoordinates[i].x ==
						startSquareCoordinates.x
					) {
						isIdenticalPieceOnTheSame.file = true;
					}

					if(
						identicalPieceCoordinates[i].y ==
						startSquareCoordinates.y
					) {
						isIdenticalPieceOnTheSame.rank = true;
					}
				}

				// if there is oe on the same file
				if(isIdenticalPieceOnTheSame.file){
					// and if there is one on the same rank
					// use the square
					if(isIdenticalPieceOnTheSame.rank) {
						notation +=
							fileLetters[startSquareCoordinates.x];
						notation += 8 - startSquareCoordinates.y;
					}else{ // otherwise just use the rank
						notation += 8 - startSquareCoordinates.y;
					}
				}else{ // otherwise just use the file
					notation +=
						fileLetters[startSquareCoordinates.x];
				}
			}

			if(endSquarePiece != ' ') {
				notation += 'x';
			}

		}

		// get name of end square

		notation += fileLetters[endSquareCoordinates.x];
		notation += 8 - endSquareCoordinates.y;

		// add extra character if promotion

		if(move.length > 2) {
			notation += '=' + move[2].toUpperCase();
		}
	}
	// is it a check?
	let positionToTest = generateNewPositionFromMove(position, move);

	if(
		isCheck(
			positionToTest,
			position.whiteToMove ? coloursToMove.BLACK : coloursToMove.WHITE
		)
	) {
		// if so, is it mate?
		if(getSubsequentPositions(positionToTest) == 0) {
			notation += '#';
		}else{
			notation += '+';
		}
	}
	return(notation);
}

// generate a new position from a given move
function generateNewPositionFromMove(position, move) {
	let piece = position.piecePositions[move[0]];
	let newPiecePositions = basicPositionStringMove(position.piecePositions, move);
	let newWhiteToMove = !position.whiteToMove;
	let newMoveNumber = position.moveNumber + (position.whiteToMove ? 0 : 1);
	let newFiftyMoveCounter = position.fiftyMoveCounter + 1;

	// the following is for castling rules
	if(piece.toUpperCase() == 'K')
	{
		for(let i = 0; i < 4; i++)
		{
			if(
				castlingKingMoves[i][0] == move[0]
				&&
				castlingKingMoves[i][1] == move[1]
			){
				newPiecePositions = basicPositionStringMove(
					newPiecePositions, castlingRookMoves[i]
				);
			}
		}
	}

	// position will copy the values without being the same array
	let newWhichCornersCanCastle = [];
	for(let i = 0; i < 4; i++)
	{
		newWhichCornersCanCastle[i] = position.whichCornersCanCastle[i];
	}
	// the rooks and kings
	switch(move[0]) {
		case 0: newWhichCornersCanCastle[0] = false; break;
		case 7: newWhichCornersCanCastle[1] = false; break;
		case 56: newWhichCornersCanCastle[2] = false; break;
		case 63: newWhichCornersCanCastle[3] = false; break;
		case 4:
			newWhichCornersCanCastle[0] = false;
			newWhichCornersCanCastle[1] = false;
			break;
		case 60:
			newWhichCornersCanCastle[2] = false;
			newWhichCornersCanCastle[3] = false;
			break;
	}
	let newEnPassantFile = 9;

	// if a pawn is being moved
	if(piece.toUpperCase() == 'P')
	{
		newFiftyMoveCounter = 0;
		// if it is being moved two squares
		if(Math.abs(move[0] - move[1]) == 16)
		{
			newEnPassantFile = getCartesianFromIndex(move[0]).x;
		}
		// if it is performing a capture
		else if(Math.abs(move[0] - move[1]) != 8)
		{
			// if position is en passant
			if(position.piecePositions[move[1]] == ' ')
			{
				let squareToEmpty = getSquareToEmptyEnPassant(move[1]);

				newPiecePositions =
					newPiecePositions.substring(0,squareToEmpty) +
					' ' +
					newPiecePositions.substring(squareToEmpty + 1, 64);
			}
		}
	}
	// if the last move was a capture
	if(position.piecePositions[move[1]] != ' ') {
		newFiftyMoveCounter = 0;
	}

	return new Position(
		newPiecePositions,
		newWhiteToMove,
		newEnPassantFile,
		newWhichCornersCanCastle,
		newMoveNumber,
		newFiftyMoveCounter
	);
}

// is a move possible? (doesn't take check into account)
// (format [num1, num2])
// the control argument changes pawns from only moving forward to
// only moving diagonally
// this allows it to evaluate pawn central control
function isMovePossible(position, move, control) {
	// set up which pieces are in the start and end squares
	let startSquareIndex = move[0];
	let endSquareIndex = move[1];
	// set up which pieces are in the start and end squares
	let startSquare = position.piecePositions[move[0]];
	let endSquare = position.piecePositions[move[1]];
	// whether the piece being moved is a white piece
	let isWhite = startSquare.toUpperCase() == startSquare;

	// if the piece is not being moved
	if(startSquareIndex == endSquareIndex) return false;
	// if the square is empty
	if(startSquare == ' ') return false;
	// if it would capture a side's own piece
	if(
		getColourOfPiece(startSquare) == getColourOfPiece(endSquare)
	) return false;

	let movesForThisSquare = possibleMoves[startSquareIndex];
	// whether the move is legal and unblocked, but not whether it
	// keeps the king out of check
	let moveable = false;
	let moves;

	switch(startSquare) {
		case 'q':
		case 'Q':
			moves = movesForThisSquare.queen; break;
		case 'b':
		case 'B':
			moves = movesForThisSquare.bishop; break;
		case 'n':
		case 'N':
			moves = movesForThisSquare.knight; break;
		case 'r':
		case 'R':
			moves = movesForThisSquare.rook; break;
		case 'k':
		case 'K':
			moves = movesForThisSquare.king; break;
		case 'P':
			if(endSquare == ' ' && !control) {
				moves = movesForThisSquare.whitePawn;
			}else{
				moves = movesForThisSquare.whitePawnCapture;
			}
			break;
		case 'p':
			if(endSquare == ' ' && !control) {
				moves = movesForThisSquare.blackPawn;
			}else{
				moves = movesForThisSquare.blackPawnCapture;
			}
			break;
	}
	// loop throught all moves from position square
	for(let i = 0; i < moves.length; i++)
	{
		// and check if the move inputted is one of them
		if(moves[i].square == endSquareIndex)
		{
			let blockingSquares = moves[i].blockingSquares;
			moveable = true;
			for(let j = 0; j < blockingSquares.length; j++)
			{
				// if there is a piece at the blocking square
				if(
					position.piecePositions[blockingSquares[j]] != ' '
				){
					moveable = false;
				}
			}
		}
	}

	return moveable;
}

function isCheck(position, colour) {
	let kingPosition = 64;

	for(let i = 0; i < 64; i++) {
		let piece = position.piecePositions[i]
		if(
			piece.toUpperCase() == 'K'
			&&
			getColourOfPiece(piece) == colour
		) kingPosition = i;
	}

	if(kingPosition == 64) throw('King is off of the board.');

	for(let i = 0; i < 64; i++) {
		let piece = position.piecePositions[i]
		if(
			getColourOfPiece(piece) != colour
			&&
			getColourOfPiece(piece) != pieceColours.EMPTY
		){
			if(isMovePossible(position, [i, kingPosition]) ) return true;
		}
	}
	return false;
}

function isMoveLegal(position, move) {
	//~ console.log(move);
	let piece = position.piecePositions[move[0]];

	let isWhite = piece.toUpperCase() == piece;

	// if the piece being moved is the wrong colour
	if( isWhite != position.whiteToMove) {
		return(false);
	}

	if(isMovePossible(position, move)) {
		let newPosition = generateNewPositionFromMove(position, move);

		if(isCheck(newPosition, getColourToMove(position))) {
			return(false);
		}else{
			return(true);
		}
	}

	// for castling
	if(piece.toUpperCase() == 'K') {
		// you cannot castle your opponent's pieces
		if(getColourOfPiece(piece) != getColourToMove(position)) {
			return(false);
		}

		// loop through all 4 castling moves
		for(let i = 0; i < 4; i++) {
			// if position is one of them
			if(
				castlingKingMoves[i][0] == move[0]
				&&
				castlingKingMoves[i][1] == move[1]
				&&
				position.whichCornersCanCastle[i]
			){
				//~ return(true);
				// loop through all possible blocking squares
				for(
					let j = 0;
					j < castlingBlockingSquares[i].length;
					j++
				) {

					// if any of these are not free, the move is not
					// legal
					if(
						position.piecePositions[
							castlingBlockingSquares[i][j]
						]

						!=

						' '
					) {
						return(false);
					}
				}

				// if either of the squares that the king passes
				// through are attacked
				for(
					let j = 0;
					j < castlingCheckBlockingSquares[i].length;
					j++) {

					let newPosition =
						generateNewPositionFromMove(
							position,
							[
								move[0],
								castlingCheckBlockingSquares[i][j]
							]
						);

					if(isCheck(newPosition, getColourToMove(position))) {
						return(false);
					}
				}
				return(true);
			}
		}
	}

	// for en passant
	let startSquareCoordinates = getCartesianFromIndex(move[0]);
	let endSquareCoordinates = getCartesianFromIndex(move[1]);

	// the move tables are called 'whitePawnCapture' and
	// 'blackPawnCapture', so this saves space

	let colourOfPawn =
		getColourToMove(position) == coloursToMove.WHITE ?
		'white' : 'black';

	if(possibleMoves[move[0]][colourOfPawn + 'PawnCapture'].length) {
			// if either of the possible caputures end at the end
			// square
			for(
				let i = 0;
				i < possibleMoves[move[0]]
					[colourOfPawn + 'PawnCapture'].length;
				i++
			) {
				if(
					possibleMoves[move[0]]
						[colourOfPawn + 'PawnCapture'][i].square
					==
					move[1]
				) {
					// if the move was from the fourth rank
					if(startSquareCoordinates.y == 4) {
						// if the move ended on the en passant file
						if(
							position.enPassantFile ==
							endSquareCoordinates.x
						) {
							return(true);
						}
					}
				}
			}
		}

	return(false);
}

// actually get subsequent positions
// (or the notation for moving to them)
function getSubsequentPositions(position, notation) {
	if(notation) {
		if(position.gotSubsequentPositionsNotation) {
			return(0);
		}
	}else{
		if(position.gotSubsequentPositions) {
			return(position.subsequentPositions.length);
		}

		position.gotSubsequentPositions = true;
	}

	// loop through all of the squares
	for(let i = 0; i < 64; i++) {

		let piece = position.piecePositions[i];

		let isWhite = piece.toUpperCase() == piece;

		// if the piece being moved is the right colour
		if( isWhite == position.whiteToMove ) {

			// the moves that start from position square
			let movesForThisSquare = possibleMoves[i];

			// create a variable for moves,
			let moves = [];

			// and fill it with the ones for the appropriate piece
			switch(position.piecePositions[i]) {
				case 'q':
				case 'Q':
					moves = movesForThisSquare.queen;
					break;

				case 'b':
				case 'B':
					moves = movesForThisSquare.bishop;
					break;

				case 'n':
				case 'N':
					moves = movesForThisSquare.knight;
					break;

				case 'r':
				case 'R':
					moves = movesForThisSquare.rook;
					break;

				case 'k':
				case 'K':
					moves = movesForThisSquare.king;

					break;

				case 'P':
				case 'p':
					// the move table names contain 'white' and 'black'
					let colourOfPawn =
						getColourOfPiece(position.piecePositions[i])
						==
						coloursToMove.WHITE ?
							'white' : 'black';

					moves = [];

					// loop through all pawn moves starting at position
					// square, and add them
					// position prevents the main index of moves from
					// being edited
					let pushes =
						movesForThisSquare[colourOfPawn + 'Pawn'];
					for(let j = 0; j < pushes.length; j++) {
						moves.push(pushes[j]);
					}

					// loop through all pawn captures starting at
					// position square, and add them too
					let captures = movesForThisSquare
						[colourOfPawn + 'PawnCapture'];
					for(let j = 0; j < captures.length; j++) {
						moves.push(captures[j]);
					}

					break;
			}


			// loop through all of the possible moves
			for(let j = 0; j < moves.length; j++) {
				// if it happens to be legal,
				if(isMoveLegal(position, [ i, moves[j].square ])  ) {
					// if a pawn promotion
					if(
						(piece == 'P' && i < 16)
						||
						(piece == 'p' && i > 47)
					) {
						for(let k = 0; k < 4; k++) {
							let promotionPiece =
								piece == 'P' ?
									promotionPieces[k]. toUpperCase()
									:
									promotionPieces[k];
							addMoveToList(
								position,
								[
									i,
									moves[j].square,
									promotionPiece
								],
								notation
							);
						}
					}else{
						addMoveToList(
							position,
							[i, moves[j].square],
							notation
						);
					}
				}
			}

			// check if we can castle
			for(let j = 0; j < 4; j++) {
				// if it happens to be legal,
				if(
					isMoveLegal(
						position,
						[ i, castlingKingMoves[j][1] ]
					)
				) {
					addMoveToList(
						position,
						[i, castlingKingMoves[j][1]],
						notation
					);
				}
			}


		}
	}


	return(position.subsequentPositions.length);
}

function getSubsequentPositionsForDepth(position, depth) {
	if(depth == 1) {
		return(getSubsequentPositions(position));
	}else{
		getSubsequentPositions(position);

		let n = 0;
		for(let i = 0; i < position.subsequentPositions.length; i++) {
			n += getSubsequentPositionsForDepth(
				position.subsequentPositions[i],
				depth - 1
			);
		}

		return(n);
	}
}

function evaluate(position) {
	if(position.evaluated) {
		return(position.evaluation);
	}

	position.evaluated = true;

	let evaluation = 0;

	for(let i = 0; i < 64; i++) {
		// add basic material value
		evaluation += pieceValues[
			position.piecePositions[i]
		];

		//test for central control
		for(let j = 0; j < 4; j++) {
			if(
				isMovePossible(
					position,
					[  i, centralSquares[j]  ],
					true
				)
			) {
				let colour = getColourOfPiece(
					position.piecePositions[i]
				);

				if(colour == pieceColours.WHITE) {
					evaluation += 20;
				}else if(colour == pieceColours.BLACK) {
					evaluation -= 20;
				}
			}
		}
	}

	// test for pieces in the centre
	for(let i = 0; i < 4; i++) {
		let colour = getColourOfPiece(
			position.piecePositions[centralSquares[i]]
		);

		if(colour == pieceColours.WHITE) {
			evaluation += 30;
		}else if(colour == pieceColours.BLACK) {
			evaluation -= 30;
		}
	}

	position.evaluation = evaluation;

	return(evaluation);
};

// evalate based on the moves calculated so far
function evaluateFromKnownMoves(position) {
	if(position.gotSubsequentPositions) {

		//if stalemate or checkmate
		if(position.subsequentPositions.length == 0) {
			if(isCheck(position, coloursToMove.WHITE)) {
				return(-20000);
			}else if(isCheck(position, coloursToMove.BLACK)){
				return(20000);
			}else{
				return(0); // stalemate
			}
		}

		// minimax, so check colour
		let bestMoveValue = position.whiteToMove ? -30000 : 30000;

		for(let i = 0; i < position.subsequentPositions.length; i++) {
			let moveValue = evaluateFromKnownMoves(
				position.subsequentPositions[i]
			);


			//~ console.log(
				//~ getColourToMove(position) + ' ' + moveValue +
				//~ ', best: ' + bestMoveValue + '\n' +
				//~ position.subsequentPositions[i].piecePositions
			//~ );
			if(
				position.whiteToMove ?
				bestMoveValue < moveValue
				:
				bestMoveValue > moveValue
			) {

				bestMoveValue = moveValue;

			}
		}

		return(bestMoveValue);

	}else{
		return(evaluate(position));
	}
}

function getBestMove(position) {
	//if stalemate or checkmate
	if(position.subsequentPositions.length == 0) {

		return(position);

	}

	// minimax, so check colour
	let bestMoveValue = position.whiteToMove ? -30000 : 30000;
	let bestMoveIndex = 0;

	for(let i = 0; i < position.subsequentPositions.length; i++) {
		let moveValue =
			evaluateFromKnownMoves(position.subsequentPositions[i]);

		if(
			position.whiteToMove ?
			bestMoveValue < moveValue
			:
			bestMoveValue > moveValue
		) {
			bestMoveValue = moveValue;
			bestMoveIndex = i;
		}
	}

	return(bestMoveIndex);
}

// the object for a position
function Position(
	piecePositions, whiteToMove, enPassantFile, whichCornersCanCastle,
	moveNumber, fiftyMoveCounter
){
	this.piecePositions = piecePositions;
	this.whiteToMove = whiteToMove;
	this.enPassantFile = enPassantFile;
	this.whichCornersCanCastle = whichCornersCanCastle;

	this.moveNumber = moveNumber;
	this.fiftyMoveCounter = fiftyMoveCounter;

	// array of positions that can be moved to
	this.subsequentPositions = [];
	this.subsequentPositionsNotation = [];

	this.gotSubsequentPositions = false;
	this.gotSubsequentPositionsNotation = false;

	this.evaluation = 0;
	this.evaluated = false;

	// evaluate this position
	evaluate(this);
}

//********************************GUI CODE******************************

// whether or not the board is visually flipped
let flipped = false;

// flip board when space key is pressed
// also flip level select code
document.body.onkeyup = function(event) {
	if(event.keyCode == 32) {
		flipped = !flipped;

		// loop through level select elements and unhighlight
		for(let i = 0; i < levels.length; i++) {
			element = document.getElementById(
				'level_select_top_' + levels[i].name
			);
			element.className = 'level_select';
			element = document.getElementById(
				'level_select_bottom_' + levels[i].name
			);
			element.className = 'level_select';
		}
		element = document.getElementById(
			'level_select_top_Human'
		);
		element.className = 'level_select';
		element = document.getElementById(
			'level_select_bottom_Human'
		);
		element.className = 'level_select';

		if(flipped) {
			document.getElementById('td_player_bottom_name').className =
				'player_black_name player_name';
			document.getElementById('td_player_top_name').className =
				'player_white_name player_name';

			// get the selected element and highlight it
			element = document.getElementById(
				'level_select_top_' + sides.white.name
			);
			element.className = 'level_select level_selected';

			// get the selected element and highlight it
			element = document.getElementById(
				'level_select_bottom_' + sides.black.name
			);
			element.className = 'level_select level_selected';
		}else{
			document.getElementById('td_player_top_name').className =
				'player_black_name player_name';
			document.getElementById('td_player_bottom_name').className =
				'player_white_name player_name';

			// get the selected element and highlight it
			element = document.getElementById(
				'level_select_bottom_' + sides.white.name
			);
			element.className = 'level_select level_selected';

			// get the selected element and highlight it
			element = document.getElementById(
				'level_select_top_' + sides.black.name
			);
			element.className = 'level_select level_selected';
		}
	}
}

function addMoveNotation(notation) {
	if(currentPosition.whiteToMove) {
		notationBody.innerHTML +=
			'<tr class="tr_notation"><td class="notation_number">' +
			currentPosition.moveNumber +
			'.  </td><td class="notation_move" id="movew' +
			currentPosition.moveNumber +
			'">' +
			notation +
			'</td><td class="notation_move" id="moveb' +
			currentPosition.moveNumber +
		'"></td></tr>';
	}else{
		document.getElementById('moveb' + currentPosition.moveNumber)
			.textContent = notation;
	}
}

let initialisingClock = true;

// convert ms into hrs + mins + secs
function getClockTimeInHMS(time) {
	let text = '';

	// if over an hour
	if(time >= 3600000) {
		text += Math.floor(time / 3600000);
		text += ':'

		time %= 3600000; // this is so we don't add the hours again as
		// 60 minutes

		// if the time remaining is less than 10 minutes
		if(time < 600000) {
			text += '0';
		}

		// if the time remaining is less than 1 minute
		if(time < 60000) {
			text += '0:'

			// if the time remaining is less than 10 seconds
			if(time < 10000) {
				text += '0'
			}
		}


	}

	// if over a minute
	if(time >= 60000) {
		text += Math.floor(time / 60000);
		text += ':'

		time %= 60000;

		if(time < 10000) {
			text += '0'
		}
	}

	// add seconds
	text += Math.floor(time / 1000);
	time %= 1000;

	text += '.';

	//add tenths of seconds
	text += Math.floor(time / 100);

	return(text);
}

let mouseOffset = {
	'LEFT' : true,
	'TOP' : false,
}

// get the mouse offset for the canvas
function getOffset(offsetDirection) {
	let offset=0;
	element=ctx.canvas;

	if(offsetDirection == mouseOffset.LEFT){

		while(element != document.body){
			offset+=element.offsetLeft;
			element=element.offsetParent;
		}
		offset+=element.offsetLeft;

		offset-=scrollX;
	}else{

		while(element != document.body){
			offset+=element.offsetTop;
			element=element.offsetParent;
		}
		offset+=element.offsetTop;

		offset-=scrollY;
	}

	return(offset);
}

// set up the canvas
let cnv = document.getElementsByTagName('canvas')[0]; // the canvas
let ctx = cnv.getContext('2d'); // its context

// set up all of the images

let imageSizeInSquare = 0.8;
let imagesOffset = (1 - imageSizeInSquare) / 2;

let images = {
	'board' : new Image(),

	'pieces' : {
		'R' : new Image(),
		'N' : new Image(),
		'B' : new Image(),
		'Q' : new Image(),
		'K' : new Image(),
		'P' : new Image(),
		'r' : new Image(),
		'n' : new Image(),
		'b' : new Image(),
		'q' : new Image(),
		'k' : new Image(),
		'p' : new Image(),
		' ' : document.createElement('canvas'),
	}
}

images.board.src = 'chesspieces/BOARD.png';

images.pieces.R.src = 'chesspieces/WR.png';
images.pieces.N.src = 'chesspieces/WN.png';
images.pieces.B.src = 'chesspieces/WB.png';
images.pieces.Q.src = 'chesspieces/WQ.png';
images.pieces.K.src = 'chesspieces/WK.png';
images.pieces.P.src = 'chesspieces/WP.png';

images.pieces.r.src = 'chesspieces/BR.png';
images.pieces.n.src = 'chesspieces/BN.png';
images.pieces.b.src = 'chesspieces/BB.png';
images.pieces.q.src = 'chesspieces/BQ.png';
images.pieces.k.src = 'chesspieces/BK.png';
images.pieces.p.src = 'chesspieces/BP.png';

// set up the size of the canvas
let canvasSize = 600;

ctx.canvas.width = canvasSize;
ctx.canvas.height = canvasSize;

let squareSize = canvasSize / 8;

let mouse = {
	'position' : Cartesian(0, 0),
	'isDown' : false,
	'justClicked' : false,
	'boardSquare' : 0,
	'holdingPiece' : false,
	'holdingSquare' : 0,
	'promotionType' : 'Q',
}

ctx.canvas.onmousemove = function(event) {
	mouse.position.x = event.clientX - getOffset(mouseOffset.LEFT);
	mouse.position.y = event.clientY - getOffset(mouseOffset.TOP);

	mouse.boardSquare = getIndexFromCartesian(
		Math.floor(mouse.position.x / squareSize),
		Math.floor(mouse.position.y / squareSize),
	);

	if(flipped) {
		mouse.boardSquare = 63 - mouse.boardSquare;
	}

	let positioninSquare = Cartesian(
		mouse.position.x % squareSize,
		mouse.position.y % squareSize
	);

	if(positioninSquare.x < squareSize / 2) {
		if(positioninSquare.y < squareSize / 2) {
			mouse.promotionType = 'Q';
		}else{
			mouse.promotionType = 'N';
		}
	}else{
		if(positioninSquare.y < squareSize / 2) {
			mouse.promotionType = 'R';
		}else{
			mouse.promotionType = 'B';
		}
	}
}

ctx.canvas.onmousedown = function() {
	mouse.holdingPiece = true;
	mouse.holdingSquare = mouse.boardSquare;
}

ctx.canvas.onmouseup = function() {
	if(
		(currentPosition.whiteToMove ? sides.white.type : sides.black.type)
		==
		levelTypes.HUMAN
	) {

		let move = [mouse.holdingSquare, mouse.boardSquare];

		if(isMoveLegal(currentPosition, move)) {

			if(
				currentPosition.piecePositions[move[0]].toUpperCase()
				==
				'P'
			) {
				if(
					move[1] < 8
					||
					move[1] > 55
				){
					if(currentPosition.whiteToMove) {
						move.push(mouse.promotionType);
					}else{
						move.push(mouse.promotionType.toLowerCase());
					}
				}
			}

			addMoveNotation(getNotationForMove(currentPosition, move));
			let newPosition = generateNewPositionFromMove(
				currentPosition,
				move
			);

			currentPosition = newPosition;

			gameFENs.push(getFEN(currentPosition, true));

			initialisingClock = true;

		}
	}
	mouse.holdingPiece = false;
}

// draw the board image
function drawBoard() {
	ctx.drawImage(
		images.board,
		0,
		0,
		canvasSize,
		canvasSize
	);
}

let miniPromotionImagesPositions = [
	['Q', 0, 0],
	['N', 0, 0.5],
	['B', 0.5, 0.5],
	['R', 0.5, 0]
];

// the function for drawing the position onto the canvas
function drawPosition(position) {
	let cartesianPosition = Cartesian(0, 0);

	for(let i = 0; i < 64; i++) {
		cartesianPosition.x = i % 8;
		cartesianPosition.y = Math.floor(i / 8);

		if(flipped) {
			cartesianPosition.x = 7 - cartesianPosition.x;
			cartesianPosition.y = 7 - cartesianPosition.y;
		}

		// if this piece is not being moved
		if(!(mouse.holdingPiece && mouse.holdingSquare == i)){
			ctx.drawImage(
				images['pieces'][position['piecePositions'][i]],
				(cartesianPosition.x + imagesOffset) * squareSize,
				(cartesianPosition.y + imagesOffset) * squareSize,
				squareSize * imageSizeInSquare,
				squareSize * imageSizeInSquare
			);
		}
	}

	if(mouse.holdingPiece) {
		for(let i = 0; i < 64; i++) {
			// if this piece is being moved
			if(mouse.holdingSquare == i) {
				ctx.drawImage(
					images['pieces'][position['piecePositions'][i]],
					mouse.position.x - squareSize * imageSizeInSquare *
					0.5,
					mouse.position.y - squareSize * imageSizeInSquare *
					0.5,
					squareSize * imageSizeInSquare,
					squareSize * imageSizeInSquare
				);
			}
		}
	}

	if(currentPosition.piecePositions[mouse.holdingSquare] == 'P') {
		if(
			mouse.holdingSquare < 16
			&&
			mouse.boardSquare < 8
			&&
			currentPosition.whiteToMove
		){

			for(let i = 0; i < 4; i++) {
				let cartesianCoordinates =
					getCartesianFromIndex(mouse.boardSquare);

				ctx.drawImage(
					images.pieces[miniPromotionImagesPositions[i][0]],
					squareSize * (
						miniPromotionImagesPositions[i][1] +
						cartesianCoordinates.x
					),
					squareSize * (
						miniPromotionImagesPositions[i][2] +
						cartesianCoordinates.y
					),
					0.5 * squareSize,
					0.5 * squareSize,
				);
			}
		}
	}else if(
		currentPosition.piecePositions[mouse.holdingSquare] == 'p'
	) {
		if(
			mouse.holdingSquare > 47
			&&
			mouse.boardSquare > 55
			&&
			!currentPosition.whiteToMove
		){
			for(let i = 0; i < 4; i++) {
				let cartesianCoordinates = getCartesianFromIndex(
					mouse.boardSquare
				);
				ctx.drawImage(
					images.pieces[
						miniPromotionImagesPositions[i][0].toLowerCase()
					],
					squareSize * (
						miniPromotionImagesPositions[i][1] +
						cartesianCoordinates.x
					),
					squareSize * (
						miniPromotionImagesPositions[i][2] +
					cartesianCoordinates.y
					),
					0.5 * squareSize,
					0.5 * squareSize,
				);
			}
		}

	}

}

// the main graphical function
function draw() {
	drawBoard();
	drawPosition(currentPosition);


	setTimeout('draw()', 16);
}

//********************ENGINE FUNCTIONS AND VARABLES*********************

let openingBook = {
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -' : ['e4', 'd4', 'c4', 'Nf3'],
		'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e' : ['e5', 'd5', 'c5','c6','e6','Nf6','g6'],
			'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e' : ['Nf3', 'Bc4', 'Nc3'],
				'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -' : ['Nf6','Nc6'],
				'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq -' : ['Nf6'],
				'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -' : ['Nf6', 'Nc6'],
			'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d' : ['exd5'],
				'rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq -' : ['Qxd5'],
					'rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq -' : ['Nc3'],
						'rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq -' : ['Qa5'],
			'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c' : ['d4', 'Nf3'],
				'rnbqkbnr/pp1ppppp/8/2p5/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d' : ['cxd4'],
				'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -' : ['Nc6'],
					'r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -' : ['d4'],
						'r1bqkbnr/pp1ppppp/2n5/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d' : ['cxd4'],
							'r1bqkbnr/pp1ppppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -' : ['Nxd4'],
								'r1bqkbnr/pp1ppppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -' : ['Nxd4'],
		'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d' : ['d5', 'f5', 'Nf6', 'g6'],
		'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c' : ['c5', 'e5', 'f5', 'Nf6'],
		'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -' : ['d5'],
};

// this is the proportion of the remaining time that engine will use
let timeProportion = 0.05;

// store the current position
let currentPosition = new Position(
	'\
rnbqkbnr\
pppppppp\
        \
        \
        \
        \
PPPPPPPP\
RNBQKBNR',
	true,
	8,
	[true, true, true, true],
	1,
	0,
);

// this is an array of all the positions achieved so far
let game = [currentPosition];
let gameFENs = [getFEN(currentPosition, true)];
let gameMoveNotation = ['Starting Position'];
// get subsequent positions for the first position that it already hasn't

// return true if finished
function searchFirstUnsearchedNodeAtDepth(position, depth) {
	if(depth == 1) {
		if(!position.gotSubsequentPositions) {
			getSubsequentPositions(position);

			return(false);
		}else{
			return(true);
		}
	}

	if(!position.gotSubsequentPositions) {
		getSubsequentPositions(position);
		return(false);
	}

	// loop through subsequent positions
	for(let i = 0; i < position.subsequentPositions.length; i++) {
		if(
			!searchFirstUnsearchedNodeAtDepth(
				position.subsequentPositions[i], depth - 1
			)
		) {
			return(false);
		}
	}

	// if all of the subsequent positions have their own subsequent
	// positions calculated
	return true;
}

function searchFirstUnsearchedNode(position, depthLimit)
{
	let depthSoFar = 1;
	while(
		searchFirstUnsearchedNodeAtDepth(position, depthSoFar) &&
		depthSoFar <= depthLimit
	) depthSoFar++;

	//console.log(depthSoFar);

	if(depthSoFar > depthLimit)
	{
		getSubsequentPositionsForDepth(position, depthLimit)
		return true;
	}
	else
	{
		return false;
	}
}

// change the position
// add the notation
// notify the engine loop to initialise the next clock phase
function executeMoveFromIndex(position, index) {
	// get the notation for the moves
	getSubsequentPositions(currentPosition, true);

	if(currentPosition.subsequentPositions.length) {
		addMoveNotation(currentPosition.subsequentPositionsNotation[index]);

		currentPosition =
			currentPosition.subsequentPositions[index];

		gameFENs.push(getFEN(currentPosition, true));
	}

	initialisingClock = true;
}

// this plays a move when a algebraic move is passed e.g. 'e4'
function executeMoveFromNotation(position, notation) {
	getSubsequentPositions(currentPosition, true);
	getSubsequentPositions(currentPosition, false);

	for(let i = 0; i < currentPosition.subsequentPositions.length; i++) {
		if(currentPosition.subsequentPositionsNotation[i] == notation) {

			addMoveNotation(notation);

			//~ console.log(currentPosition.subsequentPositions[i]);
			currentPosition = currentPosition.subsequentPositions[i];

			gameFENs.push(getFEN(currentPosition, true));
		}
	}

	initialisingClock = true;
}

// store the clock values for one side
function ClockSide(time, increment) {
	this.time = time;
	this.increment = increment;

	this.startedCountingMoment = Date.now();
	this.startedCountingTimeAmount = this.time;

	this.initialiseTime = function() {
		this.time += this.increment;
		this.startedCountingMoment = Date.now();
		this.startedCountingTimeAmount = this.time;
	}

	this.getAndSetTime = function() {
		this.time = this.startedCountingTimeAmount +
			(this.startedCountingMoment - Date.now());
	}
}

let clock = {
	'white' : new ClockSide(1200000, 10000),
	'black' : new ClockSide(1200000, 10000)
}

// we need a series of levels
// 1: plays first move
// 2: plays last move
// (1 & 2 are swapped for black)
// 3: plays random moves
// 4: depth 1, no book
// 5: depth 2, no book
// 6: depth 2, book
// 7: depth 3, book
// 8: depth 10, book

let levelTypes = {
	'HUMAN' : 0,
	'FIRST' : 1,
	'LAST' : 2,
	'RANDOM' : 3,
	'STANDARD' : 4,
}

function Level(type, depth, book, name) {
	this.type = type;
	this.depth = depth;
	this.book = book;
	this.name = name;

	// for code to only run the moment it becomes this engine's turn
	this.initialising = true;
	// the time when we will stop searching
	this.haltSearchTime = 0;

	switch(this.type) {
		case levelTypes.HUMAN:
			// if it's a human player to move, just hang
			this.loop = function() {
			};
			break;
		case levelTypes.FIRST:
		case levelTypes.LAST:
			this.loop = function() {
				getSubsequentPositions(currentPosition);

				// this is the index of the move to be chosen
				let moveIndex;

				if(this.type == levelTypes.FIRST) {
					if(currentPosition.whiteToMove) {
						moveIndex =
							currentPosition.subsequentPositions.length
							- 1;
					}else{
						moveIndex = 0;
					}
				}else{
					// must be last, becasuse that is the only other
					// level type that creates this function
					if(currentPosition.whiteToMove) {
						moveIndex = 0;
					}else{
						moveIndex =
							currentPosition.subsequentPositions.length
							- 1;
					}
				}

				executeMoveFromIndex(currentPosition, moveIndex)

			}
			break;
		case levelTypes.RANDOM:
			this.loop = function() {

				getSubsequentPositions(currentPosition);
				getSubsequentPositions(currentPosition, true);

				let moveIndex = Math.floor(
					currentPosition.subsequentPositions.length
					* Math.random()
				);

				executeMoveFromIndex(currentPosition, moveIndex)
			}
			break;
		case levelTypes.STANDARD:
			this.loop = function() {
				if(this.initialising)
				{
					console.log("intialising tree search");
					// delete knowledge of positions, so that we don't use
					// the knowledge of higher levels
					currentPosition.subsequentPositions = [];
					currentPosition.gotSubsequentPositions = false;
					
					let clockTimeRemaining =
						currentPosition.whiteToMove ?
							clock.white.time:
							clock.black.time;
					let clockTimeForThisMove =
						clockTimeRemaining * timeProportion;

					this.haltSearchTime = Date.now() + clockTimeForThisMove;
					this.initialising = false;

					if(this.book)
					{
						let opening = openingBook[getFEN(currentPosition, true)];
						if(opening)
						{
							console.log("book move played");
							let openingMove = opening[
								Math.floor(
									Math.random() * opening.length
								)
							];
							executeMoveFromNotation(currentPosition, openingMove);
							this.initialising = true;
						}
					}
					return;
				}
				if(Date.now() > this.haltSearchTime)
				{
					console.log("search halted due to time");
					let index = getBestMove(currentPosition);
					executeMoveFromIndex(currentPosition, index);
					this.initialising = true;
				}
				searchFirstUnsearchedNode(currentPosition, this.depth);
			}
			break;
	}
}

let levels = [
	new Level(levelTypes.HUMAN,    0,  false, 'Human'),
 
	new Level(levelTypes.FIRST,    0,  false, 'Level_1'),
	new Level(levelTypes.LAST,     0,  false, 'Level_2'),
	new Level(levelTypes.RANDOM,   0,  false, 'Level_3'),
	new Level(levelTypes.STANDARD, 1,  false, 'Level_4'),
	new Level(levelTypes.STANDARD, 2,  false, 'Level_5'),
	new Level(levelTypes.STANDARD, 2,  true,  'Level_6'),
	new Level(levelTypes.STANDARD, 3,  true,  'Level_7'),
	new Level(levelTypes.STANDARD, 10, true,  'Level_8'),
];

let sides = {
	'white' : levels[4],
	'black' : levels[0],
}

// we need a series of time controls
// bullet: 1+0
// blitz: 5+5
// rapid: 20+10
// classical: 90+30
function TimeControl(name, description, main, increment) {
	this.name = name;
	this.description = description;
	this.main = main;
	this.increment = increment;
}

let timeControls = {
	'Bullet' :    new TimeControl('Bullet',    '1+0',   60000,   0),
	'Blitz' :     new TimeControl('Blitz',     '5+5',   300000,  5000),
	'Rapid' :     new TimeControl('Rapid',     '20+10', 1200000, 10000),
	'Classical' : new TimeControl('Classical', '90+30', 5400000, 30000),
}

let clockElements = {
	'top' : document.getElementById('div_player_top_clock'),
	'bottom' : document.getElementById('div_player_bottom_clock'),
}

let results = {
	'UNDECIDED' : '*',
	'WHITEWIN' : '1-0',
	'BLACKWIN' : '0-1',
	'DRAW' : '½-½',
}


// WIN CAUSES:

// checkmate x
// on time x
// resignation

// DRAW CAUSES:

// threefold repetition
// 50-move rule x
// dead position x
// stalemate x
// on time x
// agreement

let gameStates = {
	'inPlay' : true,
	'result' : results.UNDECIDED,
	'cause' : null,
}

function testForResult() {
	// if there are no legal moves
	if(getSubsequentPositions(currentPosition) == 0) {
		// checkmate
		if(isCheck(
			currentPosition,
			currentPosition.whiteToMove ?
				coloursToMove.WHITE : coloursToMove.BLACK
		)) {
			gameStates.result = currentPosition.whiteToMove ?
				results.BLACKWIN : results.WHITEWIN;
			gameStates.cause = 'checkmate';
			gameStates.inPlay = false;
		}else{
			// stalemate
			gameStates.result = results.DRAW;
			gameStates.cause = 'stalemate';
			gameStates.inPlay = false;
		}
		return(1);
	}

	// if white flags
	if(clock.white.time <=0) {
		// try to find black pieces
		for(let i = 0; i < 64; i++) {
			let piece = currentPosition.piecePositions[i];
			if(
				getColourOfPiece(piece) == pieceColours.BLACK
				&&
				piece != 'k'
			) {
				// if you find one, black wins
				gameStates.result = results.BLACKWIN;
				gameStates.cause = 'on time';
				gameStates.inPlay = false;
				return(1);
			}
		}
		// if black has only a king left, call it a draw
		gameStates.result = results.DRAW;
		gameStates.cause = 'on time';
		gameStates.inPlay = false;
		return(1);
	}

	// if black flags
	if(clock.black.time <=0) {
		// try to find white pieces
		for(let i = 0; i < 64; i++) {
			let piece = currentPosition.piecePositions[i];
			if(
				getColourOfPiece(piece) == pieceColours.WHITE
				&&
				piece != 'K'
			) {
				// if you find one, white wins
				gameStates.result = results.WHITEWIN;
				gameStates.cause = 'on time';
				gameStates.inPlay = false;
				return(1);
			}
		}
		// if white has only a king left, call it a draw
		gameStates.result = results.DRAW;
		gameStates.cause = 'on time';
		gameStates.inPlay = false;
		return(1);
	}

	if(currentPosition.fiftyMoveCounter >= 100) {
		gameStates.result = results.DRAW;
		gameStates.cause = '50 moves';
		gameStates.inPlay = false;
		return(1);
	}

	// now test for a dead position
	let knights = 0;
	let clearlyAlivePosition = false;
	// true = odd (light) false = even (dark) squares
	let bishopSquareTypes = [];

	for(let i = 0; i < 64; i++) {
		let piece = currentPosition.piecePositions[i].toUpperCase();

		switch(piece) {
			case 'P':
			case 'R':
			case 'Q':
				clearlyAlivePosition = true;
				break;
			case 'N':
				knights++;
				break;
			case 'B':
				bishopSquareTypes.push(i % 2 == 1);
			default:
				break;
		}

		if(clearlyAlivePosition) {
			break;
		}
	}

	if(!clearlyAlivePosition) {
		if(knights < 2 && bishopSquareTypes.length == 0) {
			gameStates.result = results.DRAW;
			gameStates.cause = 'dead position';
			gameStates.inPlay = false;
			return(1);
		}
		if(knights == 0) {
			if(bishopSquareTypes.length < 2) {
				gameStates.result = results.DRAW;
				gameStates.cause = 'dead position';
				gameStates.inPlay = false;
				return(1);
			}
			let firstBishopSquareType = bishopSquareTypes[0];
			for(let i = 1; i < bishopSquareTypes.length; i++) {
				if(bishopSquareTypes[i] != firstBishopSquareType) {
					clearlyAlivePosition = true;
				}
			}
			if(!clearlyAlivePosition) {
				gameStates.result = results.DRAW;
				gameStates.cause = 'dead position';
				gameStates.inPlay = false;
				return(1);
			}
		}
	}

	// test for threefold repetition
	for(let i = 0; i < gameFENs.length-2; i++) {
		for(let j = i + 1; j < gameFENs.length-1; j++) {
			if(gameFENs[i] == gameFENs[j]) {
				for(let k = j+1; k < gameFENs.length; k++) {
					if(gameFENs[i] == gameFENs[k]) {
						gameStates.result = results.DRAW;
						gameStates.cause = 'repetition';
						gameStates.inPlay = false;
						return(1);
					}
				}
			}
		}
	}
}

function engineLoop() {
	if(gameStates.result != results.UNDECIDED)
	{
		setTimeout('engineLoop()', 0);
		return;
	}

	if(testForResult())
	{
		notationBody.innerHTML +=
			'<tr class="tr_notation"><td></td><td>' +
			gameStates.result +
			'</td><td>' +
			gameStates.cause +
			'</td></tr>';
		setTimeout('engineLoop()', 0);
		return;
	}

	// display clock times and run engine loop function
	if(flipped)
	{
		clockElements.bottom.textContent =
			getClockTimeInHMS(clock.black.time);
		clockElements.top.textContent = getClockTimeInHMS(clock.white.time);
	}
	else
	{
		clockElements.bottom.textContent =
			getClockTimeInHMS(clock.white.time);
		clockElements.top.textContent = getClockTimeInHMS(clock.black.time);
	}

	// calculate clock times
	if(currentPosition.whiteToMove)
	{
		if(initialisingClock)
		{
			if(currentPosition.moveNumber > 2) clock.black.getAndSetTime();
			if(currentPosition.moveNumber > 1) clock.white.initialiseTime();
			initialisingClock = false;
		}
		else if(currentPosition.moveNumber > 1)
		{
			clock.white.getAndSetTime();
		}
		sides.white.loop();
	}
	else
	{
		if(initialisingClock)
		{
			if(currentPosition.moveNumber > 1) clock.white.getAndSetTime();
			clock.black.initialiseTime();
			initialisingClock = false;
		}else if(currentPosition.moveNumber > 1)
		{
			clock.black.getAndSetTime();
		}
		sides.black.loop();
	}

	setTimeout('engineLoop()', 0);
}

//*************************LEVEL SELECT HTML CODE***********************

let element;
// loop through levels
for(let i = 0; i < levels.length; i++) {
	// get a top select element
	element = document.getElementById(
		'level_select_top_' + levels[i].name
	);

	element.onclick = function() {
		// length of "level_select_top_"
		let level = this.id.substring(23);

		if(!level) {
			if(flipped) {
				sides.white = levels[0];
			}else{
				sides.black = levels[0];
			}
		}else{
			if(flipped) {
				sides.white = levels[level];
			}else{
				sides.black = levels[level];
			}
		}

		// reset other span elements
		for(let i = 0; i < levels.length; i++) {
			element = document.getElementById(
				'level_select_top_' + levels[i].name
			);

			element.className = 'level_select';
		}

		element = document.getElementById(
			'level_select_top_Human'
		);

		// highlight this element

		element.className = 'level_select';

		this.className = 'level_select level_selected';
	}

	// see above block for comments

	element = document.getElementById(
		'level_select_bottom_' + levels[i].name
	);

	element.onclick = function() {
		// length of "level_select_bottom_"
		let level = this.id.substring(26);

		if(!level) {
			if(!flipped) {
				sides.white = levels[0];
			}else{
				sides.black = levels[0];
			}
		}else{
			if(!flipped) {
				sides.white = levels[level];
			}else{
				sides.black = levels[level];
			}
		}

		for(let i = 0; i < levels.length; i++) {
			element = document.getElementById(
				'level_select_bottom_' + levels[i].name
			);

			element.className = 'level_select';
		}

		element = document.getElementById(
			'level_select_bottom_Human'
		);

		element.className = 'level_select';

		this.className = 'level_select level_selected';
	}
}

//*******************TIME CONTROL SELECT HTML CODE**********************

// loop through levels
for(let i in timeControls) {
	// get a top select element
	element = document.getElementById(
		'time_control_select_' + timeControls[i].name
	);

	//~ console.log(element);

	element.onclick = function() {
		// length of "level_select_top_"
		let timeControl = this.id.substring(20);


		clock.white = new ClockSide(
			timeControls[timeControl].main,
			timeControls[timeControl].increment
		);

		clock.black = new ClockSide(
			timeControls[timeControl].main,
			timeControls[timeControl].increment
		);

		// reset other span elements
		for(let i in timeControls) {
			element = document.getElementById(
				'time_control_select_' + timeControls[i].name
			);

			element.className = 'time_control_select';
		}

		this.className = 'time_control_select time_control_selected';
	}
}

//****************************INITIATE LOOPS****************************

//~ setInterval('draw()', 50);
setTimeout('draw()', 10);
setTimeout('engineLoop()', 10);
