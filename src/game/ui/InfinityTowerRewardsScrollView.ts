import { GameObjects, Scene } from "phaser";
import type { InfinityTowerRewardConfig } from "../configs/infinityTower";
import { getInfinityTowerConsumableConfig } from "../configs/infinityTowerConsumables";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type { PlayerProfile } from "../entities/Player/PlayerProfile";
import { languageController } from "../localization/LanguageController";
import {
  InfinityTowerRewardController,
  type InfinityTowerRewardView,
} from "../progression/InfinityTowerRewardController";

type InfinityTowerAssetConfig = {
  textureKey: string;
  texturePath: string;
};

type RewardSlotView = {
  layout: RewardCardElementLayout;
  cardCenterX: number;
  icon: GameObjects.Image;
  amountText: GameObjects.Text;
  button: GameObjects.Image;
  buttonLabel: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
  buttonBaseWidth: number;
  buttonBaseHeight: number;
  canClaim: boolean;
};

type RewardRowView = {
  container: GameObjects.Container;
  panel: GameObjects.Image;
  floorText: GameObjects.Text;
  slots: RewardSlotView[];
};

type RewardRowData = {
  level: number;
  rewards: InfinityTowerRewardView[];
};

type InfinityTowerRewardsScrollViewConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  profile: PlayerProfile;
  rewardController: InfinityTowerRewardController;
  onClaimGlovesReward: (itemId: string) => void;
  onShowRewardDetails: (reward: InfinityTowerRewardConfig) => void;
};

type RewardCardButtonLayout = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  labelOffsetX: number;
  labelOffsetY: number;
};

type RewardCardElementLayout = {
  iconOffsetX: number;
  iconOffsetY: number;
  emeraldIconSize: number;
  smallIconSize: number;
  glovesIconSize: number;
  amountTextOffsetX: number;
  amountTextOffsetY: number;
  amountTextOriginX: number;
  amountTextOriginY: number;
  amountTextWrapWidth: number;
  amountTextFontSize: number;
  glovesTextFontSize: number;
  claimButton: RewardCardButtonLayout;
  lockedButton: RewardCardButtonLayout;
  claimedButton: RewardCardButtonLayout;
};

export class InfinityTowerRewardsScrollView {
  static readonly rowTextureKey = "infinite-tower-reward-row-panel";
  static readonly rowTexturePath =
    "assets/images/ui/infinity-tower/reward-row-panel.png";
  static readonly rewardButtonOpenTextureKey =
    "infinite-tower-reward-button-open";
  static readonly rewardButtonOpenPath =
    "assets/images/ui/infinity-tower/reward-button-open.png";
  static readonly rewardButtonLockedTextureKey =
    "infinite-tower-reward-button-locked";
  static readonly rewardButtonLockedPath =
    "assets/images/ui/infinity-tower/reward-button-locked.png";
  static readonly rewardButtonClaimedTextureKey =
    "infinite-tower-reward-button-claimed";
  static readonly rewardButtonClaimedPath =
    "assets/images/ui/infinity-tower/reward-button-claimed.png";
  static readonly emeraldIconTextureKey = "infinite-tower-emerald-icon";
  static readonly emeraldIconPath = "assets/images/ui/icons/emerald.png";
  static readonly rewiveIconTextureKey = "infinite-tower-rewive-icon";
  static readonly rewiveIconPath = "assets/images/ui/icons/rewiveIcon.png";

  private static readonly rowDisplayWidth = 620;
  private static readonly rowDisplayHeight = 200;
  private static readonly rowSpacing = 92;
  private static readonly visibleRowCountWithoutScroll = 4;
  private static readonly rewardCardCenterOffsetX = {
    left: -185,
    right: 185,
  };
  // One reward card template. All offsets are relative to the card center.
  private static readonly rewardCardLayout: RewardCardElementLayout = {
    iconOffsetX: -54,
    iconOffsetY: -20,
    emeraldIconSize: 36,
    smallIconSize: 32,
    glovesIconSize: 52,
    amountTextOffsetX: -18,
    amountTextOffsetY: -20,
    amountTextOriginX: 0,
    amountTextOriginY: 0.5,
    amountTextWrapWidth: 128,
    amountTextFontSize: 22,
    glovesTextFontSize: 20,
    claimButton: {
      offsetX: 0,
      offsetY: 15,
      width: 240,
      height: 90,
      labelOffsetX: 0,
      labelOffsetY: 0,
    },
    lockedButton: {
      offsetX: 0,
      offsetY: 15,
      width: 300,
      height: 120,
      labelOffsetX: 0,
      labelOffsetY: 0,
    },
    claimedButton: {
      offsetX: 0,
      offsetY: 23,
      width: 175,
      height: 90,
      labelOffsetX: 0,
      labelOffsetY: 0,
    },
  };
  private static readonly floorLabelOffsetY = -20;
  private static readonly buttonHoverScale = 1.04;
  private static readonly rewardsPerRow = 2;
  private static readonly futureLockedRowCount = 2;
  private static readonly pastClaimedRowCount = 2;

