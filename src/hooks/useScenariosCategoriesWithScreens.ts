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

function walkCategories(
  categories: RawCategory[],
  byCategory: Record<string, ScenarioItem[]>,
  all: ScenarioItem[]
): ScenariosTreeNode[] {
  const result: ScenariosTreeNode[] = [];
  for (const raw of categories) {
    if (!raw || raw.is_deleted) continue;
    const id = String(raw.id ?? '');
    if (!id) continue;
    const label = String(raw.tag?.name ?? '');
    const childRaw = Array.isArray(raw.children) ? raw.children : [];
    const children = walkCategories(childRaw, byCategory, all);

    const items = extractScreens(raw, label);
    if (items.length > 0) {
      byCategory[id] = items;
      all.push(...items);
    }

    const count = items.length || Number(raw.screens_count ?? raw.scenarios_count ?? 0);
    result.push({
      id,
      label,
      sectionId: id,
      count,
      ...(children.length > 0 ? { children } : {}),
    });
  }
  return result;
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
      const roots = list.filter((c) => c.parent_id == null);
      const source = roots.length > 0 ? roots : list;
      const byCategory: Record<string, ScenarioItem[]> = {};
      const all: ScenarioItem[] = [];
      const tree = walkCategories(source, byCategory, all);
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
