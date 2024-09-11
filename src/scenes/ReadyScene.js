class ReadyScene extends Phaser.Scene {
    constructor() {
        super({
            key: "ReadyScene",
        });
    }

    init(data) {}

    create() {

        // Game over text
        this.text = this.add.text(250, 300, "Ready?", {
            fontSize: "32px",
            fill: "#FF0180",
            fontFamily: "Rubik",
        });
        this.text.setOrigin(0.5, 0.5);

        // grow text
        this.tweens.add({
            targets: this.text,
            duration: 1000,
            scaleX: 1.2,
            scaleY: 1.2,
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });

        // add text below saying thanks for playing
        this.textLower = this.add.text(250, 350, "Click to start!", {
            fontSize: "20px",
            fill: "#616161",
            fontFamily: "Rubik",
        });
        this.textLower.setOrigin(0.5, 0.5);
        this.textLower.alpha = 0;

        // fade in text
        this.tweens.add({
            targets: this.textLower,
            duration: 1000,
            alpha: 1,
            delay: 1000,
            ease: "Linear",
            yoyo: false,
            repeat: 0,
        });

        // register whether click has happened
        this.click = false;

        // on click, start the next scene
        // don't accept clicks before the text has faded in

        this.input.on(
            "pointerdown",
            function (pointer) {
                if ((this.textLower.alpha > 0.9) & !this.click) {
                    // Turn text pink
                    this.textLower.setColor("#FF0180");
                    this.click = true;
                    this.nextScene();
                }
            }.bind(this)
        );
    }

    update() {

    }

    nextScene() {
        // move the lower text down after a delay, using easing
        // then start the next scene

        this.tweens.add({
            targets: this.textLower,
            duration: 500,
            alpha: 0,
            delay: 1000,
            ease: "Quad",
            yoyo: false,
            repeat: 0,
        });

        // same for the main text
        this.tweens.add({
            targets: this.text,
            duration: 500,
            alpha: 0,
            delay: 1500,
            ease: "Quad",
            yoyo: false,
            repeat: 0,
            onComplete: function () {
                this.scene.start("GameScene");
            }.bind(this),
        });
    }
}

export default ReadyScene;
