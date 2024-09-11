/**
 * Represents an asteroid in the game.
 */
class Asteroid extends Phaser.Physics.Arcade.Sprite {
    /**
     * Create a new Asteroid instance.
     * 
     * @param {Phaser.Scene} scene - The scene this asteroid belongs to.
     * @param {number} x - The x-coordinate of the asteroid's initial position.
     * @param {number} y - The y-coordinate of the asteroid's initial position.
     * @param {string} texture - The texture of the asteroid.
     * @param {string} color - The color of the asteroid.
     * @param {number} baseValue - The base value of the asteroid.
     */
    constructor(scene, x, y, texture, color, baseValue) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.color = color;
        this.baseValue = baseValue;

        // Set initial properties
        this.setScale(0.3);
        this.setAlpha((baseValue + 1) / 6); // Assuming max baseValue is 5
        this.setData("betAmount", (baseValue + 1) * 10);
        this.setData("colour", color);
        this.setData("baseValue", baseValue);

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    /**
     * Make the asteroid explode.
     */
    explode() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.75,
            scaleY: 0.75,
            duration: 100,
            ease: "Quad",
            repeat: 0,
            yoyo: true,
            onComplete: () => {
                this.visible = false;
                this.onExplodeComplete();
            },
            callbackScope: this,
        });
    }

    /**
     * Callback function called when the explosion animation completes.
     * This method can be overridden by the Asteroids class to hide the group.
     */
    onExplodeComplete() {
        // This method can be overridden by the Asteroids class to hide the group
    }
}

/**
 * Class representing the Asteroids game.
 */
class Asteroids {
    /**
     * Preload the assets required for the game.
     * @param {Phaser.Scene} scene - The game scene.
     * @param {string} imagePath - The path to the image assets.
     */
    static preloadAssets(scene, imagePath) {
        // load pink and purple asteroids 1-5
        scene.load.image("asteroid_pink_1", `${imagePath}/asteroid_pink1.png`);
        scene.load.image("asteroid_pink_2", `${imagePath}/asteroid_pink2.png`);
        scene.load.image("asteroid_pink_3", `${imagePath}/asteroid_pink3.png`);
        scene.load.image("asteroid_pink_4", `${imagePath}/asteroid_pink4.png`);
        scene.load.image("asteroid_pink_5", `${imagePath}/asteroid_pink5.png`);

        scene.load.image(
            "asteroid_purple_1",
            `${imagePath}/asteroid_purple1.png`
        );
        scene.load.image(
            "asteroid_purple_2",
            `${imagePath}/asteroid_purple2.png`
        );
        scene.load.image(
            "asteroid_purple_3",
            `${imagePath}/asteroid_purple3.png`
        );
        scene.load.image(
            "asteroid_purple_4",
            `${imagePath}/asteroid_purple4.png`
        );
        scene.load.image(
            "asteroid_purple_5",
            `${imagePath}/asteroid_purple5.png`
        );
    }

    /**
     * Create an instance of the Asteroids game.
     * @param {Phaser.Scene} scene - The game scene.
     * @param {number} centerX - The x-coordinate of the center of the game area.
     * @param {number} centerY - The y-coordinate of the center of the game area.
     * @param {number} radius - The radius of the game area.
     * @param {number} numSprites - The number of sprites.
     * @param {function} handleOverlap - The overlap handler function.
     */
    constructor(scene, centerX, centerY, radius, numSprites, handleOverlap) {
        this.scene = scene;
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.numSprites = numSprites;

        // Define start and end angles for the arcs
        const startAngle1 = Math.PI / 1.8;
        const endAngle1 = Math.PI / 1.3;
        const startAngle2 = Math.PI / 4.4;
        const endAngle2 = Math.PI / 2.2;

        // Calculate the angle increments
        const angleIncrement1 = (endAngle1 - startAngle1) / (numSprites - 1);
        const angleIncrement2 = (endAngle2 - startAngle2) / (numSprites - 1);

        // Create sprite and text groups
        this.asteroidGroup = scene.physics.add.group();
        this.asteroidTextGroup = scene.add.group();

        // Create and position the sprites along the arcs
        for (let i = 0; i < numSprites; i++) {
            // Add pink asteroids
            this.addAsteroid(
                i,
                startAngle1,
                angleIncrement1,
                `asteroid_pink_${i + 1}`,
                "#FF0180",
                "pink",
                handleOverlap,
                0
            );

            // Add purple asteroids
            this.addAsteroid(
                i,
                startAngle2,
                angleIncrement2,
                `asteroid_purple_${numSprites - i}`,
                "#b078ff",
                "purple",
                handleOverlap,
                1
            );
        }

        // Hide everything to start with
        this.hide();

    }

