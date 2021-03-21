let scepterImage;

export function scepterPreload(p5) {
    p5 = p5 || window;
    scepterImage = p5.loadImage('assets/sun-scepter.png');
}

export function createScepter(x, y, p5) {
    p5 = p5 || window;
    let scepter = p5.createSprite(x, y);
    scepter.addImage(scepterImage);
    scepter.visible = false;
    scepter.growth = 0.1;
    scepter.reveal = function(x, y) {
        this.position.x = x;
        this.position.y = y + 20;
        this.visible = true;
        this.rotationSpeed = 2;
        this.depth = 10000;
    };
    scepter.spin = function() {
        this.scale += this.growth;
        if (this.scale > 4 || this.scale < 1) {
            this.growth *= -1;
        }
    };

    return scepter;
}
