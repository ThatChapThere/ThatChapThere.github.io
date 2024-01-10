let executeStandardMove = (position, r, f, er, ef) =>
{
	position.boardState[er][ef] = position.boardState[r][f];
	position.boardState[r][f] = 0;
	if(position.lastCastlingEndSquare)
	{
		let cr = position.lastCastlingEndSquare[0];
		let cf = position.lastCastlingEndSquare[1];
		if(
			er == cr &&
			(ef == 4 || ef == (cf + 4) / 2)
		) position.boardState[cr][cf] = 0;
	}
	position.whiteToMove = !position.whiteToMove;
	position.enPassantFile = null;
	position.enPassantSquare = null;
	position.SteveSquare = null;
	position.potentialLongPassantSquare = null;
	position.lastCastlingEndSquare = null;
}

let executeEnPassant = (position, r, f, er, ef) =>
{
	executeStandardMove(position, r, f, er, ef);
	position.boardState[r][ef] = 0; // capture pawn
}

let executePromotion = (position, r, f, er, ef, piece) =>
{
	executeStandardMove(position, r, f, er, ef);
	position.boardState[er][ef] = piece;
}

let executeCastling = (position, r, f, er, ef) =>
{
	rookValue = position.whiteToMove ? 2 : -2; // move rook
	executeStandardMove(position, r, f, er, ef);
	if(ef < f) // queenside
	{
		position.boardState[r][0] = 0;
		position.boardState[r][3] = rookValue;
	}
	else // kingside
	{
		position.boardState[r][7] = 0;
		position.boardState[r][5] = rookValue;
	}
	position.lastCastlingEndSquare = [er, ef];
}

let getQueenMoves = (position) =>
{
	let queenMoves = [];
	let queenValue = position.whiteToMove ? 5 : -5;
	for(let r = 0; r < 8; r++)
	for(let f = 0; f < 8; f++)
	{
		if(position.boardState[r][f] == queenValue)
		{
			for(q in kingQueenVectors)
			{
				let er = r + kingQueenVectors[q][0];
				let ef = f + kingQueenVectors[q][1];
				while(true)
				{
					if(!(0 <= er && er <= 7)) break; // off board
					if(!(0 <= ef && ef <= 7)) break;
					if(position.whiteToMove) { if(position.boardState[er][ef] > 0) break; } // self capture
					else                     { if(position.boardState[er][ef] < 0) break; }
					let queenMove = new Move();
					queenMove.newPosition = JSON.parse(JSON.stringify(position));
					executeStandardMove(queenMove.newPosition, r, f, er, ef);
					queenMoves.push(queenMove);
					queenMove.notation = 'Qx' + indexToNotation(er, ef);
					if(position.boardState[er][ef]) break; // capture
					queenMove.notation = 'Q' + indexToNotation(er, ef);
					er += kingQueenVectors[q][0];
					ef += kingQueenVectors[q][1];
				}
			}
		}
	}
	return queenMoves;
}

let getBishopMoves = (position) =>
{
	let bishopMoves = [];
	bishopValue = position.whiteToMove ? 4 : -4;
	for(let r = 0; r < 8; r++)
	for(let f = 0; f < 8; f++)
	{
		if(position.boardState[r][f] == bishopValue)
		{
			for(b in bishopVectors)
			{
				let er = r + bishopVectors[b][0];
				let ef = f + bishopVectors[b][1];
				while(true)
				{
					if(!(0 <= er && er <= 7)) break; // off board
					if(!(0 <= ef && ef <= 7)) break;
					if(position.whiteToMove) { if(position.boardState[er][ef] > 0) break; } // self capture
					else                     { if(position.boardState[er][ef] < 0) break; }
					bishopMove = new Move();
					bishopMove.newPosition = JSON.parse(JSON.stringify(position));
					executeStandardMove(bishopMove.newPosition, r, f, er, ef);
					bishopMoves.push(bishopMove);
					bishopMove.notation = 'Bx' + indexToNotation(er, ef);
					if(position.boardState[er][ef]) break; // capture
					bishopMove.notation = 'B' + indexToNotation(er, ef);
					er += kingQueenVectors[b][0];
					ef += kingQueenVectors[b][1];
				}
			}
		}
	}
	return bishopMoves;
}

