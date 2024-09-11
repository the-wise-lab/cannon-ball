import InstructionBox from "../classes/instructionBox.js";
import Cannon from "../classes/cannon.js";
import Ball from "../classes/ball.js";
import TwinklingStars from "../classes/twinklingStars.js";
import Alien from "../classes/alien.js";
import {
    TopUI,
    BonusText,
    BonusRoundText,
    ScoreAnnouncementText,
} from "../classes/ui.js";
import Asteroids from "../classes/asteroids.js";
import { saveData } from "../data.js";

class GameScene extends Phaser.Scene {
    constructor(key) {
        super({
            key: key,
        });
    }

    init(data) {
        // STARTING VALUES
        // Keep track of trial number
        this.trialNumber = -1;

        // Score
        this.score = 0;

        // Number of times they hit the alien
        this.nHits = 0;

        // Probability of balls exploding - these variables are set later based on trial info
        this.pinkBallExplodeChance = 0;
        this.purpleBallExplodeChance = 0;

        // Confidence rating value
        this.confidence = 0.5;

        // The amount bet on confidence trials
        this.pinkBet = -999;
        this.purpleBet = -999;

        // Track whether they have hit something on confidence trials
        this.confidenceTargetHit = false;

        // Score increase variable
        this.scoreIncrease = 0;

        // Ball start position
        this.ballStartY = 560;

        // Track trial type
        this.trialType = "trial";

        // Scaling of the reward values on confidence trials
        this.betScaling = -999;

        // Set side that is blocked (when blocked)
        this.blockedSide = -1;

        // Whether this is a "broken" trial
        this.brokenTrial = false;

        // Flag to indicate whether we can currently fire balls
        this.cannonActive = true;

        // Whether the instructions for the "broken" trials have been shown
        this.brokenInstructionsShown = false;

        // Colours for the balls
        this.ballColours = ["pink", "purple", "grey"];

        // Score announcement interval
        this.scoreAnnouncementInterval = 1000;

        // variable to track whether confidence box is shown
        this.confidenceShown = true;

        // variables to track responses and task events
        this.response = -999;
        this.ballColour = "";
        this.exploded = false;

        // variable to track RTs
        this.startTime = this.game.loop.time;
        this.RT = -999;

        // Retrieve the speed with which the alien moves
        this.alienSpeed = this.registry.get("alienSpeed");

        // Retrieve the physics debugging status
        this.debugPhysics = this.registry.get("debugPhysics");

        // Retrieve how often to save data
        this.dataSaveInterval = this.registry.get("dataSaveInterval");

        // Retrieve whether to show explode chance bars
        this.showExplodeChanceBars = this.registry.get("showExplodeChanceBars");

        // Retrieve whether the cannon balls should be grey instead of coloured
        this.ballsAreGrey = this.registry.get("ballsAreGrey");

        // Retrieve whether to show the probability of pink/purple balls
        this.showBallColourProbabilities = this.registry.get(
            "showBallColourProbabilities"
        );

        // Retrieve the fixed ball colour probabilities - would be better to set these in trial info
        this.leftPinkChance = this.registry.get("leftPinkChance");
        this.rightPinkChance = this.registry.get("rightPinkChance");

        // Retrieve whether to show instructions on the first "broken" trial
        this.showBrokenInstructions = this.registry.get(
            "showBrokenInstructions"
        );

        // Retrieve the file containing trial info
        this.trialInfoFile = this.registry.get("trialInfoFile");
    }

    /**
     * Preloads all the necessary assets for the game.
     */
    preload() {
        // Preload assets for the TwinklingStars class
        TwinklingStars.preloadAssets(this, "./assets/star.png");

        // Load cannonballs
        Ball.preloadAssets(
            this,
            this.ballColours,
            "./assets",
            { frameWidth: 100, frameHeight: 100 },
            { frameWidth: 100, frameHeight: 100 }
        );

        // Load cannon
        Cannon.preloadAssets(this, "./assets");

        // Load alien
        Alien.preloadAssets(this, "./assets");

        // UI elements preload
        TopUI.preloadAssets(this, "./assets");

        // Load asteroids for confidence trials
        Asteroids.preloadAssets(this, "./assets");

        // load trial info
        // this.load.json("trial_info", "./src/trial_info/trial_info_TU.json");
        // this.load.json("trial_info", "./src/trial_info/trial_info_two-step.json");
        this.load.json("trial_info", `./src/trial_info/${this.trialInfoFile}`);

        // Load planet image
        this.load.image("planet", "./assets/planet.png");

        // Load background image
        this.load.image("background", "./assets/BG1_resized.png");
    }

