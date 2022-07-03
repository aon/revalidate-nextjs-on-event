export const getRequiredEnv = (name: string) => {
  const val = process.env[name];
  if (val === undefined || val === null) {
    throw `Missing env var for ${name}`;
  }
  return val;
};
