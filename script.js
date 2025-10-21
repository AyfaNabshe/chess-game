document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const moveHistory = document.getElementById("moveHistory");
    const moveInput = document.getElementById("moveInput");
    const submitMove = document.getElementById("submitMove");
    const exportHistory = document.getElementById("exportHistory");

    const pieces = {
        white: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖', '♙'],
        black: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜', '♟']
    };

    const pieceNamesBg = {
        '♖': "топ",
        '♘': "кон",
        '♗': "офицер",
        '♕': "царица",
        '♔': "цар",
        '♙': "пешка",
        '♜': "топ",
        '♞': "кон",
        '♝': "офицер",
        '♛': "царица",
        '♚': "цар",
        '♟': "пешка"
    };

    const pieceGender = {
        '♖': "бял",
        '♘': "бял",
        '♗': "бял",
        '♕': "бяла",
        '♔': "бял",
        '♙': "бяла",
        '♜': "черен",
        '♞': "черен",
        '♝': "черен",
        '♛': "черна",
        '♚': "черен",
        '♟': "черна"
    };

    let currentTurn = "white";
    let selectedSquare = null;
    let activePiece = null;

    function createBoard() {
        for (let row = 8; row >= 1; row--) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div");
                square.classList.add("square");
                square.classList.add((row + col) % 2 === 0 ? "white" : "black");
                square.setAttribute("data-position", `${String.fromCharCode(65 + col)}${row}`);
                board.appendChild(square);

                if (row === 2) {
                    square.innerHTML = `<span class="chess-piece" draggable="true">${pieces.white[8]}</span>`;
                } else if (row === 7) {
                    square.innerHTML = `<span class="chess-piece" draggable="true">${pieces.black[8]}</span>`;
                } else if (row === 1) {
                    square.innerHTML = `<span class="chess-piece" draggable="true">${pieces.white[col]}</span>`;
                } else if (row === 8) {
                    square.innerHTML = `<span class="chess-piece" draggable="true">${pieces.black[col]}</span>`;
                }
            }
        }
    }

    createBoard();

    board.addEventListener("dragstart", (event) => {
        if (event.target.classList.contains("chess-piece")) {
            const piece = event.target;
            if ((currentTurn === "white" && piece.innerHTML.match(/[♔♕♖♗♘♙]/)) ||
                (currentTurn === "black" && piece.innerHTML.match(/[♚♛♜♝♞♟]/))) {
                event.dataTransfer.setData("text", event.target.outerHTML);
                activePiece = piece;
            } else {
                event.preventDefault();
            }
        }
    });
	

    board.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

 board.addEventListener("drop", (event) => {
        event.preventDefault();
        const square = event.target.closest(".square");
        if (square && activePiece) {
            const targetPiece = square.querySelector(".chess-piece");

            if (!targetPiece || isOpponentPiece(targetPiece)) {
                const from = activePiece.parentElement.getAttribute("data-position");
                const to = square.getAttribute("data-position");

                if (targetPiece && isOpponentPiece(targetPiece)) {
                    capturePiece(targetPiece.textContent, currentTurn);
                    targetPiece.remove();
                }

                square.innerHTML = activePiece.outerHTML;
                activePiece.parentElement.innerHTML = "";
                addMoveToHistory(activePiece.textContent, from, to, currentTurn);
                activePiece = null;
                switchTurn();
            }
        }
    });

