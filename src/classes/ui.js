class Score {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;

        // Create the 'Score' label text
        this.scoreText = scene.add.text(110, 10, "Score", {
            color: "white",
            fontFamily: "Rubik",
            fontSize: "20px",
        });

        // Create the score value text
        this.scoreValueText = scene.add.text(165, 30, this.score.toString(), {
            color: "#FF0180",
            fontFamily: "Rubik",
            fontSize: "20px",
        });

        // Set origin of score value text to right
        this.scoreValueText.setOrigin(1, 0);
    }

    updateScore(score) {
        this.score = score;
        this.scoreValueText.setText(this.score.toString());
    }
}

class AttemptsCounter {
    constructor(scene, totalTrials) {
        this.scene = scene;
        this.totalTrials = totalTrials;
        this.trialNumber = 0;

        // Create the attempts text
        this.attemptsText = scene.add.text(
            250,
            32,
            this.totalTrials - this.trialNumber,
            { color: "#FF0180", fontFamily: "Rubik", fontSize: "45px" }
        );

        // Set origin of the attempts text
        this.attemptsText.setOrigin(0.5);
    }

    updateTrial(totalTrials, trialNumber) {
        // TODO CHECK THIS
        this.attemptsText.setText(totalTrials - trialNumber);
    }
}

class AlienCounter {
    static preloadAssets(scene, imagePath) {
        scene.load.image("alien", `${imagePath}/spaceship4.png`);
    }

    constructor(scene) {
        this.scene = scene;
        this.alienCount = 0;

        // Create the alien icon
        this.alienIcon = scene.add.image(330, 32, "alien");
        this.alienIcon.setScale(0.2);
        this.alienIcon.setOrigin(0.5);

        // Create the alien counter text
        this.alienCounterText = scene.add.text(
            355,
            22,
            "x " + this.alienCount,
            {
                color: "#FF0180",
                fontFamily: "Rubik",
                fontSize: "20px",
            }
        );
    }

    updateAlienCount(newCount) {
        // TODO CHECK THIS
        this.alienCount = newCount;
        this.alienCounterText.setText("x " + this.alienCount);
    }
}

class ExplodeBars {
    static preloadAssets(scene, imagePath) {
        scene.load.image("explode_icon", `${imagePath}/explode_icon.png`);
        scene.load.image("safe_icon", `${imagePath}/safe_icon.png`);
        scene.load.image(
            "blocked_indicator",
            `${imagePath}/blocked_indicator.png`
        );
    }

    constructor(scene) {
        this.scene = scene;
        this.pinkBallExplodeChance = 0.5;
        this.purpleBallExplodeChance = 0.5;

        // Create two gray bars as the background of the explosion probability bar
        this.barBackground1 = scene.add.rectangle(125, 65, 250, 10, 0x1c1c1c);
        this.barBackground1.setStrokeStyle(0, "white");
        this.barBackground1.setOrigin(0, 0.5);
        this.barBackground1.setFillStyle("0xaba9a9");

        this.barBackground2 = scene.add.rectangle(125, 80, 250, 10, 0x1c1c1c);
        this.barBackground2.setStrokeStyle(0, "white");
        this.barBackground2.setOrigin(0, 0.5);
        this.barBackground2.setFillStyle("0xaba9a9");

        // Add pink and purple bars to show the probability of explosion
        this.bar1 = scene.add.rectangle(125, 65, 250, 10, 0x1c1c1c);
        this.bar1.setStrokeStyle(0, "white");
        this.bar1.setOrigin(0, 0.5);
        this.bar1.setFillStyle("0xFF0180");
        this.bar1.setScale(1 - this.pinkBallExplodeChance, 1);

        this.bar2 = scene.add.rectangle(125, 80, 250, 10, 0x1c1c1c);
        this.bar2.setStrokeStyle(0, "white");
        this.bar2.setOrigin(0, 0.5);
        this.bar2.setFillStyle("0x6A00FF");
        this.bar2.setScale(1 - this.purpleBallExplodeChance, 1);

        // Add explode icon
        this.explodeIcon = scene.add.image(115, 72.5, "explode_icon");
        this.explodeIcon.setOrigin(1, 0.5);
        this.explodeIcon.setScale(0.4);

        // Add safe icon to the left of the bars
        this.safeIcon = scene.add.image(385, 72.5, "safe_icon");
        this.safeIcon.setOrigin(0, 0.5);
        this.safeIcon.setScale(0.5);

        // Add indicator blocked image
        this.blockedIndicator = scene.add.image(125, 72.5, "blocked_indicator");
        this.blockedIndicator.setOrigin(0, 0.5);
        this.blockedIndicator.visible = false;
    }

    updateExplodeChanceBars(probPink, probPurple) {
        // Update the explode chance
        this.pinkBallExplodeChance = 1 - probPink;
        this.purpleBallExplodeChance = 1 - probPurple;

        // Update bar size using easing
        this.scene.tweens.add({
            targets: this.bar1,
            scaleX: 1 - this.pinkBallExplodeChance, // Success chance
            duration: 500,
            ease: "Quad",
            repeat: 0,
            yoyo: false,
        });

        this.scene.tweens.add({
            targets: this.bar2,
            scaleX: 1 - this.purpleBallExplodeChance, // Success chance
            duration: 500,
            ease: "Quad",
            repeat: 0,
            yoyo: false,
        });
    }

