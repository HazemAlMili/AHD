import assert from "node:assert/strict";
import test from "node:test";
import { canAdminRole } from "@workspace/api-zod";

test("server role middleware permits approved admins", () => {
  assert.equal(canAdminRole("OPERATIONS", ["ADMIN", "OPERATIONS"]), true);
  assert.equal(canAdminRole("ADMIN", []), true);
});

test("server role middleware rejects missing or insufficient roles", () => {
  assert.equal(canAdminRole("ANALYST", ["ADMIN"]), false);
  assert.equal(canAdminRole(undefined, ["ADMIN"]), false);
});
