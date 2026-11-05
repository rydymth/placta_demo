import { z } from "zod";

// avoid overcomplication!!!
// interface schemas {
//
// }

// Functions to resolve a good url properly
// Q: How will url scheme help resolve our pages?

export enum ContentType {
  hero = "hero",
  "text-section" = "text-section"
}

const isSafeHref = (value: string): boolean => {
  // Checks if the url is right!
  // Should be path type and then we resolve to https?
  // Q: How is this exactly working out?
  if (value.startsWith("/"))
    return !value.startsWith("//") &&
      !value.includes("\\");
  try {
    return new URL(value).protocol === "https:";
  }
  catch (e: any) {
    return false;
  }
}

// url schema. Will always use the safeFun to parse.
// Function can be swapped out thanks to the object providing???
export const hrefSchema = z
  .string()
  .max(2048)
  .refine(isSafeHref,
    { message: "Must be a local path or https url" });

// For every component
export const componentId = z.string().min(1).max(64);

/*
 * Provide main section schema.
 * Component rendering
 * Q: Can we make this tight with interface?
 * contains: heading(200),
 * subtitle(500)?,
 * ctaText(60)?
 * ctaHref(hrefSchema)?
 */
export const heroContentSchema = z
  .strictObject({
    heading: z.string().min(1).max(200),
    subTitle: z.string().min(1).max(500).optional(),
    ctaText: z.string().min(1).max(60).optional(),
    ctaHref: hrefSchema.optional()
  })
  .refine(c =>
    (c.ctaHref === undefined) === (c.ctaText === undefined), // already returning, both href and text undefined
    {
      message: "ctaHref and ctaText should be provided together!",
      path: ["ctaHref"]
    }
  );

// Q: can create an enum of litrals?
export const heroSchema = z.strictObject({
  id: componentId,
  type: z.literal(ContentType.hero),
  schemaVersion: z.literal(1),
  content: heroContentSchema,
});

// Text section
export const textSectionContentSchema = z.strictObject({
  heading: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
});

export const textSectionSchema = z.strictObject({
  id: componentId,
  type: z.literal(ContentType["text-section"]),
  schemaVersion: z.literal(1),
  content: textSectionContentSchema,
});

export const componentSchema = z.discriminatedUnion("type", [
  heroSchema,
  textSectionSchema,
]);

export type HeroComponent = z.infer<typeof heroSchema>;
export type TextSectionComponent = z.infer<typeof textSectionSchema>;
export type PageComponent = z.infer<typeof componentSchema>;
export type ComponentType = PageComponent["type"];


