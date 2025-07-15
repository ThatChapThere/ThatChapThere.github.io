const moveVectors = {};
moveVectors[Pieces.BISHOP] = [7, 9];
moveVectors[Pieces.ROOK] = [1, 8];
moveVectors[Pieces.KNIGHT] = [6, 10, 15, 17];
for(const piece in moveVectors) moveVectors[piece] = moveVectors[piece].concat(moveVectors[piece].map(v => -v));
moveVectors[Pieces.QUEEN] = [].concat(moveVectors[Pieces.BISHOP], moveVectors[Pieces.ROOK]);
moveVectors[Pieces.CASTLEABLE_ROOK] = moveVectors[Pieces.ROOK];
moveVectors[Pieces.KING] = moveVectors[Pieces.QUEEN];
moveVectors[Pieces.KING_WHOSE_TURN_IT_IS] = moveVectors[Pieces.KING];
for(const piece in moveVectors) moveVectors[black(piece)] = moveVectors[piece];
moveVectors[Pieces.PAWN] = [-7, -8, -9];
moveVectors[black(Pieces.PAWN)] = moveVectors[Pieces.PAWN].map(v => -v);
Object.freeze(moveVectors);

function isSquareControlledBy(position, square, side) {
    let piece = Pieces.BISHOP;
    for(let v = 0 ; v < moveVectors[piece].length; v++) { // all move directions
        let moveVector = moveVectors[piece][v];
        for(let d = 1; onBoard(square, moveVector, d); d++)
        {
            let endPiece = position[square + moveVector * d];
            if(endPiece && endPiece !== -side(Pieces.EN_PASSANTABLE_SQUARE)) {
                if(
                    endPiece === side(Pieces.BISHOP) ||
                    endPiece === side(Pieces.QUEEN)  ||
                    d === 1 && (endPiece === side(Pieces.KING) || endPiece === side(Pieces.KING_WHOSE_TURN_IT_IS))
                ) return true;
                break;
            }
        }
    }
    piece = Pieces.ROOK;
    for(let v = 0 ; v < moveVectors[piece].length; v++) { // all move directions
        let moveVector = moveVectors[piece][v];
        for(let d = 1; onBoard(square, moveVector, d); d++)
        {
            let endPiece = position[square + moveVector * d];
            if(endPiece && endPiece !== -side(Pieces.EN_PASSANTABLE_SQUARE)) {
                if(
                    endPiece === side(Pieces.ROOK) ||
                    endPiece === side(Pieces.CASTLEABLE_ROOK) ||
                    endPiece === side(Pieces.QUEEN)  ||
                    d === 1 && (endPiece === side(Pieces.KING) || endPiece === side(Pieces.KING_WHOSE_TURN_IT_IS))
                ) return true;
                break;
            }
        }
    }
    piece = Pieces.KNIGHT;
    for(let v = 0 ; v < moveVectors[piece].length; v++) { // all move directions
        let moveVector = moveVectors[piece][v];
        if(onBoard(square, moveVector, 1)) {
            let endPiece = position[square + moveVector];
            if(endPiece) {
                if(endPiece === side(Pieces.KNIGHT)) return true;
            }
        }
    }
    piece = (side === white ? black : white)(Pieces.PAWN); // opposite pawn move because we're scanning backwards
    for(let v = 0 ; v < moveVectors[piece].length; v++) { // all move directions
        let moveVector = moveVectors[piece][v];
        if(!((moveVector + 64) % 8)) continue; // must be diagonal
        if(onBoard(square, moveVector, 1)) {
            let endPiece = position[square + moveVector];
            if(endPiece) {
                if(endPiece === side(Pieces.PAWN)) return true;
            }
        }
    }
    return false;
}

function isLegal(position) {
    let whiteToMove = position.includes(white(Pieces.KING_WHOSE_TURN_IT_IS));
    let side = whiteToMove ? black : white; // opposite side to move
    let kingPosition = position.indexOf(side(Pieces.KING));
    return !isSquareControlledBy(position, kingPosition, whiteToMove ? white : black);
}

