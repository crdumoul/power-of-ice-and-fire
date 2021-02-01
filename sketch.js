let kai;
let kaiAnimation;
let alex;
let alexAnimation;
let character;
let map;

let trees;

let skeletonAnimation;
let skeletons;

function createCharacterAnimation(imageFile, frameWidth, frameHeight) {
    let spriteSheet = loadSpriteSheet(imageFile, frameWidth, frameHeight, 2);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = 30;
    return animation;
}

function createSkeletonAnimation() {
    let spriteSheet = loadSpriteSheet('assets/skeleton.png', 22, 32, 1);
    let animation = loadAnimation(spriteSheet);
    return animation;
}

function createSkeleton(x, y) {
    let skeleton = createSprite(x, y);
    skeleton.addAnimation('normal', skeletonAnimation);
    skeleton.setSpeed(1, random(0, 360));
    return skeleton;
}

function createTree(x, y) {
    let tree = createSprite(x, y);
    tree.addAnimation('normal', 'assets/tree1.png');
    tree.immovable = true;
    return tree;
}

function preload() {
    alexAnimation = createCharacterAnimation('assets/Alex.png', 76, 96);
    kaiAnimation = createCharacterAnimation('assets/Kai.png', 76, 96);
    skeletonAnimation = createSkeletonAnimation();

    map = loadStrings('assets/map.txt');
}

function frontalCollision(sprite, target, callback) {
    sprite.collide(target, (thisSprite, thatSprite) => {
        // facing right
        if (thisSprite.mirrorX() == 1) {
            if (thisSprite.touching.right) {
                callback(thisSprite, thatSprite);
            }
        // facing left
        } else {
            if (thisSprite.touching.left) {
                callback(thisSprite, thatSprite);
            }
        }
    });
}

function setup() {
    createCanvas(1024, 736);

    alex = createSprite(width / 2, height / 2);
    alex.addAnimation('normal', alexAnimation);

    kai = createSprite(width / 2, height / 2);
    kai.addAnimation('normal', kaiAnimation);

    trees = new Group();
    skeletons = new Group();
    let y = 16;
    map.forEach(row => {
        let x = 16;
        for(let i = 0 ; i < row.length ; i++) {
            switch (row.charAt(i)) {
                case 't':
                    trees.add(createTree(x, y));
                    break;
                case 's':
                    skeletons.add(createSkeleton(x, y));
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
    background(150, 150, 150);

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
            character.mirrorX(-1);
        }
        if (keyIsDown(RIGHT_ARROW)) {
            character.velocity.x = 5;
            character.mirrorX(1);
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
        skeletons.bounce(trees);
        skeletons.bounce(skeletons);

        frontalCollision(character, skeletons, (left, right) => {
            right.remove();
        });

        drawSprites();
    }
}
