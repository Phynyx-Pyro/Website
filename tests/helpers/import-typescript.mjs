import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

export async function importTypeScriptModule(fileUrl, replacements = []) {
  let source = await readFile(fileUrl, 'utf8')

  for (const [from, to] of replacements) {
    assert.ok(source.includes(from), `Expected test replacement was not found: ${from}`)
    source = source.replace(from, to)
  }

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: fileUrl.pathname,
    reportDiagnostics: true,
  })

  const errors = compiled.diagnostics?.filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  )
  assert.deepEqual(errors, [], 'TypeScript test fixture did not transpile cleanly')

  const encoded = Buffer.from(compiled.outputText).toString('base64')
  return import(`data:text/javascript;base64,${encoded}#${crypto.randomUUID()}`)
}
