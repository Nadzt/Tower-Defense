// Global Variables
const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
const shop = document.querySelector(".shop")
const buttons = document.querySelectorAll(".shop-item")
const stageSelect = document.querySelector(".stage-select")
const playBtns = document.querySelectorAll(".play")
const playerStats = document.querySelector(".player")
const playerHPHTML = document.querySelector(".playerHP")
const playerGHTML = document.querySelector(".playerGold")
const waveHTML = document.querySelector(".waveNumber")
const gameover = document.querySelector("#GameOver")
const menu = document.querySelector(".menu")    
const pauseButton = document.querySelector(".pause")
const pauseText = document.querySelector("#GamePaused")
const returnButton = document.querySelector(".return")
canvas.width = 1280
canvas.height = 768
const mouse = {
    x: undefined,
    y: undefined
}

// Variables
let currentStage = 0
const background = new Image()
const enemies = []
const placementTiles = []
const buildings = []
let placingMode = false
let activeTile
let fourTiles
const player = {
    hp: Number,
    gold: Number
}
let currentTower
let difficulty
let isPaused
let animationID
let isGameover


// Functions 
const createEnemies = () => {
    const pathings = stagePathings[currentStage]
    let enemyCount = 10 + Math.floor(difficulty / 2)
    let enemySpeed = 1 + Math.round(difficulty / 4) * .25
    playSound("wave")
    waveHTML.innerHTML = difficulty

    for(let i = 0; i < enemyCount; i++){
        const startingOffset = 30 * i
        const waypointNum = Math.floor(Math.random() * pathings.length)
        const waypoint = pathings[waypointNum]
        let soldierIndex = Math.floor(Math.random() * difficulty)
        switch(true) {
            case soldierIndex === 2:
            case soldierIndex === 3:
                soldierIndex = 2
                break
            case soldierIndex >= 4:
                soldierIndex = 3
                break
        }
        const soldier = soldiers[soldierIndex]
        const enemy = new Soldier({
            position: {
                x: waypoint[0].x - startingOffset,
                y: waypoint[0].y
            },
            stage: currentStage,
            pathing: waypointNum,
            soldier: soldier,
            speed: enemySpeed
        })

        enemies.push(enemy)
    }
}

const createPlacementTiles = () => {
    let rawData = rawPlacement[currentStage]
    for(let i = 0; i < rawData.length; i += 40){
        placementArray.push(rawData.slice(i, i + 40))
    }

    placementArray.forEach((row, i) => {
        row.forEach((item, j) => {
            switch(item) {
                case 85:
                placementTiles.push(new PlacementTile({
                    position: {
                        x: 32 * j,
                        y: 32 * i
                    }
                }))
                break
            }
        })
    })
}

const playSound = (soundCode = "string") => {
    const sound = new Audio()
    switch(soundCode) {
        case "death":
            sound.src = `../sounds/death.wav`;
            sound.volume = .3
            break
        case "wave":
            sound.src = `../sounds/wave.wav`;
            sound.volume = .2
            break
        case "bullet":
            sound.src = `../sounds/bullet.ogg`;
            sound.volume = .1
            break
        case "missile":
            sound.src = `../sounds/missile.ogg`;
            sound.volume = .2
            break
        case "moab":
            sound.src = `../sounds/moab.ogg`;
            sound.volume = .3
            break
        case "tank":
            sound.src = `../sounds/bullet.ogg`;
            sound.volume = .3
            break
    }
    sound.play()
}

const createSound = (soundCode = "string") => {
    const sound = new Audio()
    switch(soundCode){
        case "fire":
            sound.src = `../sounds/fire.ogg`;
            sound.volume = .1
            break
        case "laser":
            sound.src = `../sounds/laser.ogg`;
            sound.volume = .1
            break
    }

    return sound
}

const pauseGame = () => {
    cancelAnimationFrame(animationID)
    buildings.forEach(tower => {
        if(tower.sound && !tower.sound.paused) {
            tower.sound.pause()
        }
    })
    isPaused = true
    pauseButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>
    `
    pauseText.style.display = "inline-block"
}

const unpauseGame = () => {
    if(!isGameover) {
        animate()
        isPaused = false
        pauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M272 63.1l-32 0c-26.51 0-48 21.49-48 47.1v288c0 26.51 21.49 48 48 48L272 448c26.51 0 48-21.49 48-48v-288C320 85.49 298.5 63.1 272 63.1zM80 63.1l-32 0c-26.51 0-48 21.49-48 48v288C0 426.5 21.49 448 48 448l32 0c26.51 0 48-21.49 48-48v-288C128 85.49 106.5 63.1 80 63.1z"/></svg>
        `
        pauseText.style.display = "none"
    }
}

