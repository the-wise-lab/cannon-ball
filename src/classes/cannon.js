class CannonPointer {
    static assetsPreloaded = false;

    /**
     * Preloads the assets for the CannonPointer class.
     * @param {Phaser.Scene} scene - The Phaser scene.
     */
    static preloadAssets(scene) {
        scene.load.image("cannon_pointer", "./assets/cannon_pointer.png");
        scene.load.image("mask", "./assets/mask.png");
        CannonPointer.assetsPreloaded = true;
    }

    /**
     * Creates a new CannonPointer instance.
     * @param {Phaser.Scene} scene - The Phaser scene.
     * @throws {Error} If the assets for CannonPointer have not been preloaded.
     */
    constructor(scene) {
        if (!CannonPointer.assetsPreloaded) {
            throw new Error(
                "Assets for CannonPointer have not been preloaded."
            );
        }

        this.scene = scene;
        this.createCannonPointer();
        this.createCannonPointerMask();
    }

    /**
     * Creates the cannon pointer sprite.
     */
    createCannonPointer() {
        this.cannonPointer = this.scene.physics.add
            .sprite(250, 545, "cannon_pointer")
            .setOrigin(1, 1)
            .setDepth(-2)
            .setScale(1.5);
    }

    /**
     * Creates the cannon pointer mask image.
     */
    createCannonPointerMask() {
        this.mask = this.scene.add
            .image(0, 0, "mask")
            .setScale(1)
            .setOrigin(0, 0)
            .setDepth(-1)
            .setVisible(false);
    }

    /**
     * Sets the rotation of the cannon pointer.
     * @param {number} rotation - The rotation value.
     */
    setRotation(rotation) {
        this.cannonPointer.rotation = rotation;
    }

    /**
     * Shows the cannon pointer and mask.
     */
    show() {
        this.cannonPointer.setVisible(true);
        this.mask.setVisible(true);
    }

    /**
     * Hides the cannon pointer and mask.
     */
    hide() {
        this.cannonPointer.setVisible(false);
        this.mask.setVisible(false);
    }
}

class BallContainer {
    static preloadAssets(scene, imagePath) {
        scene.load.image(
            "ball_container_ring",
            `${imagePath}/ball_container_ring.png`
        );
        scene.load.image("blocked", `${imagePath}/blocked.png`);

        // Load ball images
        let colours = ["pink", "purple", "grey"];
        colours.forEach((colour) => {
            // Check if already loaded
            if (scene.textures.exists(`ball_${colour}`)) {
                return;
            }
            else {
                scene.load.image(
                    `ball_${colour}`,
                    `${imagePath}/ball_${colour}.png`
                );
            }
        });
    }

    constructor(scene, x, y, showBallColourProbs = false) {
        // Rotating ring
        this.ring = scene.add.image(x, y, "ball_container_ring");
        this.ring.setScale(0.04);
        this.ring.setOrigin(0.5);
        this.ring.setDepth(11);

        // Blocked indicator
        this.blockedIndicator = scene.add.image(x, y, "blocked");
        this.blockedIndicator.setScale(0.5);
        this.blockedIndicator.visible = false;
        this.blockedIndicator.setDepth(16);
        this.blocked = false;

        // Store a reference to the scene
        this.scene = scene;

        // Ball probabilities - we only specify pink as purple is 1 - pinkProb
        this.showBallColourProbs = showBallColourProbs;
        this.pinkProb = 0;
        if (showBallColourProbs) {
            this.ring.setScale(0.07);
            this.createBalls();
            this.updateBallColourProbabilities(this.pinkProb);
        }
    }

    createBalls() {

        // Create 10 ball sprites using the grey ball image
        this.balls = this.scene.physics.add.group({
            key: "ball_grey",
            repeat: 9,
            setXY: { x: this.ring.x, y: this.ring.y, stepX: 0 },
        });

        // Put the balls inside the ring       
        this.boundaryCircle = new Phaser.Geom.Circle(this.ring.x, this.ring.y, 15);

        // Set scale of balls
        this.balls.children.iterate((ball) => {
            ball.setScale(0.2);
            // Set ball moving in a random direction
            ball.setCollideWorldBounds(true); // To keep ball within the world bounds
            ball.setBounce(1); // Perfect bounce
            ball.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50)); // Random initial velocity

            ball.setDepth(15);

        });

    }

    update() {
        if (!this.blocked) {
            // rotate the ball container ring image
            this.ring.rotation += 0.01;
        }

        // Rotate the balls constantly
        if (this.showBallColourProbs) {
            this.balls.children.iterate(ball => {
                if (!this.boundaryCircle.contains(ball.x, ball.y)) {
                    ball.rotation += 0.05;

                    // Reposition the ball slightly towards the boundary circle
                    let directionToCenter = new Phaser.Math.Vector2(this.boundaryCircle.x - ball.x, this.boundaryCircle.y - ball.y).normalize();
                    ball.x += directionToCenter.x * 2;
                    ball.y += directionToCenter.y * 2;
            
                    // Generate a random angle in radians
                    let randomAngle = Phaser.Math.FloatBetween(0, 2 * Math.PI);

                    // Create a vector from the angle
                    let randomDirection = new Phaser.Math.Vector2(Math.cos(randomAngle), Math.sin(randomAngle));

                    // Get the magnitude (speed) of the current velocity
                    let speed = 50;

                    // Apply the speed to the new direction
                    let newVelocity = randomDirection.normalize().scale(speed);

                    // Set the ball's new velocity
                    ball.body.velocity.set(newVelocity.x, newVelocity.y);
                }
            });
        }
    }

    setBlocked(blocked) {
        this.blocked = blocked;
        this.blockedIndicator.visible = blocked;
    }

    flash() {
        // Reset alpha in case it's ended up at the wrong value (can happen if animations are interrupted)
        if (this.ring.alpha != 1) {
            this.ring.alpha = 1;
        }
        if (!this.blocked) {
            // briefly set alpha of left ring to 0.5 with easing
            this.scene.tweens.add({
                targets: this.ring,
                alpha: 0.2,
                duration: 100,
                ease: "Quad",
                repeat: 0,
                yoyo: true,
                callbackScope: this,
            });
        } else {
            this.scene.tweens.add({
                targets: this,
                alpha: 0.6,
                duration: 100,
                ease: "Quad",
                repeat: 0,
                yoyo: true,
                callbackScope: this,
            });
        }
    }
    
    updateBallColourProbabilities(pinkProb) {

        // if pinkProb < 0, set all balls to gray
        if (this.pinkProb < 0) {
            this.balls.children.iterate(ball => {
                ball.setTexture("ball_grey");
            });
            return;
        }

        else {
            this.pinkProb = pinkProb;

            // set 10 * pinkProb balls to pink
            let numPinkBalls = Math.floor(10 * pinkProb);
    
            // set the first numPinkBalls balls to pink
            for (let i = 0; i < numPinkBalls; i++) {
                this.balls.children.entries[i].setTexture("ball_pink");
            }
            // set the rest to purple
            for (let i = numPinkBalls; i < 10; i++) {
                this.balls.children.entries[i].setTexture("ball_purple");
            }    
        }
    }

}

