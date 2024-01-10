const pieces = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king', 'knook', 'canadian queen'];

// indexed by rank and then file
// this is down and then right
//*
const startingPosition = [
	[-2, -3, -4, -5, -6, -4, -3, -2],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 1,  1,  1,  1,  1,  1,  1,  1],
	[ 2,  3,  4,  5,  6,  4,  3,  2]
];
//*/
/*
const startingPosition = [
	[ 0,  0,  0, -2, -2, -2, -6,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 0,  0,  0,  0,  0,  0,  0,  0],
	[ 2,  0,  0,  0,  6,  0,  0,  2],
];
//*/

let knightVectors = [];
let bishopVectors = [];
let rookVectors   = [];
for(a=0;a<2;a++)for(b=0;b<2;b++)for(c=0;c<2;c++)knightVectors.push([(b+1)*(c?1:-1),(2-b)*(a-c?-1:1)]);
for(a=0;a<2;a++)for(b=0;b<2;b++)bishopVectors.push([a*2-1,b*2-1]);
for(a=0;a<2;a++)for(b=0;b<2;b++)rookVectors.push([a*(b*2-1),(1-a)*(b*2-1)]);
let kingQueenVectors = bishopVectors.concat(rookVectors);

let indexToNotation = (r, f) => 'abcdefgh'[f] + (8 - r);

class Position
{
	constructor() {
		this.boardState = JSON.parse(JSON.stringify(startingPosition));
		this.whiteCanCastleKingside = true;
		this.whiteCanCastleQueenside = true;
		this.blackCanCastleKingside = true;
		this.blackCanCastleQueenside = true;
		this.quastlingWhiteKingside = true;
		this.quastlingWhiteQueenside = true;
		this.quastlingBlackKingside = true;
		this.quastlingBlackQueenside = true;
		this.enPassantSquare = null;
		this.lastCastlingEndSquare = null;
		this.SteveSquare = null;
		this.potentialLongPassantSquare = null;
		this.whiteToMove = true;
	}
}

let currentPosition = new Position();

class Move
{
	constructor() {
		this.newPosition = new Position();
		this.notation = '';
	}
}

let getStandardMoveFunctions =
[
	getQueenMoves, getKnightMoves, getRookMoves, getBishopMoves, getKingMoves, getPawnMoves, getCastlingMoves
];

let getAnarchyMoveFunctions = [];

let getMoveFunctions = getStandardMoveFunctions.concat(getAnarchyMoveFunctions);

let filterLegalMoves = (moveList) =>
{
	let moves = [];
	for(m in moveList)
	{
		let move = moveList[m];
		let subsequentMoves = getMoves(move.newPosition);
		let legal = true;
		for(sm in subsequentMoves)
		{
			let subsequentMove = subsequentMoves[sm];
			let subsequentBoardState = subsequentMove.newPosition.boardState;
			let kings = 0;
			for(let r = 0; r < 8; r++)
			for(let f = 0; f < 8; f++)
			{
				if(Math.abs(subsequentBoardState[r][f]) == 6)
				{
					kings++;
				}
			}
			if(kings != 2) legal = false;
		}
		if(legal) moves.push(move);
	}
	return moves;
}

let getMoves = (position) =>
{
	let moves = [];
	for(let mf in getMoveFunctions)
	{
		newMoves = getMoveFunctions[mf](position);
		for(let nm in newMoves) moves.push(newMoves[nm]);
	}
	return moves;
}

let getLegalMoves = (position) =>
{
	let moves = getMoves(position);
	moves = filterLegalMoves(moves);
	return moves;
}

let executeMove = (move) =>
{
	currentPosition = JSON.parse(JSON.stringify(move.newPosition));
}