let getRookMoves = (position) =>
{
	let rookMoves = [];
	rookValue = position.whiteToMove ? 2 : -2;
	for(let r = 0; r < 8; r++)
	for(let f = 0; f < 8; f++)
	{
		if(position.boardState[r][f] == rookValue)
		{
			for(rv in rookVectors)
			{
				let er = r + rookVectors[rv][0];
				let ef = f + rookVectors[rv][1];
				while(true)
				{
					if(!(0 <= er && er <= 7)) break; // off board
					if(!(0 <= ef && ef <= 7)) break;
					if(position.whiteToMove) { if(position.boardState[er][ef] > 0) break; } // self capture
					else                     { if(position.boardState[er][ef] < 0) break; }
					rookMove = new Move();
					rookMove.newPosition = JSON.parse(JSON.stringify(position));
					executeStandardMove(rookMove.newPosition, r, f, er, ef);
					if(position.whiteToMove)
					{
						if(f == 7) rookMove.newPosition.whiteCanCastleKingside = false;
						if(f == 0) rookMove.newPosition.whiteCanCastleQueenside = false;
					}
					else
					{
						if(f == 7) rookMove.newPosition.blackCanCastleKingside = false;
						if(f == 0) rookMove.newPosition.blackCanCastleQueenside = false;
					}
					rookMoves.push(rookMove);
					rookMove.notation = 'Rx' + indexToNotation(er, ef);
					if(position.boardState[er][ef] * (position.whiteToMove?1:-1) < 0) break; // capture
					rookMove.notation = 'R' + indexToNotation(er, ef);
					er += rookVectors[rv][0];
					ef += rookVectors[rv][1];
				}
			}
		}
	}
	return rookMoves;
}

let getKnightMoves = (position) =>
{
	let knightMoves = [];
	knightValue = position.whiteToMove ? 3 : -3;
	for(let r = 0; r < 8; r++)
	for(let f = 0; f < 8; f++)
	{
		if(position.boardState[r][f] == knightValue)
		{
			for(k in knightVectors)
			{
				let er = r + knightVectors[k][0];
				let ef = f + knightVectors[k][1];
				if(!(0 <= er && er <= 7)) continue; // off board
				if(!(0 <= ef && ef <= 7)) continue;
				if(position.whiteToMove) { if(position.boardState[er][ef] > 0) continue; } // self capture
				else                     { if(position.boardState[er][ef] < 0) continue; }
				knightMove = new Move();
				knightMove.newPosition = JSON.parse(JSON.stringify(position));
				executeStandardMove(knightMove.newPosition, r, f, er, ef);
				knightMoves.push(knightMove);
				knightMove.notation = 'Nx' + indexToNotation(er, ef);
				if(position.boardState[er][ef]) continue; // capture
				knightMove.notation = 'N' + indexToNotation(er, ef);
			}
		}
	}
	return knightMoves;
}

let getKingMoves = (position) =>
{
	let kingMoves = [];
	kingValue = position.whiteToMove ? 6 : -6;
	for(let r = 0; r < 8; r++)
	for(let f = 0; f < 8; f++)
	{
		if(position.boardState[r][f] == kingValue)
		{
			for(k in kingQueenVectors)
			{
				let er = r + kingQueenVectors[k][0];
				let ef = f + kingQueenVectors[k][1];
				if(!(0 <= er && er <= 7)) continue; // off board
				if(!(0 <= ef && ef <= 7)) continue;
				if(position.whiteToMove) { if(position.boardState[er][ef] > 0) continue; } // self capture
				else                     { if(position.boardState[er][ef] < 0) continue; }
				kingMove = new Move();
				kingMove.newPosition = JSON.parse(JSON.stringify(position));
				executeStandardMove(kingMove.newPosition, r, f, er, ef);
				if(position.whiteToMove)
				{
					kingMove.newPosition.whiteCanCastleKingside = false;
					kingMove.newPosition.whiteCanCastleQueenside = false;
				}
				else
				{
					kingMove.newPosition.blackCanCastleKingside = false;
					kingMove.newPosition.blackCanCastleQueenside = false;
				}
				kingMoves.push(kingMove);
				kingMove.notation = 'Kx' + indexToNotation(er, ef);
				if(position.boardState[er][ef]) continue; // capture
				kingMove.notation = 'K' + indexToNotation(er, ef);
			}
		}
	}
	return kingMoves;
}

