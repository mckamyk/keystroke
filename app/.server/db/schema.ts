import { sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const mapData = z.record(
  z.string(),
  z.object({
    vector: z.array(z.number()),
    vectorCount: z.number(),
  })
);

export type MapData = z.infer<typeof mapData>;

export const bio = sqliteTable("bio", {
  user: text("user").notNull().primaryKey(),
  map: text("map").notNull().default("{}"),
});
