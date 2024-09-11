import GameScene from "./GameScene.js";
import InstructionBox from "../classes/instructionBox.js";

class TrainingScene extends GameScene {
    constructor(key) {
        super("TrainingScene");
    }

    init(data) {
        super.init(data);
        this.trainingPhase = 0;
        
        // Get task type
        this.task = this.game.registry.get("task");

    }

    preload() {
        super.preload();
    }

    create() {
        super.create();

        // Set cannon movement flag
        this.cannonMoving = true;

        // Instruction box for cannon aiming
        this.instructionBoxCannon = new InstructionBox(
            this,
            250,
            350,
            300,
            100,
            250,
            1,
            15,
            "down",
            "Click to continue"
        );
        this.instructionBoxCannon.setText("Use the mouse to aim the cannon");
        this.instructionBoxCannon.hide();

        // Instruction boxes for containers (left and right)
        this.instructionBoxContainerLeft = new InstructionBox(
            this,
            100,
            400,
            150,
            100,
            100,
            1,
            15,
            "down",
            "Choose one!"
        );
        this.instructionBoxContainerLeft.setText(
            "Press 1 to fire from the left"
        );

        this.instructionBoxContainerRight = new InstructionBox(
            this,
            400,
            400,
            150,
            100,
            400,
            1,
            15,
            "down",
            "Choose one!"
        );
        this.instructionBoxContainerRight.setText(
            "Press 2 to fire from the right"
        );
        this.instructionBoxContainerLeft.hide();
        this.instructionBoxContainerRight.hide();

        // Instruction box for balls
        this.instructionBoxBalls = new InstructionBox(
            this,
            250,
            350,
            350,
            150,
            250,
            1,
            15,
            "down",
            "Click to continue"
        );
        if (this.task === "MB") {
            this.instructionBoxBalls.setText(
                "The two containers have a different chance to fire pink or purple balls, which changes from time to time"
            );
        }
        else if (this.task === "MBMF") {
            this.instructionBoxBalls.setText(
                "The two containers have a different chance to fire pink or purple balls, depending on how many of each colour there are"
            );
        }
        else if (this.task === "MF") {
            this.instructionBoxBalls.setText(
                "Both containers fire grey coloured balls"
            );
        }
        this.instructionBoxBalls.hide();

        // Instruction box for balls
        this.instructionBoxBalls2 = new InstructionBox(
            this,
            250,
            350,
            350,
            150,
            250,
            1,
            15,
            "down",
            "Click to continue"
        );
        this.instructionBoxBalls2.setText(
            "If one container is shooting one colour, this means the other one is more likely to shoot the other colour"
        );
        this.instructionBoxBalls2.hide();

        // Instruction box for explosions
        this.instructionBoxExplosions = new InstructionBox(
            this,
            250,
            180,
            320,
            130,
            250,
            1,
            15,
            "up"
        );
        if (this.task === "MB") {
            this.instructionBoxExplosions.setText(
                "Some balls will explode and you will lose points!\n\nThe fuller the bar, the MORE likely the ball will be safe"
            );
        }
        else if (this.task === "MBMF") {
            this.instructionBoxExplosions.setText(
                "Some balls will explode and you will lose points!\n\nPink and purple balls have different chances of exploding, which changes from time to time"
            );
        }
        else if (this.task === "MF") {
            this.instructionBoxExplosions.setText(
                "Some balls will explode and you will lose points!\n\nThe left and right options have different chances to fire exploding balls, which changes from time to time"
            );
        }
        this.instructionBoxExplosions.hide();

        // Instruction box for asteroid
        this.instructionBoxAsteroid = new InstructionBox(
            this,
            250,
            290,
            300,
            70,
            250,
            0.7,
            15,
            "up"
        );
        this.instructionBoxAsteroid.setText(
            "Your goal is to hit the spaceships with the balls!"
        );
        this.instructionBoxAsteroid.hide();

        // Ball number instruction box
        this.instructionBoxBallNumber = new InstructionBox(
            this,
            250,
            105,
            300,
            70,
            250,
            0.7,
            15,
            "up"
        );
        this.instructionBoxBallNumber.setText(
            "The number at the top shows how many balls you have left"
        );
        this.instructionBoxBallNumber.hide();

        // Bonus round instruction box
        this.instructionBoxBonusRound = new InstructionBox(
            this,
            250,
            175,
            300,
            70,
            250,
            0.7,
            15,
            "down"
        );
        this.instructionBoxBonusRound.setText(
            "On bonus rounds, earn extra points by matching the colours of the ball and asteroids"
        );
        this.instructionBoxBonusRound.hide();

        // Asteroid bonus instruction box
        this.instructionBoxAsteroidBonus = new InstructionBox(
            this,
            300,
            200,
            300,
            70,
            400,
            0.7,
            15,
            "down"
        );
        this.instructionBoxAsteroidBonus.setText(
            "If the ball colour matches, you win the bonus amount. If not, you lose the amount!"
        );
        this.instructionBoxAsteroidBonus.hide();

        // Variable to keep track of timing
        this.timeSinceStepShown = 0;

        // Start training step
        this.stepTraining();

        // Increment training phase on click
        this.input.on(
            "pointerdown",
            function (pointer) {
                this.handleClick();
            },
            this
        );


        // Watch for "fired" event from the balls and step training when fired
        this.ball_pink.on(
            "offScreen",
            function () {
                this.stepTraining();
            },
            this
        );

        this.ball_purple.on(
            "offScreen",
            function () {
                this.stepTraining();
            },
            this
        );

        // Ensure balls don't explode during training
        this.trialInfo[0]["pinkExplode"] = 1;
        this.trialInfo[0]["purpleExplode"] = 1;

    }

