type PlayerLevelUpRequirement = {
  level: number;
  xp_to_next_level: number;
};

const playerLevelUpRequirements: PlayerLevelUpRequirement[] = [
  { level: 1, xp_to_next_level: 2 },
  { level: 5, xp_to_next_level: 3 },
  { level: 10, xp_to_next_level: 4 },
  { level: 15, xp_to_next_level: 5 },
  { level: 20, xp_to_next_level: 6 },
  { level: 25, xp_to_next_level: 7 },
  { level: 30, xp_to_next_level: 8 },
  { level: 35, xp_to_next_level: 9 },
  { level: 40, xp_to_next_level: 10 },
  { level: 45, xp_to_next_level: 11 },
  { level: 50, xp_to_next_level: 12 },
];

export function getXpToNextLevel(level: number) {
  const safeLevel = Math.max(1, Math.floor(level));
  let requirement: number = playerLevelUpRequirements[0].xp_to_next_level;

  for (const nextRequirement of playerLevelUpRequirements) {
    if (safeLevel < nextRequirement.level) {
      break;
    }

    requirement = nextRequirement.xp_to_next_level;
  }

  return requirement;
}