    setBlocked(blocked) {

        // Make sure the explode chance bars are hidden
        if (blocked) {
            this.updateExplodeChanceBars(0, 0);
        }

        // Set the blocked indicator to visible 
        this.blockedIndicator.visible = blocked;
    }
}

class TopUI {
    static preloadAssets(scene, imagePath) {
        AlienCounter.preloadAssets(scene, imagePath);
        ExplodeBars.preloadAssets(scene, imagePath);
    }

    constructor(scene, totalTrials, showExplodeChanceBars = true) {
        this.scene = scene;

        // Initialize the Score
        this.score = new Score(scene);

        // Initialize the Attempts Counter
        this.attemptsCounter = new AttemptsCounter(scene, totalTrials);

        // Initialize the Alien Counter
        this.alienCounter = new AlienCounter(scene);

        // Initialize the Explode Bars
        this.showExplodeChanceBars = showExplodeChanceBars;
        if (showExplodeChanceBars) {
            this.explodeBars = new ExplodeBars(scene);
        }
        
    }

    // TODO CHECK ALL OF THESE METHODS
    updateScore(newScore) {
        this.score.updateScore(newScore);
    }

    updateTrial(totalTrials, trialNumber) {
        this.attemptsCounter.updateTrial(totalTrials, trialNumber);
    }

    resetTrials() {
        this.attemptsCounter.resetTrials();
    }

    updateAlienCount(newCount) {
        this.alienCounter.updateAlienCount(newCount);
    }

    updateExplodeChanceBars(newPinkChance, newPurpleChance) {
        if (this.showExplodeChanceBars) {
            this.explodeBars.updateExplodeChanceBars(
                newPinkChance,
                newPurpleChance
            );
        }

    }

    setBlocked(blocked) {
        if (this.showExplodeChanceBars) {
            this.explodeBars.setBlocked(blocked);
        }
        
    }
}

class BonusText extends Phaser.GameObjects.Text {
    constructor(scene, x, y, initialText) {
        super(scene, x, y, initialText, {
            color: "#292929",
            fontFamily: "Rubik",
            fontSize: "60px",
        });

        // Set origin and visibility
        this.setOrigin(0.5);
        this.visible = false;

        // Add this text object to the scene
        scene.add.existing(this);
    }

    setBonusText(text) {
        this.setText(text);
    }

    setBonusTextColour(colour) {
        this.setColor(colour);
    }

    reset() {
        this.visible = false;

        // Reset text alpha and scale
        this.alpha = 1;
        this.scaleX = 1;
        this.scaleY = 1;
    }

    show(duration = 1000, scale = 1.5, delay = 400) {
        // Delay the execution of the following code
        this.scene.time.delayedCall(delay, () => {
            this.visible = true;

            this.scene.tweens.add({
                targets: this,
                scaleX: scale,
                scaleY: scale,
                alpha: 0,
                duration: duration,
                ease: "Quad",
                repeat: 0,
                delay: 200,
                yoyo: false,
                onComplete: () => {
                    this.visible = false;
                    this.emit("shown");
                },
                callbackScope: this,
            });
        });
    }
}

class BonusRoundText extends Phaser.GameObjects.Text {
    constructor(scene, x = 250, y = 200, text = "Bonus Round!", style = {}) {
        super(scene, x, y, text, {
            ...{
                color: "#FF0180",
                fontFamily: "Rubik",
                fontSize: "50px",
            },
            ...style,
        });
        this.setOrigin(0.5);
        this.visible = false;
        scene.add.existing(this);
    }

    flash() {
        this.visible = true;
        this.setAlpha(1);
        this.setScale(1, 1);

        this.scene.tweens.add({
            targets: this,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1000,
            ease: "Quad",
            repeat: 0,
            delay: 200,
            yoyo: false,
            onComplete: () => {
                this.visible = false;
                this.setAlpha(1);
                this.setScale(1, 1);
            },
            callbackScope: this,
        });
    }
}

class ScoreAnnouncementText extends Phaser.GameObjects.Text {
    constructor(
        scene,
        x = 250,
        y = 200,
        initialText = "1000 points!",
        style = {}
    ) {
        super(scene, x, y, initialText, {
            ...{
                color: "#ffffff",
                fontFamily: "Rubik",
                fontSize: "50px",
            },
            ...style,
        });
        this.setOrigin(0.5);
        this.visible = false;
        scene.add.existing(this);
    }

    flash(score) {
        this.setText(score + " points!");
        this.setScale(0.3, 0.3);
        this.visible = true;
        this.alpha = 1;

        // Grow text
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            alpha: 0,
            duration: 1000,
            ease: "Quad",
            repeat: 0,
            delay: 200,
            yoyo: false,
            onComplete: () => {
                // Fade out after delay
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 1000,
                    ease: "Quad",
                    repeat: 0,
                    delay: 1000,
                    yoyo: false,
                    onComplete: () => {
                        this.visible = false;
                    },
                });
            },
        });
    }
}

export { TopUI, BonusText, BonusRoundText, ScoreAnnouncementText };
