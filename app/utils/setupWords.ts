import words from "./words";

export const getShuffledWords = () => {
  const shuffled = words
    .sort(() => Math.random() - 0.5)
    .map((w) => w.toLowerCase())
    .slice(0, 10);
  return shuffled;
};
