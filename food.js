
let appleImage;

export function foodPreload(p5) {
    p5 = p5 || window;
    appleImage = p5.loadImage('assets/apple.png');
}

export function createApple(x, y, p5) {
    p5 = p5 || window;
    let apple = p5.createSprite(x, y);
    apple.addImage(appleImage);
    apple.immovable = true;
    return apple;
}

