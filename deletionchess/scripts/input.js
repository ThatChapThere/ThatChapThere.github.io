cnv.onmousedown = function(e) {
    dragSquare = mouseSquare;
}

window.onmouseup = function(e) {
    clientMove = [dragSquare, mouseSquare];
    dragSquare = -1;
}

window.onmousemove = function(e) {
    let offset = cnv.getBoundingClientRect();
    mouse = [e.clientX - offset.left, e.clientY - offset.top];
    mouseSquare = Math.floor(mouse[0] / squareSize) + Math.floor(mouse[1] / squareSize) * 8;
}

window.onkeyup = function(e) {
    if(e.key === 'Enter' && gameOver)
        newGame();
}

newGameButton.onclick = function(e) {
    newGame();
}