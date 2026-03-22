import { COLUMN_INDEX_LOOKUP, NAMED_EXPRESSION_LOOKUP } from '@/shared/data/columns';
import { isCellReference, toA1 } from '@/shared/utils/a1';

const TOKEN_REGEX = /\b([A-Za-z_][A-Za-z0-9_]*)\b/g;

export const compileFormula = (rawFormula: string, rowIndex: number) => {
  if (!rawFormula.startsWith('=')) {
    return rawFormula;
  }

  return rawFormula.replace(TOKEN_REGEX, (match) => {
    if (isCellReference(match)) {
      return match;
    }

    const lookupKey = match.toLowerCase();
    const columnId = NAMED_EXPRESSION_LOOKUP.get(lookupKey);

    if (!columnId) {
      return match;
    }

    const columnIndex = COLUMN_INDEX_LOOKUP[columnId];
    return toA1(rowIndex, columnIndex);
  });
};
