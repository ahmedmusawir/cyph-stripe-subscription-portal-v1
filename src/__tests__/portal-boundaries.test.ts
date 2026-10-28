// Architecture boundaries (AC-24/25/28): source inventory, not behaviour mirrors.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'src');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(name) ? [p] : [];
  });
}
const all = files(SRC).filter((f) => !f.includes(`${join('src', '__tests__')}`));
const rel = (f: string) => relative(ROOT, f);
const read = (f: string) => readFileSync(f, 'utf8');

describe('portal source boundaries', () => {
  it('only src/services/portal imports the mock fixtures', () => {
    const offenders = all.filter((f) => /from ['"]@\/mocks\//.test(read(f)) && !rel(f).startsWith('src/services/portal/'));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('components and app pages never import the engines or fixtures directly', () => {
    const offenders = all.filter(
      (f) => (rel(f).startsWith('src/components/') || rel(f).startsWith('src/app/')) &&
        /from ['"]@\/services\/portal\/(registration|account|pricing|validation|storage)['"]/.test(read(f)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('no Stripe SDK, no new Supabase business clients, no raw HTML injection', () => {
    for (const f of all) {
      const text = read(f);
      expect({ f: rel(f), stripe: /from ['"]stripe['"]|@stripe\//.test(text) }).toEqual({ f: rel(f), stripe: false });
      expect({ f: rel(f), html: /dangerouslySetInnerHTML/.test(text) }).toEqual({ f: rel(f), html: false });
    }
    const supabaseImporters = all.filter((f) => /@\/utils\/supabase\/|from '\.\/supabase\//.test(read(f))).map(rel).sort();
    // Existing auth wiring only (documented exceptions).
    expect(supabaseImporters).toEqual([
      'src/app/api/auth/confirm/route.ts',
      'src/app/api/auth/login/route.ts',
      'src/app/api/auth/logout/route.ts',
      'src/proxy.ts',
      'src/services/auth/session.ts',
      'src/utils/get-user-role.ts',
    ]);
  });

  it('portal types are SDK-free', () => {
    for (const f of files(join(SRC, 'types', 'portal'))) expect(read(f)).not.toMatch(/from ['"](?!@\/types\/|\.\/)/);
  });

  it('no app code imports module documentation, design files or QAM', () => {
    const offenders = all.filter((f) => /agent_docs|_design\/|QAM\//.test(read(f).replace(/\/\/.*$/gm, '')));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('the shared access rule is the only role predicate in the portal surfaces', () => {
    const literal = all.filter((f) => /=== ['"](superadmin|admin)['"]/.test(read(f))).map(rel);
    expect(literal).toEqual([]);
  });
});
