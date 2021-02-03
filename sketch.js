let kai;
let kaiAnimation;
let alex;
let alexAnimation;
let character;
let map;
let trees;
let hearts;
let emptyHeartAnimation;
let halfHeartAnimation;
let fullHeartAnimation;

let skeletonAnimation;
let skeletons;

let fireAnimations;
let fires;
let isGameOver;

let STARTING_HEALTH = 10;

function createCharacterAnimation(imageFile, frameWidth, frameHeight) {
    let spriteSheet = loadSpriteSheet(imageFile, frameWidth, frameHeight, 2);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = 10;
    return animation;
}

function createCharacter(x, y, animation) {
    let c = createSprite(x, y);
    c.addAnimation('normal', animation);
    c.health = STARTING_HEALTH;
    return c;
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

function createFireAnimation(frameDelay) {
    let spriteSheet = loadSpriteSheet('assets/fire.png', 32, 32, 2);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = frameDelay;
    return animation;
}

function createFire(x, y) {
    let fire = createSprite(x, y);
    fire.addAnimation('normal', random(fireAnimations));
    return fire;
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
    emptyHeartAnimation = loadAnimation('assets/empty-heart.png');
    halfHeartAnimation = loadAnimation('assets/half-heart.png');
    fullHeartAnimation = loadAnimation('assets/full-heart.png');
    fireAnimations = [];
    [8, 10, 12].forEach(frameDelay => {
        fireAnimations.push(createFireAnimation(frameDelay));
    });

    map = loadStrings('assets/map.txt');
}

function layoutMap() {
    trees = new Group();
    skeletons = new Group();
    fires = new Group();
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
                case 'f':
                    fires.add(createFire(x, y));
                    break;
                case 'P':
                    alex = createCharacter(x, y, alexAnimation);
                    kai = createCharacter(x, y, kaiAnimation);
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
    let numHearts = STARTING_HEALTH / 2;
    let heartWidth = 35;
    for (let i = 0 ; i < numHearts ; i++) {
        let heart = createSprite((width / 2) - (numHearts * heartWidth / 2) + (i * heartWidth), height - 32);
        heart.addAnimation('empty', emptyHeartAnimation)
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
    isGameOver = false;
}

function draw() {
    background(150, 150, 150);

    skeletons.bounce(trees);
    skeletons.bounce(skeletons);

    if (character == undefined) {
        selectCharacter();
    } else {
        if (!isGameOver) {
            handleCharacterMovement();
            handleZoom();
        }

        handleCollisions();
        panCamera();

        drawSprites();

        if (isGameOver) {
            fill(0, 0, 0);
            textSize(96);
            textAlign(CENTER);
            text('GAME OVER', width / 2, height / 2);
        }
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

function bounceBack(sprite, bounce) {
    if (sprite.touching.left) {
        sprite.position.x += bounce;
    }
    if (sprite.touching.right) {
        sprite.position.x -= bounce;
    }
    if (sprite.touching.top) {
        sprite.position.y += bounce;
    }
    if (sprite.touching.bottom) {
        sprite.position.y -= bounce;
    }
}

function takeDamage(hero) {
    bounceBack(hero, 15);
    hero.health -= 1;
    updateHearts(hero.health);
    if (hero.health == 0) {
        gameOver();
    }
}

function updateHearts(health) {
    for (let i = 0 ; i < hearts.length ; i++) {
        let heart = hearts.get(i);
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

function gameOver() {
    isGameOver = true;
    getSprites().forEach(sprite => {
        sprite.velocity.x = 0;
        sprite.velocity.y = 0;
        sprite.animation.stop();
    });
}

function handleCollisions() {
    character.collide(trees);

    character.collide(skeletons, (hero, skeleton) => {
        // facing right
        if (hero.mirrorX() == 1) {
            if (hero.touching.right) {
                skeleton.remove();
            } else {
                takeDamage(hero);
            }
        // facing left
        } else {
            if (hero.touching.left) {
                skeleton.remove();
            } else {
                takeDamage(hero);
            }
        }
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
