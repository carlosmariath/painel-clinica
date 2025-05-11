import api from "../api";

const ENDPOINT = "/users";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branchId?: string;
}

// Buscar usuários administrativos
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get(`${ENDPOINT}/admin`);
  return response.data;
};

// Buscar usuário por ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data;
};

// Criar usuário administrativo
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  branchId?: string;
}): Promise<User> => {
  const response = await api.post(`${ENDPOINT}/admin`, userData);
  return response.data;
};

// Atualizar usuário administrativo
export const updateUser = async (
  id: string,
  userData: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: string;
    branchId?: string;
  }
): Promise<User> => {
  const response = await api.patch(`${ENDPOINT}/${id}`, userData);
  return response.data;
};

// Excluir usuário administrativo
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
}; 