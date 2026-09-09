import { Flower2, LockKeyhole, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import { useThreeKeepsakes } from "../hooks/useThreeKeepsakes";
import { BlossomSprig } from "../../../shared/components/visuals/BlossomSprig";
import { keepsakeIcons, keepsakeSoundCues, keepsakes, type KeepsakeId, type KeepsakeItem } from "../model/keepsakes";
import type { StoryPartId } from "../../story/data/story";

export type { KeepsakeId, KeepsakeItem } from "../model/keepsakes";

interface KeepsakePlaygroundProps {
  partId?: StoryPartId;
  visitedStoryIds: ReadonlySet<string>;
  playCue?: (cue: SoundCue) => void;
  reducedMotion: boolean;
}

export function KeepsakePlayground({ partId, visitedStoryIds, playCue, reducedMotion }: KeepsakePlaygroundProps) {
  const [selectedId, setSelectedId] = useState<KeepsakeId>("bouquet");
  const visibleItems = useMemo(
    () => (partId ? keepsakes.filter((item) => item.partId === partId) : keepsakes),
    [partId],
  );
  const unlockedItems = useMemo(
    () => visibleItems.filter((item) => visitedStoryIds.has(item.unlockStoryId)),
    [visibleItems, visitedStoryIds],
  );
  const unlockedIds = useMemo(() => unlockedItems.map((item) => item.id), [unlockedItems]);
  const effectiveSelectedId = unlockedIds.includes(selectedId)
    ? selectedId
    : (unlockedIds[unlockedIds.length - 1] ?? visibleItems[0]?.id ?? "bouquet");
  const selectedItem = useMemo(
    () => visibleItems.find((item) => item.id === effectiveSelectedId) ?? visibleItems[0] ?? keepsakes[0],
    [effectiveSelectedId, visibleItems],
  );
  const selectKeepsake = useCallback((id: KeepsakeId) => {
    playCue?.(keepsakeSoundCues[id]);
    setSelectedId(id);
  }, [playCue]);
  const { containerRef, supported } = useThreeKeepsakes({
    reducedMotion,
    selectedId: effectiveSelectedId,
    unlockedIds,
    onSelect: selectKeepsake,
    theme: partId === "together-offline" ? "night" : "blush",
  });

  return (
    <section className="keepsake-playground" data-selected-keepsake={effectiveSelectedId} aria-labelledby="keepsake-title">
      <BlossomSprig className="keepsake-flower keepsake-flower-one" variant={partId === "together-offline" ? "blue" : "pink"} />
      <BlossomSprig className="keepsake-flower keepsake-flower-two" variant={partId === "together-offline" ? "blue" : "cream"} />
      <div className="keepsake-copy">
        <p className="kicker">cute interactive corner</p>
        <h2 id="keepsake-title">Chạm vào mấy món kỷ vật nhỏ xíu này</h2>
        <p>{selectedItem.hint}</p>
        <div className="keepsake-selected" aria-live="polite">
          <Sparkles aria-hidden="true" size={18} />
          <span className="keepsake-selected-pulse" aria-hidden="true" />
          Đang chọn: <strong>{selectedItem.label}</strong>
        </div>
      </div>

      <div className="keepsake-stage">
        <div className="keepsake-memory-card" key={selectedItem.id}>
          <span>{String(visibleItems.findIndex((item) => item.id === selectedItem.id) + 1).padStart(2, "0")}</span>
          <strong>{selectedItem.label}</strong>
          <p>{selectedItem.memoryCaption}</p>
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
        </div>
        <div
          className="keepsake-canvas"
          ref={containerRef}
          role="img"
          aria-label="Hộp kỷ vật 3D tương tác, các món sẽ mở dần theo chương câu chuyện."
        >
          {!supported ? (
            <div className="keepsake-fallback">
              <Flower2 aria-hidden="true" size={34} />
              <strong>Chế độ nhẹ</strong>
              <span>Trình duyệt đang dùng bản tĩnh để đọc mượt hơn.</span>
            </div>
          ) : null}
        </div>

        <div className="keepsake-controls" aria-label="Chọn kỷ vật 3D">
          {visibleItems.map((item) => (
            <KeepsakeButton
              isActive={item.id === effectiveSelectedId}
              isLocked={!unlockedIds.includes(item.id)}
              item={item}
              key={item.id}
              onSelect={() => selectKeepsake(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function KeepsakeButton({
  isActive,
  isLocked,
  item,
  onSelect,
}: {
  isActive: boolean;
  isLocked: boolean;
  item: KeepsakeItem;
  onSelect: () => void;
}) {
  const Icon = isLocked ? LockKeyhole : keepsakeIcons[item.id];
  const unlockLabel = `Mở ở ${item.unlockLabel}`;

  return (
    <button
      className={`${isActive ? "is-active" : ""} ${isLocked ? "is-locked" : ""}`}
      type="button"
      aria-pressed={isActive}
      disabled={isLocked}
      onClick={onSelect}
    >
      <Icon aria-hidden="true" size={15} />
      <span>{item.label}</span>
      {isLocked ? <small>{unlockLabel}</small> : null}
    </button>
  );
}
