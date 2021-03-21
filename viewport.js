

export function createViewport(x, y, p5) {
    p5 = p5 || window;
    let viewport = p5.createSprite(x, y);
    viewport.setCollider('rectangle', 0, 0, width, height);
    viewport.shapeColor = color(0, 0, 0, 0);
    viewport.markVisible = function(all, visible) {
        visible.clear();
        viewport.overlap(all, (viewport, item) => {
            visible.add(item);
        });
    };
    return viewport;
}

