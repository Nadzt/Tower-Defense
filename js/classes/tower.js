class Tower {
    constructor({
        position = {x: 0, y:0},
        imageSrc,
        size
    })
    {
        this.image = new Image()
        this.image.src = imageSrc
        this.position = position
        this.size = size
        this.frames = 0
    }

    draw() {
        c.save()
        c.translate(this.center.x, this.center.y)
        c.rotate(this.angle - Math.PI * .5)
        c.translate(-this.center.x, -this.center.y)
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.size,
            this.size
        )
        c.restore()
    }
}

class TowerSimple extends Tower {
    constructor({
            position,
            imageSrc,
            size,
            range,
            fireRate,
            projectile
        }){

        super({position, imageSrc, size})
        this.center = {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        }
        this.angle = 0
        this.projectiles = []
        this.target
        
        //variables
        this.range = range
        this.fireRate = fireRate
        this.projectile = projectile
    }

    draw() {
        super.draw()

        // c.beginPath()
        // c.strokeStyle = "rgba(10, 10, 10, 0.4)"
        // c.arc(this.center.x, this.center.y, this.range, 0, Math.PI * 2)
        // c.stroke()
    }

    shoot() {
        this.projectiles.push(new Bullet({
            position: {
                x: this.position.x + Math.cos(this.angle) * -this.size / 2,
                y: this.position.y + Math.sin(this.angle) * -this.size / 2
            },
            projectile: this.projectile,
            target: this.target,
        }))
        playSound(this.projectile.sound)
    }

    update(){        
        if(this.target && this.frames % this.fireRate === 0) this.shoot()
        if(this.target) this.frames++
        else if (this.frames % this.fireRate !== 0) this.frames++

        if(this.range === 2000 && this.target) {
            c.beginPath()
            c.moveTo(this.center.x, this.center.y)
            c.lineTo(this.target.position.x, this.target.position.y)
            c.stroke()
        } 

        this.draw()
    }
}

class TowerFlamethrower extends Tower {
    constructor({
            position,
            imageSrc,
            size,
            range,
            fireRate,
            projectile,
            maxAngle,
            cannonSpeed
        }){

        super({position, imageSrc, size})
        this.center = {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        }
        this.angle = 0
        this.projectiles = []
        this.target
        
        //variables
        this.isFlamethrower = true
        this.range = range
        this.fireRate = fireRate
        this.projectile = projectile
        this.angleOffset = 0
        this.maxAngle = maxAngle
        this.cannonSpeed = cannonSpeed
        this.sound = createSound("fire")
        this.sound.loop = true
    }

    draw() {
        super.draw()

        // c.beginPath()
        // c.strokeStyle = "rgba(10, 10, 10, 0.4)"
        // c.arc(this.center.x, this.center.y, this.range, 0, Math.PI * 2)
        // c.stroke()
    }

    shoot() {
        const spreadMax = 32
        const spread = Math.random() * spreadMax - spreadMax / 2
        const targetPosition = {
            position: {
                x: this.center.x - Math.cos(this.angle) * this.range + spread,
                y: this.center.y - Math.sin(this.angle) * this.range + spread
            }
        }
        this.projectiles.push(new Flames({
            position: {
                x: this.position.x + Math.cos(this.angle) * -this.size / 2,
                y: this.position.y + Math.sin(this.angle) * -this.size / 2
            },
            projectile: this.projectile,
            target: targetPosition,
        }))
    }

    update(){        
        if(this.target) {
            if(this.angleOffset >= this.maxAngle || this.angleOffset <= -this.maxAngle) {
                this.cannonSpeed = -this.cannonSpeed
            } 
            this.angleOffset += this.cannonSpeed
            this.angle += this.angleOffset

            if(this.frames % this.fireRate === 0) {
                this.shoot()
                this.shoot()
            }

            if(this.sound.paused){
                this.sound.play()
            }
            this.frames++
        }else {
        this.sound.pause()
        this.sound.currentTime = 0
        if (this.frames % this.fireRate !== 0) this.frames++
        }

        this.draw()
    }
}

function createLaser (x1, y1, x2, y2, startWidth, endWidth) {
    const directionVectorX = x2 - x1,
          directionVectorY = y2 - y1;
    const perpendicularVectorAngle = Math.atan2(directionVectorY, directionVectorX) + Math.PI/2;
    const path = new Path2D();
    path.arc(x1, y1, startWidth/2, perpendicularVectorAngle, perpendicularVectorAngle + Math.PI);
    path.arc(x2, y2, endWidth/2, perpendicularVectorAngle + Math.PI, perpendicularVectorAngle);
    path.closePath();
    return path;
}

class TowerLaser extends Tower {
    constructor({
            position,
            imageSrc,
            size,
            range,
            fireRate,
            projectile
        }){

        super({position, imageSrc, size})
        this.center = {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        }
        this.angle = 0
        this.projectiles = []
        this.target
        
        //variables
        this.range = range
        this.fireRate = fireRate
        this.projectile = projectile
        this.previousTarget
        this.sound = createSound("laser")
        this.sound.loop = true
    }

