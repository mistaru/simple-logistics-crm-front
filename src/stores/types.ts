export interface Role {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
  permissions: Permission[];
}
export interface UserList {
  roles: {
    active: boolean;
    errorMessages: unknown[];
    blocked?: Date;
    permissions: {
      name: { value: string };
      operationPermissions: string;
    }[];
  }[];
}
export interface User {
  username?: string;
  blocked?: Date;
  id: number;
  name: string;
  login: string;
  roles: Role[];
}

export interface ScreenType {
  value: string;
  description: string;
  icon: string;
}

export interface PermissionName {
  value: string;
  authority: string;
  description: string;
  icon: string;
  screenType: ScreenType;
  view: string;
}

export interface Permission {
  id: number;
  name: PermissionName;
  access: number;
}

export interface UpdatePassword {
  currentPassword: string,
  newPassword: string,
}
export interface FormattedPermission {
  id?: number;
  name: string;
  access: number;
}
export interface EditablePermission {
  id?: number;
  name: PermissionName;
  access: number;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface NewUser {
  id?: number;
  username: string;
  blocked?: Date;
  password: string;
  roles: {id:number}[];
}
