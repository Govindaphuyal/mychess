document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const chess = new Chess();
    const boardElement = document.querySelector(".chessboard");

    let draggedPiece = null;
    let sourceSquare = null;
    let playerRole = null;

    const renderBoard = () => {
        const board = chess.board();
        boardElement.innerHTML = "";
        board.forEach((row, rowIndex) => {
            row.forEach((column, colIndex) => {
                const squareElement = document.createElement("div");
                squareElement.classList.add('square', (rowIndex + colIndex) % 2 === 0 ? "light" : "dark");
                squareElement.dataset.row = rowIndex;
                squareElement.dataset.col = colIndex;

                if (column) {
                    const pieceElement = document.createElement("div");
                    pieceElement.classList.add("piece", column.color === 'w' ? "white" : "black");
                    pieceElement.innerText = getPiecesUnicode(column);
                    pieceElement.draggable = playerRole === column.color;
                    pieceElement.addEventListener("dragstart", (e) => {
                        if (pieceElement.draggable) {
                            draggedPiece = pieceElement;
                            sourceSquare = { row: rowIndex, col: colIndex };
                            e.dataTransfer.setData("text/plain", '');
                        }
                    });
                    pieceElement.addEventListener("dragend", (e) => {
                        draggedPiece = null;
                        sourceSquare = null;
                    });
                    squareElement.appendChild(pieceElement);
                }

                squareElement.addEventListener("dragover", function (e) {
                    e.preventDefault();
                });

                squareElement.addEventListener("drop", function (e) {
                    e.preventDefault();
                    if (draggedPiece) {
                        const targetSquare = {
                            row: parseInt(squareElement.dataset.row),
                            col: parseInt(squareElement.dataset.col)
                        };
                        handleMove(sourceSquare, targetSquare);
                    }
                });

                boardElement.appendChild(squareElement);
            });
        });
        if(playerRole==="b"){
            boardElement.classList.add("flipped");
        }else{
            boardElement.classList.remove("flipped");

        }
    };

    const handleMove = (source, target) => {
        const move = {
            from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
            to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
            promotion: 'q'  // Always promote to a queen for simplicity
        };

        const moveResult = chess.move(move);
        if (moveResult) {
            socket.emit("move", move);
        } else {
            renderBoard();  // Re-render to reset the position
        }
    };

    const getPiecesUnicode = (piece) => {
        const unicodePieces = {
            p: '♟',
            r: '♜',
            n: '♞',
            b: '♝',
            q: '♛',
            k: '♚',
            P: '♙',
            R: '♖',
            N: '♘',
            B: '♗',
            Q: '♕',
            K: '♔'
        };
        return unicodePieces[piece.type] || "";
    };

    socket.on("playerRole", function (role) {
        playerRole = role;
        renderBoard();
    });

    socket.on("spectatorRole", function () {
        playerRole = null;
        renderBoard();
    });

    socket.on("boardState", function (fen) {
        chess.load(fen);
        renderBoard();
    });

    socket.on("move", function (move) {
        chess.move(move);
        renderBoard();
    });

    renderBoard();
});