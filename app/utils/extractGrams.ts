import { getWords } from "./setupWords";

const words = await getWords();

const digramMap: Record<string, number> = {};
const trigramMap: Record<string, number> = {};

for (const word of words) {
  for (let i = 0; i < word.length - 1; i++) {
    const digram = word.slice(i, i + 2);
    if (digramMap[digram]) {
      digramMap[digram]++;
    } else {
      digramMap[digram] = 1;
    }
  }

  for (let i = 0; i < word.length - 2; i++) {
    const trigram = word.slice(i, i + 3);
    if (trigramMap[trigram]) {
      trigramMap[trigram]++;
    } else {
      trigramMap[trigram] = 1;
    }
  }
}

const digrams = Object.entries(digramMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50)
  .map(([k, v]) => k);
const trigrams = Object.entries(trigramMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50)
  .map(([k, v]) => k);

Bun.write(
  import.meta.dir + "/grams.json",
  JSON.stringify({ digrams, trigrams }, null, 2)
);
