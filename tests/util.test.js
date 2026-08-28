import { describe, it, expect } from "vitest";
import { fmt, mins, esc, tagFromTitle, slugify } from "../public/util.js";

describe("fmt — 24h to 12h display", () => {
  it("morning", () => expect(fmt("09:30")).toBe("9:30am"));
  it("noon", () => expect(fmt("12:00")).toBe("12:00pm"));
  it("afternoon", () => expect(fmt("17:45")).toBe("5:45pm"));
  it("midnight", () => expect(fmt("00:00")).toBe("12:00am"));
  it("just before noon", () => expect(fmt("11:59")).toBe("11:59am"));
  it("1pm", () => expect(fmt("13:00")).toBe("1:00pm"));
});

describe("mins — time string to minutes since midnight", () => {
  it("midnight", () => expect(mins("00:00")).toBe(0));
  it("9:30", () => expect(mins("09:30")).toBe(570));
  it("23:59", () => expect(mins("23:59")).toBe(1439));
});

describe("esc — HTML escaping", () => {
  it("passes plain text through", () => expect(esc("hello")).toBe("hello"));
  it("escapes <script>", () => expect(esc("<script>")).toBe("&lt;script&gt;"));
  it("escapes ampersand", () => expect(esc("a & b")).toBe("a &amp; b"));
  it("escapes double quotes", () => expect(esc('say "hi"')).toBe("say &quot;hi&quot;"));
  it("escapes single quotes", () => expect(esc("it's")).toBe("it&#39;s"));
  it("handles null/undefined", () => {
    expect(esc(null)).toBe("");
    expect(esc(undefined)).toBe("");
    expect(esc("")).toBe("");
  });
  it("escapes all five characters together", () => {
    expect(esc(`<a href="x" onclick='y'>&`))
      .toBe("&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;");
  });
});

describe("tagFromTitle — auto-classify block by title", () => {
  it("breakfast → food", () => expect(tagFromTitle("Breakfast")).toBe("food"));
  it("workout → play", () => expect(tagFromTitle("Morning Workout")).toBe("play"));
  it("wind down → rest", () => expect(tagFromTitle("Wind down")).toBe("rest"));
  it("meeting → work", () => expect(tagFromTitle("Team meeting")).toBe("work"));
  it("unknown defaults to work", () => expect(tagFromTitle("Random thing")).toBe("work"));
  it("null/empty defaults to work", () => {
    expect(tagFromTitle(null)).toBe("work");
    expect(tagFromTitle("")).toBe("work");
  });
  it("case insensitive", () => expect(tagFromTitle("BADMINTON session")).toBe("play"));
});

describe("slugify — name to storage slug", () => {
  it("lowercases and underscores", () => expect(slugify("Goblet squat")).toBe("goblet_squat"));
  it("strips special characters", () => expect(slugify("Single-leg RDL")).toBe("single_leg_rdl"));
  it("handles em-dashes", () => expect(slugify("Agility ladder — lateral")).toBe("agility_ladder_lateral"));
  it("trims leading/trailing underscores", () => expect(slugify("—Test—")).toBe("test"));
  it("handles empty/null", () => {
    expect(slugify("")).toBe("");
    expect(slugify(null)).toBe("");
  });
  it("collapses multiple separators", () => expect(slugify("Med-ball   throw!!")).toBe("med_ball_throw"));
});
