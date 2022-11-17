const cols = document.querySelectorAll('.col')
const toast = document.querySelector('.toast')
const tutorial = document.querySelector('.tutorial')
const resetButton = document.querySelector('.reset')
const undoButton = document.querySelector('i[data-type="undo"]')
const redoButton = document.querySelector('i[data-type="redo"]')
let history = []
let historyPosition = 0

document.addEventListener('keydown', (event) => {
  if(event.code === 'Space') {
    event.preventDefault()
    setRandomColors()
  }
})

document.addEventListener('click', (event) => {
  const type = event.target.dataset.type

  switch (true) {
    case type === 'lock':
      lockColumn(event)
      break;
    case type === 'code':
      copyToClipboard(event.target.textContent)
      break;
    case type === 'info':
      showTutorialModal()
      break;
    case type === 'reset':
      resetSelectedColors()
      break;
    case type === 'undo':
    case type === 'redo':
      updateHistoryPosition(type)
      break;
    default:
      break;
  }
})

function init() {
  setRandomColors(true)
}

function setRandomColors(isInit) {
  const colors = isInit ? getColorsFormHash() : []

  if (isInit) {
    resetButton.classList.add('disabled')
  }

  cols.forEach((col, index) => {
    const isLocked = col.querySelector('i').classList.contains('fa-lock')
    const text = col.querySelector('.hex')
    const name = col.querySelector('.color-name')

    if (isLocked) {
      colors.push(text.textContent)
      return
    }

    const color = isInit && colors[index] ? colors[index] : chroma.random()
    const button = col.querySelector('button')
    const colorName = ntc.name(color.toString())[1]

    text.textContent = color
    name.textContent = colorName
    col.style.background = color

    if (!isInit) {
      colors.push(color)
    }

    setTextColor(text, color)
    setTextColor(name, color)
    setTextColor(button, color)
  })

  if (!isInit && historyPosition !== history.length - 1) {
    history = history.slice(0, historyPosition + 1)
  }
  
  history.push(colors)
  historyPosition = history.length - 1

  updateUndoRedoButtons()
  updateColorsHash(colors)
}

function setColorsFromHistory() {
  const colors = history[historyPosition]

  cols.forEach((col, index) => {
    const color = colors[index]
    const text = col.querySelector('.hex')
    const name = col.querySelector('.color-name')
    const button = col.querySelector('button')
    const colorName = ntc.name(color.toString())[1]

    text.textContent = color
    name.textContent = colorName
    col.style.background = color

    setTextColor(text, color)
    setTextColor(name, color)
    setTextColor(button, color)
  })

  updateUndoRedoButtons()
  updateColorsHash(colors)
}

function setTextColor(text, color) {
  const luminance = chroma(color).luminance()
  text.style.color = luminance > 0.5 ? 'black' : 'white'
}

function showMessageAboutCopy() {
  toast.classList.toggle('visible')
  setTimeout(() => toast.classList.toggle('visible'), 2000)
}

function lockColumn(event) {
  const icon = event.target.tagName === 'I'
  ? event.target
  : event.target.children[0]

  icon.classList.toggle('fa-lock-open')
  icon.classList.toggle('fa-lock')

  hasLockedColumns()
    ? resetButton.classList.remove('disabled')
    : resetButton.classList.add('disabled')
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  showMessageAboutCopy()
}

function updateColorsHash(colors = []) {
  document.location.hash = colors.map((color) => color.toString().substring(1)).join('-')
}

function getColorsFormHash() {
  if (document.location.hash.length > 1) {
    return document.location.hash
      .substring(1)
      .split('-')
      .map((color) => '#' + color)
  }

  return []
}

function showTutorialModal() {
  tutorial.classList.toggle('visible')
}

function resetSelectedColors() {
  if (resetButton.classList.contains('disabled')) {
    return
  }

  cols.forEach((col) => {
    const icon = col.querySelector('i')

    if (icon.classList.contains('fa-lock')) {
      icon.classList.toggle('fa-lock')
      icon.classList.toggle('fa-lock-open')
    }
  })

  resetButton.classList.add('disabled')
}

function hasLockedColumns() {
  let count = 0
  
  cols.forEach((col) => {
    const icon = col.querySelector('i')

    if (icon.classList.contains('fa-lock')) {
      count =+ 1
    }
  })

  return count > 0
}

function updateUndoRedoButtons() {
  const isUndoButtonContainDisabled = undoButton.classList.contains('disabled')
  const isRedoButtonContainDisabled = redoButton.classList.contains('disabled')

  if (historyPosition === 0 && !isUndoButtonContainDisabled) {
    undoButton.classList.add('disabled')
  }

  if (historyPosition !== 0 && isUndoButtonContainDisabled && history.length) {
    undoButton.classList.remove('disabled')
  }

  if (historyPosition + 1 === history.length && !isRedoButtonContainDisabled) {
    redoButton.classList.add('disabled')
  }

  if (historyPosition + 1 !== history.length && isRedoButtonContainDisabled) {
    redoButton.classList.remove('disabled')
  }
}

function updateHistoryPosition(type) {
  if (type === 'undo' && historyPosition > 0) {
    historyPosition -= 1
  }

  if (type === 'redo' && history[historyPosition + 1]) {
    historyPosition += 1
  }

  updateUndoRedoButtons()
  setColorsFromHistory()
}

init()