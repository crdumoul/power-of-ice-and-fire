let treeImage;

export function treePreload(p5) {
    p5 = p5 || window;
    treeImage = p5.loadImage('assets/tree1.png');
}

export function createTree(x, y, p5) {
    p5 = p5 || window;
    let tree = p5.createSprite(x, y);
    tree.addImage(treeImage);
    tree.setCollider('circle', 0, 0, 16);
    tree.immovable = true;
    return tree;
}

