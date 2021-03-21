import { STARTING_HEALTH } from './character.js';

let emptyHeartAnimation;
let halfHeartAnimation;
let fullHeartAnimation;

export function heartsPreload(p5) {
    p5 = p5 || window;
    emptyHeartAnimation = p5.loadAnimation('assets/empty-heart.png');
    halfHeartAnimation = p5.loadAnimation('assets/half-heart.png');
    fullHeartAnimation = p5.loadAnimation('assets/full-heart.png');
}

export function createHearts(p5) {
    p5 = p5 || window;
    let hearts = new p5.Group();
    let numHearts = STARTING_HEALTH / 2;
    let heartWidth = 35;
    for (let i = 0 ; i < numHearts ; i++) {
        let x = (p5.width / 2) - (numHearts * heartWidth / 2) + (i * heartWidth);
        let heart = p5.createSprite(x, p5.height - 32);
        heart.addAnimation('empty', emptyHeartAnimation)
        heart.addAnimation('half', halfHeartAnimation)
        heart.addAnimation('full', fullHeartAnimation)
        heart.changeAnimation('full');
        hearts.add(heart);
    }
    hearts.update = function(health) {
        for (let i = 0 ; i < this.length ; i++) {
            let heart = this.get(i);
            if(health >= 2) {
                heart.changeAnimation('full');
            } else if (health >= 1) {
                heart.changeAnimation('half');
            } else {
                heart.changeAnimation('empty');
            }
            health -= 2;
        }
    }
    hearts.move = function(deltaX, deltaY) {
        for (let i = 0 ; i < this.length ; i++) {
            let heart = this.get(i);
            heart.position.x += deltaX;
            heart.position.y += deltaY;
        }
    }

    return hearts;
}

