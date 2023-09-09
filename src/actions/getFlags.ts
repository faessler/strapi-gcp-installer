export const getFlags = () => {
  return process.argv.slice(3).reduce<Record<string, string>>((accumulator, currentValue) => {
    const [key, value] = currentValue.replace(/^--/, "").split("=");
    accumulator[key] = value || "true";
    return accumulator;
  }, {});
};
