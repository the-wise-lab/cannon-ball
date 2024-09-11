import {
    doc,
    setDoc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

/**
 * Initializes the subject data in the Firestore database.
 * @param {object} game - The game object.
 */
export function initSubject(game) {
    // const docRef = doc(
    //     game.config.db,
    //     "STUDY",
    //     game.config.studyID,
    //     "subjects",
    //     game.config.uid
    // );

    // setDoc(docRef, {
    //     subjectID: game.registry.get("subjectID"),
    //     date: new Date().toLocaleDateString(),
    //     time: new Date().toLocaleTimeString(),
    //     trial_data: [],
    //     attention_checks: [],
    // })
    //     .then(() => {
    //         console.log("Data successfully written!");
    //     })
    //     .catch((error) => {
    //         console.error("Error writing document: ", error);
    //     });
}

/**
 * Saves the trial data to the Firestore database.
 * @param {object} scene - The scene object.
 */
export function saveData(game) {
    // // Get a reference to the document in the Firestore database
    // const docRef = doc(
    //     game.config.db,
    //     "STUDY",
    //     game.config.studyID,
    //     "subjects",
    //     game.config.uid
    // );

    // // Update the document with the trial data
    // updateDoc(docRef, {
    //     trial_data: game.registry.get("data"),
    // })
    //     .then(() => {
    //         // Log a success message when the data is successfully updated
    //         console.log("Data successfully updated!");
    //     })
    //     .catch((error) => {
    //         // Log an error message if there is an error updating the document
    //         console.error("Error updating document: ", error);
    //     });
}
