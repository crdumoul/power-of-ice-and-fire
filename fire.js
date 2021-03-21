let fireAnimations;

function createFireAnimation(frameDelay, p5) {
    let spriteSheet = p5.loadSpriteSheet('assets/fire.png', 32, 32, 2);
    let animation = p5.loadAnimation(spriteSheet);
    animation.frameDelay = frameDelay;
    return animation;
}

export function firePreload(p5) {
    p5 = p5 || window;
    fireAnimations = [];
    [8, 10, 12].forEach(frameDelay => {
        fireAnimations.push(createFireAnimation(frameDelay, p5));
    });
}

export function createFire(x, y, p5) {
    p5 = p5 || window;
    let fire = p5.createSprite(x, y);
    fire.addAnimation('normal', p5.random(fireAnimations));
    return fire;
}