    draw() {
        super.draw()

        // c.strokeStyle = "rgba(10, 10, 10, 0.4)"
        // c.beginPath()
        // c.arc(this.center.x, this.center.y, this.range, 0, Math.PI * 2)
        // c.stroke()
    }

    shoot() {
        let laserPath = createLaser(this.target.position.x, this.target.position.y, this.center.x, this.center.y, 1, 10);
        c.fillStyle = 'yellow';
        c.fill(laserPath);

        if(this.target !== this.previousTarget) this.projectile.damage = 0
        if(this.frames % this.fireRate === 0) {
            this.projectile.damage += this.projectile.incrementalDamage
            this.target.HP -= this.projectile.damage
            if(this.target.HP <= 0) {
                const enemyIndex = enemies.findIndex((enemy) => {
                    return enemy === this.target
                })
                if(enemyIndex > -1) {
                    player.gold += this.target.gold
                    playerGHTML.innerHTML = player.gold
                    enemies.splice(enemyIndex, 1)
                    playSound("death")
                }
            }
        }

        this.previousTarget = this.target
    }

    update(){        
        if(this.target) {
            this.shoot()
            if(this.sound.paused) this.sound.play()
        } else {
            this.sound.pause()
            this.sound.currentTime = 0
        }
        if(this.target) this.frames++

        this.draw()
    }
}

const towers = {
    tower: { // 36 DPS
        imageSrc: "img/towers/tower.png",
        size: 32,
        range: 100,
        fireRate: 25,
        value: 100,
        projectile: {
            quantityPerShot: 1,
            img: "img/projectiles/bullet.png",
            speed: 7,
            radius: 4,
            damage: 15,
            size: 32,
            sound: "bullet"
        }
    },
    missile: { // 50 DPS
        imageSrc: "img/towers/missile.png",
        size: 32,
        range: 150,
        fireRate: 90,
        value: 175,
        projectile: {
            quantityPerShot: 1,
            img: "img/projectiles/missile-sm.png",
            speed: 4,
            radius: 7,
            damage: 75,
            size: 32,
            sound: "missile"
        }
    },
    missile2: { // 96 DPS
        imageSrc: "img/towers/missile2.png",
        size: 32,
        range: 250,
        fireRate: 500,
        value: 300,
        projectile: {
            quantityPerShot: 1,
            img: "img/projectiles/missile-sm.png",
            speed: 3,
            radius: 7,
            damage: 800,
            size: 32,
            sound: "missile"
        }
    },
    moab: { // 200 DPS
        imageSrc: "img/towers/moab.png",
        size: 64,
        range: 600,
        fireRate: 600,
        value: 1000,
        projectile: {
            quantityPerShot: 1,
            img: "img/projectiles/missile.png",
            speed: 2,
            radius: 15,
            damage: 2000,
            size: 64,
            sound: "moab"
        }
    },
    flamethrower: { // 9% - 3% DPS AOE
        class: "flamethrower",
        imageSrc: "img/towers/flamethrower.png",
        size: 32,
        range: 125,
        fireRate: 3,
        maxAngle: 0.5,
        cannonSpeed: 0.03,
        value: 50,
        projectile: {
            img: "img/projectiles/flame-1.png",
            speed: 2,
            radius: 6,
            damage: 0,
            size: 32,
            ttl: 120
        } 
    },
    flamethrower2: { // 9% - 3% DPS AOE
        class: "flamethrower",
        imageSrc: "img/towers/flamethrower2.png",
        size: 32,
        range: 150,
        fireRate: 5,
        maxAngle: .1,
        cannonSpeed: 0.01,
        value: 500,
        projectile: {
            img: "img/projectiles/flame-1.png",
            speed: 3,
            radius: 6,
            damage: 0,
            size: 32,
            ttl: 250,
        } 
    },
    laser: { // Incremental Damage
        class: "laser",
        imageSrc: "img/towers/laser.png",
        size: 32,
        range: 250,
        fireRate: 4,
        value: 1,
        projectile: {
            damage: 0,
            incrementalDamage: 0.3,
        } 
    },
    tank: { // 585
        imageSrc: "img/towers/tank.png",
        size: 64,
        range: 125,
        fireRate: 40,
        value: 2500,
        projectile: {
            quantityPerShot: 2,
            img: "img/projectiles/bullet.png",
            speed: 7,
            radius: 7,
            damage: 390,
            size: 64,
            sound: "tank"
        }
    },
    tank2: { // 900
        imageSrc: "img/towers/tank2.png",
        size: 64,
        range: 75,
        fireRate: 5,
        value: 4000,
        projectile: {
            quantityPerShot: 1,
            img: "img/projectiles/bullet.png",
            speed: 5,
            radius: 10,
            damage: 75,
            size: 64,
            sound: "tank"
        }
    }
}