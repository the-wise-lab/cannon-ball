class InstructionBox extends Phaser.GameObjects.Container {
    /**
     * Constructs a new instruction box class.
     * @param {Phaser.Scene} scene - The Phaser scene.
     * @param {number} x - The x position of the bubble.
     * @param {number} y - The y position of the bubble.
     * @param {number} w - The width of the bubble.
     * @param {number} h - The height of the bubble.
     * @param {number} pointerX - The x position of the pointer triangle.
     * @param {number} pointerScale - The scale of the pointer triangle. Default is 1.
     * @param {number} fontSize - The font size of the text. Default is 15.
     * @param {string} direction - The direction of the pointer triangle. Default is "down".
     * @param {string} textBelow - The text displayed below the bubble. Default is an empty string.
     * @param {number} zorder - The z-order of the bubble. Default is 100.
     */
    constructor(
        scene,
        x,
        y,
        w,
        h,
        pointerX,
        pointerScale = 1,
        fontSize = 15,
        direction = "down",
        textBelow = "",
        zorder = 100
    ) {
        // Calculate the y position and direction modifier based on the direction
        let triangle_y, directionModifier;
        if (direction == "down") {
            triangle_y = y + h / 2;
            directionModifier = 1;
        } else if (direction == "up") {
            triangle_y = y - h / 6;
            directionModifier = -1;
        }

        // Create a triangle
        const triangle = scene.add.triangle(
            pointerX,
            triangle_y,
            0,
            0,
            w / 5,
            0,
            0 + w / 10,
            directionModifier * 40,
            "0xe8e8e8"
        );

        // Set the origin, scale, zorder of the triangle
        triangle.setOrigin(0.5, 0.5);
        triangle.setScale(pointerScale);
        triangle.setDepth(zorder - 1);

        // Create a rectangle
        const box = scene.add.rectangle(x, y, w, h, "0xe8e8e8");

        // Set the origin and z-order of the rectangle
        box.setOrigin(0.5);
        box.setDepth(zorder);

        // Add the main text
        const bubbleText = scene.add.text(x, y, "Test", {
            color: "0xff0000",
            fontFamily: "Rubik",
            fontSize: fontSize,
            wordWrap: { width: w * 0.95 },
        });

        // Set the origin, z-order, and alignment of the main text
        bubbleText.setOrigin(0.5);
        bubbleText.setDepth(zorder + 1);
        bubbleText.setAlign("center");

        // Add the text below
        const clickText = scene.add.text(x, y + h / 3.5, textBelow, {
            color: "#8c8c8c",
            fontFamily: "Rubik",
            fontSize: fontSize * 0.8,
            wordWrap: { width: w * 0.95 },
        });

        // Set the origin and z-order of the text below
        clickText.setOrigin(0.5);
        clickText.setDepth(zorder + 1);

        // Create the Bubble object with the elements
        super(scene, 0, 0, [triangle, box, bubbleText, clickText]);
        scene.add.existing(this);

        // Set the bubbleText property
        this.bubbleText = bubbleText;

        // Set overall z-order
        this.setDepth(20);
    }

    setText(text) {
        this.bubbleText.text = text;
    }

    show() {
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }

    // setOnClick(f) {
    //     this.buttonBackground.on('pointerdown', () => {f()});
    // }
}

export default InstructionBox;
