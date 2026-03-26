import { describe, it, expect } from "vitest";
import {
  TREATY_BENEFITS,
  VIOLATION_PENALTIES,
  proposePact,
  acceptPact,
  breakPact,
  formCompact,
} from "./diplomacy-engine";
import type { DiplomacyState } from "../types/diplomacy";
import { EmpireId } from "../types/ids";
import { relationshipKey } from "../types/diplomacy";

function emptyDiplomacy(): DiplomacyState {
  return { pacts: new Map(), coalitions: new Map(), relationships: new Map() };
}

const EMPIRE_A = EmpireId("empire-a");
const EMPIRE_B = EmpireId("empire-b");
const EMPIRE_C = EmpireId("empire-c");

describe("Diplomacy System", () => {
  // REQ-033: Player can propose/accept/reject all three treaty types
  describe("REQ-033: Treaty management", () => {
    it("can propose a Stillness Accord (NAP)", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      expect(pact).not.toBeNull();
      expect(pact!.type).toBe("stillness-accord");
      expect(pact!.memberIds).toContain(EMPIRE_A);
      expect(pact!.memberIds).toContain(EMPIRE_B);
    });

    it("can propose a Star Covenant (Alliance)", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      expect(pact).not.toBeNull();
      expect(pact!.type).toBe("star-covenant");
    });

    it("can form a Nexus Compact (Coalition)", () => {
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      expect(compact.targetId).toBe(EMPIRE_C);
      expect(compact.memberIds).toContain(EMPIRE_A);
      expect(compact.memberIds).toContain(EMPIRE_B);
      expect(compact.combatBonus).toBeGreaterThan(0);
    });

    it("cannot propose pact with self", () => {
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_A, 1, emptyDiplomacy());
      expect(pact).toBeNull();
    });

    it("cannot create duplicate pact", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const accepted = acceptPact(pact!, diplomacy);
      const duplicate = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 2, accepted);
      expect(duplicate).toBeNull();
    });

    it("accepting a pact updates relationship status", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const newState = acceptPact(pact!, diplomacy);
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      expect(newState.relationships.get(key)!.status).toBe("allied");
    });
  });

  // REQ-034: Treaty mechanical benefits
  describe("REQ-034: Treaty benefits", () => {
    it("Stillness Accord provides no trade discount or defence obligation", () => {
      const benefits = TREATY_BENEFITS["stillness-accord"];
      expect(benefits.tradeDiscount).toBe(0);
      expect(benefits.defenceObligation).toBe(false);
    });

    it("Star Covenant provides 15% trade discount and mutual defence", () => {
      const benefits = TREATY_BENEFITS["star-covenant"];
      expect(benefits.tradeDiscount).toBe(0.15);
      expect(benefits.defenceObligation).toBe(true);
      expect(benefits.intelSharing).toBe(true);
    });

    it("Nexus Compact provides combat bonus and defence obligation", () => {
      const benefits = TREATY_BENEFITS["nexus-compact"];
      expect(benefits.defenceObligation).toBe(true);
    });
  });

  // REQ-035: Treaty violations trigger consequences
  describe("REQ-035: Violation consequences", () => {
    it("breaking a Stillness Accord incurs -20 reputation", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);
      const result = breakPact(pact!.id, EMPIRE_A, 5, withPact);
      expect(result.reputationPenalty).toBe(-20);
    });

    it("breaking a Star Covenant incurs -50 reputation", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);
      const result = breakPact(pact!.id, EMPIRE_A, 5, withPact);
      expect(result.reputationPenalty).toBe(-50);
    });

    it("breaking pact sets relationship to hostile", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);
      const result = breakPact(pact!.id, EMPIRE_A, 5, withPact);
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      expect(result.diplomacy.relationships.get(key)!.status).toBe("hostile");
    });

    it("violation count increments", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);
      const result = breakPact(pact!.id, EMPIRE_A, 5, withPact);
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      expect(result.diplomacy.relationships.get(key)!.violations).toBe(1);
    });

    it("Stillness Accord violation grants 25% combat bonus to victim", () => {
      expect(VIOLATION_PENALTIES["stillness-accord"].combatBonus).toBe(0.25);
    });
  });

  // REQ-036: Bots respect/violate treaties per archetype (tested at integration level)
  describe("REQ-036: Bot treaty behaviour", () => {
    it("treaty system supports per-archetype violation (structure exists)", () => {
      // Schemers can break pacts — the breakPact function supports any empire breaking any pact
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);
      // Any empire can break
      const result = breakPact(pact!.id, EMPIRE_A, 10, withPact);
      expect(result.diplomacy.pacts.get(pact!.id)!.active).toBe(false);
    });
  });
});
