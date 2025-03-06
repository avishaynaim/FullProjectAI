import { Project } from "../components/project/project.model";
import { Field } from "./field.model";
import { Message } from "./message.model";
import { Root } from "./root.model";

export interface TreeNode {
    key: string;
    label: string;
    type: 'project' | 'root' | 'message' | 'field';
    data: Project | Root | Message | Field;
    expandedIcon?: string;
    collapsedIcon?: string;
    children?: TreeNode[];
    leaf?: boolean;
    selectable?: boolean;
  }