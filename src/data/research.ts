export const research = Array.from({ length: 40 }, (_, id) => ({
  id, kind: Math.floor(id / 8), rank: id % 8 + 1, cost: 1 + Math.floor((id % 8) ** 1.5),
  prerequisite: id % 8 ? id - 1 : null, key: `research.${Math.floor(id / 8)}`,
}));