// Initialization
const init = () => {
    background.src = backgroundStages[currentStage]
    enemies.splice(0, enemies.length)
    placementTiles.splice(0, placementTiles.length)
    buildings.splice(0, buildings.length)
    placingMode = false
    activeTile = undefined
    fourTiles = undefined
    player.hp = 100
    player.gold = 250 * (currentStage + 1)
    playerHPHTML.innerHTML = player.hp
    playerGHTML.innerHTML = player.gold
    currentTower = undefined
    difficulty = 1
    isPaused = false
    isGameover = false

    createPlacementTiles()
    createEnemies()
    animate()
}

const animate = () => {
    animationID = requestAnimationFrame(animate)
    c.drawImage(background, 0, 0)
    
    // enemies and fireDetection
    for(let i = enemies.length - 1; i >= 0; i--){
        let enemy = enemies[i]
        
        if(enemy.fireTicks < 60) {
            for(let j = buildings.length - 1; j >= 0; j--){
                let tower = buildings[j]

                if(tower && tower.isFlamethrower) {
                    for(let i = tower.projectiles.length - 1; i >= 0; i--){
                        const projectile = tower.projectiles[i]
                        const xDifference = enemy.position.x - projectile.center.x
                        const yDifference = enemy.position.y - projectile.center.y
                        const distance = Math.hypot(xDifference, yDifference)
                        if(distance <= enemy.radius + projectile.radius){
                            enemy.fireTicks = 100
                            break
                        }
                    }
                }

                if(enemy.fireTicks === 100) break
            } 
        }

        if(enemy.fireTicks > 0) {
            enemy.fireTicks--
            enemy.HP -= enemy.fireDamage
            if(enemy.HP <= 0) {
                player.gold += enemy.gold
                playerGHTML.innerHTML = player.gold
                enemies.splice(i, 1)
                playSound("death")
            }
        }

        if(enemy.position.x > canvas.width + enemy.radius
        || enemy.position.y > canvas.height + enemy.radius){
            enemies.splice(i, 1)
            player.hp -= enemy.damage
            playerHPHTML.innerHTML = player.hp

            if(player.hp <= 0){
                gameover.style.display = "inline-block"
                isGameover = true
                cancelAnimationFrame(animationID)
            }
        }
        enemy.update()
    }

    // placement tiles
    if(placingMode) placementTiles.forEach(tile => {
        tile.update()
    })

    // buildings and projectiles
    buildings.forEach(tower => {
        tower.update()
        tower.target = undefined
        const validTargets = enemies.filter(enemy => {
            const xDifference = tower.center.x - enemy.position.x
            const yDifference = tower.center.y - enemy.position.y
            const distance = Math.hypot(xDifference, yDifference)
            return distance < enemy.radius + tower.range && enemy.position.x + enemy.radius > 0
        })
        tower.target = validTargets[0]
        if(tower.target){
            const xDifference = tower.center.x - validTargets[0].position.x
            const yDifference = tower.center.y - validTargets[0].position.y
            const angle = Math.atan2(yDifference, xDifference)
            tower.angle = angle
        }

        for(let i = tower.projectiles.length - 1; i >= 0; i--){
            const projectile = tower.projectiles[i]
            projectile.update()

            const xDifference = projectile.target.position.x - projectile.center.x
            const yDifference = projectile.target.position.y - projectile.center.y
            const distance = Math.hypot(xDifference, yDifference)
            if(distance <= projectile.target.radius + projectile.radius){
                tower.projectiles.splice(i, 1)
                projectile.target.HP -= projectile.damage
                if(projectile.target.HP <= 0){
                    const enemyIndex = enemies.findIndex((enemy) => {
                            return enemy === projectile.target
                        })
                    if(enemyIndex > -1) {
                        player.gold += projectile.target.gold
                        playerGHTML.innerHTML = player.gold
                        enemies.splice(enemyIndex, 1)
                        playSound("death")
                    }
                }
            } else if(projectile.ttl) {
                if(distance <= projectile.radius) projectile.destination = true
                projectile.ttl -= 2
                if(projectile.ttl <= 50) projectile.image.src = "img/projectiles/flame-2.png"
                if(projectile.ttl <= 0) tower.projectiles.splice(i, 1)
            }
        }
    })

    // increases difficulty if enemies are wiped out
    if(enemies.length === 0) {
        difficulty++
        createEnemies()
    }
}

