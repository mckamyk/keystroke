import React, {
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { CornerDownLeft } from "lucide-react";
import { z } from "zod";

const letters = "abcdefghijklmnopqrstuvwxyz ";

export const stroke = z.object({
  key: z.string().length(1),
  direction: z.enum(["up", "down"]),
  time: z.number(),
});

export type Stroke = z.infer<typeof stroke>;

type KeystrokeProps = {
  words: string[];
  processStrokes: (strokes: Stroke[]) => void;
};

const Keystroke: React.FC<KeystrokeProps> = ({ words, processStrokes }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [promp, setPromp] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  useEffect(() => {
    if (!promp.length) setPromp(words);
    else
      setTimeout(() => {
        setDone(() => false);
        setIndex(() => 0);
        setStrokes(() => []);
        setPromp(() => words);
      }, 2000);
  }, [words]);

  useEffect(() => {
    if (done) {
      processStrokes(strokes);
    }
  }, [done]);

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === " " || e.key === "Enter") {
      setIndex((index) => index + 1);
      ref.current!.value = "";
      if (index + 1 === words.length) {
        setDone(true);
      }
    }

    if (!letters.includes(e.key) || e.key.length > 1) {
      return;
    }

    setStrokes((strokes) => [
      ...strokes,
      { key: e.key, direction: "up", time: e.timeStamp },
    ]);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!letters.includes(e.key) || e.key.length > 1) return;

    setStrokes((strokes) => [
      ...strokes,
      { key: e.key, direction: "down", time: e.timeStamp },
    ]);
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <div className="absolute top-0 left-0 w-screen h-screen bg-stone-900 flex items-center justify-center">
      <div>
        <div>
          <input
            onKeyUp={handleKeyUp}
            onKeyDown={handleKeyDown}
            ref={ref}
            type="text"
            className="py-2 text-center inline bg-stone-800 text-slate-200 ring-none outline-none w-full rounded-md"
          />
        </div>
        <div className="space-x-2">
          {promp.map((word, i) => (
            <span
              key={i}
              className={twMerge(
                "text-slate-200 transition-colors",
                i >= index && "text-gray-500"
              )}
            >
              {word}
            </span>
          ))}
          <CornerDownLeft
            className={twMerge(
              "inline text-slate-200 size-4 transition-colors",
              index !== words.length && "text-gray-500"
            )}
          />
        </div>

        <div
          className={twMerge(
            "absolute w-inherit text-center text-slate-200 text-sm opacity-0 transition-opacity",
            done && "opacity-100"
          )}
        >
          Done!
        </div>
      </div>
    </div>
  );
};

export default Keystroke;
