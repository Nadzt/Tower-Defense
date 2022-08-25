class PlacementTile {
    constructor({position}) {
        this.position = position
        this.size = 32
        this.color = "rgba(255, 255, 255, .2)"
        this.isEmpty = true
        this.active = false
    }
    
    draw() {
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.size, this.size)
    }

    update(){
        if(!this.isEmpty) return
        if(mouse.x > this.position.x && mouse.x < this.position.x + this.size
        && mouse.y > this.position.y && mouse.y < this.position.y + this.size)
        {
            this.color = "rgba(0, 255, 0, .2)"
            
            c.beginPath()
            c.strokeStyle = "rgba(10, 10, 10, 0.4)"
            c.arc(this.position.x + currentTower.size/2, this.position.y + currentTower.size/2, currentTower.range, 0, Math.PI * 2)
            c.stroke()
        } else {
            this.color = "rgba(255, 255, 255, .2)"
        }
        if(this.active) this.color = "rgba(0, 255, 0, .2)"

        this.draw()
    }
}