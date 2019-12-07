export function enforceMandatory(
  module: string,
  env: NodeJS.ProcessEnv,
  mandatoryKeys: string[]
): void {
  const keepMissing = (acc: string[], e: string[]): string[] =>
    e[1] ? acc.filter(k => k !== e[0]) : acc;
  const entries = Object.entries(env);
  const missingKeys = entries.reduce(keepMissing, mandatoryKeys);
  if (missingKeys.length > 0) {
    throw new Error(
      `Invalid ${module} configuration\nmissing or invalid keys : ${JSON.stringify(
        missingKeys,
        null,
        2
      )}`
    );
  }
}