    /**
     * Set up the background and planet images.
     */
    setBackground() {
        // Set up the background image
        this.background = this.add.image(0, 0, "background");
        this.background.setOrigin(0);
        this.background.setDepth(-10);

        // Set up the planet image
        this.planet = this.add.image(250, 615, "planet");
        this.planet.setScale(0.12);
    }

    /**
     * Calculates the increase in score based on the bet color, bet amount, alien color,
     * and score color.
     *
     * @param {string} betColor - The color of the bet.
     * @param {number} betAmount - The amount of the bet.
     * @param {string} alienColor - The color of the alien.
     * @param {string} scoreColor - The color of the score.
     * @returns {number} - The increase in score.
     */
    calculateScoreIncrease = (betColor, betAmount, alienColor, scoreColor) => {
        // If the bet amount is -999, return 0 indicating no valid bet
        if (betAmount === -999) {
            return 0;
        }

        // Calculate the score modifier based on whether the alien color matches the bet color
        const scoreModifier = alienColor === betColor ? 1 : -1;

        // Set the bonus text to display the bet amount with a '+' sign if the score modifier is positive
        this.bonusText.setBonusText(
            `${scoreModifier > 0 ? "+" : "-"}${betAmount}`
        );

        // Calculate the score increase by multiplying the bet amount with the score modifier
        const scoreIncrease = betAmount * scoreModifier;

        // Set the bonus text color to the specified score color
        this.bonusText.setBonusTextColour(scoreColor);

        // Return the calculated score increase
        return scoreIncrease;
    };

    /**
     * Retrieves the bet information from the asteroid and ball objects.
     * Updates the confidence and the specific bet property based on the color of the ball.
     * @param {Phaser.GameObjects.Sprite} asteroid - The asteroid object.
     * @param {Phaser.GameObjects.Sprite} ball - The ball object.
     */
    getBetInfo(asteroid, ball) {
        // Retrieve the bet amount from the asteroid object
        const betAmount = asteroid.getData("betAmount");

        // Retrieve the color of the ball and asteroid objects
        const ballColour = ball.getData("colour");
        const asteroidColour = asteroid.getData("colour");

        // Update the confidence based on the color of the asteroid
        this.confidence =
            asteroid.getData("baseValue") *
            (asteroidColour === "pink" ? -1 : 1);

        // Update the specific bet property based on the color of the ball
        if (ballColour === "pink") {
            this.pinkBet = betAmount;
        } else {
            this.purpleBet = betAmount;
        }
    }

    /**
     * Handles the overlap between the ball and the alien.
     * @param {Ball} ball - The ball object.
     */
    handleBallAlienOverlap(ball) {
        // Reset the position of the ball
        ball.resetPosition();

        // Move the ball to the bottom (TODO: Evaluate if necessary)
        ball.moveToBottom();

        // Update the score
        this.updateScore();

        // Reset the alien
        this.alien.reset();
    }

    /**
     * Handles the overlap between a ball and an asteroid.
     * @param {Phaser.GameObjects.Sprite} asteroid - The asteroid sprite.
     * @param {Phaser.GameObjects.Sprite} ball - The ball sprite.
     */
    handleBallAsteroidOverlap(asteroid, ball) {
        // Check if the confidence target hit flag is false
        if (!this.confidenceTargetHit) {
            // Set the confidence target hit flag to true
            this.confidenceTargetHit = true;

            // Hide the cannon pointer
            this.cannon.hidePointer();

            // Get the bet info
            this.getBetInfo(asteroid, ball);

            // Calculate the score increase if there's a valid bet
            if (this.pinkBet !== -999 || this.purpleBet !== -999) {
                // Determine the bet type
                const betType = this.pinkBet !== -999 ? "pink" : "purple";

                // Calculate the score increase
                this.scoreIncrease = this.calculateScoreIncrease(
                    betType,
                    asteroid.getData("betAmount"),
                    asteroid.getData("colour"),
                    asteroid.getData("colour") === "pink"
                        ? "#FF0180"
                        : "#6A00FF"
                );

                // Show the bonus text after a delay
                this.bonusText.show(1000, 1.5, 400);
            }

            // Reset the ball position
            ball.resetPosition();

            // Explode the asteroid
            asteroid.explode();
        }
    }

