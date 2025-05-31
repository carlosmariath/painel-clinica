import api from '../api';

export interface AppointmentCalendarItem {
  id: string;
  clientId: string;
  therapistId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  therapist?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    name: string;
  };
  notes?: string;
}

// Função para buscar agendamentos para o calendário
export const getCalendarAppointments = async (
  start: string,
  end: string,
  therapistId?: string,
  clientId?: string,
  branchId?: string
): Promise<AppointmentCalendarItem[]> => {
  let url = `/appointments/calendar?start=${start}&end=${end}`;
  if (therapistId) url += `&therapistId=${therapistId}`;
  if (clientId) url += `&clientId=${clientId}`;
  if (branchId) url += `&branchId=${branchId}`;
  
  const response = await api.get(url);
  
  // Garantir que todos os campos necessários estejam presentes
  const processedData = response.data.map((item: Partial<AppointmentCalendarItem>) => ({
    id: item.id || '',
    clientId: item.clientId || '',
    therapistId: item.therapistId || '',
    date: item.date || '',
    startTime: item.startTime || '00:00',
    endTime: item.endTime || '00:00',
    status: item.status || 'PENDING',
    client: item.client || { id: '', name: 'Cliente não especificado' },
    therapist: item.therapist || { id: '', name: 'Terapeuta não especificado' },
    service: item.service || { id: '', name: 'Serviço não especificado' },
    notes: item.notes || '',
  }));
  
  return processedData;
}; 