import { useState, useEffect, useCallback } from 'react';
import type { ScenarioItem } from './useProjects';

export type ScenariosTreeNode = {
  id: string;
  label: string;
  sectionId: string;
  count: number;
  children?: ScenariosTreeNode[];
};

function getImageBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl.replace(/\/api\/?$/, '') + '/images/';
}

function toImageUrl(path: string): string {
  if (!path) return '';
  let cleaned = path;
  const matches = [...path.matchAll(/https?:\/+/gi)];
  const last = matches.length > 0 ? matches[matches.length - 1] : undefined;
  if (last && last.index !== undefined && last.index > 0) cleaned = path.slice(last.index);
  cleaned = cleaned.replace(/^(https?:)\/+/i, '$1//');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return getImageBaseUrl() + (cleaned.startsWith('/') ? cleaned.slice(1) : cleaned);
}

type RawImage = { id?: string; path?: string; file_name?: string };

type RawScreen = {
  id?: string;
  path?: string;
  file_name?: string;
  image?: string;
  images?: Array<string | RawImage>;
  title?: string;
};

type RawProject = { id?: string; name?: string; logo?: string };

type RawCategory = {
  id?: string;
  parent_id?: string | null;
  is_deleted?: boolean;
  tag?: { id?: string; name?: string };
  project?: RawProject;
  project_id?: string;
  screens_count?: number;
  scenarios_count?: number;
  children?: RawCategory[];
  screens?: RawScreen[];
  scenarios?: RawScreen[];
};

function extractScreens(category: RawCategory, categoryName: string): ScenarioItem[] {
  const list = Array.isArray(category.screens)
    ? category.screens
    : Array.isArray(category.scenarios)
      ? category.scenarios
      : [];
  const result: ScenarioItem[] = [];
  const categoryId = String(category.id ?? '');
  const project = category.project;
  const projectId = String(project?.id ?? category.project_id ?? '');
  const projectName = project?.name ? String(project.name) : undefined;
  const projectLogo = project?.logo ? toImageUrl(String(project.logo)) : undefined;

  for (const screen of list) {
    if (!screen || typeof screen !== 'object') continue;
    const screenId = String(screen.id ?? '');
    const nestedImages = Array.isArray(screen.images) ? screen.images : null;
    if (nestedImages && nestedImages.length > 0) {
      nestedImages.forEach((img, idx) => {
        const path =
          typeof img === 'string'
            ? img
            : ((img.path ?? img.file_name ?? '') as string);
        if (!path) return;
        const imgId =
          typeof img === 'string'
            ? `${screenId || categoryId}-${idx}`
            : String(img.id ?? `${screenId || categoryId}-${idx}`);
        result.push({
          id: imgId,
          screenId: screenId || imgId,
          title: categoryName,
          image: toImageUrl(path),
          categoryId,
          ...(projectId ? { projectId } : {}),
          ...(projectName ? { projectName } : {}),
          ...(projectLogo ? { projectLogo } : {}),
        });
      });
      continue;
    }
    const direct = (screen.path ?? screen.file_name ?? screen.image ?? '') as string;
    if (!direct) continue;
    result.push({
      id: screenId || `${categoryId}-${result.length}`,
      screenId: screenId || `${categoryId}-${result.length}`,
      title: screen.title ?? categoryName,
      image: toImageUrl(direct),
      categoryId,
      ...(projectId ? { projectId } : {}),
      ...(projectName ? { projectName } : {}),
      ...(projectLogo ? { projectLogo } : {}),
    });
  }
  return result;
}

// Flatten nested API response into a flat list
function flattenCategories(items: RawCategory[]): RawCategory[] {
  const result: RawCategory[] = [];
  for (const item of items) {
    result.push(item);
    if (Array.isArray(item.children) && item.children.length > 0) {
      result.push(...flattenCategories(item.children));
    }
  }
  return result;
}

// Returns the project id from a category, checking both project_id and project.id
function getCatProjectId(c: RawCategory): string | undefined {
  return c.project_id ?? c.project?.id ?? undefined;
}

