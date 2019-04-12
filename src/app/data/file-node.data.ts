interface FileNode {
  id: string;
  type: string;
  name: string;
  isNew: boolean;
  children?: FileNode[];
}
