import { ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { z } from "zod";
import { getUser, updateMap } from "~/.server/db/helpers";
import Keystroke, { stroke } from "~/component/keystroke";
import { parseStrokes } from "~/utils/parseStrokes";
import { getShuffledWords } from "~/utils/setupWords";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  const words = getShuffledWords();
  return { words };
};

const actionBody = z.object({
  strokes: z.array(stroke),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const u = await getUser("me");

  const { strokes } = actionBody.parse(await request.json());
  const map = parseStrokes(strokes, u.map);

  await updateMap("me", map);

  return {};
};

export default function Index() {
  const d = useLoaderData<typeof loader>();

  if (!d) return null;
  const { words } = d;

  const fetcher = useFetcher();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <Keystroke
        words={words.slice(0, 10)}
        processStrokes={(strokes) => {
          fetcher.submit(
            { strokes },
            {
              encType: "application/json",
              method: "POST",
              navigate: false,
            }
          );
        }}
      />
    </div>
  );
}