// Event Listeners
addEventListener("mousemove", (e) => {
    mouse.x = e.clientX - canvas.clientLeft - canvas.parentElement.offsetLeft
    mouse.y = e.clientY - canvas.clientTop - canvas.parentElement.offsetTop

    activeTile = undefined
    fourTiles = 0

    if(placingMode && currentTower.size === 32) {
        for(let tile of placementTiles) {
            if(mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size
                && mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size){
                activeTile = tile
                break
            }
        }
    } else if(placingMode && currentTower.size === 64) {
        for(let tile of placementTiles) {
            if((mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size
                && mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size)){
                    activeTile = tile
                    tile.active = true
                    fourTiles++
            } else if((mouse.x + 32 > tile.position.x && mouse.x + 32 < tile.position.x + tile.size
                        && mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size
                        && tile.isEmpty)
                    ||(mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size
                        && mouse.y + 32 > tile.position.y && mouse.y + 32< tile.position.y + tile.size
                        && tile.isEmpty)
                    || (mouse.x + 32 > tile.position.x && mouse.x + 32 < tile.position.x + tile.size
                        && mouse.y + 32> tile.position.y && mouse.y + 32 < tile.position.y + tile.size
                        && tile.isEmpty)){
                tile.active = true
                fourTiles++
            } else {
                tile.active = false
            }
        }       
    }
})

canvas.addEventListener("click", (e) => {
    if(currentTower && currentTower.size === 32 && activeTile && activeTile.isEmpty && player.gold >= currentTower.value){
        if(!currentTower.class) {
            buildings.push(new TowerSimple({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                },
                imageSrc: currentTower.imageSrc,
                size: currentTower.size,
                range: currentTower.range,
                fireRate: currentTower.fireRate,
                projectile: currentTower.projectile,
            }))
        } else if(currentTower.class === "flamethrower") {
            buildings.push(new TowerFlamethrower({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                },
                imageSrc: currentTower.imageSrc,
                size: currentTower.size,
                range: currentTower.range,
                fireRate: currentTower.fireRate,
                projectile: currentTower.projectile,
                maxAngle: currentTower.maxAngle,
                cannonSpeed: currentTower.cannonSpeed,
            }))
        } else {
            buildings.push(new TowerLaser({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                },
                imageSrc: currentTower.imageSrc,
                size: currentTower.size,
                range: currentTower.range,
                fireRate: currentTower.fireRate,
                projectile: currentTower.projectile,
            }))
        }

        activeTile.isEmpty = false
        placingMode = false
        player.gold -= currentTower.value
        playerGHTML.innerHTML = player.gold

    } else if(placingMode && fourTiles === 4 && player.gold >= currentTower.value) {
        buildings.push(new TowerSimple({
            position: {
                x: activeTile.position.x,
                y: activeTile.position.y
            },
            imageSrc: currentTower.imageSrc,
            size: currentTower.size,
            range: currentTower.range,
            fireRate: currentTower.fireRate,
            projectile: currentTower.projectile,
        }))
        for(let tile of placementTiles) {
            if(tile.active) tile.isEmpty = false
        }
        placingMode = false
        player.gold -= currentTower.value
        playerGHTML.innerHTML = player.gold
    }
})

buttons.forEach(button => {
    button.addEventListener("click", (e) => {
        placingMode = !placingMode
        currentTower = towers[e.currentTarget.dataset.tower]
    })
})

playBtns.forEach(button => {
    button.addEventListener("click", (e) => {
        currentStage = e.currentTarget.dataset.stage - 1

        stageSelect.style.display = "none"
        shop.style.display = "flex"
        playerStats.style.display = "flex"
        menu.style.display = "flex"
        init()
    })
})

pauseButton.addEventListener("click", () => {
    if(isPaused) unpauseGame()
    else pauseGame() 
})

addEventListener("visibilitychange", () => {
    if(document.visibilityState === "hidden") {
        if(animationID !== 0 && animationID !== undefined){
            pauseGame()
        }
    }
})

returnButton.addEventListener("click", () => {
    cancelAnimationFrame(animationID)
    buildings.forEach(tower => {
        if(tower.sound && !tower.sound.paused) {
            tower.sound.pause()
        }
    })
    // resets animationID frames to 0, to prevent pauses from switching tabs in menu
    animationID = 0

    stageSelect.style.display = "flex"
    pauseText.style.display = "none"
    shop.style.display = "none"
    playerStats.style.display = "none"
    menu.style.display = "none"
})