class Cannon extends Phaser.GameObjects.Image {
    constructor(scene, x, y, showBallColourProbs = false) {
        super(scene, x, y, "cannon");

        // Create the cannon pointer
        this.pointer = new CannonPointer(scene);

        // Add the cannon to the scene
        scene.add.existing(this);

        // Store a reference to the scene
        this.scene = scene;

        // Scale the cannon
        this.setScale(0.1);

        // Set y origin
        this.setOrigin(0.5, 0.6666);

        // Create and configure the cannon stuff
        this.cannonStuff = scene.add.image(x, y + 15, "cannon_stuff");
        this.cannonStuff.setScale(0.15);
        this.cannonStuff.setOrigin(0.5);
        this.cannonStuff.setDepth(10);
        this.setDepth(9); // the cannon itself

        // Ball containers
        this.showBallColourProbs = showBallColourProbs;
        this.ball_container_left = new BallContainer(scene, 137.51, 548.5, showBallColourProbs);
        this.ball_container_right = new BallContainer(scene, 358.5, 548.5, showBallColourProbs);

        // Flag to indicate whether the cannon should move
        this.frozen = false;
    }

    /**
     * Preloads the assets required for the scene.
     * 
     * @param {Phaser.Scene} scene - The scene object.
     * @param {string} imagePath - The path to the image assets.
     */
    static preloadAssets(scene, imagePath) {
        // Load the cannon image
        scene.load.image("cannon", `${imagePath}/cannon.png`);
        // Load the cannon stuff image
        scene.load.image("cannon_stuff", `${imagePath}/cannon_stuff.png`);

        // Preload the assets for CannonPointer
        CannonPointer.preloadAssets(scene);
        // Preload the assets for BallContainer
        BallContainer.preloadAssets(scene, imagePath);
    }

    setFrozen(frozen) {
        this.frozen = frozen;
    }

    update() {
        // rotate cannon on mouse move - should be centered when mouse is in the middle of the screen
        if (!this.frozen) {
            this.rotation =
                Phaser.Math.Angle.BetweenPoints(
                    this,
                    this.scene.input.activePointer
                ) + 1.5708;
            // and same for the pointer
            this.pointer.setRotation(
                Phaser.Math.Angle.BetweenPoints(
                    this.pointer.cannonPointer,
                    this.scene.input.activePointer
                ) + 1.5708
            );

            // Make sure cannon is never rotated past 60 degrees
            // if (this.rotation > 1.0472) {
            //     this.rotation = 1.0472;
            // } else if (this.rotation < -1.0472) {
            //     this.rotation = -1.0472;
            // }

            // Make sure cannon is never rotated beyond 70 degrees
            if (this.rotation > 1.22173) {
                this.rotation = 1.22173;
            } else if (this.rotation < -1.22173) {
                this.rotation = -1.22173;
            }
        }

        // Run ball container updates
        this.ball_container_left.update();
        this.ball_container_right.update();
    }

    showPointer() {
        this.pointer.show();
    }

    hidePointer() {
        this.pointer.hide();
    }

    flashContainer(side) {
        // 0 = left
        (side === 0
            ? this.ball_container_left
            : this.ball_container_right
        ).flash();
    }

    blockContainer(side) {
        // 0 = left
        (side === 0
            ? this.ball_container_left
            : this.ball_container_right
        ).setBlocked(true);
    }

    unblockContainers() {
        this.ball_container_left.setBlocked(false);
        this.ball_container_right.setBlocked(false);
    }

    updateBallColourProbabilities(pinkProbLeft, pinkProbRight) {
        if (this.showBallColourProbs) {
            this.ball_container_left.updateBallColourProbabilities(pinkProbLeft);
            this.ball_container_right.updateBallColourProbabilities(pinkProbRight);
        }
    }
}

export default Cannon;
