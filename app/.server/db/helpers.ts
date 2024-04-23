import { eq } from "drizzle-orm";
import { db } from "./db";
import { MapData, bio, mapData } from "./schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const ZodUserInsert = createInsertSchema(bio, {
  map: mapData.catch({}).transform((d) => JSON.stringify(d)),
});

export const ZodUserSelect = createSelectSchema(bio, {
  map: z.string().transform((d) => mapData.parse(JSON.parse(d))),
});

export const getUser = async (user: string) => {
  const u = await db.query.bio.findFirst({
    where: (s) => eq(s.user, user),
  });

  if (!u) {
    const u = await db
      .insert(bio)
      .values(ZodUserInsert.parse({ user }))
      .returning()
      .then((r) => r[0]);

    return ZodUserSelect.parse(u);
  }

  return ZodUserSelect.parse(u);
};

export const updateMap = async (user: string, map: MapData) => {
  return await db
    .update(bio)
    .set({ map: JSON.stringify(map) })
    .where(eq(bio.user, user))
    .returning()
    .then((r) => r[0]);
};
