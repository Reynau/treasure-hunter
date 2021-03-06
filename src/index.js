const PIXI = require('pixi.js')

let Container = PIXI.Container
let autoDetectRenderer = PIXI.autoDetectRenderer
let loader = PIXI.loader
let resources = PIXI.loader.resources
let Sprite = PIXI.Sprite
let Text = PIXI.Text

let menuScene, gameScene, gameOverScene
let dungeon, door, explorer, treasure, blobs
let level, maxNumOfBlobs, numOfBlobs
let healthBar, levelMessage, endMessage
let state, id

let fontFamily

let stage = new Container()
let maxWidth = 512
let maxHeight = 512
let renderer = autoDetectRenderer(maxWidth, maxHeight)
document.body.appendChild(renderer.view)

// Preloading of the sprite
loader
    .add('images/treasureHunter.json')
    .load(setup)

// Initializations
function initLevel () {
  numOfBlobs = min(level + 1, maxNumOfBlobs)
}
function initExplorer () {
  explorer.x = 68
  explorer.y = gameScene.height / 2 - explorer.height / 2
  explorer.vx = 0
  explorer.vy = 0
  explorer.baseSpeed = 5
  explorer.speed = explorer.baseSpeed
  explorer.health = 100
  explorer.carryTreasure = false
}
function initTreasure () {
  treasure.x = gameScene.width - treasure.width - 48
  treasure.y = gameScene.height / 2 - treasure.height / 2
}
function initBlobs () {
// Blobs
  let spacing = 48
  let xOffset = 150
  let direction = 1

  for (let i = 0; i < maxNumOfBlobs; ++i) {
    let blob = blobs[i]
    if (i < numOfBlobs) {
      blob.x = spacing * i + xOffset
      blob.y = blob.height + blob.height * i
      blob.speed = level + 2
      blob.vy = blob.speed * direction
      blob.damage = level + 1
      blob.visible = true
      direction *= -1
    } else {
      blob.visible = false
    }
  }
}

