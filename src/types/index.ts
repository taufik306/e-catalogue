export interface CatalogueNode {
  id: string;
  parentId: string | null;
  name: string;
  price: string;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
  children: CatalogueNode[];
}
