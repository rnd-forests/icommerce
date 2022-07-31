#!/usr/bin/env node

const THRESHOLD = {
  currentDifferentFromWanted: parseInt(process.env.CURRENT_DIFFERENT_FROM_WANTED) || 20,
  currentDifferentLatest: parseInt(process.env.CURRENT_DIFFERENT_FROM_LATEST) || 40,
};

const { stdin } = process;
const inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', chunk => inputChunks.push(chunk));

stdin.on('end', function () {
  const inputJSON = inputChunks.join();
  const parsedData = JSON.parse(inputJSON);
  const npmOutdatedSummary = Object.entries(parsedData)
    .map(entry => Object.assign({ name: entry[0] }, entry[1]))
    .reduce(
      (previousValue, el) => {
        let { currentDifferentFromWanted, currentDifferentLatest } = previousValue;
        if (el.current != el.wanted) currentDifferentFromWanted.push(el.name);
        if (el.current != el.latest) currentDifferentLatest.push(el.name);
        return { currentDifferentFromWanted, currentDifferentLatest };
      },
      { currentDifferentFromWanted: [], currentDifferentLatest: [] },
    );

  console.log('Expected', THRESHOLD);
  console.log('Acutal  ', {
    currentDifferentFromWanted: npmOutdatedSummary.currentDifferentFromWanted.length,
    currentDifferentLatest: npmOutdatedSummary.currentDifferentLatest.length,
  });

  if (
    npmOutdatedSummary.currentDifferentFromWanted.length > THRESHOLD.currentDifferentFromWanted ||
    npmOutdatedSummary.currentDifferentLatest.length > THRESHOLD.currentDifferentLatest
  ) {
    console.error('Detected too many outdated dependencies.');
    console.error(npmOutdatedSummary);
    process.exit(7);
  }

  console.log('Outdated dependencies is within threshold.');
});
