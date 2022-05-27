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
var gGame
var gBoard
var hintCells = []
var gTimer
var gStart
var isTimerOn
var gSteps = []
var isBackStep = false

function initGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        firstStep: true,
        lives: 3,
        isWin: false,
        hints: 3,
        isHintOn: false,
        safeClicks: 3,
    }
    gBoard = buildBoard()
    randomMine()
    renderBoard()
    smiley()
    livesLeft()
    clearInterval(gTimer)
    resetHintCount()
    closeMsgBox()

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
    var strHTML = '<table><tbody>';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var isMineCell = gBoard[i][j].isMine
            var minesAround = setMinesNegsCount(i, j)
            cell.minesAroundCount = minesAround
            if (gBoard[i][j].isShown) {
                var printcell = (isMineCell === false) ? minesAround : MINE
                strHTML += `<td class="shown cell-${i}-${j}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, this, ${i}, ${j})">${printcell}</td>`
            } else {
                var printcell = (cell.isMarked) ? FLAG : ''
                strHTML += `<td class="cell-${i}-${j}"onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, this, ${i}, ${j})">${printcell}</td>`
            }
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.table');
    elContainer.innerHTML = strHTML;

    //// NOTE: UNDO STEPS
    // if (isBackStep) return
    // var boardCopy = Object.assign([], gBoard);
    // var gameCopy = Object.assign({}, gGame);
    // // gSteps.push(boardCopy)
    // var step = { board: boardCopy, game: gameCopy }
    // gSteps.push(step)
    // console.log('step.borad', step.board);
    // console.log(gSteps);

}


function cellClicked(elCell, i, j) {
    isBackStep = false
    if (gGame.firstStep) {
        timerStart()
        gGame.firstStep = false
    }
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
    } else {
        gGame.shownCount++
    }
    if (cell.minesAroundCount === 0 && !cell.isMine) {
        gGame.shownCount--
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
        openMsgBox()
        timerEnd()
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
    var strHTML = ''
    var elLives = document.querySelector('.lives')
    if (gGame.lives === 0) {
        gGame.isOn = false
        showAllMines()
        timerEnd()
        openMsgBox()
        return
    }
    for (var i = 0; i < gGame.lives; i++) {
        strHTML += '💚'
    }
    elLives.innerHTML = strHTML
}
function smiley() {
    var smile = document.querySelector('.smiley')
    if (gGame.isWin) smile.innerText = '😎'
    else if (gGame.lives === 3) smile.innerText = '😀'
    else if (gGame.lives < 3) smile.innerText = '🤯'
}

function hints(el) {
    if (gGame.hints < 1) return
    if (gGame.isHintOn) return
    gGame.hints--
    gGame.isHintOn = true
    hintColor(el)


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
    var elHint = document.querySelectorAll('.clicked')
    for (var i = 0; i < elHint.length; i++) {
        elHint[i].style.visibility = 'hidden'
    }
    renderBoard()
    gGame.isHintOn = false
}

function hintColor(el) {
    el.classList.add('clicked')
}
function resetHintCount() {
    var elHint = document.querySelectorAll('.clicked')
    for (var i = 0; i < elHint.length; i++) {
        elHint[i].style.visibility = 'visible'
        elHint[i].classList.remove('clicked')
    }
}

function safeClick() {
    if (gGame.safeClicks === 0) return

    gGame.safeClicks--
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
    if (safeCells.length === 0) return
    var randomNum = getRandomInt(0, safeCells.length)
    var raddomCell = safeCells[randomNum]
    var elCell = document.querySelector(`.cell-${raddomCell.i}-${raddomCell.j}`);
    elCell.classList.add('safe-click')
    var elBtn = document.querySelector('.safe span')
    elBtn.innerText = `${gGame.safeClicks}`

    setTimeout(function () {
        elCell.classList.remove('safe-click')
    }, 1000)

}

function undoStep() {
    if (gSteps.length === 0) return
    isBackStep = true
    var step = gSteps.pop()
    console.log('step board', step.board);
    console.log('step game', step.game);
    gBoard = step.board
    gGame = step.game
    renderBoard()
    livesLeft()
}

function openMsgBox() {
    var elBox = document.querySelector('.msg-box')
    var elBoxText = document.querySelector('.msg-text')
    elBox.style.display = 'flex'
    if (gGame.lives === 0) {
        elBoxText.innerText = 'GAME OVER!'
        elBoxText.style.color = 'red'
    }

    if(gGame.isWin){
        elBoxText.innerText = 'WINNER!'
        elBoxText.style.color = '#2fff00'
    }
}
function closeMsgBox() {
    var elBox = document.querySelector('.msg-box')
    elBox.style.display = 'none'
}

function renderCell(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function timerStart() {
    gStart = new Date
    isTimerOn = true
    gTimer = setInterval(timerRun, 20)
}

function timerRun() {
    if (isTimerOn) {
        var end = new Date
        var time = (end - gStart) / 1000
        gGame.secsPassed = time
        var eltime = document.querySelector('.timer span')
        eltime.innerText = parseInt(time)
    }
}
function timerEnd() {
    isTimerOn = false
    clearInterval(gTimer)

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}