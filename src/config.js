const gameConfigSettings = {

    // UPDATE TASK SETTINGS HERE
    // IMPORTANT - THE ORDER OF THESE SETTINGS MUST NOT BE CHANGED

    // General settings

    // URL to redirect to after the game is complete
    redirectURL: "www.redirecturl.com",

    // Settings for game play
    alienSpeed: 120,
    debugPhysics: false,
    dataSaveInterval: 5,

    // Task-specific settings - Transition Learning Task
    MB: {
        showExplodeChanceBars: true,
        showBallColourProbabilities: false,
        ballsAreGrey: false,
        leftPinkChance: 0.7,
        rightPinkChance: 0.3,
        showBrokenInstructions: true,
        trialInfoFile: "trial_info_transition-learning.json"
    },

    // Task-specific settings - Two-Step Task
    MBMF: {
        showExplodeChanceBars: false,
        showBallColourProbabilities: true,
        ballsAreGrey: false,
        leftPinkChance: 0.7,
        rightPinkChance: 0.3,
        showBrokenInstructions: false,
        trialInfoFile: "trial_info_two-step.json"
    },

    // Task-specific settings - Model-Free Task
    MF: {
        showExplodeChanceBars: false,
        showBallColourProbabilities: false,
        ballsAreGrey: true,
        leftPinkChance: -1,
        rightPinkChance: -1,
        showBrokenInstructions: false,
        trialInfoFile: "trial_info_model-free.json"
    }
};

export { gameConfigSettings };