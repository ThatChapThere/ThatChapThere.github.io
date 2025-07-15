/*
boardState = Array(64).fill(Pieces.EMPTY);
boardState[0] = black(Pieces.KING);
boardState[63] = white(Pieces.KING_WHOSE_TURN_IT_IS);
boardState[23] = white(Pieces.ROOK);
//*/

let whitebot = false;
let blackbot = true;
let removingPieces = true;
let boardStates = [boardState.reduce( (a, c) => a + c, '')];
let fiftyMoveCounter = 0;
let gameOver = false;
let termination = '';

function isDead(position) {
    let bishops = [0, 0];
    let knights = 0;
    for(let i = 0; i < 64; i++)
    {
        switch(white(position[i])) {
            case Pieces.CASTLEABLE_ROOK:
            case Pieces.ROOK:
            case Pieces.QUEEN:
            case Pieces.PAWN:
                return false;
            case Pieces.KNIGHT:
                knights++;
                break;
            case Pieces.BISHOP:
                bishops[(i + Math.floor(i/8) % 2)%2]++;
                break;
            default:
                break;
        }
        if(knights > 1) return false;
        if((bishops[0] + bishops[1]) > 0 && knights > 0) return false;
        if(bishops[0] > 0 && bishops[1] > 0) return false;
    }
    return true;
}

function isThreefold(boardStates) {
    let counters = {};
    for(let i = 0; i < boardStates.length; i++)
        counters[boardStates[i]]++
    return Math.max(...Object.values(counters)) >= 3;
}

function executeMoveOnBoard(move) {
    if(boardState[move[1]] || white(boardState[move[0]]) === white(Pieces.PAWN))
        fiftyMoveCounter = 0;
    else fiftyMoveCounter++;
    boardState = executeMove(boardState, move);
    legalMoves = getLegalMoves(boardState);
    boardStates.push(boardState.reduce((a, c) => a + c, ''));
    if(fiftyMoveCounter === 100) {
        gameOver = true;
        termination = 'draw by fifty-move rule';
    }
    if(isDead(boardState)) {
        gameOver = true;
        termination = 'draw by dead position';
    }
    if(isThreefold(boardStates)) {
        gameOver = true;
        termination = 'draw by threefold repetition';
    }
    if(!legalMoves.length) {
        gameOver = true;
        let whiteToMove = boardState.includes(white(Pieces.KING_WHOSE_TURN_IT_IS));
        let side = whiteToMove ? white : black;
        let kingPosition = boardState.indexOf(side(Pieces.KING_WHOSE_TURN_IT_IS));
        if(isSquareControlledBy(boardState, kingPosition, whiteToMove ? black : white))
            termination = 'win by checkmate';
        else termination = 'draw by stalemate';
    }
}

function newGame() {
    newGameButton.disabled = true;
    fiftyMoveCounter = 0;
    boardState = STARTING_POSITION;
    legalMoves = getLegalMoves(boardState);
    boardStates = [boardState.reduce( (a, c) => a + c, '')];
    gameOver = false;
    gameLoop();
}

function gameLoop() {
    if(gameOver) {
        newGameButton.disabled = false;
        return;
    }
    let whiteToMove = boardState.includes(white(Pieces.KING_WHOSE_TURN_IT_IS));
    if(whiteToMove && whitebot || !whiteToMove && blackbot) {
        if(removingPieces) boardState = removeRandomPiece(boardState);
        executeMoveOnBoard(legalMoves[Math.floor(Math.random() * legalMoves.length)]);
    } else if(legalMoves.some(m => m[0] === clientMove[0] && m[1] === clientMove[1])) {
        executeMoveOnBoard(clientMove);
    }
    setTimeout(gameLoop, 0);
}

legalMoves = getLegalMoves(boardState);
gameLoop();
drawLoop();