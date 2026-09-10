import { describe, expect, test } from "bun:test"
import { migrateOmoUserConfigToSmmr } from "./smmr-config"
import { MemoryMigrationFileSystem, parseFile } from "./migration-test-support"

describe("migrateOmoUserConfigToSmmr", () => {
  test("moves the legacy user config into the canonical home", () => {
    const fileSystem = new MemoryMigrationFileSystem()
    fileSystem.files.set("/home/alice/.omo/omo.jsonc", `// legacy\n{"task":{"default_concurrency":7}}`)

    const result = migrateOmoUserConfigToSmmr({ env: { HOME: "/home/alice" }, fileSystem })

    expect(result.status).toBe("migrated")
    expect(fileSystem.existsSync("/home/alice/.omo/omo.jsonc")).toBe(false)
    expect(fileSystem.existsSync("/home/alice/.omo/omo.jsonc.bak.smmr")).toBe(true)
    expect(parseFile(fileSystem, "/home/alice/.smmr/smmr.jsonc")).toMatchObject({ task: { default_concurrency: 7 }, _migrations: ["smmr-user-config"] })
  })

  test("does not clobber canonical values during migration", () => {
    const fileSystem = new MemoryMigrationFileSystem()
    fileSystem.files.set("/home/alice/.omo/omo.json", `{"task":{"default_concurrency":7},"categories":{"legacy":{}}}`)
    fileSystem.files.set("/home/alice/.smmr/smmr.jsonc", `{"task":{"default_concurrency":9}}`)

    migrateOmoUserConfigToSmmr({ env: { HOME: "/home/alice" }, fileSystem })

    expect(parseFile(fileSystem, "/home/alice/.smmr/smmr.jsonc")).toMatchObject({
      task: { default_concurrency: 9 },
      categories: { legacy: {} },
    })
  })

  test("is idempotent after the source has been backed up", () => {
    const fileSystem = new MemoryMigrationFileSystem()
    fileSystem.files.set("/home/alice/.omo/omo.jsonc", `{"task":{"default_concurrency":7}}`)
    migrateOmoUserConfigToSmmr({ env: { HOME: "/home/alice" }, fileSystem })

    const second = migrateOmoUserConfigToSmmr({ env: { HOME: "/home/alice" }, fileSystem })

    expect(second.status).toBe("skipped")
  })
})
