let goodWizardImage;

export function goodWizardPreload(p5) {
    p5 = p5 || window;
    goodWizardImage = p5.loadImage('assets/good-wizard.png');
}

export function createGoodWizard(x, y, p5) {
    p5 = p5 || window;
    let goodWizard = p5.createSprite(x, y);
    goodWizard.addImage(goodWizardImage);
    goodWizard.setCollider('rectangle', 12, 0, 60, 100);
    return goodWizard;
}