    /**
     * Create the UI elements for the game.
     */
    createUI() {
        // Create the UI element at the top of the screen
        this.topUI = new TopUI(
            this,
            this.totalTrials,
            this.showExplodeChanceBars
        );

        // Create the bonus text element
        this.bonusText = new BonusText(this, 250, 320, "+100");

        // Listen to the "shown" event of the bonus text element to trigger score update and start a new trial
        this.bonusText.on("shown", () => {
            this.score += this.scoreIncrease; // Update the score
            this.hideConfidence(); // Hide the confidence element
            this.startNewTrial(); // Start a new trial
        });

        // Create the bonus round text element
        this.bonusRoundText = new BonusRoundText(this);
    }

    /**
     * Load trial information from cache and set properties.
     */
    loadTrialInfo() {
        // Load trial info from cache
        this.trialInfo = this.cache.json.get("trial_info");

        // Set totalTrials based on registry value
        if (this.registry.get("short")) {
            this.totalTrials = 5;
        } else {
            this.totalTrials = Object.keys(this.trialInfo).length;
        }
    }

    /**
     * Creates the background with twinkling stars.
     */
    createBackground() {
        // Set background
        this.setBackground();

        // Create twinkling stars
        new TwinklingStars(this, {
            numberOfStars: 30, // Number of stars to create
            minX: 0, // Minimum x-coordinate for star position
            maxX: 500, // Maximum x-coordinate for star position
            minY: 0, // Minimum y-coordinate for star position
            maxY: 600, // Maximum y-coordinate for star position
            initialScale: 0.2, // Initial scale of stars
            initialAlpha: 0.5, // Initial opacity of stars
            endScale: 0.3, // End scale of stars
            endAlpha: 0.9, // End opacity of stars
            minDuration: 1000, // Minimum duration of animation
            maxDuration: 3000, // Maximum duration of animation
            ease: "Quad", // Easing function for animation
        });
    }

    /**
     * Creates pink and purple cannonballs.
     * Sets up event listeners for exploded, offScreen, and missed events.
     */
    createBalls() {
        // Create grey cannonball
        this.ball_grey = new Ball(this, 300, 800, "grey", 0.05);
        if (this.ballsAreGrey == true) {
            this.ball_pink = new Ball(this, 300, 800, "grey", 0.05)
            this.ball_purple = new Ball(this, 300, 800, "grey", 0.05)
             }
        else {
        // Create pink cannonball
        this.ball_pink = new Ball(this, 300, 800, "pink", 0.05);
        // Create purple cannonball
        this.ball_purple = new Ball(this, 300, 800, "purple", 0.05);
        }        
        // Listen for the 'exploded' event
        this.ball_pink.on("exploded", (ball) => {
            this.handleBallExplosion(ball);
        });

        this.ball_purple.on("exploded", (ball) => {
            this.handleBallExplosion(ball);
        });

        // Set up the listener for the ball going off-screen
        this.ball_pink.on("offScreen", (ball) => {
            this.startNewTrial();
        });

        this.ball_purple.on("offScreen", (ball) => {
            this.startNewTrial();
        });

        // Handle missing the target on confidence trials
        // This represents a response in the middle of the scale
        this.ball_pink.on("missed", (ball) => {
            if (this.confidenceShown & !this.confidenceTargetHit) {
                this.handleMissedConfidenceTrial(ball);
            }
        });

        this.ball_purple.on("missed", (ball) => {
            if (this.confidenceShown & !this.confidenceTargetHit) {
                this.handleMissedConfidenceTrial(ball);
            }
        });
    }

    /**
     * Creates an alien sprite and sets up overlap for pink and purple balls.
     */
    createAlien() {
        // Create alien sprite
        this.alien = new Alien(this, 250, 200, this.alienSpeed);
        this.alien.setMoving(true);

        // Setup overlap for pink ball and alien
        this.physics.add.overlap(this.alien, this.ball_pink, () => {
            this.handleBallAlienOverlap(this.ball_pink);
        });

        // Setup overlap for purple ball and alien
        this.physics.add.overlap(this.alien, this.ball_purple, () => {
            this.handleBallAlienOverlap(this.ball_purple);
        });
    }

