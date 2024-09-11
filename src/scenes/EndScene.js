class EndScene extends Phaser.Scene {
    constructor() {
        super({
            key: "EndScene",
        });
    }

    init(data) {}

    create() {
        // SAVE DATA
        var time_taken = (new Date() - this.cache.game.start_time) / 60000;

        // Game over text
        var text = this.add.text(250, 300, "Game over", {
            fontSize: "32px",
            fill: "#FF0180",
            fontFamily: "Rubik",
        });
        text.setOrigin(0.5, 0.5);

        // grow text
        this.tweens.add({
            targets: text,
            duration: 1000,
            scaleX: 1.2,
            scaleY: 1.2,
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });

        // add text below saying thanks for playing
        var textLower = this.add.text(250, 350, "Thanks for playing!", {
            fontSize: "20px",
            fill: "#616161",
            fontFamily: "Rubik",
        });
        textLower.setOrigin(0.5, 0.5);
        textLower.alpha = 0;

        // fade in text
        this.tweens.add({
            targets: textLower,
            duration: 1000,
            alpha: 1,
            delay: 1000,
            ease: "Linear",
            yoyo: false,
            repeat: 0,
        });

        // Add text saying click to move on
        var textLower2 = this.add.text(250, 400, "Click to move on", {
            fontSize: "20px",
            fill: "#616161",
            fontFamily: "Rubik",
        });
        textLower2.setOrigin(0.5, 0.5);
        textLower2.alpha = 0;

        // Fade in text
        this.tweens.add({
            targets: textLower2,
            duration: 1000,
            alpha: 1,
            delay: 2000,
            ease: "Linear",
            yoyo: false,
            repeat: 0,
        });

        // Get subject ID from registry
        var subjectID = this.registry.get("subjectID");

        // When clicked, go to completion URL
        this.input.on(
            "pointerdown",
            function (pointer) {
                // GO TO URL
                window.location.href = this.registry.get("redirectURL");
            }.bind(this)
        );
    }

    update() {}
}

export default EndScene;