function getLegalMoves(position) {
    let legalMoves = [];
    let whiteToMove = position.includes(white(Pieces.KING_WHOSE_TURN_IT_IS));
    let side = whiteToMove ? white : black;
    for(let i = 0; i < 64; i++) if(position[i]) { // all non empty squares
        let piece = position[i];
        if((piece > 0) === whiteToMove) { // all correctly coloured pieces
            for(let v = 0 ; v < moveVectors[piece].length; v++) { // all move directions
                let moveVector = moveVectors[piece][v];
                for(let d = 1; onBoard(i, moveVector, d); d++)
                {
                    if(d > 1) {
                        if(piece === side(Pieces.KNIGHT)) break;
                        if(d > 2) {
                            if(piece === side(Pieces.PAWN) || piece === side(Pieces.KING_WHOSE_TURN_IT_IS)) break;
                        }
                    }
                    let endPiece = position[i + moveVector * d];
                    if(piece * endPiece > 0) break;
                    if(piece === side(Pieces.PAWN)) {
                        if(((moveVector + 64) % 8)) { // diagonal 
                            if(d > 1) break;
                            if(!endPiece) break;
                        } else {
                            if(endPiece) break;
                            if(d > 1 && !pawnStartingRank(i)) break;
                        }
                    }
                    if(piece === side(Pieces.KING_WHOSE_TURN_IT_IS)) {
                        if(d==2) { // castling
                            if(!kingStartingSquare(i)) break;
                            if(endPiece) break;
                            if(Math.abs(moveVector) !== 1) break; // break if not horizontal
                            let castlingThroughCheck = false;
                            for(let c = 0; c <= moveVector; c += moveVector / 2)
                            {
                                if(isSquareControlledBy(position, i + c, whiteToMove ? black : white))
                                    castlingThroughCheck = true;
                            }
                            if(castlingThroughCheck) break;
                            if(position[rookStartingSquare(i, moveVector)] != side(Pieces.CASTLEABLE_ROOK)) break;
                        }
                    }
                    if(piece === side(Pieces.PAWN) && promotionRank(i + moveVector))
                        for(let d = 2; d <= 5; d++)
                            legalMoves.push(Object.freeze([i, i + moveVector + side(d * 8)]));
                    else legalMoves.push(Object.freeze([i, i + moveVector * d]));
                    if(endPiece && endPiece !== -side(Pieces.EN_PASSANTABLE_SQUARE)) break;
                }
            }
        }
    }
    // eliminate moving into / failing to move out of check
    legalMoves = legalMoves.filter(m => isLegal(executeMove(position, m)));
    return legalMoves;
}

function executeMove(position, move) {
    position = position.slice(); // make sure it's not a reference to the same position
    let whiteToMove = position.includes(white(Pieces.KING_WHOSE_TURN_IT_IS));
    let side = whiteToMove ? white : black;
    let piece = position[move[0]];
    // castling invalidation
    if(piece === side(Pieces.CASTLEABLE_ROOK)) piece = side(Pieces.ROOK);
    if(piece === side(Pieces.KING_WHOSE_TURN_IT_IS))
        position = position.map(p => p === side(Pieces.CASTLEABLE_ROOK) ? side(Pieces.ROOK) : p);
    // castling execution
    if(piece === side(Pieces.KING_WHOSE_TURN_IT_IS) && Math.abs(move[0] - move[1]) == 2) {
        position[(move[0] + move[1]) / 2] = side(Pieces.ROOK);
        position[rookStartingSquare(move[0], move[1] - move[0])] = Pieces.EMPTY;
    }
    // En Passant execution
    if(position[move[1]] === -side(Pieces.EN_PASSANTABLE_SQUARE))
    {
        position[move[1] + side(8)] = Pieces.EMPTY;
    }
    // En Passant decay
    if(position.includes(-side(Pieces.EN_PASSANTABLE_SQUARE))){
        position[position.indexOf(-side(Pieces.EN_PASSANTABLE_SQUARE))] = Pieces.EMPTY;
    }
    // En Passant creation
    if(piece === side(Pieces.PAWN) && Math.abs(move[0] - move[1]) === 16)
        position[(move[0] + move[1]) / 2] = side(Pieces.EN_PASSANTABLE_SQUARE);
    // Promotion
    if(piece === side(Pieces.PAWN) && move[1] - move[0] === side(move[1] - move[0])) {
        piece = side(Pieces.PAWN + Math.abs((move[0]>>3) - (move[1]>>3)));
        move = move.slice(); // don't mutate actual move object
        move[1] = move[1] % 8 + (whiteToMove ? 0 : 56);
    }
    // final move execution
    position[move[1]] = piece;
    position[move[0]] = Pieces.EMPTY;
    // swap sides
    position[position.indexOf(side(Pieces.KING_WHOSE_TURN_IT_IS))] = side(Pieces.KING);
    position[position.indexOf(-side(Pieces.KING))] = -side(Pieces.KING_WHOSE_TURN_IT_IS);
    return(position);
}

function removeRandomPiece(position) {
    position = position.slice(); // make sure it's not a reference to the same position
    let whiteToMove = position.includes(white(Pieces.KING_WHOSE_TURN_IT_IS));
    let side = whiteToMove ? white : black;
    let removablePieces = [];
    for(let i = 0; i < 64; i++) {
        let piece = position[i];
        if(!piece) continue;
        if(piece === side(piece)) continue;
        if(piece === -side(Pieces.KING)) continue;
        // create position with only own pieces
        let testPosition = position.map(p => p === side(p) ? p : Pieces.EMPTY);
        // that are not giving check
        testPosition[i] = position[i];
        let kingPosition = position.indexOf(side(Pieces.KING_WHOSE_TURN_IT_IS));
        if(isSquareControlledBy(testPosition, kingPosition, whiteToMove ? black : white)) return position;
        removablePieces.push(i);
    }
    if(removablePieces.length)
        position[removablePieces[Math.floor(Math.random() * removablePieces.length)]] = Pieces.EMPTY;
    return position;
}