    /**
     * Create a broken instruction box for grey trials.
     */
    createBrokenInstructionBox() {
        // Create instruction box for grey trials
        this.instructionBoxGrey = new InstructionBox(
            this, // Parent scene
            250, // X position
            610, // Y position
            300, // Width
            50, // Height
            250, // Background color
            0.5, // Transparency
            15, // Font size
            "up", // Arrow direction
            "", // Text content
            15 // Z-order
        );

        // Set the text content of the instruction box
        this.instructionBoxGrey.setText(
            "Uh oh! Looks like the colour ball generator is broken!"
        );

        // Hide the instruction box
        this.instructionBoxGrey.hide();
    }

    /**
     * Initializes the game.
     */
    create() {
        // Load trial info
        this.loadTrialInfo();

        // TESTING - SET TRIALS 2-10 to confidence
        // for (let i = 1; i <= 20; i++) {
        //     // this.trialInfo[i]['confidence'] = 1;
        //     // this.trialInfo[i]["purpleExplode"] = 1;
        //     // this.trialInfo[i]["pinkExplode"] = 1;

        //     // if i is divisible by 2, set purple explode to 2
        //     if (i % 2 == 0) {
        //         this.trialInfo[i]["purpleExplodeChance"] = 2;
        //         this.trialInfo[i]["pinkExplodeChance"] = 2;
        //     }

        // }

        // Create a debug graphic to show the physics bodies
        if (this.debugPhysics) {
            this.physics.world.createDebugGraphic();
        }

        // Background
        this.createBackground();

        // Cannon
        this.cannon = new Cannon(
            this,
            250,
            545,
            this.showBallColourProbabilities
        );

        // Balls
        this.createBalls();

        // Alien
        this.createAlien();

        // Create UI
        this.createUI();

        // Create asteroids for confidence trials
        this.asteroids = new Asteroids(
            this,
            250,
            590,
            300,
            5,
            this.handleBallAsteroidOverlap
        );

        // Instruction box for broken trials
        this.createBrokenInstructionBox();

        // Big text to show announcements about score
        this.scoreAnnouncementText = new ScoreAnnouncementText(
            this,
            250,
            300,
            "1000 points!"
        );

        // Start the first trial
        this.startNewTrial();
    }

    handleMissedConfidenceTrial(ball) {
        this.confidence = 0;
        this.pinkBet = 0;
        this.purpleBet = 0;
        this.confidenceTargetHit = true;
        this.startNewTrial();
        this.hideConfidence();
        ball.resetPosition();
    }

    handleBallExplosion(ball) {
        // Reset the ball's position or handle it being off-screen
        ball.y = 620;

        // Update the score
        this.score -= 50;

        this.topUI.updateScore(this.score);

        // Set exploded state
        this.exploded = true;

        // Update trial counter
        this.startNewTrial();

        // Optionally update explode chance bars
        // this.updateExplodeChanceBars(true);
    }

    start() {}

    /**
     * Handles the response after a player selects a side.
     * @param {number} side - The side selected by the player (0 for left, 1 for right).
     */
    handleResponse(side) {
        // After a delay, hide the instruction box
        this.time.delayedCall(
            1000,
            this.instructionBoxGrey.hide,
            [],
            this.instructionBoxGrey
        );

        // Flash the container
        this.cannon.flashContainer(side);

        // Check if the selected side is not blocked and the cannon is active
        if (this.blockedSide !== side && this.cannonActive) {
            // Record the response
            this.response = side + 1;

            // Get the side string
            const sideString = side === 0 ? "left" : "right";

            // Calculate the response time in milliseconds
            this.RT = this.game.loop.time - this.startTime;

            // Set the cannon as inactive to prevent firing again
            this.cannonActive = false;

            // Fire the ball based on the selected option
            if (
                this.trialInfo[this.trialNumber][`purpleOption${side + 1}`] ===
                1
            ) {
                this.ball_purple.fire(
                    sideString,
                    this.trialInfo[this.trialNumber]["purpleExplode"] === 0
                );
            } else {
                this.ball_pink.fire(
                    sideString,
                    this.trialInfo[this.trialNumber]["pinkExplode"] === 0
                );
            }
        }
    }

    /**
     * Handles key press events.
     *
     * @param {string} key - The key that was pressed ("LEFT" or "RIGHT").
     * @param {number} response - The response to handle (0 or 1).
     */
    handleKeyPress(key, response) {
        // Check if the key is pressed for at least 500 milliseconds
        if (
            this.input.keyboard.checkDown(
                this.input.keyboard.addKey(key),
                500
            ) &&
            !this.ball_pink.visible &&
            !this.ball_purple.visible
        ) {
            // Handle the response
            this.handleResponse(response);
        }
    }

