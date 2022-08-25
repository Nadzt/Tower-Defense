class Enemy {
    constructor({
        position = {x: 0, y:0},
        imageSrc,
        offset = {x: 32, y: 32},
        size = 64
    })
    {
        this.image = new Image()
        this.image.src = imageSrc
        this.position = position
        this.offset = offset
        this.size = size
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.angle)
        c.translate(-this.position.x, -this.position.y)
        c.drawImage(
            this.image,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            this.size,
            this.size
        )
        c.restore()

        if(this.HP < this.maxHP) {
            c.fillStyle = "red"
            c.fillRect(
                this.position.x - this.offset.x / 2,
                this.position.y - this.offset.y / 1.5,
                this.size / 2,
                5
            )
            c.fillStyle = "green"
            c.fillRect(
                this.position.x - this.offset.x / 2,
                this.position.y - this.offset.y / 1.5,
                (this.HP / this.maxHP) * this.size / 2,
                5
            )
        }
    }
}

class Soldier extends Enemy {
    constructor({position = {x: 0, y:0}, stage, pathing, soldier, speed}) {
        super({
            position: position,
            imageSrc: soldier.imageSrc,
        })
        this.position = position
        this.velocity = {
            x: 0,
            y: 0
        }
        this.waypoint = {
            stage: stage,
            pathing: pathing,
            current: 0
        }
        this.gold = soldier.gold
        this.radius = 13
        this.angle = 0
        this.HP = soldier.HP
        this.maxHP = soldier.HP
        this.velocityMultiplier = speed
        this.fireTicks = 0
        this.fireDamage = soldier.fireDamage
        this.damage = soldier.damage
    }

    draw() {
        // this enemy hitbox
        // c.beginPath()
        // c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        // c.fillStyle = "red"
        // c.fill()
    }

    update() {
        // selects pathing and next waypoint // i can optimize this
        const pathing = stagePathings[this.waypoint.stage][this.waypoint.pathing]
        const waypoint = pathing[this.waypoint.current]
        // angle for sprite rotation
        const yDistance = waypoint.y - this.position.y
        const xDistance = waypoint.x - this.position.x
        const angle = Math.atan2(yDistance, xDistance)
        this.angle = angle

        this.velocity.x = Math.cos(angle) * this.velocityMultiplier
        this.velocity.y = Math.sin(angle) * this.velocityMultiplier
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        // changes to next waypoint
        if( Math.abs(Math.round(this.position.x) - Math.round(waypoint.x)) < Math.abs(this.velocity.x)
        && Math.abs(Math.round(this.position.y) - Math.round(waypoint.y)) < Math.abs(this.velocity.y)
        && this.waypoint.current < pathing.length - 1)
        { this.waypoint.current++ }

        // this.draw is the hitbox, super.draw is the sprite drawing
        // this.draw() 
        super.draw()
    }
}

const soldiers = [
    {
        imageSrc: "img/enemies/enemy1.png",
        gold: 50,
        HP: 100,
        damage: 1,
        speed: 1.5,
        fireDamage: 0.15 // 9%
    },
    {
        imageSrc: "img/enemies/enemy2.png",
        gold: 100,
        HP: 400,
        damage: 3,
        speed: 1.5,
        fireDamage: 0.6 // 9%
    },
    {
        imageSrc: "img/enemies/enemy3.png",
        gold: 200,
        HP: 800,
        damage: 5,
        speed: 1.5,
        fireDamage: 0.8 // 6%
    },
    {
        imageSrc: "img/enemies/enemy4.png",
        gold: 350,
        HP: 2000,
        damage: 10,
        speed: 1.5,
        fireDamage: 1 // 6%
    },
]