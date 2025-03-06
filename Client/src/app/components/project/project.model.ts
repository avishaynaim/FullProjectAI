import { Root } from "../../models/root.model";

export interface Project {
    id: string;
    name: string;
    description: string;
    createdDate: Date;
    lastModifiedDate: Date;
    roots: Root[];
  }