    // Update - runs constantly
    update() {
        // Run cannon updates
        this.cannon.update();

        // Run ball updates
        this.ball_pink.update();
        this.ball_purple.update();

        // if the 1 key is pressed
        this.handleKeyPress("ONE", 0);
        // if the 2 key is pressed
        this.handleKeyPress("TWO", 1);
    }

    updateScore() {
        this.score += 100;
        this.nHits += 1;
        this.topUI.updateScore(this.score);
        this.topUI.updateAlienCount(this.nHits);

        // update trial counter
        this.startNewTrial();
    }

    storeData() {
        // DATA
        var trialData = {
            trial: this.trialNumber,
            trialType: this.trialType,
            score: this.score,
            nHits: this.nHits,
            response: this.response,
            ballColour: this.ballColour,
            exploded: this.exploded,
            RT: this.RT,
            confidence: this.confidence,
            pinkBet: this.pinkBet,
            purpleBet: this.purpleBet,
            betScaling: this.betScaling,
        };

        // Store data
        this.game.registry.values.data[this.trialNumber] = trialData;
    }

    /**
     * Handle a broken trial.
     *
     * @param {object} currentTrialInfo - Information about the current trial.
     */
    handleBrokenTrial(currentTrialInfo) {
        // Check if the trial is broken
        this.brokenTrial = currentTrialInfo["pinkExplodeChance"] > 1;

        // Update the UI
        this.topUI.setBlocked(this.brokenTrial);

        if (this.brokenTrial) {
            // Set grey color for pink and purple balls
            [this.ball_pink, this.ball_purple].forEach((ball) =>
                ball.setGrey()
            );

            // Show grey instruction box if not already shown
            if (!this.brokenInstructionsShown && this.showBrokenInstructions) {
                this.instructionBoxGrey.show();
                this.brokenInstructionsShown = true;
            }
        } else {
            // Set original textures for pink and purple balls
            [this.ball_pink, this.ball_purple].forEach((ball) =>
                ball.setColoured()
            );

            // Hide grey instruction box
            this.instructionBoxGrey.hide();

            // Update explode chance bars
            this.updateExplodeChanceBars(true);

            // Reset the instruction box shown flag
            this.brokenInstructionsShown = false;
        }
    }

    /**
     * Handle the confidence trial based on the current trial information.
     *
     * @param {object} currentTrialInfo - The information about the current trial.
     */
    handleConfidenceTrial(currentTrialInfo) {
        // Don't show if this is also a broken trial
        if (
            currentTrialInfo["confidence"] === 1 &&
            currentTrialInfo["pinkExplodeChance"] <= 1
        ) {
            // Make sure balls don't explode
            currentTrialInfo["pinkExplode"] = 1;
            currentTrialInfo["purpleExplode"] = 1;

            // Show the pink and purple balls
            [this.ball_pink, this.ball_purple].forEach((ball) => {
                ball.visible = true;
                ball.alpha = 0;
            });

            // Delayed call to hide the balls and show the confidence
            this.time.delayedCall(
                500,
                () => {
                    [this.ball_pink, this.ball_purple].forEach((ball) => {
                        ball.visible = false;
                        ball.alpha = 1;
                    });
                    this.showConfidence();
                },
                [],
                this
            );
        } else {
            // Hide the confidence and set the trial type to "trial"
            this.hideConfidence();
            this.trialType = "trial";
        }
    }

    startNewTrial() {
        // increment trial number
        this.trialNumber += 1;

        // store data locally (but not on the 0th trial before we have any data)
        if (this.trialNumber != 0) {
            this.storeData();
        }

        // Go to end scene if all trials completed
        let end = this.handleEndScene();

        if (!end) {
            console.log("Starting new trial...", this.trialNumber);

            // Update trial counter
            this.topUI.updateTrial(this.totalTrials, this.trialNumber);

            // Reset bets
            this.pinkBet = this.purpleBet = -999;

            // Save data every 5 trials
            if (
                this.trialNumber != 0 &&
                this.trialNumber % this.dataSaveInterval == 0
            ) {
                this.saveData();
            }

            // Get trial info
            const currentTrialInfo = this.trialInfo[this.trialNumber];

            // Set explode chance bar values
            this.updateExplodeChanceBars(true);

            // Update ball colour probabilities if showing
            this.cannon.updateBallColourProbabilities(
                this.leftPinkChance,
                this.rightPinkChance
            );

            // Handle the broken trial
            this.handleBrokenTrial(currentTrialInfo);

            // Set blocked container side
            this.handleCannonBlocking(currentTrialInfo);

            // Show confidence UI with probability
            this.handleConfidenceTrial(currentTrialInfo);

            // Show score announcement if score is % 1000
            this.handleScoreAnnouncement();

            // Record time at which the trial started
            this.startTime = this.game.loop.time;

            // Set cannon active
            this.cannonActive = true;
        }
    }

