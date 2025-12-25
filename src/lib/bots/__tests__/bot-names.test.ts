import { describe, it, expect } from "vitest";
import {
  BOT_EMPIRE_NAMES,
  BOT_EMPEROR_NAMES,
  getBotEmpireName,
  getBotEmperorName,
} from "../bot-names";

describe("Bot Names", () => {
  describe("BOT_EMPIRE_NAMES", () => {
    it("should have exactly 25 names", () => {
      expect(BOT_EMPIRE_NAMES).toHaveLength(25);
    });

    it("should have all unique names", () => {
      const uniqueNames = new Set(BOT_EMPIRE_NAMES);
      expect(uniqueNames.size).toBe(25);
    });

    it("should all start with 'Empire'", () => {
      BOT_EMPIRE_NAMES.forEach((name) => {
        expect(name).toMatch(/^Empire /);
      });
    });
  });

  describe("BOT_EMPEROR_NAMES", () => {
    it("should have exactly 25 names", () => {
      expect(BOT_EMPEROR_NAMES).toHaveLength(25);
    });

    it("should have all unique names", () => {
      const uniqueNames = new Set(BOT_EMPEROR_NAMES);
      expect(uniqueNames.size).toBe(25);
    });
  });

  describe("getBotEmpireName", () => {
    it("should return correct name for valid index", () => {
      expect(getBotEmpireName(0)).toBe("Empire Alpha");
      expect(getBotEmpireName(1)).toBe("Empire Beta");
      expect(getBotEmpireName(24)).toBe("Empire Nexus");
    });

    it("should return fallback for index >= 25", () => {
      expect(getBotEmpireName(25)).toBe("Empire 26");
      expect(getBotEmpireName(100)).toBe("Empire 101");
    });

    it("should return fallback for negative index", () => {
      expect(getBotEmpireName(-1)).toBe("Empire 0");
    });
  });

  describe("getBotEmperorName", () => {
    it("should return correct name for valid index", () => {
      expect(getBotEmperorName(0)).toBe("Commander Alpha");
      expect(getBotEmperorName(1)).toBe("Admiral Beta");
      expect(getBotEmperorName(24)).toBe("Director Nexus");
    });

    it("should return fallback for index >= 25", () => {
      expect(getBotEmperorName(25)).toBe("Commander 26");
      expect(getBotEmperorName(100)).toBe("Commander 101");
    });

    it("should return fallback for negative index", () => {
      expect(getBotEmperorName(-1)).toBe("Commander 0");
    });
  });
});
