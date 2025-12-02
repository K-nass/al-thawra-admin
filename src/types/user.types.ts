// User related types
export interface User {
  id: string | number;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'author' | 'subscriber';
  bio?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  username?: string;
  password: string;
  avatar?: string;
  role?: 'admin' | 'editor' | 'author' | 'subscriber';
  bio?: string;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  id: string | number;
  password?: string;
}

export interface AuthUser extends User {
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends CreateUserDto {
  confirmPassword: string;
}
