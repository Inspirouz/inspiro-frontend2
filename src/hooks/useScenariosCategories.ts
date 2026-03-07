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
  is_deleted?: boolean;
  tag?: { id?: string; name?: string };
  scenarios_count?: number;
  children?: RawItem[];
};

function mapNode(raw: RawItem): ScenariosTreeNode | null {
  if (raw.is_deleted) return null;
  const id = String(raw.id ?? '');
  if (!id) return null;
  const tag = raw.tag && typeof raw.tag === 'object' ? raw.tag : undefined;
  const label = String(tag?.name ?? '');
  const sectionId = id;
  const count = Number(raw.scenarios_count ?? 0);
  const rawChildren = raw.children;
  const children = Array.isArray(rawChildren)
    ? rawChildren.map((c) => mapNode(c)).filter((n): n is ScenariosTreeNode => n != null)
    : undefined;
  return { id, label, sectionId, count, ...(children?.length ? { children } : {}) };
}

export function useScenariosCategories(projectId?: string | null) {
  const [treeStructure, setTreeStructure] = useState<ScenariosTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (projectId) params.set('project_id', projectId);
      const url = `${apiUrl}/scenarios-categories${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      const data = json?.data ?? json;
      const list: RawItem[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      const ok = res.ok && (json?.success === true || (json?.status_code >= 200 && json?.status_code < 300));
      if (ok && list.length > 0) {
        // Only root nodes (parent_id === null) as top-level tree; map and filter is_deleted
        const roots = list.filter((x) => x.parent_id == null);
        const mapped = roots
          .map((x) => mapNode(x))
          .filter((n): n is ScenariosTreeNode => n != null);
        setTreeStructure(mapped);
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
