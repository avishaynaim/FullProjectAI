import { EnumValue } from "./enum-value.model";

export enum FieldType {
    String = 'String',
    Integer = 'Integer',
    Decimal = 'Decimal',
    Boolean = 'Boolean',
    DateTime = 'DateTime',
    Enum = 'Enum',
    Complex = 'Complex'
  }
  
  export interface Field {
    id: string;
    name: string;
    description: string;
    type: FieldType;
    defaultValue?: string;
    isRequired: boolean;
    createdDate: Date;
    lastModifiedDate: Date;
    messageId?: string | null;
    parentFieldId?: string | null;
    childFields: Field[];
    enumValues: EnumValue[];
  }