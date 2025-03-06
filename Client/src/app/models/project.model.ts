import { Root } from "./root.model";

export interface Project {
    id: string;
    name: string;
    description: string;
    createdDate: Date;
    lastModifiedDate: Date;
    roots: Root[];
  }