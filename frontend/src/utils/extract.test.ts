import { describe, expect, it } from "vitest";
import { extractActivities } from "./extract";

describe("extractActivities", () => {
  it("parses japanese log sentences", () => {
    const result = extractActivities("朝は散歩15分とおやつ2回、夜に遊び20分");
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "walk", amount: 15 }),
        expect.objectContaining({ type: "treat", amount: 2 }),
        expect.objectContaining({ type: "play", amount: 20 }),
      ]),
    );
  });
});
