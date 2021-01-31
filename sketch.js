let kai;
let alex;
let character;

let trees = [];

let canvasWidth = 1000;
let canvasHeight = 500;

function createCharacter(image1, image2) {
    let sprite = createSprite(canvasWidth / 2, canvasHeight / 2);
    let animation = loadAnimation(image1, image2);
    animation.frameDelay = 30;
    sprite.addAnimation('normal', animation);
    return sprite;
}

function createTree(x, y) {
    let tree = createSprite(x, y);
    tree.addAnimation('normal', 'assets/tree1.png');
    tree.width = 32;
    tree.height = 32;
    return tree;
}

function preload() {
    kai = createCharacter('assets/Kai-1.png', 'assets/Kai-2.png');
    alex = createCharacter('assets/Alex-1.png', 'assets/Alex-2.png');

    for (let x = 0 ; x < canvasWidth ; x += 32) {
        trees.push(createTree(x, 32));
    }
}

function setup() {
    createCanvas(canvasWidth, canvasHeight);
}

function draw() {
    background(200, 200, 200);

    if (character == undefined) {
        fill(0, 102, 153);
        textSize(48);
        textAlign(CENTER);
        text('Who do you want to be?', width / 2, (height / 2) - 50);
        text("Press 'a' for Alex", width / 2, height / 2);
        text("Press 'k' for Kai", width / 2, (height / 2) + 50);

        if (keyWentDown('a')) {
            character = alex;
        } else if (keyWentDown('k')) {
            character = kai;
        }
    } else {
        character.velocity.x = 0;
        character.velocity.y = 0;

        if (keyIsDown(LEFT_ARROW)) {
            character.velocity.x = -5;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            character.velocity.x = 5;
        }
        if (keyIsDown(UP_ARROW)) {
            character.velocity.y = -5;
        }
        if (keyIsDown(DOWN_ARROW)) {
            character.velocity.y = 5;
        }

        drawSprite(character);
        trees.forEach(tree => {
            drawSprite(tree);
            character.collide(tree);
        });
    }
}
