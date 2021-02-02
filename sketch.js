let kai;
let kaiAnimation;
let alex;
let alexAnimation;
let character;
let map;
let trees;
let hearts;
let halfHeartAnimation;
let fullHeartAnimation;

let skeletonAnimation;
let skeletons;

function createCharacterAnimation(imageFile, frameWidth, frameHeight) {
    let spriteSheet = loadSpriteSheet(imageFile, frameWidth, frameHeight, 2);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = 10;
    return animation;
}

function createSkeletonAnimation() {
    let spriteSheet = loadSpriteSheet('assets/skeleton.png', 22, 32, 2);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = 5;
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
    halfHeartAnimation = loadAnimation('assets/half-heart.png');
    fullHeartAnimation = loadAnimation('assets/full-heart.png');

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

function layoutMap() {
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
                case 'P':
                    alex = createSprite(x, y);
                    alex.addAnimation('normal', alexAnimation);
                    kai = createSprite(x, y);
                    kai.addAnimation('normal', kaiAnimation);
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

function layoutHearts() {
    hearts = new Group();
    let numHearts = 5;
    let heartWidth = 35;
    for (let i = 0 ; i < numHearts ; i++) {
        let heart = createSprite((width / 2) - (numHearts * heartWidth / 2) + (i * heartWidth), height - 32);
        heart.addAnimation('half', halfHeartAnimation)
        heart.addAnimation('full', fullHeartAnimation)
        heart.changeAnimation('full');
        hearts.add(heart);
    }
}

function setup() {
    createCanvas(1024, 704);
    frameRate(30);
    layoutMap();
    layoutHearts();
}

function draw() {
    background(150, 150, 150);

    skeletons.bounce(trees);
    skeletons.bounce(skeletons);

    if (character == undefined) {
        selectCharacter();
    } else {
        handleCharacterMovement();
        handleZoom();
        handleCollisions();
        panCamera();

        drawSprites();
    }
}

function selectCharacter() {
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
}

function handleZoom() {
    if (keyDown('z')) {
        camera.zoom = 0.5;
    } else {
        camera.zoom = 1;
    }
}

function handleCollisions() {
    character.collide(trees);
    frontalCollision(character, skeletons, (left, right) => {
        right.remove();
    });
}

function handleCharacterMovement() {
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
}

function panCamera() {
    let xThreshold = (width / 2) - (character.width / 2);
    let characterX = character.position.x;
    let cameraX = camera.position.x;
    if (characterX > cameraX + xThreshold ||
        characterX < cameraX - xThreshold) {
        camera.position.x = characterX;
        moveHearts(characterX - cameraX, 0);
    }

    let yThreshold = (height / 2) - (character.height / 2);
    let characterY = character.position.y;
    let cameraY = camera.position.y;
    if (characterY > cameraY + yThreshold ||
        characterY < cameraY - yThreshold) {
        camera.position.y = characterY;
        moveHearts(0, characterY - cameraY);
    }
}

function moveHearts(deltaX, deltaY) {
    for (let i = 0 ; i < hearts.length ; i++) {
        let heart = hearts.get(i);
        heart.position.x += deltaX;
        heart.position.y += deltaY;
    }
}
