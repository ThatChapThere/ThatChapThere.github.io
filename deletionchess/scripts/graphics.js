function drawLoop() {
    for(const pieceImage in pieceImages) {
        if(!pieceImages[pieceImage].complete) {
            setTimeout(drawLoop, 0);
            return;
        }
    }
    ctx.fillStyle = lightSquareColour;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = darkSquareColour;
    let dragLocations = legalMoves.filter(m => m[0] === dragSquare).map(m => m[1]);
    if(latestDragSquare === -1 || dragSquare === -1) latestDragSquare = dragSquare;
    if(dragLocations.concat(dragSquare).includes(mouseSquare)) latestDragSquare = mouseSquare;
    for(let i = 0; i < 8; i++)
    for(let j = 0; j < 8; j++) {
        const drawLocation = [i * squareSize, j * squareSize, squareSize, squareSize];
        const squareIndex = i + 8 * j;
        if((i + j) % 2) colouredRect(darkSquareColour, ...drawLocation);
        if(squareIndex === dragSquare && dragLocations.length) colouredRect(dragSquareColour, ...drawLocation);
        if(dragLocations.includes(squareIndex)) colouredRect(dragToSquareColour, ...drawLocation);
        let piece = boardState[squareIndex];
        if(pieceImages[piece] && squareIndex != dragSquare)
            ctx.drawImage(pieceImages[piece], ...drawLocation);
        // promotion
        if(
            dragLocations.includes(squareIndex) &&
            white(boardState[dragSquare]) === white(Pieces.PAWN) &&
            squareIndex - dragSquare === boardState[dragSquare] * Math.abs(squareIndex - dragSquare)
        ) {
            piece = boardState[dragSquare] * (Pieces.PAWN + Math.abs((squareIndex>>3) - (dragSquare>>3)));
            if(pieceImages[piece]) ctx.drawImage(pieceImages[piece], ...drawLocation);
        }
        if(pieceImages[boardState[dragSquare]] && squareIndex === latestDragSquare)
            ctx.drawImage(pieceImages[boardState[dragSquare]], ...drawLocation);
    }
    if(gameOver){
        ctx.fillStyle = '#80808080';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = 'black';
        ctx.font = '50px serif';
        ctx.textAlign = 'center';
        ctx.fillText(termination, canvasSize / 2, canvasSize / 2);
    }
    setTimeout(drawLoop, 0);
}