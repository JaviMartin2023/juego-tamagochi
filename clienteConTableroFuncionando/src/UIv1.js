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
        board.forEach((row, y) => row.forEach((cell, x) => {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            base.appendChild(tile);
            tile.dataset.x = x;
            tile.dataset.y = y;
            console.log(`Dibujando tile en (${x}, ${y}):`, tile);
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
    return tile;
}

UIv1.drawPlayers = (players) => {
    console.log("Dibujando jugadores:", players);
    players.forEach(player => {
        player.forEach((playerU, index) => {
            let antX = playerU.x;
            let antY = playerU.y;

            switch (playerU.direction) {
                case "right":
                    antX = playerU.x - 1;
                    break;
                case "left":
                    antX = playerU.x + 1;
                    break;
                case "up":
                    antY = playerU.y + 1;
                    break;
                case "down":
                    antY = playerU.y - 1;
                    break;
            }
            const tileAnt = UIv1.getTile(antX, antY);
            if (tileAnt) {
                tileAnt.classList.remove(`player-${index}`);
            }
            const tile = UIv1.getTile(playerU.x, playerU.y);
            if (tile) {
                tile.classList.remove(`player-${index}`, "up", "down", "left", "right");
                console.log(playerU.direction.toLowerCase());
                tile.classList.add(`player-${index}`, playerU.direction.toLowerCase());
                const shootButton = document.getElementById("shoot");
                if (tile.classList.contains("bush")) {
                    tile.classList.remove("player", playerU.direction.toLowerCase());     
                    if (shootButton) {
                        shootButton.classList.add("hide-button");
                    }
                } else {
                    if (shootButton) {
                        shootButton.classList.remove("hide-button");
                    }
                }
            } else {
                console.error(`Tile not found for player at (${player.x}, ${player.y})`);
        }
        });
        
    });
}

UIv1.drawBoard();

