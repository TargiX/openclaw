function collectExportTargets(value, targets = []) {
  if (typeof value === "string") {
    targets.push(value);
    return targets;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectExportTargets(entry, targets);
    }
    return targets;
  }
  if (!value || typeof value !== "object") {
    return targets;
  }
  for (const entry of Object.values(value)) {
    collectExportTargets(entry, targets);
  }
  return targets;
}

export function collectPackageDistExportErrors(params) {
  const packageJson = params.packageJson;
  const files = new Set(params.files);
  const exportsMap = packageJson && typeof packageJson === "object" ? packageJson.exports : null;
  if (!exportsMap || typeof exportsMap !== "object") {
    return [];
  }

  const errors = [];
  for (const [specifier, exportValue] of Object.entries(exportsMap)) {
    for (const target of collectExportTargets(exportValue)) {
      if (!target.startsWith("./dist/") || !target.endsWith(".js")) {
        continue;
      }
      const relativeTarget = target.slice("./".length);
      if (!files.has(relativeTarget)) {
        errors.push(`package export ${specifier} references missing dist file ${relativeTarget}`);
      }
    }
  }
  return errors;
}
