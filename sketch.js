import { createCharacters, characterPreload, selectCharacter, STARTING_HEALTH } from './character.js';
import { createSkeleton, skeletonPreload } from './skeleton.js';
import { createZombie, zombiePreload } from './zombie.js';

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

let movingSkeletons;
let waitingSkeletons;

let fireAnimations;
let fires;
let visibleFires;

let zombies;

let scepterImage;
let scepter;

let viewport;

let isGameOver;
let winner;

const MAX_FRAME_RATE = 30;

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

window.preload = function() {
    characterPreload();
    skeletonPreload();
    zombiePreload();
    scepterImage = loadImage('assets/sun-scepter.png');
    goodWizardImage = loadImage('assets/good-wizard.png');
    treeImage = loadImage('assets/tree1.png');
    appleImage = loadImage('assets/apple.png');
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
                    createCharacters(x, y);
                    createViewport(x, y);
                    break;
                case 'W':
                    createGoodWizard(x, y);
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
    scepter = createSprite(x, y);
    scepter.addImage(scepterImage);
    scepter.visible = false;
    scepter.growth = 0.1;
}

function revealScepter(x, y) {
    scepter.position.x = x;
    scepter.position.y = y + 20;
    scepter.visible = true;
    scepter.rotationSpeed = 2;
    scepter.depth = 10000;
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

window.setup = function() {
    createCanvas(960, 640);
    frameRate(MAX_FRAME_RATE);
    createScepter(0, 0);
    layoutMap();
    layoutHearts();
    isGameOver = false;
    winner = false;
    angleMode(DEGREES);
}

function handleZombies() {
    zombies.forEach(zombie => zombie.move(character));
    zombies.collide(visibleTrees);
    zombies.overlap(visibleFires, (zombie, fire) => zombie.burn());
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

window.draw = function() {
    background(150, 150, 150);

    movingSkeletons.bounce(trees);
    movingSkeletons.bounce(movingSkeletons);

    if (character == undefined) {
        character = selectCharacter();
        if (character) {
            calculateVisibleTrees();
            calculateVisibleSkeletons();
            calculateVisibleFires();
        }
    } else {
        if (!isGameOver) {
            handleZombies();
            character.move();
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

function handleZoom() {
    if (keyDown('z')) {
        camera.zoom = 0.5;
    } else {
        camera.zoom = 1;
    }
}

function takeDamage(hero) {
    if (hero.takeDamage()) {
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
    character.updateDamageDelay();

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
        takeDamage(hero);
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