function updateTurnIndicator() {
    const turnDisplay = document.getElementById("currentTurnDisplay");
    if (currentTurn === "white") {
        turnDisplay.textContent = "Белите";
        turnDisplay.classList.remove("black");
        turnDisplay.classList.add("white");
    } else {
        turnDisplay.textContent = "Черните";
        turnDisplay.classList.remove("white");
        turnDisplay.classList.add("black");
    }
}

    function highlightSquare(square) {
        document.querySelectorAll(".square").forEach((sq) => sq.classList.remove("highlight"));
        if (square) {
            square.classList.add("highlight");
        }
    }

    function markActivePiece(piece) {
        document.querySelectorAll(".chess-piece").forEach((p) => p.classList.remove("selected"));
        if (piece) {
            piece.classList.add("selected");
        }
    }

    function isOpponentPiece(piece) {
        return (currentTurn === "white" && piece.innerHTML.match(/[♚♛♜♝♞♟]/)) ||
               (currentTurn === "black" && piece.innerHTML.match(/[♔♕♖♗♘♙]/));
    }

    function switchTurn() {
        currentTurn = currentTurn === "white" ? "black" : "white";
		updateTurnIndicator();
    }

    function clearCursor() {
        highlightSquare(null);
        markActivePiece(null);
        selectedSquare = null;
        activePiece = null;
    }

    function addMoveToHistory(piece, from, to, player) {
        const gender = pieceGender[piece];
        const moveItem = document.createElement("li");
        moveItem.textContent = `${gender} ${pieceNamesBg[piece]} ${from}->${to}`;
        moveHistory.appendChild(moveItem);
    }
	

    submitMove.addEventListener("click", () => {
        const command = moveInput.value.trim();
        const match = command.match(/^(пешка|топ|кон|офицер|царица|цар) ([A-H][1-8])-([A-H][1-8])$/i);

        if (!match) {
            alert("Грешен формат! Използвайте: 'пешка E2-E4'");
            return;
        }

        const [, name, from, to] = match;

        const piece = Array.from(board.querySelectorAll(".chess-piece")).find(
            p => pieceNamesBg[p.textContent].toLowerCase() === name.toLowerCase() &&
                p.parentElement.getAttribute("data-position") === from
        );

        if (piece) {
            if ((currentTurn === "white" && !piece.innerHTML.match(/[♔♕♖♗♘♙]/)) ||
                (currentTurn === "black" && !piece.innerHTML.match(/[♚♛♜♝♞♟]/))) {
                alert(`Сега е ред на ${currentTurn === "white" ? "белите" : "черните"}!`);
                return;
            }

            const targetSquare = board.querySelector(`.square[data-position="${to}"]`);
            const targetPiece = targetSquare.querySelector(".chess-piece");

            if (targetSquare && (!targetPiece || isOpponentPiece(targetPiece))) {
                if (targetPiece && isOpponentPiece(targetPiece)) {
                    capturePiece(targetPiece.textContent, currentTurn);
                    targetPiece.remove();
                }

                targetSquare.innerHTML = piece.outerHTML;
                piece.parentElement.innerHTML = "";
                addMoveToHistory(piece.textContent, from, to, currentTurn);
                switchTurn();
            } else if (targetPiece && !isOpponentPiece(targetPiece)) {
                alert("Не можете да вземете фигура от същия цвят!");
            }
        } else {
            alert("Невалиден ход или неправилно избрана фигура!");
        }

        moveInput.value = "";
    });
function capturePiece(piece, player) {
    // Определяме контейнера за взетите фигури
    const capturedContainer = player === "white" ? document.getElementById("capturedBlack") : document.getElementById("capturedWhite");

    // Създаваме елемент за взетата фигура
    const capturedPiece = document.createElement("span");
    capturedPiece.classList.add("chess-piece");
    capturedPiece.textContent = piece;

    // Добавяме фигурата към съответния контейнер
    capturedContainer.appendChild(capturedPiece);
}



    document.addEventListener("keydown", (event) => {
        const squares = Array.from(document.querySelectorAll(".square"));

        if (!selectedSquare) {
            selectedSquare = squares.find((sq) => !sq.querySelector(".chess-piece"));
            highlightSquare(selectedSquare);
            return;
        }

        let currentIndex = squares.indexOf(selectedSquare);

        if (event.key === "ArrowUp" && currentIndex >= 8) {
            currentIndex -= 8;
        } else if (event.key === "ArrowDown" && currentIndex < 56) {
            currentIndex += 8;
        } else if (event.key === "ArrowLeft" && currentIndex % 8 !== 0) {
            currentIndex -= 1;
        } else if (event.key === "ArrowRight" && currentIndex % 8 !== 7) {
            currentIndex += 1;
        }

        selectedSquare = squares[currentIndex];
        highlightSquare(selectedSquare);

        if (event.key === "Enter") {
            const square = squares[currentIndex];
            if (activePiece) {
                const targetPiece = square.querySelector(".chess-piece");
                if (!targetPiece || isOpponentPiece(targetPiece)) {
                    const from = activePiece.parentElement.getAttribute("data-position");
                    const to = square.getAttribute("data-position");
					// Ако има противникова фигура, вземете я
            if (targetPiece && isOpponentPiece(targetPiece)) {
                capturePiece(targetPiece.textContent, currentTurn);
                targetPiece.remove();
            }
                    square.innerHTML = activePiece.outerHTML;
                    activePiece.parentElement.innerHTML = "";
                    addMoveToHistory(activePiece.textContent, from, to, currentTurn);
                    switchTurn();
                    clearCursor();
                }
            } else if (square.querySelector(".chess-piece")) {
                const piece = square.querySelector(".chess-piece");
                if ((currentTurn === "white" && piece.innerHTML.match(/[♔♕♖♗♘♙]/)) ||
                    (currentTurn === "black" && piece.innerHTML.match(/[♚♛♜♝♞♟]/))) {
                    activePiece = piece;
                    markActivePiece(piece);
                }
            }
        }
    });