    handleClick() {
        if (this.timeSinceStepShown > 1000 && this.trainingPhase !== 2) {
            this.stepTraining();
        }
    }

    

    update() {
        // Run cannon updates
        this.cannon.update();

        // Run ball updates
        this.ball_pink.update();
        this.ball_purple.update();

        if (this.trainingPhase === 2) {
            // if the 1 key is pressed
            this.handleKeyPress("ONE", 0);
            // if the 2 key is pressed
            this.handleKeyPress("TWO", 1);
        }

        // Increment time since step shown
        this.timeSinceStepShown += this.game.loop.delta;
    }

    saveData() {
        // Don't save data during training
    }

    stepTraining() {
        // Reset time since step shown
        this.timeSinceStepShown = 0;

        // Increment training phase
        this.trainingPhase += 1;

        // Perform different actions based on the training phase
        switch (this.trainingPhase) {
            case 1:
                // Show cannon instruction box
                this.instructionBoxCannon.show();

                // Stop alien from moving
                this.alien.setMoving(false);
                this.alien.visible = true;
                break;
            case 2:
                // Hide cannon instruction box and show container instruction boxes
                this.instructionBoxCannon.hide();
                this.instructionBoxContainerLeft.show();
                this.instructionBoxContainerRight.show();
                break;
            case 3:
                // Make sure we don't show a confidence trial somehow
                this.hideConfidence();
                
                // Hide container instruction boxes and show balls instruction box
                this.instructionBoxContainerLeft.hide();
                this.instructionBoxContainerRight.hide();
                this.instructionBoxBalls.show();

                // Stop alien from moving
                this.alien.setMoving(false);
                this.alien.visible = true;
    
                break;
            case 4:
                // Hide balls instruction box and show explosions instruction box if MB
                if (this.task === "MB") {
                    this.instructionBoxBalls.hide();
                    this.instructionBoxBalls2.show();
                    break;
                }
                // Otherwise step training again
                else {
                    this.instructionBoxBalls.hide();
                    this.stepTraining();
                    break;
                }
            case 5:
                // Hide balls instruction box and show explosions instruction box
                this.instructionBoxBalls2.hide();
                this.instructionBoxExplosions.show();
                break;
            case 6:
                // Hide explosions instruction box and show asteroid instruction box
                this.instructionBoxExplosions.hide();
                this.instructionBoxAsteroid.show();
                break;
            case 7:
                // Show ball number instruction box
                this.instructionBoxAsteroid.hide();
                this.instructionBoxBallNumber.show();
                break;
            case 8:
                // Show confidence instructions if MB
                if (this.task === "MB") {
                    this.showConfidence();
                    this.instructionBoxBallNumber.hide();
                    this.instructionBoxBonusRound.show();
                    break;
                }
                else {
                    this.instructionBoxBallNumber.hide();
                    this.trainingPhase = 9;
                    this.stepTraining();
                    break;
                }
            case 9:
                // Hide confidence instruction box and show ball number instruction box
                this.instructionBoxBonusRound.hide();
                this.instructionBoxAsteroidBonus.show();
                break;
            case 10:
                // Move to the ready scene
                this.instructionBoxBallNumber.hide();
                this.scene.start("ReadyScene");
                break;
        }
    }
}

export default TrainingScene;
