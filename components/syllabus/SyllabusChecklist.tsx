"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import TopicBadge from "./TopicBadge";

interface SyllabusItem {
  id: string;
  stage: string;
  category: string;
  topicName: string;
  description: string | null;
  orderIndex: number;
  covered: boolean;
}

interface Props {
  items: SyllabusItem[];
  /** Highlight these IDs as newly tagged (from latest AI pass) */
  newlyTaggedIds?: string[];
}

type GroupedStage = {
  stage: string;
  categories: { category: string; items: SyllabusItem[] }[];
  total: number;
  covered: number;
};

function groupItems(items: SyllabusItem[]): GroupedStage[] {
  const stageMap = new Map<string, Map<string, SyllabusItem[]>>();

  for (const item of items) {
    if (!stageMap.has(item.stage)) stageMap.set(item.stage, new Map());
    const catMap = stageMap.get(item.stage)!;
    if (!catMap.has(item.category)) catMap.set(item.category, []);
    catMap.get(item.category)!.push(item);
  }

  return Array.from(stageMap.entries()).map(([stage, catMap]) => {
    const categories = Array.from(catMap.entries()).map(
      ([category, items]) => ({ category, items })
    );
    const total = categories.reduce((s, c) => s + c.items.length, 0);
    const covered = categories.reduce(
      (s, c) => s + c.items.filter((i) => i.covered).length,
      0
    );
    return { stage, categories, total, covered };
  });
}

function stageLabel(stage: string) {
  if (stage === "stage1") return "Stage 1 — Primary Skills";
  if (stage === "stage2") return "Stage 2 — Essay Writing";
  return stage;
}

export default function SyllabusChecklist({
  items,
  newlyTaggedIds = [],
}: Props) {
  const grouped = groupItems(items);
  const totalItems = items.length;
  const totalCovered = items.filter((i) => i.covered).length;
  const overallPct = totalItems > 0 ? (totalCovered / totalItems) * 100 : 0;

  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    () => new Set(grouped.map((g) => g.stage))
  );
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    () => new Set(grouped.flatMap((g) => g.categories.map((c) => `${g.stage}:${c.category}`)))
  );

  function toggleStage(stage: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      next.has(stage) ? next.delete(stage) : next.add(stage);
      return next;
    });
  }

  function toggleCat(key: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Overall progress bar */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-action-blue" />
            <span className="text-sm font-bold text-deep-navy">
              Overall Progress
            </span>
          </div>
          <span className="text-sm font-bold text-action-blue">
            {totalCovered}/{totalItems}
          </span>
        </div>
        <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-action-blue rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {overallPct.toFixed(0)}% of Eiken Pre-1 syllabus covered
        </p>
      </div>

      {/* Stage groups */}
      {grouped.map((group) => {
        const stagePct =
          group.total > 0 ? (group.covered / group.total) * 100 : 0;
        const isStageOpen = expandedStages.has(group.stage);

        return (
          <div
            key={group.stage}
            className="bg-white rounded-xl border border-border overflow-hidden"
          >
            {/* Stage header */}
            <button
              onClick={() => toggleStage(group.stage)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-page transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-deep-navy">
                    {stageLabel(group.stage)}
                  </span>
                  <span className="text-[10px] font-medium text-success-text bg-success-bg px-2 py-0.5 rounded-full">
                    {group.covered}/{group.total}
                  </span>
                </div>
                <div className="mt-1.5 w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-action-blue rounded-full transition-all duration-700"
                    style={{ width: `${stagePct}%` }}
                  />
                </div>
              </div>
              {isStageOpen ? (
                <ChevronDown
                  size={16}
                  className="text-muted-foreground flex-shrink-0"
                />
              ) : (
                <ChevronRight
                  size={16}
                  className="text-muted-foreground flex-shrink-0"
                />
              )}
            </button>

            {isStageOpen && (
              <div className="border-t border-border">
                {group.categories.map((cat) => {
                  const catKey = `${group.stage}:${cat.category}`;
                  const isCatOpen = expandedCats.has(catKey);
                  const catCovered = cat.items.filter((i) => i.covered).length;

                  return (
                    <div key={catKey} className="border-b border-border last:border-b-0">
                      {/* Category header */}
                      <button
                        onClick={() => toggleCat(catKey)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-page transition-colors cursor-pointer"
                      >
                        {isCatOpen ? (
                          <ChevronDown
                            size={13}
                            className="text-muted-foreground flex-shrink-0"
                          />
                        ) : (
                          <ChevronRight
                            size={13}
                            className="text-muted-foreground flex-shrink-0"
                          />
                        )}
                        <span className="flex-1 text-xs font-semibold text-slate-600">
                          {cat.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {catCovered}/{cat.items.length}
                        </span>
                      </button>

                      {isCatOpen && (
                        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                          {cat.items.map((item) => (
                            <div key={item.id} className="relative">
                              {newlyTaggedIds.includes(item.id) && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-action-blue rounded-full animate-pulse z-10" />
                              )}
                              <TopicBadge
                                name={item.topicName}
                                covered={item.covered}
                                size="sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