exportHistory.addEventListener("click", () => {
        const moves = Array.from(moveHistory.querySelectorAll("li")).map(li => li.textContent).join("\n");
        const blob = new Blob([moves], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "chess_moves.txt";
        link.click();
    });
	document.getElementById("importHistory").addEventListener("click", () => {
    document.getElementById("import-history-file").click(); // Симулираме клик върху input[type="file"]
});
function resetCapturedPieces() {
    const capturedWhite = document.getElementById("capturedWhite");
    const capturedBlack = document.getElementById("capturedBlack");

    // Изчистваме контейнерите за взети фигури
    capturedWhite.innerHTML = "<strong>Взети черни фигури:</strong><br>";
    capturedBlack.innerHTML = "<strong>Взети бели фигури:</strong><br>";
}

function resetBoard() {
    const squares = document.querySelectorAll(".square");
    squares.forEach(square => square.innerHTML = ""); // Изчистваме клетките

    // Рестартираме фигурите в началните им позиции
    for (let col = 0; col < 8; col++) {
        document.querySelector(`[data-position="${String.fromCharCode(65 + col)}2"]`).innerHTML = `<span class="chess-piece" draggable="true">${pieces.white[8]}</span>`;
        document.querySelector(`[data-position="${String.fromCharCode(65 + col)}7"]`).innerHTML = `<span class="chess-piece" draggable="true">${pieces.black[8]}</span>`;
    }
    for (let row of [1, 8]) {
        const color = row === 1 ? pieces.white : pieces.black;
        for (let col = 0; col < 8; col++) {
            document.querySelector(`[data-position="${String.fromCharCode(65 + col)}${row}"]`).innerHTML = `<span class="chess-piece" draggable="true">${color[col]}</span>`;
        }
    }

    resetCapturedPieces(); // Нулираме контейнерите за взети фигури
    currentTurn = "white"; // Започваме с белите
    updateTurnIndicator(); // Обновяваме индикатора за текущия ход
}

function playMoves(moves) {
    moves.forEach((move, index) => {
        setTimeout(() => {
            const match = move.match(/^(бяла|черна) (пешка|топ|кон|офицер|царица|цар) ([A-H][1-8])->([A-H][1-8])$/);

            if (match) {
                const [, color, pieceName, from, to] = match;
                const piece = Array.from(board.querySelectorAll(".chess-piece")).find(p => 
                    pieceNamesBg[p.textContent] === pieceName &&
                    p.parentElement.getAttribute("data-position") === from
                );

                if (piece) {
                    const targetSquare = board.querySelector(`.square[data-position="${to}"]`);
                    const targetPiece = targetSquare.querySelector(".chess-piece");

                    // Вземане на фигура
                    if (targetPiece && isOpponentPiece(targetPiece, color)) {
                        capturePiece(targetPiece.textContent, color === "бяла" ? "white" : "black");
                        targetPiece.remove(); // Премахваме взетата фигура
                    }

                    // Преместване на фигурата
                    targetSquare.innerHTML = piece.outerHTML;
                    piece.parentElement.innerHTML = ""; // Премахваме фигурата от старото ѝ място

                    // Добавяне на хода в историята
                    addMoveToHistory(piece.textContent, from, to, color === "бяла" ? "white" : "black");

                    // Смяна на реда
                    currentTurn = color === "бяла" ? "black" : "white";
                    updateTurnIndicator(); // Обновяване на индикатора
                }
            } else {
                console.error(`Невалиден формат на хода: "${move}"`);
            }
        }, index * 1000); // Интервал от 1 секунда между ходовете
    });
}

function capturePiece(piece, player) {
    const capturedContainer = player === "white" ? document.getElementById("capturedBlack") : document.getElementById("capturedWhite");

    // Създаваме елемент за взетата фигура
    const capturedPiece = document.createElement("span");
    capturedPiece.classList.add("chess-piece");
    capturedPiece.textContent = piece;

    // Добавяме фигурата към съответния контейнер
    capturedContainer.appendChild(capturedPiece);
}

document.getElementById("import-history-file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Разделяме съдържанието на файла на редове и филтрираме празните редове
        const moves = e.target.result.split(/\r?\n/).filter(line => line.trim() !== "");

        if (moves.length > 0) {
            resetBoard(); // Нулираме дъската
            playMoves(moves); // Изпълняваме ходовете
        } else {
            console.error("Файлът е празен или не съдържа валидни ходове.");
        }
    };
    
    // Четем файла като текст
    reader.readAsText(file, "UTF-8");
});
document.getElementById("import-history-file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const moves = e.target.result.split("\n").map(line => line.trim()).filter(line => line);
            playMovesFromFileSequentially(moves);
        };
        reader.readAsText(file);
    }
});

