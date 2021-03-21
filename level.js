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

export const LEVEL1_MAP = 'assets/maze-map.txt';
export const LEVEL2_MAP = 'assets/map.txt';

export function createLevel(mapFile) {
    return function(p) {
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

        p.preload = function() {
            characterPreload(p);
            skeletonPreload(p);
            zombiePreload(p);
            firePreload(p);
            heartsPreload(p);
            treePreload(p);
            foodPreload(p);
            goodWizardPreload(p);
            scepterPreload(p);

            map = p.loadStrings(mapFile);
        }

        function layoutMap() {
            apples = new p.Group();
            trees = new p.Group();
            visibleTrees = new p.Group();
            movingSkeletons = new p.Group();
            waitingSkeletons = new p.Group();
            fires = new p.Group();
            visibleFires = new p.Group();
            zombies = new p.Group();

            let y = 16;
            map.forEach(row => {
                let x = 16;
                for(let i = 0 ; i < row.length ; i++) {
                    switch (row.charAt(i)) {
                        case 'a':
                            apples.add(createApple(x, y, p));
                            break;
                        case 't':
                            trees.add(createTree(x, y, p));
                            break;
                        case 's':
                            waitingSkeletons.add(createSkeleton(x, y, p));
                            break;
                        case 'f':
                            fires.add(createFire(x, y, p));
                            break;
                        case 'z':
                            zombies.add(createZombie(x, y, p));
                            break;
                        case 'P':
                            createCharacters(x, y, p);
                            viewport = createViewport(x, y, p);
                            break;
                        case 'W':
                            goodWizard = createGoodWizard(x, y, p);
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

        p.setup = function() {
            p.createCanvas(960, 640);
            p.frameRate(MAX_FRAME_RATE);
            p.angleMode(p.DEGREES);
            isGameOver = false;
            winner = false;

            layoutMap();
            scepter = createScepter(0, 0, p);
            hearts = createHearts(p);
        }

        function handleZombies() {
            zombies.forEach(zombie => zombie.move(character));
            zombies.collide(visibleTrees);
            zombies.overlap(visibleFires, (zombie, fire) => zombie.burn());
        }

        p.draw = function() {
            p.background(150, 150, 150);

            movingSkeletons.bounce(trees);
            movingSkeletons.bounce(movingSkeletons);

            if (character == undefined) {
                character = selectCharacter(p);
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

                p.drawSprites();

                if (isGameOver) {
                    handleEnd();
                }
            }
        }

        function handleEnd() {
            p.fill(255, 255, 255);
            p.textAlign(p.CENTER);
            p.textSize(96);
            let map = LEVEL1_MAP;
            if (winner) {
                p.text('YOU WIN!', p.camera.position.x, p.camera.position.y);
                p.textSize(32);
                p.text('You\'ve earned a piece of the Sun Scepter', p.camera.position.x, p.camera.position.y + 50);
                scepter.spin();
                map = LEVEL2_MAP;
            } else {
                p.text('GAME OVER', p.camera.position.x, p.camera.position.y);
            }
            if (p.keyWentDown(p.RETURN)) {
                p.remove();
                new p5(createLevel(map));
            }
        }

        function handleZoom() {
            if (p.keyDown('z')) {
                p.camera.zoom = 0.5;
            } else {
                p.camera.zoom = 1;
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
            p.getSprites().forEach(sprite => {
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
                scepter.reveal(p.camera.position.x, p.camera.position.y + 90);
                gameOver();
            });
        }

        function panCamera() {
            let characterX = character.position.x;
            let cameraX = p.camera.position.x;
            let characterY = character.position.y;
            let cameraY = p.camera.position.y;
            let pan = {apply: false};

            let xThreshold = (p.width / 2) - (character.width / 2) - 50;
            if (characterX > cameraX + xThreshold ||
                characterX < cameraX - xThreshold) {

                pan.apply = true;
                pan.x = characterX;
                pan.y = cameraY;
                pan.deltaX = characterX - cameraX;
                pan.deltaY = 0;
            }

            let yThreshold = (p.height / 2) - (character.height / 2) - 50;
            if (characterY > cameraY + yThreshold ||
                characterY < cameraY - yThreshold) {

                pan.apply = true;
                pan.x = cameraX
                pan.y = characterY;
                pan.deltaX = 0;
                pan.deltaY = characterY - cameraY;
            }

            if (pan.apply) {
                p.camera.position.x = pan.x;
                p.camera.position.y = pan.y;
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
                skeleton.setSpeed(1, p.random(0, 360));
                waitingSkeletons.remove(skeleton);
                movingSkeletons.add(skeleton);
            });
        }
    }
}


