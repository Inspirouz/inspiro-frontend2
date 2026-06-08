import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { useScenariosCategories } from '@/hooks/useScenariosCategories';
import { useScenariosCategoriesWithScreens } from '@/hooks/useScenariosCategoriesWithScreens';
import '@/styles/detail-page.css';
import '@/styles/scenario-tree-page.css';

type TreeNode = {
  id: string;
  label: string;
  sectionId: string;
  count: number;
  children?: TreeNode[];
};

const TreeNodeComponent = ({
  node,
  onItemClick,
  level = 0,
}: {
  node: TreeNode;
  onItemClick: (sectionId: string) => void;
  level?: number;
}) => {
  return (
    <div className={`detail-page__tree-row ${level === 0 ? 'parent-tree-row' : ''}`}>
      <button
        className="detail-page__tree-button"
        onClick={() => node.sectionId && onItemClick(node.sectionId)}
      >
        <span className="detail-page__tree-label">{node.label}</span>
        <span className="detail-page__tree-count">{node.count}</span>
      </button>
      {node.children && node.children.length > 0 && (
        <div className="detail-page__tree-children">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ScenarioTreePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { project: item } = useProject(id ?? undefined);
  const { treeStructure: rawTree } = useScenariosCategories(id ?? null);
  const { scenariosByCategoryId } = useScenariosCategoriesWithScreens(id ?? null);

  const filterNodesWithScreens = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    for (const node of nodes) {
      const filteredChildren = node.children ? filterNodesWithScreens(node.children) : undefined;
      const ownCount = scenariosByCategoryId[node.id]?.length ?? 0;
      const hasChildren = !!filteredChildren && filteredChildren.length > 0;
      if (ownCount === 0 && !hasChildren) continue;
      result.push({
        ...node,
        count: ownCount || node.count,
        ...(hasChildren ? { children: filteredChildren } : { children: undefined }),
      });
    }
    return result;
  };

  const treeStructure = filterNodesWithScreens(rawTree);

  const handleSelect = (sectionId: string) => {
    navigate(`/detail/${id}?section=${sectionId}`);
  };

  return (
    <div className="stp-page">
      <div className="stp-header">
        <button
          className="stp-back"
          onClick={() => navigate(`/detail/${id}`)}
          aria-label="Назад"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 16L7 10L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="stp-header-info">
          {item?.logo && (
            <img src={item.logo} alt={item.app_name} className="stp-app-logo" />
          )}
          <span className="stp-title">Сценарии</span>
        </div>
      </div>

      <div className="stp-tree">
        {treeStructure.length === 0 ? (
          <p className="stp-empty">Сценарии не найдены</p>
        ) : (
          treeStructure.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              onItemClick={handleSelect}
              level={0}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ScenarioTreePage;
