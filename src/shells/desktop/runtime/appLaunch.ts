export function findAppDefinition<TApp>(
  registry: Record<string, TApp>,
  appId: string,
): TApp | undefined {
  return registry[appId];
}
