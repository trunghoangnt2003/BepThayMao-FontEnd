import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

function listFiles(root, directory = root) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? listFiles(root, path)
      : [relative(root, path).replaceAll('\\', '/')];
  });
}

const normalized = (path) => readFileSync(path, 'utf8').replaceAll('\r\n', '\n');

/** Compares two directory trees by relative path and LF-normalized content. */
export function diffTrees(expectedRoot, actualRoot) {
  const expected = new Set(listFiles(expectedRoot));
  const actual = new Set(listFiles(actualRoot));
  return {
    missing: [...expected].filter((file) => !actual.has(file)).sort(),
    extra: [...actual].filter((file) => !expected.has(file)).sort(),
    changed: [...expected]
      .filter((file) => actual.has(file))
      .filter((file) => normalized(join(expectedRoot, file)) !== normalized(join(actualRoot, file)))
      .sort(),
  };
}

export const isSame = (diff) => diff.missing.length + diff.extra.length + diff.changed.length === 0;
