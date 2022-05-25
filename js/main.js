'use strict'

// var gBoard = {
//     minesAroundCount: 4,
//     isShown: true,
//     isMine: false,
//     isMarked: false
// }
var MINE = '💥'
var FLAG = '🚩'
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    win: false,
    hints: 3,
    isHintOn: false
}
var gBoard
var hintCells = []


function initGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        isWin: false,
        hints: 3,
        isHintOn: false
    }
    gBoard = buildBoard()
    randomMine()
    renderBoard()
    smiley()
    livesLeft()
    safeClick()
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
                strHTML += `<td class="shown" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, this, ${i}, ${j})">${printcell}</td>`
            } else {
                var printcell = (cell.isMarked) ? FLAG : ''
                strHTML += `<td onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, this, ${i}, ${j})">${printcell}</td>`
            }
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.table');
    elContainer.innerHTML = strHTML;
}
// var className = 'cell cell-' + i + '-' + j;
// strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
// strHTML += `<td class="shown" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, this, ${i}, ${j})">${printcell}</td>`
// strHTML += `<td onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, this, ${i}, ${j})"></td>`


function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (gGame.isOn === false) return
    if (cell.isMarked) return
    if (cell.isShown) return

    if (gGame.isHintOn) {
        hintOn(i, j)
        return
    }

    if (cell.isMine === true) {
        gGame.lives--
        livesLeft()
        if (gGame.lives === 0) {
            gGame.isOn = false
            showAllMines()
            console.log('GAME OVER!');
        }
    } else {
        gGame.shownCount++
    }
    if (cell.minesAroundCount === 0 && !cell.isMine) {
        expandShown(i, j)
    }
    cell.isShown = true
    checkGameOver()
    renderBoard()
    smiley()

}

function cellMarked(ev, elCell, i, j) {
    ev.preventDefault();
    var cell = gBoard[i][j]
    if (!gGame.isOn) return
    if (cell.isShown) return
    if (cell.isMarked) {
        elCell.innerHTML = ''
        cell.isMarked = false
        gGame.markedCount--
    } else {
        elCell.innerHTML = FLAG
        cell.isMarked = true
        gGame.markedCount++
    }

}

function checkGameOver() {
    if (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES)) {
        gGame.isOn = false
        gGame.isWin = true
        console.log('WINN!');
        smiley()

    }
}
function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) cell.isShown = true
        }
    }
}
function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue

            var cell = gBoard[i][j]
            if (cell.isMarked) continue
            if (cell.minesAroundCount === 0 && !cell.isShown) {
                cell.isShown = true
                gGame.shownCount++
                expandShown(i, j)
            }
            if (cell.minesAroundCount > 0 && !cell.isShown) {
                cell.isShown = true
                gGame.shownCount++
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

function setLevel(level) {
    switch (level) {
        case 4:
            gLevel = {
                SIZE: 4,
                MINES: 2
            }
            break;
        case 8:
            gLevel = {
                SIZE: 8,
                MINES: 12
            }
            break;
        case 12:
            gLevel = {
                SIZE: 12,
                MINES: 30
            }
            break;
    }
    initGame()
}

function livesLeft() {
    var elLives = document.querySelector('.lives span')
    elLives.innerHTML = gGame.lives
}
function smiley() {
    var smile = document.querySelector('.smiley')
    if (gGame.isWin) smile.innerText = '😎'
    else if (gGame.lives === 3) smile.innerText = '😀'
    else if (gGame.lives < 3) smile.innerText = '🤯'
}

function hints() {
    if (gGame.hints < 1) return
    if (gGame.isHintOn) return
    gGame.hints--
    gGame.isHintOn = true

}
function hintOn(rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            var cell = gBoard[i][j]
            if (!cell.isShown) {
                var cellPos = { i: i, j: j }
                hintCells.push(cellPos)
                cell.isShown = true
            }

        }
    }
    renderBoard()
    setTimeout(hintOff, 1000, hintCells)
}
function hintOff(hintCells) {
    for (var i = hintCells.length; i > 0; i--) {
        var cell = hintCells.shift()
        gBoard[cell.i][cell.j].isShown = false

    }
    renderBoard()
    gGame.isHintOn = false

    var strHTML = ''
    for (var i = 0; i < gGame.hints; i++) {
        strHTML += `💡`
    }
    var elhint = document.querySelector('.hints')
    elhint.innerHTML = strHTML
}

function safeClick() {
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (!cell.isShown && !cell.isMine) {
                var cellPos = { i: i, j: j }
                safeCells.push(cellPos)
            }
        }
    }
}



function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}