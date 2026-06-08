import Papa from 'papaparse';
import type { CatalogueNode } from '../types';

// Example Google Sheet published as CSV link (Placeholder)
// You can replace this with your actual Google Sheet CSV publish link
const DEFAULT_SHEET_CSV_URL = import.meta.env.VITE_SHEET_CSV_URL || '';

const fallbackData: CatalogueNode[] = [
  {
    id: 'chair',
    parentId: null,
    name: 'Modern Accent Chair',
    price: '$299.00',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sortOrder: 1,
    active: true,
    children: [
      {
        id: 'chair-fabric',
        parentId: 'chair',
        name: 'Fabric Accent Chair',
        price: '$299.00',
        imageUrl: 'https://images.unsplash.com/photo-1586158291800-2665f07bba79?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 1,
        active: true,
        children: [
          {
            id: 'chair-fabric-blue',
            parentId: 'chair-fabric',
            name: 'Blue Fabric Accent Chair',
            price: '$319.00',
            imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 1,
            active: true,
            children: [],
          },
        ],
      },
      {
        id: 'chair-leather',
        parentId: 'chair',
        name: 'Leather Accent Chair',
        price: '$349.00',
        imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 2,
        active: true,
        children: [],
      },
    ],
  },
  {
    id: 'table',
    parentId: null,
    name: 'Minimalist Wood Table',
    price: '$450.00',
    imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sortOrder: 2,
    active: true,
    children: [
      {
        id: 'table-small',
        parentId: 'table',
        name: 'Small Wood Table',
        price: '$350.00',
        imageUrl: 'https://images.unsplash.com/photo-1533090368676-1fd25485db88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 1,
        active: true,
        children: [],
      },
    ],
  },
  {
    id: 'lamp',
    parentId: null,
    name: 'Ceramic Table Lamp',
    price: '$85.00',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sortOrder: 3,
    active: true,
    children: [],
  }
];

type CsvRow = Record<string, string | undefined>;

const getCell = (row: CsvRow, keys: string[]): string => {
  for (const key of keys) {
    const value = row[key]?.trim();
    if (value) {
      return value;
    }
  }

  return '';
};

const parseSortOrder = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseActive = (value: string): boolean => {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return !['false', '0', 'no', 'inactive'].includes(normalized);
};

const sortCatalogueTree = (nodes: CatalogueNode[]): CatalogueNode[] => {
  nodes.sort((first, second) => {
    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.name.localeCompare(second.name);
  });

  nodes.forEach((node) => sortCatalogueTree(node.children));
  return nodes;
};

const filterActiveTree = (nodes: CatalogueNode[]): CatalogueNode[] => (
  nodes
    .filter((node) => node.active)
    .map((node) => ({
      ...node,
      children: filterActiveTree(node.children),
    }))
);

const findCycleIds = (nodes: CatalogueNode[], nodeMap: Map<string, CatalogueNode>): Set<string> => {
  const cycleIds = new Set<string>();
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (node: CatalogueNode, path: string[]) => {
    if (visited.has(node.id)) {
      return;
    }

    if (visiting.has(node.id)) {
      const cycleStart = path.indexOf(node.id);
      const cyclePath = cycleStart >= 0 ? path.slice(cycleStart) : [...path, node.id];
      cyclePath.forEach((id) => cycleIds.add(id));
      console.warn(`Circular catalogue parent relationship skipped: ${[...cyclePath, node.id].join(' -> ')}`);
      return;
    }

    visiting.add(node.id);

    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        visit(parent, [...path, node.id]);
      }
    }

    visiting.delete(node.id);
    visited.add(node.id);
  };

  nodes.forEach((node) => visit(node, []));
  return cycleIds;
};

const findInvalidNodeIds = (nodes: CatalogueNode[], nodeMap: Map<string, CatalogueNode>): Set<string> => {
  const invalidIds = findCycleIds(nodes, nodeMap);

  nodes.forEach((node) => {
    if (node.parentId && !nodeMap.has(node.parentId)) {
      invalidIds.add(node.id);
      console.warn(`Catalogue row "${node.id}" skipped because parent "${node.parentId}" was not found.`);
    }
  });

  let changed = true;
  while (changed) {
    changed = false;
    nodes.forEach((node) => {
      if (node.parentId && invalidIds.has(node.parentId) && !invalidIds.has(node.id)) {
        invalidIds.add(node.id);
        changed = true;
      }
    });
  }

  return invalidIds;
};

const buildCatalogueTree = (nodes: CatalogueNode[]): CatalogueNode[] => {
  const nodeMap = new Map<string, CatalogueNode>(
    nodes.map((node) => [node.id, { ...node, children: [] }])
  );
  const normalizedNodes = Array.from(nodeMap.values());
  const invalidIds = findInvalidNodeIds(normalizedNodes, nodeMap);
  const roots: CatalogueNode[] = [];

  normalizedNodes.forEach((node) => {
    if (invalidIds.has(node.id)) {
      return;
    }

    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (!parent || invalidIds.has(parent.id)) {
        return;
      }

      parent.children.push(node);
      return;
    }

    roots.push(node);
  });

  return sortCatalogueTree(filterActiveTree(roots));
};

const parseCatalogueRows = (rows: CsvRow[]): CatalogueNode[] => {
  const ids = new Set<string>();
  const nodes: CatalogueNode[] = [];

  rows.forEach((row, index) => {
    const id = getCell(row, ['ID', 'Id', 'id']);

    if (!id) {
      console.warn(`Catalogue row ${index + 1} skipped because it has no ID.`);
      return;
    }

    if (ids.has(id)) {
      console.warn(`Catalogue row "${id}" skipped because the ID is duplicated.`);
      return;
    }

    ids.add(id);

    nodes.push({
      id,
      parentId: getCell(row, ['ParentID', 'ParentId', 'Parent ID', 'parentId', 'parentid']) || null,
      name: getCell(row, ['Name', 'name']) || 'Unknown Item',
      price: getCell(row, ['Price', 'price']) || '-',
      imageUrl: getCell(row, ['ImageURL', 'ImageUrl', 'Image URL', 'imageUrl', 'imageurl']) || '',
      sortOrder: parseSortOrder(getCell(row, ['SortOrder', 'Sort Order', 'sortOrder', 'sortorder']), index + 1),
      active: parseActive(getCell(row, ['Active', 'active'])),
      children: [],
    });
  });

  return buildCatalogueTree(nodes);
};

export async function fetchCatalogueData(): Promise<CatalogueNode[]> {
  if (!DEFAULT_SHEET_CSV_URL) {
    console.warn('No Google Sheet CSV URL provided. Using fallback dummy data.');
    return new Promise(resolve => setTimeout(() => resolve(fallbackData), 800)); // Simulate network delay
  }

  try {
    const response = await fetch(DEFAULT_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const items = parseCatalogueRows(results.data as CsvRow[]);
          resolve(items);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    // If fetching fails (e.g. offline and not cached), fallback to dummy data or empty
    return fallbackData;
  }
}
