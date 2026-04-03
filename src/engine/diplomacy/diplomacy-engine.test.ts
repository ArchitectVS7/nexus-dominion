import { describe, it, expect } from "vitest";
import {
  TREATY_BENEFITS,
  VIOLATION_PENALTIES,
  proposePact,
  acceptPact,
  breakPact,
  formCompact,
  initReputation,
  updateReputation,
  checkMutualDefense,
  contributeToWarChest,
  dissolveCoalition,
  attemptReconciliation,
  declareWar,
  getTradeDiscount,
  getCoalitionCombatBonus,
  makePeace,
  getIntelSharingPartners,
  getRelationshipStatus,
  getEmpireAllies,
  getEmpireEnemies,
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
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);
      const result = breakPact(pact!.id, EMPIRE_A, 10, withPact);
      expect(result.diplomacy.pacts.get(pact!.id)!.active).toBe(false);
    });
  });

  describe("Reputation system", () => {
    it("global reputation starts at 50", () => {
      expect(initReputation()).toBe(50);
    });

    it("honoring treaties increases reputation", () => {
      const newRep = updateReputation(50, { honoredPactCount: 2 });
      expect(newRep).toBeGreaterThan(50);
    });

    it("violations decrease reputation", () => {
      const newRep = updateReputation(50, { violationCount: 1 });
      expect(newRep).toBeLessThan(50);
    });

    it("reputation clamped to 0-100", () => {
      expect(updateReputation(5, { violationCount: 10 })).toBeGreaterThanOrEqual(0);
      expect(updateReputation(95, { honoredPactCount: 20 })).toBeLessThanOrEqual(100);
    });
  });

  describe("Mutual defense", () => {
    it("ally attacked → obligated empires returned", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);

      const obligated = checkMutualDefense(EMPIRE_C, EMPIRE_B, withPact);
      expect(obligated).toContain(EMPIRE_A);
    });

    it("no obligation for stillness accord", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);

      const obligated = checkMutualDefense(EMPIRE_C, EMPIRE_B, withPact);
      expect(obligated).not.toContain(EMPIRE_A);
    });

    it("returns empty array when no pacts exist", () => {
      const obligated = checkMutualDefense(EMPIRE_A, EMPIRE_B, emptyDiplomacy());
      expect(obligated).toHaveLength(0);
    });

    it("does not return the attacker as an obligated defender", () => {
      // A attacks B; A-B have a star-covenant (attacker is also B's partner)
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);
      const obligated = checkMutualDefense(EMPIRE_A, EMPIRE_B, withPact);
      expect(obligated).not.toContain(EMPIRE_A);
    });

    it("does not return inactive pact members", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      const withPact = acceptPact(pact!, diplomacy);
      // Manually deactivate the pact
      withPact.pacts.set(pact!.id, { ...pact!, active: false });
      const obligated = checkMutualDefense(EMPIRE_C, EMPIRE_B, withPact);
      expect(obligated).toHaveLength(0);
    });

    it("returns multiple ally IDs when multiple defence-obligated pacts exist", () => {
      // B has star-covenant with A AND C; both should be obligated
      let diplomacy = emptyDiplomacy();
      const pact1 = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy);
      diplomacy = acceptPact(pact1!, diplomacy);
      const pact2 = proposePact("star-covenant", EMPIRE_C, EMPIRE_B, 2, diplomacy);
      diplomacy = acceptPact(pact2!, diplomacy);

      // Empire D attacks B
      const EMPIRE_D = EmpireId("empire-d");
      const obligated = checkMutualDefense(EMPIRE_D, EMPIRE_B, diplomacy);
      expect(obligated).toContain(EMPIRE_A);
      expect(obligated).toContain(EMPIRE_C);
      expect(obligated).toHaveLength(2);
    });
  });

  describe("War Chest", () => {
    it("contribution adds credits to coalition pool", () => {
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      const diplomacy = emptyDiplomacy();
      const newCoalitions = new Map(diplomacy.coalitions);
      newCoalitions.set(compact.id, compact);
      const withCompact = { ...diplomacy, coalitions: newCoalitions };

      const result = contributeToWarChest(compact.id, 1000, withCompact);
      expect(result.coalitions.get(compact.id)!.warChest).toBe(1000);
    });

    it("funds distributed on coalition dissolution", () => {
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      compact.warChest = 2000;
      const diplomacy = emptyDiplomacy();
      const newCoalitions = new Map(diplomacy.coalitions);
      newCoalitions.set(compact.id, compact);
      const withCompact = { ...diplomacy, coalitions: newCoalitions };

      const result = dissolveCoalition(compact.id, withCompact);
      expect(result.disbursements.get(EMPIRE_A)).toBe(1000);
      expect(result.disbursements.get(EMPIRE_B)).toBe(1000);
      expect(result.diplomacy.coalitions.get(compact.id)!.active).toBe(false);
    });
  });

  describe("Reconciliation", () => {
    it("hostile relationship can improve after cooldown", () => {
      const diplomacy = emptyDiplomacy();
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      diplomacy.relationships.set(key, {
        status: "hostile",
        reputation: -20,
        lastChangeCycle: 1,
        violations: 1,
      });

      // 20+ cycles later, reconciliation should work
      const result = attemptReconciliation(EMPIRE_A, EMPIRE_B, 25, diplomacy);
      const rel = result.relationships.get(key)!;
      expect(rel.status).toBe("neutral");
    });

    it("reconciliation fails if not enough time has passed", () => {
      const diplomacy = emptyDiplomacy();
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      diplomacy.relationships.set(key, {
        status: "hostile",
        reputation: -20,
        lastChangeCycle: 10,
        violations: 1,
      });

      // Only 5 cycles later — too soon
      const result = attemptReconciliation(EMPIRE_A, EMPIRE_B, 15, diplomacy);
      const rel = result.relationships.get(key)!;
      expect(rel.status).toBe("hostile");
    });
  });

  describe("declareWar", () => {
    it("sets relationship status to at-war", () => {
      const diplomacy = emptyDiplomacy();
      const result = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy);
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      const rel = result.diplomacy.relationships.get(key)!;
      expect(rel.status).toBe("at-war");
    });

    it("applies a large reputation penalty", () => {
      const diplomacy = emptyDiplomacy();
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      diplomacy.relationships.set(key, {
        status: "neutral",
        reputation: 50,
        lastChangeCycle: 0,
        violations: 0,
      });

      const result = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy);
      const rel = result.diplomacy.relationships.get(key)!;
      expect(rel.reputation).toBeLessThan(50);
      expect(rel.reputation).toBe(50 + result.reputationPenalty);
    });

    it("breaks any active pacts between the two empires", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      const withPact = acceptPact(pact, diplomacy);

      const result = declareWar(EMPIRE_A, EMPIRE_B, 5, withPact);
      const brokenPact = result.diplomacy.pacts.get(pact.id);
      expect(brokenPact).toBeDefined();
      expect(brokenPact!.active).toBe(false);
    });

    it("does not duplicate war if already at-war", () => {
      const diplomacy = emptyDiplomacy();
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      diplomacy.relationships.set(key, {
        status: "at-war",
        reputation: -50,
        lastChangeCycle: 3,
        violations: 1,
      });

      const result = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy);
      const rel = result.diplomacy.relationships.get(key)!;
      // Should not worsen an already at-war relationship
      expect(rel.status).toBe("at-war");
      expect(rel.reputation).toBe(-50); // unchanged
      expect(result.reputationPenalty).toBe(0);
    });
  });

  describe("getCoalitionCombatBonus", () => {
    it("returns 0 when no coalitions exist", () => {
      const diplomacy = emptyDiplomacy();
      expect(getCoalitionCombatBonus(EMPIRE_A, EMPIRE_C, diplomacy)).toBe(0);
    });

    it("returns 0.15 when attacker is in active coalition targeting defender", () => {
      const diplomacy = emptyDiplomacy();
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      diplomacy.coalitions.set(compact.id, compact);
      expect(getCoalitionCombatBonus(EMPIRE_A, EMPIRE_C, diplomacy)).toBe(0.15);
      expect(getCoalitionCombatBonus(EMPIRE_B, EMPIRE_C, diplomacy)).toBe(0.15);
    });

    it("returns 0 when coalition exists but targets a different empire", () => {
      const diplomacy = emptyDiplomacy();
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      diplomacy.coalitions.set(compact.id, compact);
      // EMPIRE_A attacks EMPIRE_B (not the coalition target EMPIRE_C)
      expect(getCoalitionCombatBonus(EMPIRE_A, EMPIRE_B, diplomacy)).toBe(0);
    });

    it("returns 0 when coalition is inactive", () => {
      const diplomacy = emptyDiplomacy();
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      compact.active = false;
      diplomacy.coalitions.set(compact.id, compact);
      expect(getCoalitionCombatBonus(EMPIRE_A, EMPIRE_C, diplomacy)).toBe(0);
    });

    it("returns 0 when empire is not a coalition member", () => {
      const diplomacy = emptyDiplomacy();
      const EMPIRE_D = EmpireId("empire-d");
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      diplomacy.coalitions.set(compact.id, compact);
      expect(getCoalitionCombatBonus(EMPIRE_D, EMPIRE_C, diplomacy)).toBe(0);
    });
  });

  describe("makePeace", () => {
    it("transitions at-war to neutral", () => {
      let diplomacy = emptyDiplomacy();
      const warResult = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy);
      diplomacy = warResult.diplomacy;

      const result = makePeace(EMPIRE_A, EMPIRE_B, 10, diplomacy);
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      expect(result.relationships.get(key)!.status).toBe("neutral");
    });

    it("updates lastChangeCycle to current cycle", () => {
      let diplomacy = emptyDiplomacy();
      diplomacy = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy).diplomacy;

      const result = makePeace(EMPIRE_A, EMPIRE_B, 15, diplomacy);
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      expect(result.relationships.get(key)!.lastChangeCycle).toBe(15);
    });

    it("no-op if not at war", () => {
      const diplomacy = emptyDiplomacy();
      const result = makePeace(EMPIRE_A, EMPIRE_B, 10, diplomacy);
      // Should return diplomacy unchanged (no relationship created)
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      expect(result.relationships.has(key)).toBe(false);
    });

    it("preserves violation count", () => {
      let diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      diplomacy = acceptPact(pact, diplomacy);
      diplomacy = breakPact(pact.id, EMPIRE_A, 3, diplomacy).diplomacy;
      // Now hostile with violations = 1; declare war
      diplomacy = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy).diplomacy;

      const result = makePeace(EMPIRE_A, EMPIRE_B, 10, diplomacy);
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      expect(result.relationships.get(key)!.violations).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getIntelSharingPartners", () => {
    it("returns allies with intel sharing from star-covenant", () => {
      let diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      diplomacy = acceptPact(pact, diplomacy);

      const partners = getIntelSharingPartners(EMPIRE_A, diplomacy);
      expect(partners).toContain(EMPIRE_B);
    });

    it("does not include stillness-accord partners", () => {
      let diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      diplomacy = acceptPact(pact, diplomacy);

      const partners = getIntelSharingPartners(EMPIRE_A, diplomacy);
      expect(partners).not.toContain(EMPIRE_B);
    });

    it("returns empty array if no intel-sharing pacts", () => {
      expect(getIntelSharingPartners(EMPIRE_A, emptyDiplomacy())).toHaveLength(0);
    });

    it("does not include inactive pacts", () => {
      let diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      diplomacy = acceptPact(pact, diplomacy);
      diplomacy.pacts.set(pact.id, { ...pact, active: false });

      expect(getIntelSharingPartners(EMPIRE_A, diplomacy)).toHaveLength(0);
    });
  });

  describe("getRelationshipStatus", () => {
    it("returns neutral for unknown pairs", () => {
      expect(getRelationshipStatus(EMPIRE_A, EMPIRE_B, emptyDiplomacy())).toBe("neutral");
    });

    it("returns allied for star-covenant members", () => {
      let diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      diplomacy = acceptPact(pact, diplomacy);

      expect(getRelationshipStatus(EMPIRE_A, EMPIRE_B, diplomacy)).toBe("allied");
    });

    it("returns at-war after war declaration", () => {
      let diplomacy = emptyDiplomacy();
      diplomacy = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy).diplomacy;

      expect(getRelationshipStatus(EMPIRE_A, EMPIRE_B, diplomacy)).toBe("at-war");
    });
  });

  describe("getEmpireAllies", () => {
    it("returns all allied empires", () => {
      let diplomacy = emptyDiplomacy();
      const pact1 = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      diplomacy = acceptPact(pact1, diplomacy);
      const pact2 = proposePact("star-covenant", EMPIRE_A, EMPIRE_C, 2, diplomacy)!;
      diplomacy = acceptPact(pact2, diplomacy);

      const allies = getEmpireAllies(EMPIRE_A, diplomacy);
      expect(allies).toContain(EMPIRE_B);
      expect(allies).toContain(EMPIRE_C);
      expect(allies).toHaveLength(2);
    });

    it("returns empty array if no allies", () => {
      expect(getEmpireAllies(EMPIRE_A, emptyDiplomacy())).toHaveLength(0);
    });
  });

  describe("getEmpireEnemies", () => {
    it("returns all empires at war with", () => {
      let diplomacy = emptyDiplomacy();
      diplomacy = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy).diplomacy;
      diplomacy = declareWar(EMPIRE_A, EMPIRE_C, 6, diplomacy).diplomacy;

      const enemies = getEmpireEnemies(EMPIRE_A, diplomacy);
      expect(enemies).toContain(EMPIRE_B);
      expect(enemies).toContain(EMPIRE_C);
      expect(enemies).toHaveLength(2);
    });

    it("returns empty array if at peace", () => {
      expect(getEmpireEnemies(EMPIRE_A, emptyDiplomacy())).toHaveLength(0);
    });
  });

  describe("acceptPact — stillness-accord status", () => {
    it("accepting stillness-accord sets status to non-aggression", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      const result = acceptPact(pact, diplomacy);
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      expect(result.relationships.get(key)!.status).toBe("non-aggression");
    });
  });

  describe("breakPact — edge cases", () => {
    it("returns zero penalty for inactive pact", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      const withPact = acceptPact(pact, diplomacy);
      // Break it once
      const { diplomacy: broken } = breakPact(pact.id, EMPIRE_A, 5, withPact);
      // Break it again — already inactive
      const result = breakPact(pact.id, EMPIRE_A, 10, broken);
      expect(result.reputationPenalty).toBe(0);
      expect(result.combatBonus).toBe(0);
    });

    it("returns zero penalty for nonexistent pact ID", () => {
      const result = breakPact("fake-pact-id" as any, EMPIRE_A, 5, emptyDiplomacy());
      expect(result.reputationPenalty).toBe(0);
    });
  });

  describe("contributeToWarChest — edge cases", () => {
    it("returns unchanged state for inactive coalition", () => {
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      compact.active = false;
      const diplomacy = emptyDiplomacy();
      diplomacy.coalitions.set(compact.id, compact);
      const result = contributeToWarChest(compact.id, 500, diplomacy);
      expect(result.coalitions.get(compact.id)!.warChest).toBe(0);
    });

    it("multiple contributions stack", () => {
      const compact = formCompact(EMPIRE_A, [EMPIRE_B], EMPIRE_C, 5);
      const diplomacy = emptyDiplomacy();
      diplomacy.coalitions.set(compact.id, compact);
      let state = contributeToWarChest(compact.id, 500, diplomacy);
      state = contributeToWarChest(compact.id, 300, state);
      expect(state.coalitions.get(compact.id)!.warChest).toBe(800);
    });
  });

  describe("dissolveCoalition — edge cases", () => {
    it("returns empty disbursements for nonexistent coalition", () => {
      const result = dissolveCoalition("fake-id" as any, emptyDiplomacy());
      expect(result.disbursements.size).toBe(0);
    });
  });

  describe("attemptReconciliation — edge cases", () => {
    it("no-op if relationship is not hostile", () => {
      const diplomacy = emptyDiplomacy();
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      diplomacy.relationships.set(key, {
        status: "neutral",
        reputation: 30,
        lastChangeCycle: 1,
        violations: 0,
      });
      const result = attemptReconciliation(EMPIRE_A, EMPIRE_B, 50, diplomacy);
      expect(result.relationships.get(key)!.status).toBe("neutral");
    });

    it("no-op if no relationship exists", () => {
      const result = attemptReconciliation(EMPIRE_A, EMPIRE_B, 50, emptyDiplomacy());
      expect(result.relationships.has(relationshipKey(EMPIRE_A, EMPIRE_B))).toBe(false);
    });
  });

  describe("declareWar — additional cases", () => {
    it("creates new relationship with default reputation minus penalty", () => {
      const result = declareWar(EMPIRE_A, EMPIRE_B, 5, emptyDiplomacy());
      const key = relationshipKey(EMPIRE_A, EMPIRE_B);
      const rel = result.diplomacy.relationships.get(key)!;
      // Default 50 + (-30) = 20
      expect(rel.reputation).toBe(20);
    });

    it("breaks multiple active pacts between the same empires", () => {
      let diplomacy = emptyDiplomacy();
      const pact1 = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      diplomacy = acceptPact(pact1, diplomacy);
      const pact2 = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 2, diplomacy)!;
      diplomacy = acceptPact(pact2, diplomacy);

      const result = declareWar(EMPIRE_A, EMPIRE_B, 5, diplomacy);
      expect(result.diplomacy.pacts.get(pact1.id)!.active).toBe(false);
      expect(result.diplomacy.pacts.get(pact2.id)!.active).toBe(false);
    });
  });

  describe("updateReputation — combined factors", () => {
    it("honors and violations in same call net out", () => {
      // +3 (3 honored × 1) - 10 (1 violation × 10) = -7; 50 + (-7) = 43
      expect(updateReputation(50, { honoredPactCount: 3, violationCount: 1 })).toBe(43);
    });
  });

  describe("formCompact — multiple members", () => {
    it("supports 3+ members in coalition", () => {
      const EMPIRE_D = EmpireId("empire-d");
      const compact = formCompact(EMPIRE_A, [EMPIRE_B, EMPIRE_C, EMPIRE_D], EMPIRE_A, 5);
      expect(compact.memberIds).toHaveLength(4);
      expect(compact.memberIds).toContain(EMPIRE_D);
    });
  });

  describe("getTradeDiscount", () => {
    it("returns 0 when empire has no pacts", () => {
      const diplomacy = emptyDiplomacy();
      expect(getTradeDiscount(EMPIRE_A, diplomacy)).toBe(0);
    });

    it("returns 0 for stillness-accord (no trade benefit)", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("stillness-accord", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      const withPact = acceptPact(pact, diplomacy);
      expect(getTradeDiscount(EMPIRE_A, withPact)).toBe(0);
    });

    it("returns 0.15 for active star-covenant", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      const withPact = acceptPact(pact, diplomacy);
      expect(getTradeDiscount(EMPIRE_A, withPact)).toBe(0.15);
    });

    it("returns 0.15 for both members of the covenant", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      const withPact = acceptPact(pact, diplomacy);
      expect(getTradeDiscount(EMPIRE_B, withPact)).toBe(0.15);
    });

    it("returns 0 after star-covenant is broken", () => {
      const diplomacy = emptyDiplomacy();
      const pact = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      const withPact = acceptPact(pact, diplomacy);
      const { diplomacy: broken } = breakPact(pact.id, EMPIRE_A, 5, withPact);
      expect(getTradeDiscount(EMPIRE_A, broken)).toBe(0);
      expect(getTradeDiscount(EMPIRE_B, broken)).toBe(0);
    });

    it("takes best discount from multiple pacts (does not stack)", () => {
      let diplomacy = emptyDiplomacy();
      const pact1 = proposePact("star-covenant", EMPIRE_A, EMPIRE_B, 1, diplomacy)!;
      diplomacy = acceptPact(pact1, diplomacy);
      const pact2 = proposePact("star-covenant", EMPIRE_A, EMPIRE_C, 2, diplomacy)!;
      diplomacy = acceptPact(pact2, diplomacy);
      // Should be 0.15, not 0.30 (best, not sum)
      expect(getTradeDiscount(EMPIRE_A, diplomacy)).toBe(0.15);
    });
  });
});
