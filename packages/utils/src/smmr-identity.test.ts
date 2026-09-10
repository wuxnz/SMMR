import { describe, expect, test } from "bun:test"
import { OMO_LEGACY_CONFIG_BASE, OMO_LEGACY_WORKSPACE_DIR, SMMR_BRAND_NAME, SMMR_CONFIG_BASE, SMMR_WORKSPACE_DIR } from "./smmr-identity"

describe("SMMR identity constants", () => {
  test("exposes canonical and legacy names", () => {
    expect({ SMMR_BRAND_NAME, SMMR_CONFIG_BASE, SMMR_WORKSPACE_DIR, OMO_LEGACY_CONFIG_BASE, OMO_LEGACY_WORKSPACE_DIR }).toEqual({
      SMMR_BRAND_NAME: "SMMR",
      SMMR_CONFIG_BASE: "smmr",
      SMMR_WORKSPACE_DIR: ".smmr",
      OMO_LEGACY_CONFIG_BASE: "omo",
      OMO_LEGACY_WORKSPACE_DIR: ".omo",
    })
  })
})
