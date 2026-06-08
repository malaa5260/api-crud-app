export interface ApiObjectData {
  color?: string | number | boolean | null;
  capacity?: string | number | boolean | null;
  [key: string]: string | number | boolean | null | undefined | ApiObjectData | ApiObjectData[];
}

export interface ApiObject {
  id: string;
  name: string;
  data: ApiObjectData | null;
}

export interface CreateApiObject {
  name: string;
  data: ApiObjectData;
}

export interface CreateApiObjectForm {
  name: string;
  color: string;
  capacity: string;
}

export function toCreateApiObjectDto(form: CreateApiObjectForm): CreateApiObject {
  return {
    name: form.name.trim(),
    data: {
      color: form.color.trim() || 'Not specified',
      capacity: form.capacity.trim() || 'Not specified',
    },
  };
}

export interface DeleteApiObjectResponse {
  message: string;
}