    /**
     * Adds an asteroid to the game.
     *
     * @param {number} i - The index of the asteroid.
     * @param {number} startAngle - The starting angle of the asteroid.
     * @param {number} angleIncrement - The angle increment for each asteroid.
     * @param {string} texture - The texture of the asteroid.
     * @param {string} textColor - The color of the asteroid's text.
     * @param {string} color - The color of the asteroid.
     * @param {function} handleOverlap - The function to handle overlap with balls.
     * @param {number} side - The side of the asteroid. 0 = left, 1 = right.
     */
    addAsteroid(i, startAngle, angleIncrement, texture, textColor, color, handleOverlap, side) {
        // Calculate the position of the asteroid
        const angle = startAngle + i * angleIncrement;
        const x = this.centerX + this.radius * Math.cos(angle);
        const y = this.centerY - this.radius * Math.sin(angle);

        // Create Asteroid instance
        const baseValue = side === 0 ? i : this.numSprites - (i + 1);
        const asteroid = new Asteroid(this.scene, x, y, texture, color, baseValue);

        // Override the onExplodeComplete method for each asteroid
        asteroid.onExplodeComplete = () => {
            this.hide();
        };

        // Add overlap with balls
        this.scene.physics.add.overlap(
            asteroid,
            this.scene.ball_pink,
            handleOverlap,
            null,
            this.scene
        );
        this.scene.physics.add.overlap(
            asteroid,
            this.scene.ball_purple,
            handleOverlap,
            null,
            this.scene
        );

        // Create and add text label for the asteroid
        const text = this.scene.add.text(x, y - 30, `${i + 1}`, {
            color: textColor,
            fontFamily: "Rubik",
            fontSize: "18px",
        });
        text.setOrigin(0.5);
        if (side == 0) {
            text.setData("baseValue", i + 1);
        }
        else {
            text.setData("baseValue", this.numSprites - i);
        }

        // Add asteroid to group
        this.asteroidGroup.add(asteroid);
        
        // Add text to group
        this.asteroidTextGroup.add(text);
    }

    /**
     * Hides the asteroid group and the asteroid text group by fading them out and making them invisible.
     */
    hide() {
        // Fade out and make asteroid group invisible
        this.asteroidGroup.getChildren().forEach(function (child) {
            this.scene.tweens.add({
                targets: child,
                alpha: 0,
                duration: 100,
                ease: "Quad",
                repeat: 0,
                yoyo: false,
                callbackScope: this,
                onComplete: function () {
                    // Set child to invisible and disable its body
                    child.visible = false;
                    child.body.enable = false;
                },
            });
        }, this);

        // Fade out and make asteroid text group invisible
        this.asteroidTextGroup.getChildren().forEach(function (child) {
            this.scene.tweens.add({
                targets: child,
                alpha: 0,
                duration: 100,
                ease: "Quad",
                repeat: 0,
                yoyo: false,
                callbackScope: this,
                onComplete: function () {
                    // Set child to invisible
                    child.visible = false;
                },
            });
        }, this);
    }

/**
 * Show the asteroid group and asteroid text group with updated properties.
 * @param {number} betScaling - The scaling factor for the bet amount.
 */
show(betScaling) {
    // Show each child in the asteroid group
    this.asteroidGroup.getChildren().forEach(function (child) {
        // Make the child visible
        child.visible = true;

        // Set alpha to 1
        child.alpha = 1;

        // Enable collisions for the child
        child.body.enable = true;

        // Set the bet amount for the child based on the base value and bet scaling
        child.setData("betAmount", (child.getData("baseValue") + 1) * betScaling);

        // Make the child pulse using a tween animation
        // Scale the child to 0.27 over a duration of 1000ms with Quad easing
        // Repeat the animation indefinitely and reverse it (yoyo)
        this.scene.tweens.add({
            targets: child,
            scaleX: 0.27,
            scaleY: 0.27,
            duration: 1000,
            ease: "Quad",
            repeat: -1,
            yoyo: true,
            callbackScope: this,
        });
    }, this);

    // Show each child in the asteroid text group
    this.asteroidTextGroup.getChildren().forEach(function (child) {
        // Set alpha to 1
        child.alpha = 1;

        // Make the child visible
        child.visible = true;

        // Set the text of the child to the base value multiplied by the bet scaling
        child.setText(child.getData("baseValue") * betScaling);
    }, this);
}
}

export default Asteroids;
