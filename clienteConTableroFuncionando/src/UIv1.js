import { UI_BUILDER } from "./Ui.js";
import { ELEMENTS } from "./entities/Board.js";

export const UIv1 = UI_BUILDER.init();

UIv1.initUI = () => {
    const base = document.getElementById(UIv1.uiElements.board);
    base.classList.add("board");
}

UIv1.drawBoard = (board) => {
    if (board !== undefined) {
        const base = document.getElementById(UIv1.uiElements.board);
        base.innerHTML = '';
        base.style.gridTemplateColumns = `repeat(${board.length}, 100px)`;
        base.style.gridTemplateRows = `repeat(${board.length}, 100px)`;
        board.forEach((row, x) => row.forEach((cell, y) => {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            base.appendChild(tile);
            tile.dataset.x = x;
            tile.dataset.y = y;
            console.log(`Dibujando tile en (${x}, ${y}):`, tile); // Verificar los elementos del DOM
            if (cell === ELEMENTS.bush) {
                tile.classList.add("bush");
            }
            anime({
                targets: tile,
                opacity: [0, 1],
                duration: (Math.random() * 8000) + 1000,
                easing: 'easeInOutQuad'
            });
        }));
    }
}

UIv1.getTile = (x, y) => {
    const tile = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
    console.log(`Buscando tile en (${x}, ${y}):`, tile); // Verificar los elementos del DOM
    return tile;
}

UIv1.drawPlayers = (players) => {
    console.log("Dibujando jugadores:", players); // Verificar los datos de los jugadores
    players.forEach(player => {
        player.forEach(playerU => {
            console.log(player);
            console.log(playerU);
            const tile = UIv1.getTile(playerU.x, playerU.y);
            console.log(tile);

            if (tile) {
                tile.classList.add("player");
            } else {
                console.error(`Tile not found for player at (${player.x}, ${player.y})`);
        }
        });
        
    });
}

UIv1.drawBoard();