let getPawnMoves = (position) =>
{
	let pawnMoves = [];
	pawnValue = position.whiteToMove ? 1 : -1;
	for(let r = 0; r < 8; r++)
	for(let f = 0; f < 8; f++)
	{
		if(position.boardState[r][f] == pawnValue)
		{
			if(position.whiteToMove)
			{
				// straight pawn moves
				if(position.boardState[r-1][f] == 0)
				{
					if(r == 1)
					{
						for(let promotionValue = 2; promotionValue <= 5; promotionValue++)
						{
							pawnMove = new Move();
							pawnMove.newPosition = JSON.parse(JSON.stringify(position));
							executePromotion(pawnMove.newPosition, r, f, r-1, f, promotionValue);
							pawnMove.notation = indexToNotation(r - 1, f);
							pawnMove.notation += '  RNBQ'[promotionValue];
							pawnMoves.push(pawnMove);
						}
					}
					else
					{
						pawnMove = new Move();
						pawnMove.newPosition = JSON.parse(JSON.stringify(position));
						executeStandardMove(pawnMove.newPosition, r, f, r-1, f);
						pawnMove.notation = indexToNotation(r - 1, f);
						pawnMoves.push(pawnMove);
					}
					// double pawn move
					if(r == 6)
					if(position.boardState[r-2][f] == 0)
					{
						pawnMove = new Move();
						pawnMove.newPosition = JSON.parse(JSON.stringify(position));
						executeStandardMove(pawnMove.newPosition, r, f, r-2, f);
						pawnMove.newPosition.enPassantSquare = [r-1, f];
						pawnMove.notation = indexToNotation(r - 2, f);
						pawnMoves.push(pawnMove);
					}
				}
				//captures
				for(let cf = -1; cf <= 1; cf += 2)
				{
					// guard clause for off board moves
					if(!(0 <= f + cf && f + cf <= 7)) continue;
					if(position.boardState[r-1][f+cf] < 0)
					{
						// promotion
						if(r == 1)
						{
							for(let promotionValue = 2; promotionValue <= 5; promotionValue++)
							{
								let pawnMove = new Move();
								pawnMove.newPosition = JSON.parse(JSON.stringify(position));
								executePromotion(pawnMove.newPosition, r, f, r-1, f+cf, promotionValue);
								pawnMove.notation = indexToNotation(r,f)[0] + 'x' + indexToNotation(r - 1, f + cf);
								pawnMove.notation += '  RNBQ'[promotionValue];
								pawnMoves.push(pawnMove);
							}
						}
						else
						{
							let pawnMove = new Move();
							pawnMove.newPosition = JSON.parse(JSON.stringify(position));
							executeStandardMove(pawnMove.newPosition, r, f, r-1, f+cf);
							pawnMove.notation = indexToNotation(r,f)[0] + 'x' + indexToNotation(r - 1, f + cf);
							pawnMoves.push(pawnMove);
						}
					}
					else if(
						position.enPassantSquare &&
						r - 1 == position.enPassantSquare[0] &&
						f+cf == position.enPassantSquare[1]
					){
						let pawnMove = new Move();
						pawnMove.newPosition = JSON.parse(JSON.stringify(position));
						executeEnPassant(pawnMove.newPosition, r, f, r-1, f+cf);
						pawnMove.notation = indexToNotation(r,f)[0] + 'x' + indexToNotation(r - 1, f + cf);
						pawnMoves.push(pawnMove);
					}
				}
			}
			// black pawn moves
			else
			{
				// straight pawn moves
				if(position.boardState[r+1][f] == 0)
				{
					if(r == 6)
					{
						for(let promotionValue = 2; promotionValue <= 5; promotionValue++)
						{
							pawnMove = new Move();
							pawnMove.newPosition = JSON.parse(JSON.stringify(position));
							executePromotion(pawnMove.newPosition, r, f, r+1, f, -promotionValue);
							pawnMove.notation = indexToNotation(r,f)[0] + indexToNotation(r + 1, f);
							pawnMove.notation += '  RNBQ'[promotionValue];
							pawnMoves.push(pawnMove);
						}
					}
					else
					{
						pawnMove = new Move();
						pawnMove.newPosition = JSON.parse(JSON.stringify(position));
						executeStandardMove(pawnMove.newPosition, r, f, r+1, f);
						pawnMove.notation = indexToNotation(r + 1, f);
						pawnMoves.push(pawnMove);
					}
					// double pawn move
					if(r == 1)
					if(position.boardState[r+2][f] == 0)
					{
						pawnMove = new Move();
						pawnMove.newPosition = JSON.parse(JSON.stringify(position));
						executeStandardMove(pawnMove.newPosition, r, f, r+2, f);
						pawnMove.newPosition.enPassantSquare = [r+1, f];
						pawnMove.notation = indexToNotation(r + 2, f);
						pawnMoves.push(pawnMove);
					}
				}
				//captures
				for(let cf = -1; cf <= 1; cf += 2)
				{
					// guard clause for off board moves
					if(!(0 <= f + cf && f + cf <= 7)) continue;
					if(position.boardState[r+1][f+cf] > 0)
					{
						// promotion
						if(r + 1 == 7)
						{
							for(let promotionValue = 2; promotionValue <= 5; promotionValue++)
							{
								pawnMove = new Move();
								pawnMove.newPosition = JSON.parse(JSON.stringify(position));
								executePromotion(pawnMove.newPosition, r, f, r+1, f+cf, -promotionValue);
								pawnMove.notation = indexToNotation(r,f)[0] + 'x' + indexToNotation(r + 1, f + cf);
								pawnMove.notation += '  RNBQ'[promotionValue];
								pawnMoves.push(pawnMove);
							}
						}
						else
						{
							pawnMove = new Move();
							pawnMove.newPosition = JSON.parse(JSON.stringify(position));
							executeStandardMove(pawnMove.newPosition, r, f, r+1, f+cf);
							pawnMove.notation = indexToNotation(r,f)[0] + 'x' + indexToNotation(r + 1, f + cf);
							pawnMoves.push(pawnMove);
						}
					}
					else if(
						position.enPassantSquare &&
						r + 1 == position.enPassantSquare[0] &&
						f+cf == position.enPassantSquare[1]
					){
						let pawnMove = new Move();
						pawnMove.newPosition = JSON.parse(JSON.stringify(position));
						executeEnPassant(pawnMove.newPosition, r, f, r+1, f+cf);
						pawnMove.notation = indexToNotation(r,f)[0] + 'x' + indexToNotation(r + 1, f + cf);
						pawnMoves.push(pawnMove);
					}
				}
			}
		}
	}
	return pawnMoves;
}

