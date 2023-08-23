// TODO: allow A-Za-Z words without "_"
export const isSnakeCase = (text: string) => {
  return /\b[A-Za-z]+(?:_[A-Za-z]+)+\b/.test(text);
};

export const isKebabCase = (text: string) => {
  return /\b[a-zA-Z]+(?:-[a-zA-Z]+)*\b/.test(text);
};

export const isValidRepositoryName = (text: string) => {
  return /^[a-z|-]+\/[a-z|-]+$/.test(text);
};
