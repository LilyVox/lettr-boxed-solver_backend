import fs from 'node:fs';
import wordListPath from 'word-list';
const big_dictionary = fs.readFileSync(wordListPath, 'utf8').split('\n');
const slicedDictionary = [];
const alphabet = 'abcdefghijklmnopqrstuvwxyz';
let allValidWordsByPocket = {};
function sliceDictionary() {
    dictionaryInitializer();
    console.log('Slicing dictionary...');
    for (let i = 0; i < big_dictionary.length; i++) {
        const word = big_dictionary[i];
        // slice dictionary by beginning letter into 26 parts
        if (filterDuplicateLettersOrShortWords(word))
            continue;
        const firstLetter = word[0].toLowerCase();
        const letterBias = letterToNumber(firstLetter);
        slicedDictionary[letterBias].push(word);
    }
}
function filterDuplicateLettersOrShortWords(word) {
    if (word == undefined || word.length < 3)
        return true;
    let lastLetter = '';
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
    console.log('Initializing dictionary...');
    for (let i = 0; i < 26; i++) {
        slicedDictionary.push([]);
    }
}
function pocketChecker(pockets, lastPocket, letter) {
    for (let l = 0; l < pockets.length; l++) {
        if (l == lastPocket) {
            continue; // skip the current pocket
        }
        const pocket = pockets[l];
        if (pocket.includes(letter)) {
            return l;
        }
    }
    return null;
}
function wordChecker(pockets, pocketBias, word) {
    // we start on 1 because we're evaluating the second letter first
    let lastValidPocket = pocketBias;
    for (let k = 1; k < word.length; k++) {
        const letter = word[k];
        const nextValidPocket = pocketChecker(pockets, lastValidPocket, letter);
        if (nextValidPocket == null)
            return null;
        lastValidPocket = nextValidPocket;
    }
    return word;
}
function dictionarySliceChecker(pockets, dictionarySlice, startingPocket) {
    console.log('checking slice...' + dictionarySlice[0]);
    const trueWordSlice = [];
    for (let j = 0; j < dictionarySlice.length; j++) {
        const word = dictionarySlice[j];
        const validWord = wordChecker(pockets, startingPocket, word);
        if (validWord != null)
            trueWordSlice.push(word);
    }
    return trueWordSlice;
}
export function wordsFinder(pockets) {
    console.log('starting solver..');
    for (let i = 0; i < pockets.length; i++) {
        // check for words that start with each letter in the pocket
        const checking_pocket = pockets[i];
        for (let p = 0; p < pockets[i].length; p++) {
            const checkLetter = checking_pocket[p];
            const tWordSlice = dictionarySliceChecker(pockets, slicedDictionary[letterToNumber(checkLetter)], i);
            allValidWordsByPocket[checkLetter] = tWordSlice;
        }
    }
    return allValidWordsByPocket;
}
export function wordStringer(pockets) {
    allValidWordsByPocket = {};
    wordsFinder(pockets);
    // to string words, we need to start with an arbitrary pocket letter,
    // pick a long word from that pocket-slice which hits many different pockets
    // then choose another word that starts from the ending letter that hits many pockets
    const pocketsJoined = pockets.join("");
    const allStringsFound = {};
    for (let i = 0; i < pocketsJoined.length; i++) {
        const aStartingLetter = pocketsJoined[i];
        const newWordString = makeWordString(aStartingLetter, pockets);
        allStringsFound[aStartingLetter] = newWordString;
    }
    return allStringsFound;
}
function makeWordString(startingLetter, pockets) {
    if (allValidWordsByPocket[startingLetter].length == 0)
        return [];
    const wordString = [];
    let remainingLetters = "";
    do {
        let nextLetter = "";
        if (wordString.length == 0) {
            nextLetter = startingLetter;
        }
        else {
            const lastWord = wordString[wordString.length - 1];
            const lastLetter = lastWord[lastWord.length - 1];
            nextLetter = lastLetter;
        }
        remainingLetters = findRemainingLettersToHit(pockets, wordString);
        const foundWord = findWeightedWordByLetter(nextLetter, remainingLetters);
        //todo integrate contingency when we hit a terminating line, like ending in x with no valid x words to continue with
        if (foundWord.length > 0)
            wordString.push(foundWord);
        else
            return wordString;
    } while (remainingLetters.length > 0 || wordString.length > 7);
    return wordString;
}
function findWeightedWordByLetter(letter, lettersToHit) {
    // loop over the words in a slice, return the highest one?
    let bestWord = "";
    let bestWeight = 0;
    if (allValidWordsByPocket[letter].length == 0)
        return "";
    allValidWordsByPocket[letter].sort((lastWord, thisWord) => {
        const thisWordWeight = wordWeight(lettersToHit, thisWord);
        const lastWordWeight = wordWeight(lettersToHit, lastWord);
        return lastWordWeight - thisWordWeight;
    });
    allValidWordsByPocket[letter].forEach((word) => {
        const checkWeight = wordWeight(lettersToHit, word);
        if (checkWeight > bestWeight) {
            bestWeight = checkWeight;
            bestWord = word;
        }
    });
    return bestWord;
}
function findRemainingLettersToHit(pockets, words) {
    const wordsSoFar = words.join("");
    const pocketsJoined = pockets.join("");
    if (wordsSoFar.length == 0)
        return pocketsJoined;
    let remainingLetters = "";
    for (let i = 0; i < wordsSoFar.length; i++) {
        const checkLetter = wordsSoFar[i];
        if (pocketsJoined.indexOf(checkLetter) == -1) {
            remainingLetters += checkLetter;
        }
    }
    return remainingLetters;
}
function wordWeight(lettersToHit, word) {
    // consonants 2x value of vowels?
    // consonants at end of alphabet 4x value except t?
    let weight = 0;
    let sameLetters = "";
    for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        if (sameLetters.indexOf(letter) == -1) {
            sameLetters += letter;
            weight += 1;
        }
    }
    return weight;
}
sliceDictionary();
