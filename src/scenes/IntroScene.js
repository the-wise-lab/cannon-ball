class IntroScene extends Phaser.Scene {
    constructor() {
        super({
            key: "IntroScene",
        });
    }

    init(data) {}

    create() {
        // Create main text with styling
        this.text = this.add.text(250, 300, "Cannon Ball", {
            fontSize: "32px",   // Set font size
            fill: "#FF0180",    // Set text color
            fontFamily: "Rubik",    // Set font family
        });
        this.text.setOrigin(0.5, 0.5);  // Set text origin

        // Animate the main text to grow and shrink
        this.tweens.add({
            targets: this.text,
            duration: 1000,
            scaleX: 1.2,    // Scale text horizontally
            scaleY: 1.2,    // Scale text vertically
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });

        // Create text below saying "click to play" with styling
        this.textLower = this.add.text(250, 350, "Click to play", {
            fontSize: "20px",   // Set font size
            fill: "#616161",    // Set text color
            fontFamily: "Rubik",    // Set font family
        });
        this.textLower.setOrigin(0.5, 0.5); // Set text origin
        this.textLower.alpha = 0;   // Set initial transparency to 0

        // Event listener for pointer down event
        this.input.on(
            "pointerdown",
            function (pointer) {
                if ((this.textLower.alpha > 0.9) & !this.click) {
                    this.textLower.setColor("#FF0180");    // Change text color when clicked
                    this.click = true;  // Set click flag to true
                    this.nextScene();   // Start the next scene
                }
            }.bind(this)
        );

        // Fade in the text below
        this.tweens.add({
            targets: this.textLower,
            duration: 1000,
            alpha: 1,   // Set transparency to fully visible
            ease: "Linear",
            yoyo: false,
            repeat: 0,
        });

        // Set initial click flag to false
        this.click = false;
    }

    update() {}

    /**
     * Transitions to the next scene by animating the lower and main text.
     */
    nextScene() {
        // Animates the lower text by moving it down after a delay using easing
        this.tweens.add({
            targets: this.textLower,
            duration: 500,
            alpha: 0,
            delay: 1000,
            ease: "Quad",
            yoyo: false,
            repeat: 0,
        });

        // Animates the main text by fading it out after a delay using easing
        this.tweens.add({
            targets: this.text,
            duration: 500,
            alpha: 0,
            delay: 1500,
            ease: "Quad",
            yoyo: false,
            repeat: 0,
            onComplete: function () {
                // Starts the next scene after the animation is complete
                if (this.game.config.testing) {
                    this.scene.start('GameScene');
                }
                else {
                    this.scene.start('TrainingScene');
                }
            }.bind(this),
        });
    }
}

export default IntroScene;
