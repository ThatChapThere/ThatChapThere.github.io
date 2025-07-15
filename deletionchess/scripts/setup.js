const squareSize = canvasSize / 8;

const newGameButton = document.getElementById('newGameButton');
const cnv = document.getElementById('cnv');
const ctx = cnv.getContext('2d');
cnv.width  =
cnv.height = canvasSize;
cnv.style.width  =
cnv.style.height = canvasSize + 'px';

const Pieces = Object.freeze({
    EMPTY: 0,
    PAWN: 1,
    ROOK: 2,
    KNIGHT: 3,
    BISHOP: 4,
    QUEEN: 5,
    KING: 6,
    CASTLEABLE_ROOK: 7,
    EN_PASSANTABLE_SQUARE: 8,
    KING_WHOSE_TURN_IT_IS: 9,
});

const SIDE_PIECES = Object.freeze([Pieces.CASTLEABLE_ROOK, Pieces.KNIGHT, Pieces.BISHOP]);
const PIECES = Object.freeze([].concat(SIDE_PIECES, Pieces.QUEEN, Pieces.KING, SIDE_PIECES.slice().reverse()));
const PAWNS = Object.freeze(Array(8).fill(Pieces.PAWN));
const STARTING_POSITION = [].concat(
    black(PIECES), black(PAWNS), Array(32).fill(Pieces.EMPTY), white(PAWNS), white(PIECES)
);
STARTING_POSITION[STARTING_POSITION.indexOf(white(Pieces.KING))] = white(Pieces.KING_WHOSE_TURN_IT_IS);
Object.freeze(STARTING_POSITION);

let boardState = STARTING_POSITION;
let whiteToMove = true;
let dragSquare = -1;
let mouse = [0, 0];
let legalMoves = [];
let mouseSquare = -1;
let latestDragSquare = -1;
let clientMove = [-1, -1];