  private readonly scene: Scene;
  private readonly profile: PlayerProfile;
  private readonly rewardController: InfinityTowerRewardController;
  private readonly onClaimGlovesReward: (itemId: string) => void;
  private readonly onShowRewardDetails: (
    reward: InfinityTowerRewardConfig,
  ) => void;
  private readonly x: number;
  private readonly y: number;
  private readonly width: number;
  private readonly height: number;
  private readonly depth: number;
  private readonly viewportTop: number;
  private readonly content: GameObjects.Container;
  private readonly blocker: GameObjects.Rectangle;
  private readonly rowViews: RewardRowView[] = [];
  private scrollOffset = 0;
  private maxScrollOffset = 0;
  private dragStartY = 0;
  private dragStartOffset = 0;
  private isDragging = false;
  private isVisible = false;

  constructor(config: InfinityTowerRewardsScrollViewConfig) {
    this.scene = config.scene;
    this.profile = config.profile;
    this.rewardController = config.rewardController;
    this.onClaimGlovesReward = config.onClaimGlovesReward;
    this.onShowRewardDetails = config.onShowRewardDetails;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    this.depth = config.depth;
    this.viewportTop = this.y - this.height / 2;

    this.content = this.scene.add
      .container(this.x, this.viewportTop)
      .setDepth(this.depth + 2)
      .setVisible(false);

    this.blocker = this.scene.add
      .rectangle(this.x, this.y, this.width, this.height, 0x000000, 0)
      .setDepth(this.depth + 1)
      .setInteractive({ useHandCursor: false })
      .setVisible(false);

    this.blocker.on(
      "wheel",
      (
        _pointer: Phaser.Input.Pointer,
        _deltaX: number,
        deltaY: number,
        _deltaZ: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        this.setScrollOffset(this.scrollOffset + deltaY * 0.65);
      },
    );
    this.blocker.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartY = pointer.y;
      this.dragStartOffset = this.scrollOffset;
    });
    this.blocker.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) {
        return;
      }

      this.setScrollOffset(
        this.dragStartOffset - (pointer.y - this.dragStartY),
      );
    });
    this.scene.input.on("pointerup", this.handlePointerUp, this);
  }

  static getAssets(): InfinityTowerAssetConfig[] {
    const configuredRewards = InfinityTowerRewardController.getRewards();
    const rewardIconAssets = configuredRewards
      .filter((reward) => reward.type === "gloves")
      .map((reward) => ({
        textureKey: reward.iconTextureKey,
        texturePath: reward.iconTexturePath,
      }));
    const consumableIconAssets = configuredRewards
      .filter((reward) => reward.type === "consumable")
      .map((reward) => getInfinityTowerConsumableConfig(reward.consumableId))
      .filter(
        (
          consumable,
        ): consumable is NonNullable<
          ReturnType<typeof getInfinityTowerConsumableConfig>
        > => Boolean(consumable),
      )
      .map((consumable) => ({
        textureKey: consumable.iconTextureKey,
        texturePath: consumable.iconTexturePath,
      }));

    const assets = [
      {
        textureKey: InfinityTowerRewardsScrollView.rowTextureKey,
        texturePath: InfinityTowerRewardsScrollView.rowTexturePath,
      },
      {
        textureKey: InfinityTowerRewardsScrollView.rewardButtonOpenTextureKey,
        texturePath: InfinityTowerRewardsScrollView.rewardButtonOpenPath,
      },
      {
        textureKey: InfinityTowerRewardsScrollView.rewardButtonLockedTextureKey,
        texturePath: InfinityTowerRewardsScrollView.rewardButtonLockedPath,
      },
      {
        textureKey:
          InfinityTowerRewardsScrollView.rewardButtonClaimedTextureKey,
        texturePath: InfinityTowerRewardsScrollView.rewardButtonClaimedPath,
      },
      {
        textureKey: InfinityTowerRewardsScrollView.emeraldIconTextureKey,
        texturePath: InfinityTowerRewardsScrollView.emeraldIconPath,
      },
      {
        textureKey: InfinityTowerRewardsScrollView.rewiveIconTextureKey,
        texturePath: InfinityTowerRewardsScrollView.rewiveIconPath,
      },
      ...rewardIconAssets,
      ...consumableIconAssets,
    ];

    return InfinityTowerRewardsScrollView.dedupeAssets(assets);
  }

  private static dedupeAssets(assets: InfinityTowerAssetConfig[]) {
    return [
      ...new Map(assets.map((asset) => [asset.textureKey, asset])).values(),
    ];
  }

  refresh() {
    const targetScrollOffset = this.isVisible
      ? this.scrollOffset
      : Number.POSITIVE_INFINITY;

    this.clearRows();

    const rows = this.getRewardRows().reverse();
    this.maxScrollOffset =
      Math.max(
        0,
        rows.length - InfinityTowerRewardsScrollView.visibleRowCountWithoutScroll,
      ) * InfinityTowerRewardsScrollView.rowSpacing;
    rows.forEach((row, index) => {
      this.createRewardRow(row, index);
    });

    this.setScrollOffset(Math.min(targetScrollOffset, this.maxScrollOffset));
  }

  setVisible(visible: boolean) {
    this.isVisible = visible;
    this.content.setVisible(visible);
    this.blocker.setVisible(visible);

    if (visible) {
      this.blocker.setInteractive({ useHandCursor: false });
      this.applyViewportClip();
    } else {
      this.blocker.disableInteractive();
      this.isDragging = false;
    }
  }

  destroy() {
    this.scene.input.off("pointerup", this.handlePointerUp, this);
    this.clearRows();
    this.content.destroy();
    this.blocker.destroy();
  }

  private getRewardRows(): RewardRowData[] {
    const rewardViews = this.rewardController.getRewardFeedViews({
      futureLockedCount:
        InfinityTowerRewardsScrollView.futureLockedRowCount *
        InfinityTowerRewardsScrollView.rewardsPerRow,
      pastClaimedCount:
        InfinityTowerRewardsScrollView.pastClaimedRowCount *
        InfinityTowerRewardsScrollView.rewardsPerRow,
    });
    const rowsByLevel = new Map<number, InfinityTowerRewardView[]>();

    rewardViews.forEach((rewardView) => {
      const levelRewards = rowsByLevel.get(rewardView.reward.level) ?? [];

      levelRewards.push(rewardView);
      rowsByLevel.set(rewardView.reward.level, levelRewards);
    });

    return [...rowsByLevel.entries()]
      .map(([level, rewards]) => ({
        level,
        rewards: rewards.slice(0, InfinityTowerRewardsScrollView.rewardsPerRow),
      }))
      .sort((left, right) => left.level - right.level);
  }

  private createRewardRow(row: RewardRowData, index: number) {
    const rowContainer = this.scene.add.container(
      0,
      index * InfinityTowerRewardsScrollView.rowSpacing +
        InfinityTowerRewardsScrollView.rowDisplayHeight / 2,
    );
    const rowPanel = this.scene.add
      .image(0, 0, InfinityTowerRewardsScrollView.rowTextureKey)
      .setDisplaySize(
        InfinityTowerRewardsScrollView.rowDisplayWidth,
        InfinityTowerRewardsScrollView.rowDisplayHeight,
      );
    const floorText = this.scene.add
      .text(
        0,
        InfinityTowerRewardsScrollView.floorLabelOffsetY,
        String(row.level),
        {
          fontFamily: "Hardpixel",
          fontSize: 20,
          color: "#ffe85a",
          stroke: "#1f1f1f",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setResolution(2);
    const rowView: RewardRowView = {
      container: rowContainer,
      panel: rowPanel,
      floorText,
      slots: [],
    };

    rowContainer.add(rowPanel);
    rowContainer.add(floorText);
    row.rewards.forEach((rewardView, rewardIndex) => {
      const cardCenterX =
        rewardIndex === 0
          ? InfinityTowerRewardsScrollView.rewardCardCenterOffsetX.left
          : InfinityTowerRewardsScrollView.rewardCardCenterOffsetX.right;
      const slot = this.createRewardSlot(rowContainer, cardCenterX, rewardView);

      rowView.slots.push(slot);
    });

    this.content.add(rowContainer);
    this.rowViews.push(rowView);
  }

  private createRewardSlot(
    rowContainer: GameObjects.Container,
    cardCenterX: number,
    rewardView: InfinityTowerRewardView,
  ): RewardSlotView {
    const layout = InfinityTowerRewardsScrollView.rewardCardLayout;
    const claimButtonLayout = layout.claimButton;
    const buttonX = cardCenterX + claimButtonLayout.offsetX;
    const buttonY = claimButtonLayout.offsetY;
    const icon = this.scene.add
      .image(
        cardCenterX + layout.iconOffsetX,
        layout.iconOffsetY,
        InfinityTowerRewardsScrollView.emeraldIconTextureKey,
      )
      .setDisplaySize(layout.emeraldIconSize, layout.emeraldIconSize);
    const amountText = this.scene.add
      .text(
        cardCenterX + layout.amountTextOffsetX,
        layout.amountTextOffsetY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: layout.amountTextFontSize,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 4,
          wordWrap: {
            width: layout.amountTextWrapWidth,
            useAdvancedWrap: true,
          },
        },
      )
      .setOrigin(layout.amountTextOriginX, layout.amountTextOriginY)
      .setResolution(2);
    const button = this.scene.add.image(
      buttonX,
      buttonY,
      InfinityTowerRewardsScrollView.rewardButtonLockedTextureKey,
    );
    const buttonLabel = this.scene.add
      .text(
        buttonX + claimButtonLayout.labelOffsetX,
        buttonY + claimButtonLayout.labelOffsetY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 13,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5)
      .setResolution(2);
    const hitArea = this.scene.add.rectangle(
      buttonX,
      buttonY,
      claimButtonLayout.width,
      claimButtonLayout.height,
      0x000000,
      0,
    );
    const slot: RewardSlotView = {
      layout,
      cardCenterX,
      icon,
      amountText,
      button,
      buttonLabel,
      hitArea,
      buttonBaseWidth: claimButtonLayout.width,
      buttonBaseHeight: claimButtonLayout.height,
      canClaim: rewardView.state === "claimable",
    };

    this.renderRewardSlot(slot, rewardView);
    hitArea.on(
      "pointerdown",
      (
        pointer: Phaser.Input.Pointer,
        _x: number,
        _y: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();

        if (!this.isPointerInsideViewport(pointer)) {
          return;
        }

        this.claimReward(rewardView);
      },
    );
    hitArea.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      if (
        rewardView.state === "claimable" &&
        this.isPointerInsideViewport(pointer)
      ) {
        this.setRewardSlotButtonHovered(slot, true);
      }
    });
    hitArea.on("pointerout", () => {
      this.setRewardSlotButtonHovered(slot, false);
    });
    rowContainer.add([icon, amountText, button, buttonLabel, hitArea]);

    return slot;
  }

  private renderRewardSlot(
    slot: RewardSlotView,
    rewardView: InfinityTowerRewardView,
  ) {
    const { reward, state } = rewardView;
    const { layout } = slot;
    const isClaimed = state === "claimed";
    const isOpen = state !== "locked";

    if (reward.type === "gloves") {
      slot.icon
        .setTexture(reward.iconTextureKey)
        .setDisplaySize(layout.glovesIconSize, layout.glovesIconSize);
      slot.amountText
        .setText(languageController.t(reward.titleKey))
        .setFontSize(layout.glovesTextFontSize)
        .setColor("#ffe85a")
        .setWordWrapWidth(layout.amountTextWrapWidth, true)
        .setAlign("center");
    } else {
      const isRewiveReward = reward.type === "rewive";
      const consumableConfig =
        reward.type === "consumable"
          ? getInfinityTowerConsumableConfig(reward.consumableId)
          : undefined;

      slot.icon
        .setTexture(
          isRewiveReward
            ? InfinityTowerRewardsScrollView.rewiveIconTextureKey
            : consumableConfig
              ? consumableConfig.iconTextureKey
              : InfinityTowerRewardsScrollView.emeraldIconTextureKey,
        )
        .setDisplaySize(
          isRewiveReward || consumableConfig
            ? layout.smallIconSize
            : layout.emeraldIconSize,
          isRewiveReward || consumableConfig
            ? layout.smallIconSize
            : layout.emeraldIconSize,
        );
      slot.amountText
        .setText(`x${reward.amount}`)
        .setFontSize(layout.amountTextFontSize)
        .setColor("#ffffff")
        .setWordWrapWidth(layout.amountTextWrapWidth, true)
        .setAlign("left");
    }

    slot.button.setTexture(
      isClaimed
        ? InfinityTowerRewardsScrollView.rewardButtonClaimedTextureKey
        : isOpen
          ? InfinityTowerRewardsScrollView.rewardButtonOpenTextureKey
          : InfinityTowerRewardsScrollView.rewardButtonLockedTextureKey,
    );
    InfinityTowerRewardsScrollView.applyRewardButtonLayout(
      slot,
      isClaimed,
      isOpen,
    );
    slot.buttonBaseWidth = slot.button.displayWidth;
    slot.buttonBaseHeight = slot.button.displayHeight;
    slot.buttonLabel.setText(
      languageController.t(
        isClaimed
          ? "infinite.rewardClaimed"
          : isOpen
            ? "infinite.rewardClaim"
            : "infinite.rewardLocked",
      ),
    );

    if (state === "claimable") {
      slot.hitArea.setInteractive({ useHandCursor: true });
    } else {
      slot.hitArea.disableInteractive();
    }

    slot.canClaim = state === "claimable";
  }

  private claimReward(rewardView: InfinityTowerRewardView) {
    const claimResult = this.rewardController.claimReward(rewardView.reward.id);

    if (!claimResult) {
      return;
    }

    UiSoundPlayer.playClick(this.scene);

    if (claimResult.glovesItemId) {
      this.onClaimGlovesReward(claimResult.glovesItemId);
    }

    this.onShowRewardDetails(claimResult.reward);
    this.refresh();
    this.setVisible(this.isVisible);
  }

  private setRewardSlotButtonHovered(slot: RewardSlotView, isHovered: boolean) {
    const scale = isHovered
      ? InfinityTowerRewardsScrollView.buttonHoverScale
      : 1;

    slot.button.setDisplaySize(
      slot.buttonBaseWidth * scale,
      slot.buttonBaseHeight * scale,
    );
    slot.buttonLabel.setScale(scale);
  }

  private setScrollOffset(scrollOffset: number) {
    this.scrollOffset = Math.max(
      0,
      Math.min(this.maxScrollOffset, scrollOffset),
    );
    this.content.setY(this.viewportTop - this.scrollOffset);
    this.applyViewportClip();
  }

  private isPointerInsideViewport(pointer: Phaser.Input.Pointer) {
    return (
      pointer.x >= this.x - this.width / 2 &&
      pointer.x <= this.x + this.width / 2 &&
      pointer.y >= this.y - this.height / 2 &&
      pointer.y <= this.y + this.height / 2
    );
  }

  private handlePointerUp() {
    this.isDragging = false;
  }

  private clearRows() {
    this.rowViews.forEach((row) => {
      row.container.destroy(true);
    });
    this.rowViews.length = 0;
  }

  private applyViewportClip() {
    this.rowViews.forEach((row) => {
      const isRowVisible = this.isRowOverlappingViewport(row);

      row.container.setVisible(isRowVisible && this.isVisible);

      if (!isRowVisible || !this.isVisible) {
        row.slots.forEach((slot) => {
          slot.hitArea.disableInteractive();
          this.setRewardSlotButtonHovered(slot, false);
        });
        return;
      }

      this.cropImageToViewport(row, row.panel);
      this.setTextVisibleInViewport(row, row.floorText);
      row.slots.forEach((slot) => {
        this.cropImageToViewport(row, slot.icon);
        this.cropImageToViewport(row, slot.button);
        this.setTextVisibleInViewport(row, slot.amountText);
        this.setTextVisibleInViewport(row, slot.buttonLabel);

        if (
          slot.canClaim &&
          this.isLocalPointInsideViewport(row, slot.hitArea)
        ) {
          slot.hitArea.setInteractive({ useHandCursor: true });
        } else {
          slot.hitArea.disableInteractive();
          this.setRewardSlotButtonHovered(slot, false);
        }
      });
    });
  }

  private isRowOverlappingViewport(row: RewardRowView) {
    const worldY = this.getWorldY(row, 0);
    const halfHeight = InfinityTowerRewardsScrollView.rowDisplayHeight / 2;
    const viewport = this.getViewport();

    return (
      worldY + halfHeight >= viewport.top &&
      worldY - halfHeight <= viewport.bottom
    );
  }

  private cropImageToViewport(row: RewardRowView, image: GameObjects.Image) {
    const viewport = this.getViewport();
    const displayWidth = image.displayWidth;
    const displayHeight = image.displayHeight;
    const left = this.getWorldX(row, image.x) - displayWidth * image.originX;
    const top = this.getWorldY(row, image.y) - displayHeight * image.originY;
    const right = left + displayWidth;
    const bottom = top + displayHeight;
    const visibleLeft = Phaser.Math.Clamp(left, viewport.left, viewport.right);
    const visibleTop = Phaser.Math.Clamp(top, viewport.top, viewport.bottom);
    const visibleRight = Phaser.Math.Clamp(
      right,
      viewport.left,
      viewport.right,
    );
    const visibleBottom = Phaser.Math.Clamp(
      bottom,
      viewport.top,
      viewport.bottom,
    );
    const visibleWidth = visibleRight - visibleLeft;
    const visibleHeight = visibleBottom - visibleTop;

    if (visibleWidth <= 0 || visibleHeight <= 0) {
      image.setVisible(false);
      return;
    }

    const source = image.texture.getSourceImage() as HTMLImageElement;
    const cropX = ((visibleLeft - left) / displayWidth) * source.width;
    const cropY = ((visibleTop - top) / displayHeight) * source.height;
    const cropWidth = (visibleWidth / displayWidth) * source.width;
    const cropHeight = (visibleHeight / displayHeight) * source.height;

    image.setVisible(true);
    image.setCrop(cropX, cropY, cropWidth, cropHeight);
  }

  private setTextVisibleInViewport(row: RewardRowView, text: GameObjects.Text) {
    text.setVisible(this.isLocalPointInsideViewport(row, text));
  }

  private isLocalPointInsideViewport(
    row: RewardRowView,
    object: Pick<GameObjects.Components.Transform, "x" | "y">,
  ) {
    const viewport = this.getViewport();
    const worldX = this.getWorldX(row, object.x);
    const worldY = this.getWorldY(row, object.y);

    return (
      worldX >= viewport.left &&
      worldX <= viewport.right &&
      worldY >= viewport.top &&
      worldY <= viewport.bottom
    );
  }

  private getWorldX(row: RewardRowView, localX: number) {
    return this.content.x + row.container.x + localX;
  }

  private getWorldY(row: RewardRowView, localY: number) {
    return this.content.y + row.container.y + localY;
  }

  private getViewport() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2,
    };
  }

  private static applyRewardButtonLayout(
    slot: RewardSlotView,
    isClaimed: boolean,
    isOpen: boolean,
  ) {
    const isLocked = !isClaimed && !isOpen;
    const cardLayout = slot.layout;
    const layout = isClaimed
      ? cardLayout.claimedButton
      : isLocked
        ? cardLayout.lockedButton
        : cardLayout.claimButton;
    const buttonX = slot.cardCenterX + layout.offsetX;
    const buttonY = layout.offsetY;

    slot.button
      .setPosition(buttonX, buttonY)
      .setDisplaySize(layout.width, layout.height);
    slot.buttonLabel.setPosition(
      buttonX + layout.labelOffsetX,
      buttonY + layout.labelOffsetY,
    );
    slot.hitArea
      .setPosition(buttonX, buttonY)
      .setSize(layout.width, layout.height);
  }
}
