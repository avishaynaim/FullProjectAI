import { Field } from "./field.model";

export interface Message {
    id: string;
    name: string;
    description: string;
    createdDate: Date;
    lastModifiedDate: Date;
    rootId: string;
    fields: Field[];
  }