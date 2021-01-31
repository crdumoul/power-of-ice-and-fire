var kai;
var alex;

function preload() {
    kai = loadAnimation('assets/Kai-1.png', 'assets/Kai-2.png');
    alex = loadAnimation('assets/Alex-1.png', 'assets/Alex-2.png');
}

function setup() {
    createCanvas(800, 400);
    kai.frameDelay = 10;
    alex.frameDelay = 30;
}

function draw() {
    background(255, 255, 255);
    animation(kai, 300, 150);
    animation(alex, 500, 150);
}
