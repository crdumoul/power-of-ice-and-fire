let kai;
let kaiAnimation;
let alex;
let alexAnimation;
let character;

let trees;

function createCharacterAnimation(imageFile, frameWidth, frameHeight) {
    let spriteSheet = loadSpriteSheet(imageFile, frameWidth, frameHeight, 2);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = 30;
    return animation;
}

function createCharacter(imageFile, frameWidth, frameHeight) {
    let sprite = createSprite(width / 2, height / 2);
    let spriteSheet = loadSpriteSheet(imageFile, frameWidth, frameHeight, 2);
    let animation = loadAnimation(spriteSheet);
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
    alexAnimation = createCharacterAnimation('assets/Alex.png', 76, 96);
    kaiAnimation = createCharacterAnimation('assets/Kai.png', 76, 96);
}

function setup() {
    createCanvas(1024, 736);

    alex = createSprite(width / 2, height / 2);
    alex.addAnimation('normal', alexAnimation);

    kai = createSprite(width / 2, height / 2);
    kai.addAnimation('normal', kaiAnimation);

    trees = new Group();
    let x = 16;
    for ( ; x < width ; x += 32) {
        trees.add(createTree(x, 16));
    }
    x -= 32;
    for (let y = 16 ; y < height ; y += 32) {
        trees.add(createTree(x, y));
    }
    let y = 16;
    for ( ; y < height ; y += 32) {
        trees.add(createTree(16, y));
    }
    y -= 32;
    for (let x = 16 ; x < width ; x += 32) {
        trees.add(createTree(x, y));
    }
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
            kai.remove();
        } else if (keyWentDown('k')) {
            character = kai;
            alex.remove();
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

        character.collide(trees);

        drawSprites();
    }
}
