export type RewardContainerLocationId =
  | "village"
  | "cave"
  | "low-dungeon"
  | "mid-dungeon"
  | "high-dungeon"
  | "hell";

type RewardContainersConfig = {
  containers: {
    buff_container: {
      reward_type: "choose_1_of_3_buffs";
    };
    lootbox_container: {
      reward_type: "lootbox";
    };
  };
  container_requirements_by_location: Record<
    RewardContainerLocationId,
    {
      buff_container_required: number;
      lootbox_container_required: number;
    }
  >;
};

export const rewardContainersConfig: RewardContainersConfig = {
  containers: {
    buff_container: {
      reward_type: "choose_1_of_3_buffs",
    },
    lootbox_container: {
      reward_type: "lootbox",
    },
  },
  container_requirements_by_location: {
    village: {
      buff_container_required: 40,
      lootbox_container_required: 64,
    },
    cave: {
      buff_container_required: 56,
      lootbox_container_required: 90,
    },
    "low-dungeon": {
      buff_container_required: 72,
      lootbox_container_required: 80,
    },
    "mid-dungeon": {
      buff_container_required: 96,
      lootbox_container_required: 154,
    },
    "high-dungeon": {
      buff_container_required: 120,
      lootbox_container_required: 144,
    },
    hell: {
      buff_container_required: 120,
      lootbox_container_required: 144,
    },
  },
};

export function getRewardContainerRequirements(
  locationId: RewardContainerLocationId,
) {
  return rewardContainersConfig.container_requirements_by_location[locationId];
}
