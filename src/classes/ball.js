class Ball extends Phaser.Physics.Arcade.Sprite {
    static assetsPreloaded = false;

    static preloadAssets(
        scene,
        colours,
        imagePath,
        spriteSheetConfig,
        greySpriteSheetConfig
    ) {
        colours.forEach((colour) => {
            scene.load.image(
                `ball_${colour}`,
                `${imagePath}/ball_${colour}.png`
            );
            scene.load.spritesheet(
                `ball_${colour}_explode`,
                `${imagePath}/ball_${colour}_explode.png`,
                spriteSheetConfig
            );
        });

        // Preload the grey explosion spritesheet once, as it's shared by all balls
        scene.load.spritesheet(
            "ball_grey_explode",
            `${imagePath}_grey_explode.png`,
            greySpriteSheetConfig
        );
        Ball.assetsPreloaded = true;
    }

    constructor(scene, x, y, colour, rotationSpeed) {
        if (!Ball.assetsPreloaded) {
            throw new Error("Assets for Ball have not been preloaded.");
        }

        super(scene, x, y, `ball_${colour}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Store reference to scene
        this.scene = scene;

        // Set up the ball's rotation
        this.rotationSpeed = rotationSpeed;

        this.originalColour = colour; // Store the original colour
        this.currentColour = colour; // Store the current colour
        this.setInitialProperties(scene);
        this.createExplosionAnimations(scene); // Now we're using a predefined list from the scene
        this.createExplosionGroup(scene);

        this.visible = false;

        this.setDepth(5);
    }

    setInitialProperties(scene) {
        this.setScale(0.4);
        this.setBounce(1);
        this.setCollideWorldBounds(true);
        this.setData("colour", this.currentColour);
    }

    resetPosition() {
        this.x = 20;
        this.y = 20;
        this.setVelocity(0);
        this.visible = false;
        this.alpha = 1;
        // TODO MIGHT NEED TO USE ALPHA=0 IF VISIBILIY IS USED TO TRIGGER THINGS
    }

    moveToBottom() {
        this.y = 620;
    }

    createExplosionAnimations(scene) {
        // Assuming the scene has an array of colours
        scene.ballColours.forEach((colour) => {
            // Create explosion animation for each colour only if it doesn't exist yet
            if (!scene.anims.get(`ball_${colour}_explode`)) {
                scene.anims.create({
                    key: `ball_${colour}_explode`,
                    frames: scene.anims.generateFrameNumbers(
                        `ball_${colour}_explode`,
                        {
                            start: 0,
                            end: 6,
                        }
                    ),
                    frameRate: 50,
                    maxsize: 30,
                    repeat: 0,
                    hideOnComplete: true,
                });
            }
        });

        this.explosionKey = `ball_${this.currentColour}_explode`;
    }

    createExplosionGroup(scene) {
        // Using the same array of colours from the scene
        scene.ballColours.forEach((colour) => {
            this[`${colour}Explosions`] = scene.add.group({
                defaultKey: `ball_${colour}_explode`,
                maxSize: 30,
            });
        });
    }

    setGrey() {
        this.setTexture("ball_grey");
        this.currentColour = "grey";
        this.explosionKey = "ball_grey_explode";
        this.setData("colour", "grey");
    }

    setColoured() {
        // Revert the ball's texture and explosion animation to its original colour
        this.setTexture(`ball_${this.originalColour}`);
        this.currentColour = this.originalColour;
        this.explosionKey = `ball_${this.originalColour}_explode`;
        this.setData("colour", this.originalColour);
    }

    explode() {
        this.scene.time.delayedCall(
            150,
            () => {
                let explosionGroup = this[this.currentColour + "Explosions"];
                let explosion = explosionGroup.get(this.x, this.y);
                if (explosion) {
                    explosion.setActive(true).setVisible(true);
                    this.setVelocity(0);
                    this.setVisible(false);
                    explosion.play(this.explosionKey);

                    explosion.once("animationcomplete", () => {
                        explosion.setActive(false).setVisible(false);

                        // Emit an event indicating that the ball has exploded
                        this.emit("exploded", this);
                    });
                }
            },
            [],
            this
        );
    }

    fire(side, explode) {
        // Move ball into correct position
        if (side == "left") {
            this.x = 150;
            this.y = 560;
            this.rotationSpeed = 0.2;
        } else {
            this.x = 350;
            this.y = 560;
            this.rotationSpeed = -0.2;
        }

        // things to change in scene
        this.scene.ballColour = this.currentColour;
        // freeze cannon if on confidence trial
        if (this.scene.confidenceShown) {
            this.scene.cannon.setFrozen(true);
        }

        this.visible = true;

        // Set up the firing tween
        this.scene.tweens.add({
            targets: this,
            x: 250, // Assumes the cannon has an x property
            duration: 1000,
            ease: "Quad",
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                // Set x and y to be the same as the cannon
                this.x = this.scene.cannon.x;
                this.y = this.scene.cannon.y;

                this.setVelocity(
                    Math.cos(this.scene.cannon.rotation - Math.PI / 2) * 1000,
                    Math.sin(this.scene.cannon.rotation - Math.PI / 2) * 1000
                );

                /// things to hange in scene
                this.scene.cannon.setFrozen(false);

                // Emit an event once the ball has been fired
                this.emit("fired", this);

                // Explode if the explode parameter is true
                if (explode) {
                    this.explode();
                } else {
                    this.scene.exploded = false;
                }
            },
        });
    }

    update() {
        // Rotate the ball
        this.rotation += this.rotationSpeed;

        // Check if the ball is off-screen
        if (
            this.y > 620 &&
            this.visible &&
            this.body.velocity.length() > 0 &&
            this.alpha !== 0
        ) {
            this.setVelocity(0);
            this.setVisible(false);

            // Emit an off-screen event
            this.emit("offScreen", this);
        }

        // If the ball has reached the top of the screen, emit a missed event
        if (this.y < 50) {
            this.emit("missed", this);
        }
    }
}

export default Ball;