async function playMovesFromFileSequentially(moves) {
    for (const move of moves) {
        const match = move.match(/^(бял|черен|бяла|черна) (\S+) ([A-H][1-8])->([A-H][1-8])$/i);
        if (!match) {
            console.error(`Невалиден ход във файла: ${move}`);
            continue;
        }

        const [, color, pieceName, from, to] = match;

        const piece = Array.from(board.querySelectorAll(".chess-piece")).find(p =>
            pieceGender[p.textContent] === color &&
            pieceNamesBg[p.textContent] === pieceName &&
            p.parentElement.getAttribute("data-position") === from
        );

        if (piece) {
            const targetSquare = board.querySelector(`.square[data-position="${to}"]`);
            const targetPiece = targetSquare.querySelector(".chess-piece");

            if (targetSquare && (!targetPiece || isOpponentPiece(targetPiece))) {
                if (targetPiece && isOpponentPiece(targetPiece)) {
                    capturePiece(targetPiece.textContent, currentTurn);
                    targetPiece.remove();
                }

                targetSquare.innerHTML = piece.outerHTML;
                piece.parentElement.innerHTML = "";
                addMoveToHistory(piece.textContent, from, to, currentTurn);
                switchTurn();
            } else {
                console.error(`Невалиден ход: ${move}`);
            }
        } else {
            console.error(`Фигурата не е намерена или не може да се премести: ${move}`);
        }

        // Забавяне между ходовете (500ms за визуализация)
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}


function playMovesFromFile(moves) {
    moves.forEach(move => {
        const match = move.match(/^(бял|черен|бяла|черна) (\S+) ([A-H][1-8])->([A-H][1-8])$/i);
        if (!match) {
            console.error(`Невалиден ход във файла: ${move}`);
            return;
        }

        const [, color, pieceName, from, to] = match;

        const piece = Array.from(board.querySelectorAll(".chess-piece")).find(p =>
            pieceGender[p.textContent] === color &&
            pieceNamesBg[p.textContent] === pieceName &&
            p.parentElement.getAttribute("data-position") === from
        );

        if (piece) {
            const targetSquare = board.querySelector(`.square[data-position="${to}"]`);
            const targetPiece = targetSquare.querySelector(".chess-piece");

            if (targetSquare && (!targetPiece || isOpponentPiece(targetPiece))) {
                if (targetPiece && isOpponentPiece(targetPiece)) {
                    capturePiece(targetPiece.textContent, currentTurn);
                    targetPiece.remove();
                }

                targetSquare.innerHTML = piece.outerHTML;
                piece.parentElement.innerHTML = "";
                addMoveToHistory(piece.textContent, from, to, currentTurn);
                switchTurn();
            } else {
                console.error(`Невалиден ход: ${move}`);
            }
        } else {
            console.error(`Фигурата не е намерена или не може да се премести: ${move}`);
        }
    });
}


});
