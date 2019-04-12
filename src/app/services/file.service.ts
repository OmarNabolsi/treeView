import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  dataChange = new BehaviorSubject<FileNode[]>([]);

  get data(): FileNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.newFile();
  }

  private newFile() {
    const newData: FileNode = {
      id: '1',
      name: '...root',
      isNew: false,
      type: 'root',
      children: [{
        id: '1.1',
        name: 'Entity',
        isNew: false,
        type: 'entity'
      }]
    };
    this.data.push(newData);
    this.dataChange.next(this.data);
  }

  createChild(parent: FileNode, newType: string) {
    let newFile: FileNode;
    let id = parent.id + '.1';
    if (parent.children) {
      if (parent.children.length === 0) {
        parent.children = null;
      }
    }
    if (parent.children) {
      const j = +parent.children[parent.children.length - 1].id.substr(-1, 1);
      const y = parent.children[parent.children.length - 1].id.lastIndexOf('.');
      const z = parent.children[parent.children.length - 1].id.substr(0, y);
      const x = j + 1;
      id = z + `.${x}`;
      newFile = {
        id,
        name: '',
        isNew: true,
        type: newType
      };
      parent.children.push(newFile);
    } else {
      newFile = {
        id,
        name: '',
        isNew: true,
        type: newType
      };
      parent.children = [newFile];
    }
    this.dataChange.next(this.data);
  }

  editChild(id: string) {
    const fileToEdit = this.find(this.data, id);
    fileToEdit.isNew = true;
    this.dataChange.next(this.data);
  }

  saveChild(id: string, name: string) {
    const fileToSave = this.find(this.data, id);
    fileToSave.name = name;
    fileToSave.isNew = false;
    this.dataChange.next(this.data);
  }

  getFiles() {
    return this.dataChange.value;
  }

  getFile(id: string) {
    const file = this.find(this.data, id);
    this.resetNew(this.data);
    return file;
  }

  private find(node: FileNode[], id: string): FileNode {
    let result: FileNode = null;
    node.forEach(item => {
      if (item.id === id) {
        result = item;
      }

      if (item.children) {
        const subresult = this.find(item.children, id);
        if (subresult) {
          result = subresult;
        }
      }
    });
    return result;
  }

  private resetNew(node: FileNode[]) {
    node.forEach((item, index) => {
      if (item.isNew) {
        item.isNew = false;
        if (item.name === '') {
          node.splice(index);
        }
      } else if (item.children) {
        this.resetNew(item.children);
      }
    });
  }
}
