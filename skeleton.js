let skeletonAnimation;

export function skeletonPreload(p5) {
    p5 = p5 || window;
    skeletonAnimation = createSkeletonAnimation(p5);
}

function createSkeletonAnimation(p5) {
    let spriteSheet = p5.loadSpriteSheet('assets/skeleton.png', 22, 32, 2);
    let animation = p5.loadAnimation(spriteSheet);
    animation.frameDelay = 5;
    return animation;
}

export function createSkeleton(x, y, p5) {
    p5 = p5 || window;
    let skeleton = p5.createSprite(x, y);
    skeleton.addAnimation('normal', skeletonAnimation);
    return skeleton;
}

