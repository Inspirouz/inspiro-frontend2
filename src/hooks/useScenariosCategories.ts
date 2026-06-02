import { useState, useEffect, useCallback } from 'react';

export type ScenariosTreeNode = {
  id: string;
  label: string;
  sectionId: string;
  count: number;
  children?: ScenariosTreeNode[];
};

type RawItem = {
  id?: string;
  parent_id?: string | null;
  project_id?: string;
  project?: { id?: string };
  is_deleted?: boolean;
  tag?: { id?: string; name?: string };
  screens_count?: number;
  scenarios_count?: number;
  children?: RawItem[];
};

// Flatten nested API response into a flat list
function flattenItems(items: RawItem[]): RawItem[] {
  const result: RawItem[] = [];
  for (const item of items) {
    result.push(item);
    if (Array.isArray(item.children) && item.children.length > 0) {
      result.push(...flattenItems(item.children));
    }
  }
  return result;
}

function getItemProjectId(x: RawItem): string | undefined {
  return x.project_id ?? x.project?.id ?? undefined;
}

// Build tree from flat list using parent_id relationships (works for both flat and nested API responses)
function buildTree(flatList: RawItem[], projectId?: string | null): ScenariosTreeNode[] {
  // Smart filter: if any item has project_id, filter strictly; otherwise trust the API
  let filtered: RawItem[];
  if (projectId) {
    const hasAnyProjectId = flatList.some(x => !!getItemProjectId(x));
    filtered = hasAnyProjectId
      ? flatList.filter(x => getItemProjectId(x) === projectId)
      : flatList;
  } else {
    filtered = flatList;
  }

  // Build id → item map (skip deleted)
  const byId = new Map<string, RawItem>();
  for (const item of filtered) {
    const id = String(item.id ?? '');
    if (id && !item.is_deleted) byId.set(id, item);
  }

  // Build parent → children map from parent_id
  const childrenOf = new Map<string, string[]>();
  for (const [id, item] of byId) {
    if (item.parent_id != null) {
      const pid = String(item.parent_id);
      if (byId.has(pid)) {
        if (!childrenOf.has(pid)) childrenOf.set(pid, []);
        childrenOf.get(pid)!.push(id);
      }
    }
  }

  // Roots: parent_id === null OR parent not in filtered set
  const rootIds: string[] = [];
  for (const [id, item] of byId) {
    if (item.parent_id == null || !byId.has(String(item.parent_id))) {
      rootIds.push(id);
    }
  }

  function mapItem(id: string): ScenariosTreeNode | null {
    const raw = byId.get(id);
    if (!raw) return null;
    const tag = raw.tag && typeof raw.tag === 'object' ? raw.tag : undefined;
    const label = String(tag?.name ?? '');
    const count = Number(raw.screens_count ?? raw.scenarios_count ?? 0);
    const childIds = childrenOf.get(id) ?? [];
    const children = childIds.map(mapItem).filter((n): n is ScenariosTreeNode => n != null);
    return { id, label, sectionId: id, count, ...(children.length ? { children } : {}) };
  }

  return rootIds.map(mapItem).filter((n): n is ScenariosTreeNode => n != null);
}

export function useScenariosCategories(projectId?: string | null) {
  const [treeStructure, setTreeStructure] = useState<ScenariosTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    try {
      const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : '';
      const url = `${apiUrl}/scenarios-categories${query}`;
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      const data = json?.data ?? json;
      const list: RawItem[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      const ok = res.ok && (json?.success === true || (json?.status_code >= 200 && json?.status_code < 300));
      if (ok && list.length > 0) {
        const flat = flattenItems(list);
        const tree = buildTree(flat, projectId);
        setTreeStructure(tree);
      } else {
        setTreeStructure([]);
      }
    } catch {
      setTreeStructure([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { treeStructure, loading };
}
