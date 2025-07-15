const wikiUrlStart = 'https://upload.wikimedia.org/wikipedia/commons/';

let pieceImages = {};

pieceImages[white(Pieces.PAWN)]   = '4/45/Chess_plt45.svg';
pieceImages[white(Pieces.ROOK)]   = '7/72/Chess_rlt45.svg';
pieceImages[white(Pieces.KNIGHT)] = '7/70/Chess_nlt45.svg';
pieceImages[white(Pieces.BISHOP)] = 'b/b1/Chess_blt45.svg';
pieceImages[white(Pieces.QUEEN)]  = '1/15/Chess_qlt45.svg';
pieceImages[white(Pieces.KING)]   = '4/42/Chess_klt45.svg';
pieceImages[black(Pieces.PAWN)]   = 'c/c7/Chess_pdt45.svg';
pieceImages[black(Pieces.ROOK)]   = 'f/ff/Chess_rdt45.svg';
pieceImages[black(Pieces.KNIGHT)] = 'e/ef/Chess_ndt45.svg';
pieceImages[black(Pieces.BISHOP)] = '9/98/Chess_bdt45.svg';
pieceImages[black(Pieces.QUEEN)]  = '4/47/Chess_qdt45.svg';
pieceImages[black(Pieces.KING)]   = 'f/f0/Chess_kdt45.svg';

function createPieceImage(urlEnd) {
    let url = wikiUrlStart + urlEnd;
    let image = new Image();
    image.src = url;
    return(image);
}

for(const pieceImage in pieceImages) {
    pieceImages[pieceImage] = createPieceImage(pieceImages[pieceImage]);
}

pieceImages[white(Pieces.CASTLEABLE_ROOK)] = pieceImages[white(Pieces.ROOK)];
pieceImages[black(Pieces.CASTLEABLE_ROOK)] = pieceImages[black(Pieces.ROOK)];
pieceImages[white(Pieces.KING_WHOSE_TURN_IT_IS)] = pieceImages[white(Pieces.KING)];
pieceImages[black(Pieces.KING_WHOSE_TURN_IT_IS)] = pieceImages[black(Pieces.KING)];

Object.freeze(pieceImages);