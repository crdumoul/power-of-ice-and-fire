let kai;
let kaiAnimation;
let alex;
let alexAnimation;
let character;
let trees;
let map;

function createCharacterAnimation(imageFile, frameWidth, frameHeight) {
    let spriteSheet = loadSpriteSheet(imageFile, frameWidth, frameHeight, 2);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = 30;
    return animation;
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

    map = loadStrings('assets/map.txt');
}

function setup() {
    createCanvas(1024, 736);

    alex = createSprite(width / 2, height / 2);
    alex.addAnimation('normal', alexAnimation);

    kai = createSprite(width / 2, height / 2);
    kai.addAnimation('normal', kaiAnimation);

    trees = new Group();
    let y = 16;
    map.forEach(row => {
        let x = 16;
        for(let i = 0 ; i < row.length ; i++) {
            switch (row.charAt(i)) {
                case 't':
                    trees.add(createTree(x, y));
                    break;
                case ' ':
                    // do nothing
                    break;
                default:
                    throw 'Invalid map character: ' + row.charAt(i)
            }
            x += 32;
        }
        y += 32;
    });
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

        if (keyDown('z')) {
            camera.zoom = 0.2;
        } else {
            camera.zoom = 1;
        }

        character.collide(trees);

        drawSprites();
    }
}
