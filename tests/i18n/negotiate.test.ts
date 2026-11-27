import { expect, test } from "vitest";
import { matchLocale } from "../../src/lib/i18n/negotiate";

test("selects the highest-ranked supported language with a regional tag", () => {
  expect(matchLocale("de-DE, tr;q=0.4, en-GB;q=0.9")).toBe("en");
});