// Build tree + extract screens from flat list using parent_id relationships
function buildTreeWithScreens(
  flatList: RawCategory[],
  projectId: string | null | undefined,
  byCategory: Record<string, ScenarioItem[]>,
  all: ScenarioItem[]
): ScenariosTreeNode[] {
  // Smart project filter:
  // - If at least one category has a project_id, filter strictly (exclude unknowns to prevent leakage)
  // - If NO category has project_id, trust that the API already filtered (no field to filter on)
  let filtered: RawCategory[];
  if (projectId) {
    const hasAnyProjectId = flatList.some(c => !!getCatProjectId(c));
    filtered = hasAnyProjectId
      ? flatList.filter(c => getCatProjectId(c) === projectId)
      : flatList;
  } else {
    filtered = flatList;
  }

  // Build id → category map (skip deleted)
  const byId = new Map<string, RawCategory>();
  for (const cat of filtered) {
    const id = String(cat.id ?? '');
    if (id && !cat.is_deleted) byId.set(id, cat);
  }

  // Build parent → children map from parent_id
  const childrenOf = new Map<string, string[]>();
  for (const [id, cat] of byId) {
    if (cat.parent_id != null) {
      const pid = String(cat.parent_id);
      if (byId.has(pid)) {
        if (!childrenOf.has(pid)) childrenOf.set(pid, []);
        childrenOf.get(pid)!.push(id);
      }
    }
  }

  // Extract screens for every category, with screen-level project filter as second defense
  for (const [id, cat] of byId) {
    const label = String(cat.tag?.name ?? '');
    const items = extractScreens(cat, label);
    // Second defense: if screens have projectId, filter out cross-app screens
    const screensFiltered = (projectId && items.some(s => !!s.projectId))
      ? items.filter(s => !s.projectId || s.projectId === projectId)
      : items;
    if (screensFiltered.length > 0) {
      byCategory[id] = screensFiltered;
      all.push(...screensFiltered);
    }
  }

  // Roots: parent_id === null OR parent not in filtered set
  const rootIds: string[] = [];
  for (const [id, cat] of byId) {
    if (cat.parent_id == null || !byId.has(String(cat.parent_id))) {
      rootIds.push(id);
    }
  }

  function buildNode(id: string): ScenariosTreeNode | null {
    const raw = byId.get(id);
    if (!raw) return null;
    const label = String(raw.tag?.name ?? '');
    const ownScreens = byCategory[id] ?? [];
    const childIds = childrenOf.get(id) ?? [];
    const children = childIds.map(buildNode).filter((n): n is ScenariosTreeNode => n != null);
    const count = ownScreens.length || Number(raw.screens_count ?? raw.scenarios_count ?? 0);
    return { id, label, sectionId: id, count, ...(children.length ? { children } : {}) };
  }

  return rootIds.map(buildNode).filter((n): n is ScenariosTreeNode => n != null);
}

export function useScenariosCategoriesWithScreens(projectId?: string | null) {
  const [treeStructure, setTreeStructure] = useState<ScenariosTreeNode[]>([]);
  const [scenariosByCategoryId, setScenariosByCategoryId] = useState<Record<string, ScenarioItem[]>>({});
  const [allScenarios, setAllScenarios] = useState<ScenarioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    try {
      const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : '';
      const url = `${apiUrl}/scenarios-categories/with-screens${query}`;
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      const data = json?.data ?? json;
      const list: RawCategory[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];
      const ok =
        res.ok &&
        (json?.success === true || (json?.status_code >= 200 && json?.status_code < 300));
      if (!ok || list.length === 0) {
        setTreeStructure([]);
        setScenariosByCategoryId({});
        setAllScenarios([]);
        return;
      }
      const flat = flattenCategories(list);
      const byCategory: Record<string, ScenarioItem[]> = {};
      const all: ScenarioItem[] = [];
      const tree = buildTreeWithScreens(flat, projectId, byCategory, all);
      setTreeStructure(tree);
      setScenariosByCategoryId(byCategory);
      setAllScenarios(all);
    } catch {
      setTreeStructure([]);
      setScenariosByCategoryId({});
      setAllScenarios([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { treeStructure, scenariosByCategoryId, allScenarios, loading };
}
