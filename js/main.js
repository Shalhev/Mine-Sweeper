'use strict'

// var gBoard = {
//     minesAroundCount: 4,
//     isShown: true,
//     isMine: false,
//     isMarked: false
// }
var MINE = '💥'
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard = buildBoard()
randomMine()
renderBoard()

function initGame() {

}

function buildBoard() {
    var SIZE = gLevel.SIZE
    var board = []
    for (var i = 0; i < SIZE; i++) {
        board.push([])
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    // board[0][0].isMine = true
    // board[0][0].isShown = true
    // board[3][3].isMine = true
    // board[3][3].isShown = true
    return board
}

function setMinesNegsCount(rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue

            var cell = gBoard[i][j]
            if (cell.isMine) count++

        }
    }
    return count
}

function renderBoard() {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var isMineCell = gBoard[i][j].isMine
            var minesAround = setMinesNegsCount(i, j)
            cell.minesAroundCount = minesAround
            if (gBoard[i][j].isShown) {
                var printcell = (isMineCell === false) ? minesAround : MINE
                // var className = 'cell cell-' + i + '-' + j;
                // strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
                strHTML += `<td class="shown" onclick="cellClicked(this, ${i}, ${j})">${printcell}</td>`
            } else {
                strHTML += `<td onclick="cellClicked(this, ${i}, ${j})"></td>`
            }
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.table');
    elContainer.innerHTML = strHTML;

}
function cellClicked(elCell, i, j) {
    if (gGame.isOn === false) return
    var cell = gBoard[i][j]
    if (cell.isShown === true) return
    cell.isShown = true
    gGame.shownCount++

    if (cell.isMine === true) {
        gGame.isOn = false
        console.log('GAME OVER!');
    }
    if (cell.minesAroundCount === 0 && cell.isMine === false) {
        expandShown(elCell, i, j)
    }
    console.log(gGame.shownCount);
    checkGameOver()
    renderBoard()
}

function cellMarked(elCell) {

}
console.log(gLevel.SIZE**2 - gLevel.MINES);
function checkGameOver() {
    if (gGame.shownCount === (gLevel.SIZE**2 - gLevel.MINES)){
        gGame.isOn = false
        console.log('WINN!');
    }

}
function expandShown(elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue

            var cell = gBoard[i][j]
            if (cell.minesAroundCount === 0 && !cell.isShown) {
                gGame.shownCount++
                cell.isShown = true
                expandShown(elCell, i, j)
            }

        }
    }
}
function randomMine() {
    var mineCount = 0
    while (mineCount < gLevel.MINES) {
        var rowI = getRandomInt(0, gBoard.length)
        var colJ = getRandomInt(0, gBoard[0].length)
        var cell = gBoard[rowI][colJ]
        if (cell.isMine) continue
        cell.isMine = true
        // cell.isShown = true
        mineCount++
    }

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}