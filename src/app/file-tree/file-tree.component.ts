import { Component, OnInit, ViewChild } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatMenuTrigger } from '@angular/material';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.css']
})
export class FileTreeComponent implements OnInit {
  @ViewChild(MatMenuTrigger) menu: MatMenuTrigger;
  menuPosition = { x: '0px', y: '0px' };

  private transformer = (node: FileNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      id: node.id,
      name: node.name,
      type: node.type,
      level,
      isNew: node.isNew
    };
  }

  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;

  isNew = (_: number, node: FileFlatNode) => node.isNew;

  hasChild = (_: number, node: FileFlatNode) => node.expandable;

  pendingCreate = false;
  currentNode: FileFlatNode;

  constructor(private fileService: FileService) {
    this.treeControl = new FlatTreeControl<FileFlatNode>(
      node => node.level,
      node => node.expandable
    );

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      node => node.level,
      node => node.expandable,
      node => node.children
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    fileService.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
   }

  ngOnInit() { }

  onContextMenu(event: MouseEvent, item: FileFlatNode) {
    event.preventDefault();
    this.menuPosition.x = event.clientX + 'px';
    this.menuPosition.y = event.clientY + 'px';
    this.menu.menuData = { item };
    this.pendingCreate = false;
    this.menu.openMenu();
  }

  addFile(node: FileFlatNode, type: string) {
    const parent = this.fileService.getFile(node.id);
    this.pendingCreate = true;
    this.fileService.createChild(parent, type);
    this.treeControl.expandAll();
  }

  saveFile(node: FileFlatNode, value: string) {
    this.fileService.saveChild(node.id, value);
    this.pendingCreate = false;
    this.treeControl.expandAll();
  }

  rename(node: FileFlatNode) {
    this.fileService.editChild(node.id);
    this.treeControl.expandAll();
  }

  getPlaceHolder(node: FileFlatNode) {
    let type;
    switch (node.type) {
      case 'entity':
        type = 'New Entity...';
        break;
      case 'repo':
        type = 'New Repository...';
        break;
      case 'folder':
        type = 'New Folder...';
        break;
      case 'docType':
        type = 'New Document Type...';
        break;
      default:
        type = '';
        break;
    }
    return node.name === '' ? type : node.name;
  }
}
