// Firebase
import { signInAndGetUid, db } from "./firebaseSetup.js";
import { initSubject } from "./data.js";
// Other things
import { extractUrlVariables, applyGameConfig } from "./utils.js";
import gameConfig from "./gameConfig.js";

/**
 * Function to check the start of the game.
 *
 * @param {string} uid - The user ID.
 */
var startGame = function (uid) {
    // Get URL variables
    let { subjectID, testing, studyID, short, task } = extractUrlVariables();

    // Clear start element and scroll to top
    document.getElementById("start").innerHTML = "";
    window.scrollTo(0, 0);

    // Wait a bit before starting
    setTimeout(function () {
        // Create the game with the configuration object defined above
        let game = new Phaser.Game(gameConfig);

        // Subject and study IDs stored in registry
        game.registry.set("subjectID", subjectID);
        game.registry.set("studyID", studyID.toLowerCase());

        // Apply configuration settings to the game (given in config.js)
        applyGameConfig(game, task);

        // Set testing flag
        game.config.testing = testing === "FALSE" ? false : true;

        // Set study ID
        game.config.studyID = studyID;

        // Short version for testing?
        game.registry.set("short", short);

        // Store task type in registry
        game.registry.set("task", task);

        // Store the database and uid in the game config
        // game.config.db = db; 
        game.config.uid = uid;

        // Initialise the subject in the database
        // Try to initialize the subject
        try {
            initSubject(game);
        } catch (error) {
            // Log a warning if initialization fails
            console.warn("Failed to initialise subject:", error);
            // Set a flag in the registry to indicate initialization failure
            game.registry.set("init_subject_failed", true);
        }

        // Store the start time in the registry
        game.registry.set("start_time", new Date());

        // Create an object within the game to store responses
        game.registry.set("data", {});
    }, 1000);
};

// Sign in and start the game
// signInAndGetUid()
//     .then((uid) => {
//         console.log("Signed in with UID:", uid);
//         startGame(uid); // Pass uid as an argument to startGame
//     })
//     .catch((error) => {
//         console.error("Sign-in failed:", error);
//     });

startGame();
