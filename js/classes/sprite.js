class Sprite {
    constructor({
        position = {x: 0, y:0},
        imageSrc,
        offset = {x: 0, y: 0},
        size = 64
    })
    {
        this.image = new Image()
        this.image.src = imageSrc
        this.position = position
        this.offset = offset
        this.size = size
        this.frames = {
            current: 0,
            elapsed: 0
        }
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
    }
}