export type DataType = 'string' | 'number' | 'boolean' | 'date';

export interface Field {
  id: string;
  name: string;
  datatype: DataType;
  createdAt: string;
  fills: Fill[];
}

export interface Fill {
  id: string;
  fieldId: string;
  value: string;
  createdAt: string;
  field: Field;
}
