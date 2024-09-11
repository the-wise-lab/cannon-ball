class TwinklingStars {
    // Flag to check if assets have been preloaded
    static assetsPreloaded = false;

    /**
     * Preloads the assets for the TwinklingStars class.
     * @param {Phaser.Scene} scene - The Phaser scene.
     * @param {string} starImagePath - The path to the star image.
     * @throws {Error} Throws an error if starImagePath is not a valid string.
     */
    static preloadAssets(scene, starImagePath) {
        if (typeof starImagePath !== "string" || starImagePath.trim() === "") {
            throw new Error("starImagePath must be a valid string.");
        }

        scene.load.image("star", starImagePath);
        TwinklingStars.assetsPreloaded = true;
    }

    /**
     * Creates a new instance of the TwinklingStars class.
     * @param {Phaser.Scene} scene - The Phaser scene.
     * @param {object} options - The options for the TwinklingStars.
     * @param {number} options.numberOfStars - The number of stars to create.
     * @param {number} options.minX - The minimum x coordinate for the stars.
     * @param {number} options.maxX - The maximum x coordinate for the stars.
     * @param {number} options.minY - The minimum y coordinate for the stars.
     * @param {number} options.maxY - The maximum y coordinate for the stars.
     * @param {number} options.initialScale - The initial scale of the stars.
     * @param {number} options.initialAlpha - The initial alpha of the stars.
     * @param {number} options.endScale - The end scale of the stars for animation.
     * @param {number} options.endAlpha - The end alpha of the stars for animation.
     * @param {number} options.minDuration - The minimum duration of the star animation.
     * @param {number} options.maxDuration - The maximum duration of the star animation.
     * @param {string} options.ease - The easing function to use for the stars for animation.
     * @throws {Error} Throws an error if assets have not been preloaded.
     */
    constructor(scene, options = {}) {
        if (!TwinklingStars.assetsPreloaded) {
            throw new Error(
                "Assets for TwinklingStars have not been preloaded. Call 'TwinklingStars.preloadAssets' in the scene's 'preload' method."
            );
        }

        // Default options with the possibility of overriding them
        const defaults = {
            numberOfStars: 30,
            minX: 0,
            maxX: 800,
            minY: 0,
            maxY: 600,
            initialScale: 0.2,
            initialAlpha: 0.5,
            endScale: 0.3,
            endAlpha: 0.9,
            minDuration: 1000,
            maxDuration: 3000,
            ease: "Quad", // Default easing function
        };

        this.options = Object.assign({}, defaults, options);
        this.scene = scene;
        this.createStars();
    }

    /**
     * Creates the stars for the TwinklingStars.
     */
    createStars() {
        // Loop over the number of stars
        for (let i = 0; i < this.options.numberOfStars; i++) {
            // Generate random x and y coordinates
            let x = Phaser.Math.Between(this.options.minX, this.options.maxX);
            let y = Phaser.Math.Between(this.options.minY, this.options.maxY);

            // Create a star image at the random coordinates
            let star = this.scene.add
                .image(x, y, "star")
                .setScale(this.options.initialScale)
                .setDepth(0)
                .setAlpha(this.options.initialAlpha);

            // Add a tween to the star
            this.scene.tweens.add({
                targets: star,
                scaleX: this.options.endScale,
                scaleY: this.options.endScale,
                alpha: this.options.endAlpha,
                duration: Phaser.Math.Between(
                    this.options.minDuration,
                    this.options.maxDuration
                ),
                ease: this.options.ease || "Quad",
                yoyo: true,
                repeat: -1,
            });
        }
    }
}

export default TwinklingStars;