// Setup functions
function setScenes () {
  id = resources['images/treasureHunter.json'].textures
  // Menu Scene
  menuScene = new Container()
  menuScene.visible = true
  stage.addChild(menuScene)
  setMenuScene()

  // Game Scene
  gameScene = new Container()
  gameScene.visible = false
  stage.addChild(gameScene)
  setGameScene()

  // Game Over Scene
  gameOverScene = new Container()
  gameOverScene.visible = false
  stage.addChild(gameOverScene)
  setGameOverScene()
}
function setMenuScene () {
  dungeon = new Sprite(id['dungeon.png'])
  menuScene.addChild(dungeon)
  let startButton = createButton((maxWidth - 128) / 2, (maxHeight - 68) / 2, 128, 68, 'START', function () {
    state = play
    menuScene.visible = false
    gameScene.visible = true
  })
  menuScene.addChild(startButton)
}
function setGameScene () {
  // Dungeon
  dungeon = new Sprite(id['dungeon.png'])
  gameScene.addChild(dungeon)

  // Door
  door = new Sprite(id['door.png'])
  door.position.set(32, 0)
  gameScene.addChild(door)

  // Explorer
  explorer = new Sprite(id['explorer.png'])
  initExplorer()
  gameScene.addChild(explorer)

  // Treasure
  treasure = new Sprite(id['treasure.png'])
  initTreasure()
  gameScene.addChild(treasure)

  // Blobs
  blobs = []
  for (let i = 0; i < maxNumOfBlobs; ++i) {
    let blob = new Sprite(id['blob.png'])
    blobs.push(blob)
    gameScene.addChild(blob)
  }
  initBlobs()

  // Set HUD
  setHealthBar()
  setLevelMessage()
}
function setGameOverScene () {
  endMessage = new Text(
      'The End!',
      {fontFamily: 'Futura', fontSize: '64px', fill: 'white'}
  )
  endMessage.position.set(120, maxHeight / 2 - 32)
  gameOverScene.addChild(endMessage)
}
function setHealthBar () {
  healthBar = new Container()
  healthBar.position.set(gameScene.width - 170, 6)
  gameScene.addChild(healthBar)

  // Create the black background rectangle
  let innerBar = new PIXI.Graphics()
  innerBar.beginFill(0x000)
  innerBar.drawRect(0, 0, 128, 8)
  innerBar.endFill()
  healthBar.addChild(innerBar)

  // Create the front red rectangle
  let outerBar = new PIXI.Graphics()
  outerBar.beginFill(0xFF3300)
  outerBar.drawRect(0, 0, 128, 8)
  outerBar.endFill()
  healthBar.addChild(outerBar)

  healthBar.outer = outerBar
}
function setLevelMessage () {
  levelMessage = new Text(
      'Level ' + level,
      {fontFamily: fontFamily, fontSize: '24px', fill: 'white'}
  )
  levelMessage.position.set(gameScene.width - 170, 16)
  gameScene.addChild(levelMessage)
}
function setKeyboardBinding () {
  let left = keyboard(37)
  let up = keyboard(38)
  let right = keyboard(39)
  let down = keyboard(40)
  let space = keyboard(32)
  let enter = keyboard(13)

  left.press = function () {
    explorer.vx = -explorer.speed
  }
  left.release = function () {
    if (!right.isDown) {
      explorer.vx = 0
    } else {
      explorer.vx = explorer.speed
    }
  }
  right.press = function () {
    explorer.vx = explorer.speed
  }
  right.release = function () {
    if (!left.isDown) {
      explorer.vx = 0
    } else {
      explorer.vx = -explorer.speed
    }
  }
  up.press = function () {
    explorer.vy = -explorer.speed
  }
  up.release = function () {
    if (!down.isDown) {
      explorer.vy = 0
    } else {
      explorer.vy = explorer.speed
    }
  }
  down.press = function () {
    explorer.vy = explorer.speed
  }
  down.release = function () {
    if (!up.isDown) {
      explorer.vy = 0
    } else {
      explorer.vy = -explorer.speed
    }
  }
  space.press = function () {
    explorer.carryTreasure = true
  }
  space.release = function () {
    explorer.carryTreasure = false
    explorer.speed = explorer.baseSpeed
  }
  enter.press = function () {
    if (state === end) {
      if (endMessage.text === 'You won!') {
        ++level
      } else if (state === end) {
        level = 0
      }
      levelMessage.text = 'Level ' + level
      healthBar.outer.width = 128
      initLevel()
      initExplorer()
      initTreasure()
      initBlobs()
    }
  }
  enter.release = function () {
    state = play
  }
}
function setDefaultValues () {
  level = 0
  maxNumOfBlobs = 6

  fontFamily = 'Arial'
}

// Game States
function menu () {
  menuScene.visible = true
  gameScene.visible = false
  gameOverScene.visible = false
}
function play () {
  menuScene.visible = false
  gameScene.visible = true
  gameOverScene.visible = false

  explorer.x += explorer.vx
  explorer.y += explorer.vy
  contain(explorer, {x: 28, y: 10, width: 488, height: 480})

  let explorerHit = false
  let blobDamage = 0
  for (let i = 0; i < numOfBlobs; ++i) {
    let blob = blobs[i]
    if (!hitTestRectangle(blob, treasure)) {
      blob.y += blob.vy
      let blobHitsWall = contain(blob, {x: 28, y: 10, width: 488, height: 480})
      if (blobHitsWall === 'top' || blobHitsWall === 'bottom') {
        blob.vy *= -1
      }
    }

    // If blob hits explorer
    if (hitTestRectangle(explorer, blob)) {
      explorerHit = true
      blobDamage = blob.damage
    }
  }

  // If blob hits explorer reduces health
  if (explorerHit) {
    explorer.alpha = 0.5
    explorer.health -= blobDamage
    healthBar.outer.width = explorer.health * 128 / 100
  } else {
    explorer.alpha = 1
  }

  // If explorer hits treasure, carries it
  if (hitTestRectangle(explorer, treasure)) {
    if (explorer.carryTreasure) {
      treasure.x = explorer.x + 8
      treasure.y = explorer.y + 8
      explorer.speed = explorer.baseSpeed / 2
    }
  }

  if (hitTestRectangle(treasure, door)) {
    state = end
    endMessage.text = 'You won!'
  }
  if (healthBar.outer.width < 0) {
    state = end
    endMessage.text = 'You lost!'
  }
}
function end () {
  menuScene.visible = false
  gameScene.visible = false
  gameOverScene.visible = true
}

