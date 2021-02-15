let kai;
let kaiAnimation;
let kaiDamageAnimation;
let alex;
let alexAnimation;
let alexDamageAnimation;
let character;
let map;
let hearts;
let emptyHeartAnimation;
let halfHeartAnimation;
let fullHeartAnimation;

let treeImage;
let trees;
let visibleTrees;

let goodWizardImage;
let goodWizard;

let appleImage;
let apples;

let skeletonAnimation;
let movingSkeletons;
let waitingSkeletons;

let fireAnimations;
let fires;
let visibleFires;

let zombieAnimation;
let burningZombieAnimation;
let zombies;

let scepterImage;
let scepter;

let viewport;

let isGameOver;
let winner;

const STARTING_HEALTH = 12;
const MAX_FRAME_RATE = 30;
const CHARACTER_SPEED = 7;

function createCharacterAnimation(imageFile, frameWidth, frameHeight, frameDelay = 10) {
    let spriteSheet = loadSpriteSheet(imageFile, frameWidth, frameHeight, 2);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = frameDelay;
    return animation;
}

function createCharacter(x, y, animation, damageAnimation) {
    let c = createSprite(x, y);
    c.addAnimation('normal', animation);
    c.addAnimation('damage', damageAnimation);
    c.health = STARTING_HEALTH;
    c.damageDelay = 0;
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
    return skeleton;
}

function createZombieAnimation(file, numFrames) {
    let spriteSheet = loadSpriteSheet(file, 32, 32, numFrames);
    let animation = loadAnimation(spriteSheet);
    animation.frameDelay = 10;
    return animation;
}

function createZombie(x, y) {
    let zombie = createSprite(x, y);
    zombie.addAnimation('normal', zombieAnimation);
    zombie.addAnimation('burning', burningZombieAnimation);
    zombie.setCollider('rectangle', -7, 2, 19, 30);
    zombie.scale = 2;
    return zombie;
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
    tree.addImage(treeImage);
    tree.setCollider('circle', 0, 0, 16);
    tree.immovable = true;
    return tree;
}

function createApple(x, y) {
    let apple = createSprite(x, y);
    apple.addImage(appleImage);
    apple.immovable = true;
    return apple;
}

function preload() {
    scepterImage = loadImage('assets/sun-scepter.png');
    goodWizardImage = loadImage('assets/good-wizard.png');
    treeImage = loadImage('assets/tree1.png');
    appleImage = loadImage('assets/apple.png');
    alexAnimation = createCharacterAnimation('assets/Alex.png', 76, 96);
    alexDamageAnimation = createCharacterAnimation('assets/Alex-damage.png', 76, 96, 5);
    kaiAnimation = createCharacterAnimation('assets/Kai.png', 76, 96);
    kaiDamageAnimation = createCharacterAnimation('assets/Kai-damage.png', 76, 96, 5);
    skeletonAnimation = createSkeletonAnimation();
    zombieAnimation = createZombieAnimation('assets/gliding-zombie.png', 1);
    burningZombieAnimation = createZombieAnimation('assets/burning-zombie.png', 2);
    emptyHeartAnimation = loadAnimation('assets/empty-heart.png');
    halfHeartAnimation = loadAnimation('assets/half-heart.png');
    fullHeartAnimation = loadAnimation('assets/full-heart.png');
    fireAnimations = [];
    [8, 10, 12].forEach(frameDelay => {
        fireAnimations.push(createFireAnimation(frameDelay));
    });

    map = loadStrings('assets/maze-map.txt');
}

