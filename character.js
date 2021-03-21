export const STARTING_HEALTH = 12;
const DAMAGE_DELAY_FRAMES = 30;
const NORMAL_ANIMATION = 'normal';
const DAMAGE_ANIMATION = 'damage';
const SPEED = 7;

let kai;
let kaiAnimation;
let kaiDamageAnimation;
let alex;
let alexAnimation;
let alexDamageAnimation;

export function characterPreload(p5) {
    p5 = p5 || window;
    alexAnimation = createAnimation('assets/Alex.png', 76, 96, 10, p5);
    alexDamageAnimation = createAnimation('assets/Alex-damage.png', 76, 96, 5, p5);
    kaiAnimation = createAnimation('assets/Kai.png', 76, 96, 10, p5);
    kaiDamageAnimation = createAnimation('assets/Kai-damage.png', 76, 96, 5, p5);
}

function createAnimation(imageFile, frameWidth, frameHeight, frameDelay, p5) {
    p5 = p5 || window;
    let spriteSheet = p5.loadSpriteSheet(imageFile, frameWidth, frameHeight, 2);
    let animation = p5.loadAnimation(spriteSheet);
    animation.frameDelay = frameDelay;
    return animation;
}

export function createCharacters(x, y, p5) {
    p5 = p5 || window;
    alex = createCharacter(x, y, alexAnimation, alexDamageAnimation, p5);
    alex.setCollider('rectangle', 0, 0, 74, 94);
    kai = createCharacter(x, y, kaiAnimation, kaiDamageAnimation, p5);
    kai.setCollider('rectangle', 3, 2, 60, 86);
}

function createCharacter(x, y, animation, damageAnimation, p5) {
    p5 = p5 || window;
    let character = p5.createSprite(x, y);
    character.p5 = p5;
    character.addAnimation(NORMAL_ANIMATION, animation);
    character.addAnimation(DAMAGE_ANIMATION, damageAnimation);

    character.health = STARTING_HEALTH;
    character.damageDelay = 0;

    character.updateDamageDelay = function() {
        if (this.damageDelay > 0) {
            this.damageDelay--;

            if (this.damageDelay == 0) {
                this.changeAnimation(NORMAL_ANIMATION);
            }
        }
    };

    character.takeDamage = function() {
        if (this.damageDelay == 0) {
            this.health -= 1;
            this.damageDelay = DAMAGE_DELAY_FRAMES;
            this.changeAnimation(DAMAGE_ANIMATION);
            return true;
        } else {
            return false;
        }
    };

    character.move = function() {
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (this.p5.keyIsDown(this.p5.LEFT_ARROW)) {
            this.velocity.x = -SPEED;
            this.mirrorX(-1);
        }
        if (this.p5.keyIsDown(this.p5.RIGHT_ARROW)) {
            this.velocity.x = SPEED;
            this.mirrorX(1);
        }
        if (this.p5.keyIsDown(this.p5.UP_ARROW)) {
            this.velocity.y = -SPEED;
        }
        if (this.p5.keyIsDown(this.p5.DOWN_ARROW)) {
            this.velocity.y = SPEED;
        }
    };
    return character;
}

export function selectCharacter(p5) {
    p5 = p5 || window;

    p5.fill(0, 102, 153);
    p5.textSize(48);
    p5.textAlign(p5.CENTER);
    p5.text('Who do you want to be?', p5.width / 2, (p5.height / 2) - 50);
    p5.text("Press 'a' for Alex", p5.width / 2, p5.height / 2);
    p5.text("Press 'k' for Kai", p5.width / 2, (p5.height / 2) + 50);

    if (p5.keyWentDown('a')) {
        kai.remove();
        return alex;
    } else if (p5.keyWentDown('k')) {
        alex.remove();
        return kai;
    }
    return undefined;
}
