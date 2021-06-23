export interface InputField {
  name: string;
  minimum?: number;
  placeholder?: string;
  required: boolean;
  label?: string;
  type: 'select' | 'textField' | 'switch' | 'button'; // TODO refactor to html-default: 'select', 'text', 'checkbox'
  options?: MessageId[];
  defaultValue?: string | number;
  hidden?: boolean;
  isNumber?: boolean;
}

export interface MessageId {
  name: string;
  id: string;
  selected?: boolean;
}
