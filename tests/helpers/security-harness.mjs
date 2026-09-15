import { DatabaseSync } from 'node:sqlite'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'
import { drizzle } from 'drizzle-orm/d1'

const root = fileURLToPath(new URL('../../', import.meta.url))

// Execute the real generated migrations and real Drizzle predicates against an
// isolated, in-memory SQLite database. No production binding or network is used.
export async function securityHarness() {
  let grantWriteFailures = 0
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec('PRAGMA foreign_keys = ON')
  for (const file of (await readdir(path.join(root, 'drizzle'))).filter(f => f.endsWith('.sql')).sort()) {
    sqlite.exec(await readFile(path.join(root, 'drizzle', file), 'utf8'))
  }
  const d1 = { prepare(sql) {
    const statement = sqlite.prepare(sql)
    const checkFailure = () => {
      if (/insert into "intake_contact_grants"/i.test(sql) && grantWriteFailures > 0) {
        grantWriteFailures--
        throw new Error('Synthetic transient database failure')
      }
    }
    return { bind(...args) { return {
      async all() { return { results: statement.all(...args) } },
      async raw() { return statement.all(...args).map(row => Object.values(row)) },
      async first() { return statement.get(...args) || null },
      async run() { checkFailure(); const result = statement.run(...args); return { success: true, meta: { changes: result.changes } } },
    } } }
  } }
  const env = { DB: d1, GHL_LOCATION_ID: 'location-test', GHL_PIPELINE_ID: 'pipeline-test',
    GHL_PIPELINE_STAGE_ID: 'stage-test', GHL_PRIVATE_INTEGRATION_TOKEN: 'synthetic-test-only' }
  const key = `__security_harness_${crypto.randomUUID().replaceAll('-', '')}`
  globalThis[key] = { env, db: drizzle(d1) }
  const urls = new Map()
  const dataUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${key}`
  async function moduleUrl(relative) {
    if (urls.has(relative)) return urls.get(relative)
    const filename = path.join(root, relative)
    let compiled = ts.transpileModule(await readFile(filename, 'utf8'), {
      fileName: filename, compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText
    for (const specifier of new Set([...compiled.matchAll(/from\s+["']([^"']+)["']/g)].map(m => m[1]))) {
      let resolved
      if (specifier === 'cloudflare:workers') resolved = dataUrl(`export const env = globalThis[${JSON.stringify(key)}].env`)
      else if (specifier === '@/db') resolved = dataUrl(`export function getDb(){ return globalThis[${JSON.stringify(key)}].db }`)
      else if (specifier.startsWith('@/') || specifier.startsWith('.')) {
        const target = specifier.startsWith('@/') ? specifier.slice(2) : path.join(path.dirname(relative), specifier)
        resolved = await moduleUrl(target.endsWith('.ts') ? target : `${target}.ts`)
      } else resolved = pathToFileURL(fileURLToPath(import.meta.resolve(specifier))).href
      compiled = compiled.split(`'${specifier}'`).join(JSON.stringify(resolved)).split(`"${specifier}"`).join(JSON.stringify(resolved))
    }
    const url = dataUrl(compiled)
    urls.set(relative, url)
    return url
  }
  return { sqlite, env, failGrantWrites(count) { grantWriteFailures = count }, load: async relative => import(await moduleUrl(relative)), close() { sqlite.close(); delete globalThis[key] } }
}
