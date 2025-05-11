// Serviço para gerenciar perfis de acesso
// Futuramente pode ser conectado a uma API real

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  resource: string;
}

// Dados estáticos de perfis (nesta fase inicial)
export const getRoles = async (): Promise<Role[]> => {
  // Nesta versão inicial, retornaremos dados estáticos em vez de fazer uma chamada API
  // No futuro isso poderia ser substituído por: const response = await api.get("/roles");
  const roles: Role[] = [
    {
      id: "1",
      name: "Administrador",
      code: "ADMIN",
      description: "Acesso completo ao sistema",
      permissions: [
        { id: "1", name: "Gerenciar Usuários", code: "MANAGE_USERS", description: "Criar, editar e excluir usuários", resource: "users" },
        { id: "2", name: "Gerenciar Filiais", code: "MANAGE_BRANCHES", description: "Criar, editar e excluir filiais", resource: "branches" },
        { id: "3", name: "Gerenciar Terapeutas", code: "MANAGE_THERAPISTS", description: "Criar, editar e excluir terapeutas", resource: "therapists" },
        { id: "4", name: "Gerenciar Serviços", code: "MANAGE_SERVICES", description: "Criar, editar e excluir serviços", resource: "services" },
        { id: "5", name: "Gerenciar Agendamentos", code: "MANAGE_APPOINTMENTS", description: "Criar, editar e excluir agendamentos", resource: "appointments" },
        { id: "6", name: "Gerenciar Base de Conhecimento", code: "MANAGE_KNOWLEDGE", description: "Criar, editar e excluir entradas da base de conhecimento", resource: "knowledge" },
        { id: "7", name: "Configurações do Sistema", code: "MANAGE_SETTINGS", description: "Alterar configurações do sistema", resource: "settings" },
        { id: "8", name: "Gerenciar Perfis", code: "MANAGE_ROLES", description: "Criar, editar e excluir perfis de acesso", resource: "roles" },
      ]
    },
    {
      id: "2",
      name: "Recepcionista",
      code: "RECEPTIONIST",
      description: "Gerencia agendamentos, clientes e recursos operacionais",
      permissions: [
        { id: "3", name: "Gerenciar Terapeutas", code: "MANAGE_THERAPISTS", description: "Criar, editar e excluir terapeutas", resource: "therapists" },
        { id: "4", name: "Gerenciar Serviços", code: "MANAGE_SERVICES", description: "Criar, editar e excluir serviços", resource: "services" },
        { id: "5", name: "Gerenciar Agendamentos", code: "MANAGE_APPOINTMENTS", description: "Criar, editar e excluir agendamentos", resource: "appointments" },
        { id: "6", name: "Gerenciar Base de Conhecimento", code: "MANAGE_KNOWLEDGE", description: "Criar, editar e excluir entradas da base de conhecimento", resource: "knowledge" },
      ]
    },
    {
      id: "3",
      name: "Terapeuta",
      code: "THERAPIST",
      description: "Acesso à agenda e clientes próprios",
      permissions: [
        { id: "5", name: "Gerenciar Agendamentos", code: "VIEW_APPOINTMENTS", description: "Visualizar agendamentos", resource: "appointments" },
        { id: "9", name: "Gerenciar Clientes", code: "VIEW_CLIENTS", description: "Visualizar clientes", resource: "clients" },
        { id: "10", name: "Agenda", code: "MANAGE_OWN_SCHEDULE", description: "Gerenciar própria agenda", resource: "schedule" },
      ]
    },
    {
      id: "4",
      name: "Cliente",
      code: "CLIENT",
      description: "Acesso limitado para clientes",
      permissions: [
        { id: "11", name: "Próprios Agendamentos", code: "VIEW_OWN_APPOINTMENTS", description: "Visualizar próprios agendamentos", resource: "appointments" },
        { id: "12", name: "Marcar Consultas", code: "BOOK_APPOINTMENTS", description: "Marcar novas consultas", resource: "appointments" },
      ]
    }
  ];
  
  return roles;
};

// Obter permissões disponíveis no sistema
export const getPermissions = async (): Promise<Permission[]> => {
  // Nesta versão inicial, retornaremos dados estáticos
  const permissions: Permission[] = [
    { id: "1", name: "Gerenciar Usuários", code: "MANAGE_USERS", description: "Criar, editar e excluir usuários", resource: "users" },
    { id: "2", name: "Gerenciar Filiais", code: "MANAGE_BRANCHES", description: "Criar, editar e excluir filiais", resource: "branches" },
    { id: "3", name: "Gerenciar Terapeutas", code: "MANAGE_THERAPISTS", description: "Criar, editar e excluir terapeutas", resource: "therapists" },
    { id: "4", name: "Gerenciar Serviços", code: "MANAGE_SERVICES", description: "Criar, editar e excluir serviços", resource: "services" },
    { id: "5", name: "Gerenciar Agendamentos", code: "MANAGE_APPOINTMENTS", description: "Criar, editar e excluir agendamentos", resource: "appointments" },
    { id: "6", name: "Gerenciar Base de Conhecimento", code: "MANAGE_KNOWLEDGE", description: "Criar, editar e excluir entradas da base de conhecimento", resource: "knowledge" },
    { id: "7", name: "Configurações do Sistema", code: "MANAGE_SETTINGS", description: "Alterar configurações do sistema", resource: "settings" },
    { id: "8", name: "Gerenciar Perfis", code: "MANAGE_ROLES", description: "Criar, editar e excluir perfis de acesso", resource: "roles" },
    { id: "9", name: "Gerenciar Clientes", code: "VIEW_CLIENTS", description: "Visualizar clientes", resource: "clients" },
    { id: "10", name: "Agenda", code: "MANAGE_OWN_SCHEDULE", description: "Gerenciar própria agenda", resource: "schedule" },
    { id: "11", name: "Próprios Agendamentos", code: "VIEW_OWN_APPOINTMENTS", description: "Visualizar próprios agendamentos", resource: "appointments" },
    { id: "12", name: "Marcar Consultas", code: "BOOK_APPOINTMENTS", description: "Marcar novas consultas", resource: "appointments" },
  ];
  
  return permissions;
};

// Função para obter um perfil específico por ID (usada para a tela de edição)
export const getRoleById = async (id: string): Promise<Role | null> => {
  const roles = await getRoles();
  return roles.find(role => role.id === id) || null;
}; 