    /**
     * Handles the blocking of the cannon containers based on the current trial information.
     * @param {Object} currentTrialInfo - The current trial information.
     */
    handleCannonBlocking(currentTrialInfo) {
        // Get the blocked side from the current trial information
        this.blockedSide = currentTrialInfo["blockedSide"];

        // Check if there is a blocked side
        if (this.blockedSide > -1) {
            // Block the corresponding container
            this.cannon.blockContainer(this.blockedSide);
        } else {
            // Unblock both containers
            this.cannon.unblockContainers();
        }
    }

    handleScoreAnnouncement() {
        if (
            this.score % this.scoreAnnouncementInterval === 0 &&
            this.score > 0
        ) {
            this.scoreAnnouncementText.flash(this.score);
        }
    }

    handleEndScene() {
        if (this.trialNumber === this.totalTrials) {
            console.log("Ending game...");
            this.saveData();
            this.scene.start("EndScene");
            return true;
        }
        {
            return false;
        }
    }

    /**
     * Update the explode chance bars based on the given show value.
     *
     * @param {boolean} show - Flag indicating whether to show or hide the bars.
     */
    updateExplodeChanceBars(show) {
        if (show) {
            // Show probability
            this.topUI.updateExplodeChanceBars(
                this.trialInfo[this.trialNumber]["pinkExplodeChance"],
                this.trialInfo[this.trialNumber]["purpleExplodeChance"]
            );
        } else {
            // Hide probability
            this.topUI.updateExplodeChanceBars(0, 0);
        }
    }

    /**
     * Saves the trial data to the Firestore database.
     */
    saveData() {
        // Check the init_subject_failed flag in the registry
        if (this.registry.get("init_subject_failed")) {
            // Log a warning if the flag is set
            console.warn(
                "Failed to save data because subject initialization failed."
            );
            // Return early
            return;
        }
        // Otherwise, save data
        else {
            // Use the saveData function from data.js
            saveData(this.game);
        }

    }

    1;
    showConfidence() {
        // // block one side
        // this.blockedSide = this.trialInfo[this.trialNumber]["blockedSide"];
        
        // // show corresponding blocked tape image
        // this.cannon.blockContainer(this.blockedSide);

        // Record trial type
        if (this.brokenTrial) {
            this.trialType = "forced_choice";
        } else {
            this.trialType = "confidence";

            // move balls to bottom of screen
            this.ball_pink.moveToBottom();
            this.ball_purple.moveToBottom();

            // Get bet scaling - select from either 5, 10, or 15
            this.betScaling =
                this.trialInfo[this.trialNumber]["confidenceScaling"];

            // Hide alien
            this.alien.visible = false;

            // show confidence UI
            this.asteroids.show(this.betScaling);

            // show pointer
            this.cannon.showPointer();

            // grow bonus round text and fade out
            this.bonusRoundText.flash();

            // set confidenceShown to true
            this.confidenceShown = true;

            // stop the alien moving
            this.alien.setMoving(false);

            // set explode chance bars
            this.updateExplodeChanceBars(false);

            // reset confidence alien hit flag
            this.confidenceTargetHit = false;
        }
    }

    /**
     * Hides the confidence UI and resets various game elements.
     */
    hideConfidence() {

        // Update score text
        this.topUI.updateScore(this.score);

        // Reset bonus text
        this.bonusText.reset();

        // Show alien
        this.alien.visible = true;

        // Set alien moving
        this.alien.setMoving(true);

        // Hide pointer
        this.cannon.hidePointer();

        // Hide asteroids
        this.asteroids.hide();

        // Set confidenceShown to false
        this.confidenceShown = false;

        // Reset ball positions
        this.ball_pink.resetPosition();
        this.ball_purple.resetPosition();
    }
}
export default GameScene;
