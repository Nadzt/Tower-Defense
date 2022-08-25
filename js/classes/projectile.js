class Projectile {
    constructor({position = {x: 0, y:0}, imageSrc, size}){
        this.image = new Image()
        this.image.src = imageSrc
        this.position = position
        this.center = {
            x: this.position.x,
            y: this.position.y
        }
    }

    draw() {
        c.save()
        c.translate(this.center.x, this.center.y)
        c.rotate(this.angle)
        c.translate(-this.center.x, -this.center.y)
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.size,
            this.size
        )
        c.restore()

        // c.beginPath()
        // c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2)
        // c.fillStyle = "red"
        // c.fill()
    }
}

class Bullet extends Projectile {
    constructor({
            position = {x: 0, y: 0},
            projectile,
            target,
        }){
        super({position, imageSrc: projectile.img})
        this.velocity = {
            x: 0,
            y: 0
        }
        
        // variables
        this.target = target
        this.radius = projectile.radius 
        this.damage = projectile.damage
        this.projectileSpeed = projectile.speed
        this.size = projectile.size
    }
    
    update() {
        this.center = {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        }
        const angle = Math.atan2(
            this.target.position.y - this.center.y,
            this.target.position.x - this.center.x
        )
        this.angle = angle + Math.PI * .5
        this.velocity.x = Math.cos(angle) * this.projectileSpeed
        this.velocity.y = Math.sin(angle) * this.projectileSpeed
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.draw()
    }
}

class Flames extends Projectile {
    constructor({
            position = {x: 0, y: 0},
            projectile,
            target,
        }){
        super({position, imageSrc: projectile.img})
        this.velocity = {
            x: 0,
            y: 0
        }
        
        // variables
        this.target = target
        this.radius = projectile.radius 
        this.damage = projectile.damage
        this.projectileSpeed = projectile.speed
        this.size = projectile.size
        this.ttl = projectile.ttl
        this.destination = false
    }
    
    update() {
        this.center = {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        }
        const angle = Math.atan2(
            this.target.position.y - this.center.y,
            this.target.position.x - this.center.x
        )
        this.angle = 0
        if(!this.destination) {
            this.velocity.x = Math.cos(angle) * this.projectileSpeed
            this.velocity.y = Math.sin(angle) * this.projectileSpeed
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
        }
        this.draw()
    }
}