// Auxiliar functions
function createButton (x, y, w, h, t, f) {
  let button = new Container()
  button.position.set(x, y)
  button.interactive = true
  button.mousedown = f
  button.touchstart = f
  button.mouseover = function () {
    button.box.tint = 0xffffff // Clean tint
    button.box.tint = 0x44aa33
  }
  button.mouseout = function () {
    button.box.tint = 0xffffff // Clean tint
    button.box.tint = 0x66ff33
  }

  // Box
  let box = new PIXI.Graphics()
  box.beginFill(0xFFFFFF)
  box.drawRect(0, 0, w, h)
  box.endFill()
  button.addChild(box)
  button.box = box
  button.box.tint = 0x66ff33

  // Text
  let fontSize = '32px'
  let text = new Text(
      t,
      {fontFamily: fontFamily, fontSize: fontSize, fill: 'white'}
  )
  let textSize = textWidth(t, fontSize, fontSize)
  text.position.set((w - textSize) / 2, (h - 32) / 2)
  button.addChild(text)

  return button
}
function contain (sprite, container) {
  let collision

  // Left
  if (sprite.x < container.x) {
    sprite.x = container.x
    collision = 'left'
  }

  // Top
  if (sprite.y < container.y) {
    sprite.y = container.y
    collision = 'top'
  }

  // Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width
    collision = 'right'
  }

  // Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height
    collision = 'bottom'
  }

  // Return the `collision` value
  return collision
}
function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function hitTestRectangle (r1, r2) {
  // Define the letiables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy
  // hit will determine whether there's a collision
  hit = false
  // Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2
  r1.centerY = r1.y + r1.height / 2
  r2.centerX = r2.x + r2.width / 2
  r2.centerY = r2.y + r2.height / 2
  // Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2
  r1.halfHeight = r1.height / 2
  r2.halfWidth = r2.width / 2
  r2.halfHeight = r2.height / 2
  // Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX
  vy = r1.centerY - r2.centerY
  // Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth
  combinedHalfHeights = r1.halfHeight + r2.halfHeight
  // Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    // A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      // There's definitely a collision happening
      hit = true
    } else {
      // There's no collision on the y axis
      hit = false
    }
  } else {
    // There's no collision on the x axis
    hit = false
  }
  // `hit` will be either `true` or `false`
  return hit
}
function min (x, y) {
  return y ^ ((x ^ y) & -(x < y))
}
function textWidth (txt, fontname, fontsize) {
  this.e = document.createElement('span')
  this.e.style.fontSize = fontsize
  this.e.style.fontFamily = fontname
  this.e.innerHTML = txt
  document.body.appendChild(this.e)
  let w = this.e.offsetWidth
  document.body.removeChild(this.e)
  return w
}

// Game logic
function setup () {
  state = menu  // Start the game on the menu

  setDefaultValues()
  setScenes()
  setKeyboardBinding()

  initLevel()
  initExplorer()
  initTreasure()
  initBlobs()
  gameLoop()
}
function gameLoop () {
  requestAnimationFrame(gameLoop)
  state()
  renderer.render(stage)
}

// Keyboard binding
function keyboard (keyCode) {
  let key = {}
  key.code = keyCode
  key.isDown = false
  key.isUp = true
  key.press = undefined
  key.release = undefined
  // The `downHandler`
  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press()
      key.isDown = true
      key.isUp = false
    }
    event.preventDefault()
  }
  // The `upHandler`
  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release()
      key.isDown = false
      key.isUp = true
    }
    event.preventDefault()
  }
  // Attach event listeners
  window.addEventListener(
      'keydown', key.downHandler.bind(key), false
  )
  window.addEventListener(
      'keyup', key.upHandler.bind(key), false
  )
  return key
}
