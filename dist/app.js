import fs from 'node:fs';
import wordListPath from 'word-list';
const big_dictionary = fs.readFileSync(wordListPath, 'utf8').split('\n');
let slicedDictonary = [];
let pockets = ["nks", "cut", "hbl", "aro"];
const alphabet = "abcdefghijklmnopqrstuvwxyz";
let trueWords = [];
console.log("starting solver..");
function sliceDictionary() {
    dictionaryInitializer();
    console.log("Slicing dictionary...");
    for (let i = 0; i < big_dictionary.length; i++) {
        let word = big_dictionary[i];
        // slice dictionary by beginning letter into 26 parts
        if (filterDuplicateLettersOrShortWords(word))
            continue;
        let firstLetter = word[0].toLowerCase();
        let letterBias = letterToNumber(firstLetter);
        slicedDictonary[letterBias].push(word);
    }
}
function filterDuplicateLettersOrShortWords(word) {
    if (word == undefined || word.length < 3)
        return true;
    let lastLetter = "";
    for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        if (letter == lastLetter) {
            return true;
        }
        lastLetter = letter;
    }
    return false;
}
function letterToNumber(letter) {
    letter = letter.toLowerCase();
    return alphabet.indexOf(letter);
}
function dictionaryInitializer() {
    console.log("Initializing dictionary...");
    for (let i = 0; i < 26; i++) {
        slicedDictonary.push([]);
    }
}
function pocketChecker(lastPocket, letter) {
    for (let l = 0; l < pockets.length; l++) {
        if (l == lastPocket) {
            continue; // skip the current pocket
        }
        let pocket = pockets[l];
        if (pocket.includes(letter)) {
            return l;
        }
    }
    return null;
}
function wordChecker(pocketBias, word) {
    // we start on 1 because we're evaluating the second letter first
    let lastValidPocket = pocketBias;
    for (let k = 1; k < word.length; k++) {
        let letter = word[k];
        let nextValidPocket = pocketChecker(lastValidPocket, letter);
        if (nextValidPocket == null)
            return;
        lastValidPocket = nextValidPocket;
    }
    trueWords.push(word);
    console.log("Found word: " + word);
    return;
}
function dictionarySliceChecker(dictionarySlice, startingPocket) {
    console.log("checking slice..." + dictionarySlice[0]);
    for (let j = 0; j < dictionarySlice.length; j++) {
        const word = dictionarySlice[j];
        wordChecker(startingPocket, word);
    }
}
function gamePlayer() {
    // for each pocket, 
    for (let i = 0; i < pockets.length; i++) {
        // check for words that start with each letter in the pocket
        const checking_pocket = pockets[i];
        for (let p = 0; p < pockets[i].length; p++) {
            const checkLetter = checking_pocket[p];
            dictionarySliceChecker(slicedDictonary[letterToNumber(checkLetter)], i);
        }
    }
    console.log(trueWords);
}
sliceDictionary();
gamePlayer();