let getCastlingMoves = (position) =>
{
	let castlingMoves = [];
	if(position.whiteToMove)
	{
		const r = 7;
		if(position.whiteCanCastleQueenside)
		{
			// we can assume that the rook and king are in place
			let castlingBlocked = false;
			for(let f = 1; f <= 3; f++)
			{
				if(position.boardState[r][f])
				{
					castlingBlocked = true;
					break;
				}
			}
			if(!castlingBlocked)
			{
				let castlingMove = new Move();
				castlingMove.newPosition = JSON.parse(JSON.stringify(position));
				executeCastling(castlingMove.newPosition, r, 4, r, 2);
				castlingMove.notation = 'O-O-O';
				castlingMoves.push(castlingMove);
			}
		}
		if(position.whiteCanCastleKingside)
		{
			let castlingBlocked = false;
			for(let f = 5; f <= 6; f++)
			{
				if(position.boardState[r][f])
				{
					castlingBlocked = true;
					break;
				}
			}
			if(!castlingBlocked)
			{
				let castlingMove = new Move();
				castlingMove.newPosition = JSON.parse(JSON.stringify(position));
				executeCastling(castlingMove.newPosition, r, 4, r, 6);
				castlingMove.notation = 'O-O';
				castlingMoves.push(castlingMove);
			}
		}
	}
	else
	{
		const r = 0;
		if(position.blackCanCastleQueenside)
		{
			// we can assume that the rook and king are in place
			let castlingBlocked = false;
			for(let f = 1; f <= 3; f++)
			{
				if(position.boardState[r][f])
				{
					castlingBlocked = true;
					break;
				}
			}
			if(!castlingBlocked)
			{
				let castlingMove = new Move();
				castlingMove.newPosition = JSON.parse(JSON.stringify(position));
				executeCastling(castlingMove.newPosition, r, 4, r, 2);
				castlingMove.notation = 'O-O-O';
				castlingMoves.push(castlingMove);
			}
		}
		if(position.blackCanCastleKingside)
		{
			let castlingBlocked = false;
			for(let f = 5; f <= 6; f++)
			{
				if(position.boardState[r][f])
				{
					castlingBlocked = true;
					break;
				}
			}
			if(!castlingBlocked)
			{
				let castlingMove = new Move();
				castlingMove.newPosition = JSON.parse(JSON.stringify(position));
				executeCastling(castlingMove.newPosition, r, 4, r, 6);
				castlingMove.notation = 'O-O';
				castlingMoves.push(castlingMove);
			}
		}
	}
	return castlingMoves;
}
