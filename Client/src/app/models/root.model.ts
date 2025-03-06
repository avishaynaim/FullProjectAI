import { Message } from "./message.model";

export interface Root {
    id: string;
    name: string;
    description: string;
    createdDate: Date;
    lastModifiedDate: Date;
    projectId: string;
    messages: Message[];
  }