export function pendingStrategies(strategies, entry) {
  if (entry?.postedAt && !entry.strategies) {
    return [];
  }

  return strategies.filter((strategy) => !entry?.strategies?.[strategy.id]);
}

export function recordStrategyResults(entry, strategies, results, now = new Date().toISOString()) {
  const next = {
    title: entry?.title ?? "",
    strategies: { ...(entry?.strategies ?? {}) },
  };
  const failures = [];

  for (const [index, result] of results.entries()) {
    const strategy = strategies[index];
    if (result.ok) {
      next.strategies[strategy.id] = {
        postedAt: now,
        name: result.name,
        ...(result.url ? { url: result.url } : {}),
      };
    } else {
      failures.push(strategy.id);
    }
  }

  return { entry: next, failures };
}
