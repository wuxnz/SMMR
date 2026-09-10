import { join } from "node:path"
import { resolveHomeDir, resolveUserOmoConfigDirectory, resolveUserSmmrConfigPath } from "../loader"
import { mergeOmoConfigRecords } from "../loader/merge"
import { runMigration } from "./engine"
import { DEFAULT_MIGRATION_FILE_SYSTEM, type MigrationBoundary, type MigrationClock, type MigrationEnvironment, type MigrationFileSystem, type MigrationRunResult } from "./types"

export type MigrateSmmrConfigOptions = {
  readonly clock?: MigrationClock
  readonly dryRun?: boolean
  readonly env?: MigrationEnvironment
  readonly fileSystem?: MigrationFileSystem
  readonly onBoundary?: (boundary: MigrationBoundary) => void
}

const MIGRATION_ID = "smmr-user-config"

/** Move the legacy user config into the canonical SMMR home without clobbering it. */
export function migrateOmoUserConfigToSmmr(options: MigrateSmmrConfigOptions = {}): MigrationRunResult {
  const env = options.env ?? {}
  const fileSystem = options.fileSystem ?? DEFAULT_MIGRATION_FILE_SYSTEM
  const legacyDirectory = resolveUserOmoConfigDirectory(env)
  const jsoncPath = join(legacyDirectory, "omo.jsonc")
  const jsonPath = join(legacyDirectory, "omo.json")
  const sourcePath = fileSystem.existsSync(jsoncPath) ? jsoncPath : jsonPath
  return runMigration({
    ...(options.clock === undefined ? {} : { clock: options.clock }),
    ...(options.dryRun === undefined ? {} : { dryRun: options.dryRun }),
    env,
    fileSystem,
    id: MIGRATION_ID,
    ...(options.onBoundary === undefined ? {} : { onBoundary: options.onBoundary }),
    sources: [{ path: sourcePath, backupPath: `${sourcePath}.bak.smmr` }],
    targetPath: resolveUserSmmrConfigPath(env),
    transform: (sources) => sources.reduce<Record<string, unknown>>(
      (merged, source) => mergeOmoConfigRecords(merged, source.value as Record<string, unknown>),
      {},
    ),
  })
}
