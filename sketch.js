import { createCharacters, characterPreload, selectCharacter, STARTING_HEALTH } from './character.js';
import { createSkeleton, skeletonPreload } from './skeleton.js';
import { createZombie, zombiePreload } from './zombie.js';
import { createFire, firePreload } from './fire.js';
import { createHearts, heartsPreload } from './hearts.js';
import { createTree, treePreload } from './tree.js';
import { createViewport } from './viewport.js';
import { createApple, foodPreload } from './food.js';
import { createGoodWizard, goodWizardPreload } from './good_wizard.js';
import { createScepter, scepterPreload } from './scepter.js';

let character;
let map;
let hearts;
let goodWizard;
let scepter;
let viewport;
let isGameOver;
let winner;

let apples;
let trees;
let visibleTrees;
let movingSkeletons;
let waitingSkeletons;
let fires;
let visibleFires;
let zombies;

const MAX_FRAME_RATE = 30;

window.preload = function() {
    characterPreload();
    skeletonPreload();
    zombiePreload();
    firePreload();
    heartsPreload();
    treePreload();
    foodPreload();
    goodWizardPreload();
    scepterPreload();

    map = loadStrings('assets/maze-map.txt');
}

function layoutMap() {
    apples = new Group();
    trees = new Group();
    visibleTrees = new Group();
    movingSkeletons = new Group();
    waitingSkeletons = new Group();
    fires = new Group();
    visibleFires = new Group();
    zombies = new Group();

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
                    viewport = createViewport(x, y);
                    break;
                case 'W':
                    goodWizard = createGoodWizard(x, y);
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

window.setup = function() {
    createCanvas(960, 640);
    frameRate(MAX_FRAME_RATE);
    angleMode(DEGREES);
    isGameOver = false;
    winner = false;

    layoutMap();
    scepter = createScepter(0, 0);
    hearts = createHearts();
}

function handleZombies() {
    zombies.forEach(zombie => zombie.move(character));
    zombies.collide(visibleTrees);
    zombies.overlap(visibleFires, (zombie, fire) => zombie.burn());
}

window.draw = function() {
    background(150, 150, 150);

    movingSkeletons.bounce(trees);
    movingSkeletons.bounce(movingSkeletons);

    if (character == undefined) {
        character = selectCharacter();
        if (character) {
            viewport.markVisible(trees, visibleTrees);
            viewport.markVisible(fires, visibleFires);
            calculateVisibleSkeletons();
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
            textSize(96);
            if (winner) {
                text('YOU WIN!', camera.position.x, camera.position.y);
                textSize(32);
                text('You\'ve earned a piece of the Sun Scepter', camera.position.x, camera.position.y + 50);
                scepter.spin();
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
        hearts.update(hero.health);
        if (hero.health == 0) {
            gameOver();
        }
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
        hearts.update(hero.health);
        apple.remove();
    });

    character.overlap(goodWizard, (hero, wizard) => {
        winner = true;
        scepter.reveal(camera.position.x, camera.position.y + 90);
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
        hearts.move(pan.deltaX, pan.deltaY);
        viewport.markVisible(trees, visibleTrees);
        viewport.markVisible(fires, visibleFires);
        calculateVisibleSkeletons();
    }
}

function calculateVisibleSkeletons() {
    viewport.overlap(waitingSkeletons, (viewport, skeleton) => {
        skeleton.setSpeed(1, random(0, 360));
        waitingSkeletons.remove(skeleton);
        movingSkeletons.add(skeleton);
    });
}

