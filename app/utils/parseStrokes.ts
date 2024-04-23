import { Stroke, stroke } from "~/component/keystroke";
import grams from "./grams.json";
import { z } from "zod";
import { MapData } from "~/.server/db/schema";

const { digrams, trigrams } = grams;

type Gram = {
  gram: string;
  strokes: Stroke[];
  vector: number[];
};

type pair = {
  key: string;
  distance: number;
  strokes: Stroke[];
};

export const zodGramMap = z.record(z.string(), z.array(z.array(z.number())));

export type GramMap = z.infer<typeof zodGramMap>;

export const parseStrokes = (strokes: Stroke[], gramMap: MapData) => {
  const foundTrigrams: Gram[] = [];
  const foundDigrams: Gram[] = [];

  const pairs: pair[] = [];
  // group strokes by key

  for (let i = 0; i < strokes.length; i++) {
    const stroke = strokes[i];
    if (stroke.direction === "up") {
      continue;
    }

    for (let j = i + 1; j < strokes.length; j++) {
      const nextStroke = strokes[j];
      if (nextStroke.key === stroke.key) {
        pairs.push({
          key: stroke.key,
          distance: nextStroke.time - stroke.time,
          strokes: [stroke, nextStroke],
        });
        break;
      }
    }
  }

  // trigram pass
  for (let i = 0; i < pairs.length - 2; i++) {
    const [a, b, c] = pairs.slice(i, i + 3);
    if (trigrams.includes(a.key + b.key + c.key)) {
      const strokes = [...a.strokes, ...b.strokes, ...c.strokes];
      foundTrigrams.push({
        gram: a.key + b.key + c.key,
        strokes,
        vector: calculateVector(strokes),
      });
    }
  }

  // digram pass
  for (let i = 0; i < pairs.length - 1; i++) {
    const [a, b] = pairs.slice(i, i + 2);
    if (digrams.includes(a.key + b.key)) {
      const strokes = [...a.strokes, ...b.strokes];
      foundDigrams.push({
        gram: a.key + b.key,
        strokes,
        vector: calculateVector(strokes),
      });
    }
  }

  return buildGramMap([...foundTrigrams, ...foundDigrams], gramMap);
};

const calculateVector = (strokes: Stroke[]): number[] => {
  const times: number[] = [];

  for (let i = 1; i < strokes.length; i++) {
    times.push(strokes[i].time - strokes[i - 1].time);
  }

  return times;
};

const buildGramMap = (grams: Gram[], gramMap: MapData) => {
  const map = gramMap || {};

  grams.forEach((g) => {
    const { gram, vector } = g;
    if (map[gram]) {
      map[gram].vector = averageVectors(
        map[gram].vector,
        vector,
        map[gram].vectorCount
      );
      map[gram].vectorCount++;
    } else {
      map[gram] = { vector, vectorCount: 1 };
    }
  });

  return map;
};

const averageVectors = (
  existingVector: number[],
  newVector: number[],
  vectorCount: number
) => {
  const v = existingVector.map((n) => n * vectorCount);
  const sum = v.map((n, i) => n + newVector[i]);
  return sum.map((a, i) => a / (vectorCount + 1));
};