function layoutMap() {
    apples = new Group();
    trees = new Group();
    visibleTrees = new Group();
    waitingSkeletons = new Group();
    movingSkeletons = new Group();
    zombies = new Group();
    fires = new Group();
    visibleFires = new Group();
    let y = 16;
    map.forEach(row => {
        let x = 16;
        for(let i = 0 ; i < row.length ; i++) {
            switch (row.charAt(i)) {
                case 'a':
                    apples.add(createApple(x, y));
                    break;
                case 't':
                    trees.add(createTree(x, y));
                    break;
                case 's':
                    waitingSkeletons.add(createSkeleton(x, y));
                    break;
                case 'f':
                    fires.add(createFire(x, y));
                    break;
                case 'z':
                    zombies.add(createZombie(x, y));
                    break;
                case 'P':
                    alex = createCharacter(x, y, alexAnimation, alexDamageAnimation);
                    alex.setCollider('rectangle', 0, 0, 74, 94);
                    kai = createCharacter(x, y, kaiAnimation, kaiDamageAnimation);
                    kai.setCollider('rectangle', 3, 2, 60, 86);
                    createViewport(x, y);
                    break;
                case 'W':
                    createGoodWizard(x, y);
                    createScepter(x, y);
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

function createGoodWizard(x, y) {
    goodWizard = createSprite(x, y);
    goodWizard.addImage(goodWizardImage);
    goodWizard.setCollider('rectangle', 12, 0, 60, 100);
}

function createScepter(x, y) {
    scepter = createSprite(x + 60, y);
    scepter.addImage(scepterImage);
    scepter.visible = false;
    scepter.growth = 0.1;
}

function revealScepter(x, y) {
    scepter.position.x = x;
    scepter.position.y = y + 20;
    scepter.visible = true;
    scepter.rotationSpeed = 2;
}

function spinScepter() {
    scepter.scale += scepter.growth;
    if (scepter.scale > 4 || scepter.scale < 1) {
        scepter.growth *= -1;
    }
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

function createViewport(x, y) {
    viewport = createSprite(x, y);
    viewport.setCollider('rectangle', 0, 0, width, height);
    viewport.shapeColor = color(0, 0, 0, 0);
}

function setup() {
    createCanvas(960, 640);
    frameRate(MAX_FRAME_RATE);
    layoutMap();
    layoutHearts();
    isGameOver = false;
    winner = false;
    angleMode(DEGREES);
}

function handleZombies() {
    zombies.forEach(zombie => {
        let delta = zombie.position.copy().sub(character.position);
        if (delta.magSq() < 40000) {
            zombie.setSpeed(1, delta.heading() + 180);
        } else {
            zombie.setSpeed(0);
        }
    });
    zombies.collide(visibleTrees);
    zombies.overlap(visibleFires, (zombie, fire) => {
        zombie.changeAnimation('burning');
        setTimeout(() => zombie.remove(), 1000);
    });
}

function calculateVisibleTrees() {
    visibleTrees.clear();
    viewport.overlap(trees, (viewport, tree) => {
        visibleTrees.add(tree);
    });
}

function calculateVisibleFires() {
    visibleFires.clear();
    viewport.overlap(fires, (viewport, fire) => {
        visibleFires.add(fire);
    });
}

function draw() {
    background(150, 150, 150);

    movingSkeletons.bounce(trees);
    movingSkeletons.bounce(movingSkeletons);

    if (character == undefined) {
        selectCharacter();
    } else {
        if (!isGameOver) {
            handleZombies();
            handleCharacterMovement();
            handleZoom();
        }

        handleCharacterCollisions();
        panCamera();

        drawSprites();

        if (isGameOver) {
            fill(255, 255, 255);
            textAlign(CENTER);
            if (winner) {
                textSize(96);
                text('YOU WIN!', camera.position.x, camera.position.y);
                textSize(32);
                text('You\'ve earned a piece of the Sun Scepter', camera.position.x, camera.position.y + 50);
                spinScepter();
            } else {
                text('GAME OVER', camera.position.x, camera.position.y);
            }
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

    if (character) {
        calculateVisibleTrees();
        calculateVisibleSkeletons();
        calculateVisibleFires();
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
    if (hero.damageDelay == 0) {
        hero.health -= 1;
        hero.damageDelay = MAX_FRAME_RATE;
        hero.changeAnimation('damage');
        updateHearts(hero.health);
        if (hero.health == 0) {
            gameOver();
        }
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
        if (sprite.animation) {
            sprite.animation.stop();
        }
    });
}

function handleCharacterCollisions() {
    if (character.damageDelay > 0) {
        character.damageDelay--;

        if (character.damageDelay == 0) {
            character.changeAnimation('normal');
        }
    }

    character.collide(visibleTrees);

    character.displace(movingSkeletons, (hero, skeleton) => {
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

    character.displace(zombies, (hero, zombie) => {
        if (hero.damageDelay == 0) {
            takeDamage(hero);
        }
    });

    character.overlap(visibleFires, (hero, fire) => {
        takeDamage(hero);
    });

    character.collide(apples, (hero, apple) => {
        hero.health = Math.min(STARTING_HEALTH, hero.health + 2);
        updateHearts(hero.health);
        apple.remove();
    });

    character.overlap(goodWizard, (hero, wizard) => {
        winner = true;
        revealScepter(camera.position.x, camera.position.y + 90);
        gameOver();
    });
}

function handleCharacterMovement() {
    character.velocity.x = 0;
    character.velocity.y = 0;

    if (keyIsDown(LEFT_ARROW)) {
        character.velocity.x = -CHARACTER_SPEED;
        character.mirrorX(-1);
    }
    if (keyIsDown(RIGHT_ARROW)) {
        character.velocity.x = CHARACTER_SPEED;
        character.mirrorX(1);
    }
    if (keyIsDown(UP_ARROW)) {
        character.velocity.y = -CHARACTER_SPEED;
    }
    if (keyIsDown(DOWN_ARROW)) {
        character.velocity.y = CHARACTER_SPEED;
    }
}

function panCamera() {
    let characterX = character.position.x;
    let cameraX = camera.position.x;
    let characterY = character.position.y;
    let cameraY = camera.position.y;
    let pan = {apply: false};

    let xThreshold = (width / 2) - (character.width / 2) - 50;
    if (characterX > cameraX + xThreshold ||
        characterX < cameraX - xThreshold) {

        pan.apply = true;
        pan.x = characterX;
        pan.y = cameraY;
        pan.deltaX = characterX - cameraX;
        pan.deltaY = 0;
    }

    let yThreshold = (height / 2) - (character.height / 2) - 50;
    if (characterY > cameraY + yThreshold ||
        characterY < cameraY - yThreshold) {

        pan.apply = true;
        pan.x = cameraX
        pan.y = characterY;
        pan.deltaX = 0;
        pan.deltaY = characterY - cameraY;
    }

    if (pan.apply) {
        camera.position.x = pan.x;
        camera.position.y = pan.y;
        viewport.position.x = pan.x;
        viewport.position.y = pan.y;
        moveHearts(pan.deltaX, pan.deltaY);
        calculateVisibleTrees();
        calculateVisibleSkeletons();
        calculateVisibleFires();
    }
}

function calculateVisibleSkeletons() {
    viewport.overlap(waitingSkeletons, (viewport, skeleton) => {
        skeleton.setSpeed(1, random(0, 360));
        waitingSkeletons.remove(skeleton);
        movingSkeletons.add(skeleton);
    });
}

function moveHearts(deltaX, deltaY) {
    for (let i = 0 ; i < hearts.length ; i++) {
        let heart = hearts.get(i);
        heart.position.x += deltaX;
        heart.position.y += deltaY;
    }
}
