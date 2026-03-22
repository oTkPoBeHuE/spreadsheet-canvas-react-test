const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const columnIndexToLetter = (index: number): string => {
  let current = index + 1;
  let result = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = LETTERS[remainder] + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
};

export const toA1 = (rowIndex: number, columnIndex: number): string => {
  return `${columnIndexToLetter(columnIndex)}${rowIndex + 1}`;
};

const CELL_REF_REGEX = /^[A-Z]+[0-9]+$/i;

export const isCellReference = (token: string) => CELL_REF_REGEX.test(token);
