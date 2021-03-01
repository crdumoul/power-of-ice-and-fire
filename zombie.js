
const NORMAL_ANIMATION = 'normal';
const BURNING_ANIMATION = 'burning';

let zombieAnimation;
let burningZombieAnimation;

function createZombieAnimation(file, numFrames, p5) {
    let spriteSheet = p5.loadSpriteSheet(file, 32, 32, numFrames);
    let animation = p5.loadAnimation(spriteSheet);
    animation.frameDelay = 10;
    return animation;
}

export function zombiePreload(p5) {
    p5 = p5 || window;
    zombieAnimation = createZombieAnimation('assets/gliding-zombie.png', 1, p5);
    burningZombieAnimation = createZombieAnimation('assets/burning-zombie.png', 2, p5);
}

export function createZombie(x, y, p5) {
    p5 = p5 || window;
    let zombie = p5.createSprite(x, y);
    zombie.addAnimation(NORMAL_ANIMATION, zombieAnimation);
    zombie.addAnimation(BURNING_ANIMATION, burningZombieAnimation);
    zombie.setCollider('rectangle', -7, 2, 19, 30);
    zombie.scale = 2;
    zombie.maxSpeed = 2;
    zombie.move = function(character) {
        let distance = p5.dist(character.position.x, character.position.y, this.position.x, this.position.y);
        if (distance < 200) {
            this.attractionPoint(0.5, character.position.x, character.position.y);
        } else {
            this.setSpeed(0);
        }
    };
    zombie.burn = function() {
        this.changeAnimation(BURNING_ANIMATION);
        setTimeout(() => this.remove(), 1000);
    };
    return zombie;
}

