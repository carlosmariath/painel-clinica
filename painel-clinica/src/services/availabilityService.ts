import api from "../api";

/**
 * Obtém as datas disponíveis no mês para os serviços e terapeuta selecionados.
 * @param serviceIds Lista de IDs de serviço
 * @param therapistId (opcional) ID do terapeuta para filtro
 * @param month Mês no formato YYYY-MM
 * @param branchId (opcional) ID da filial para filtro
 * @returns Array de objetos { date: string, available: boolean, slots: string[] }
 */
export const getAvailableDates = async (
  serviceIds: string[],
  therapistId?: string,
  month?: string,
  branchId?: string
): Promise<{ date: string; available: boolean; slots: string[] }[]> => {
  const params: Record<string, string> = {
    services: serviceIds.join(","),
  };

  if (therapistId) params.therapistId = therapistId;
  if (month) params.month = month; // ex: "2024-08"
  if (branchId) params.branchId = branchId;

  const response = await api.get("/appointments/availability", { params });
  return response.data;
};

/**
 * Obtém os horários disponíveis em uma data específica para os serviços e terapeuta selecionados.
 * @param serviceIds Lista de IDs de serviço
 * @param therapistId (opcional) ID do terapeuta para filtro
 * @param date Data no formato YYYY-MM-DD
 * @param branchId (opcional) ID da filial para filtro
 * @returns Array de strings representando horários, ex: ["07:00", "07:30"]
 */
export const getAvailableSlots = async (
  serviceIds: string[],
  therapistId: string | undefined,
  date: string,
  branchId?: string
): Promise<string[]> => {
  const params: Record<string, string> = {
    services: serviceIds.join(","),
    date,
  };

  if (therapistId) params.therapistId = therapistId;
  if (branchId) params.branchId = branchId;

  const response = await api.get("/appointments/availability/slots", { params });
  return response.data;
};

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  therapistId?: string;
  therapistName?: string;
}

export interface TherapistAvailability {
  therapistId: string;
  date: string;
  availableSlots: string[];
  busySlots: string[];
  workSchedule?: {
    start: string;
    end: string;
  };
}

// Buscar disponibilidade de um terapeuta específico
export const getTherapistAvailability = async (
  therapistId: string,
  date: string,
  serviceId?: string,
  branchId?: string
): Promise<TherapistAvailability> => {
  try {
    // Usar a rota específica do terapeuta para obter disponibilidade real
    const params: Record<string, string> = { date };
    if (branchId) params.branchId = branchId;
    
    const response = await api.get(`/therapists/${therapistId}/availability`, { params });
    
    const { available, slots = [], workHours = [], reason } = response.data;
    
    // Se não está disponível, retornar slots vazios e sem workSchedule
    if (!available) {
      return {
        therapistId,
        date,
        availableSlots: [],
        busySlots: [],
        workSchedule: undefined // Não definir workSchedule quando não há disponibilidade
      };
    }
    
    // Se há múltiplos horários de trabalho, pegar o primeiro
    const workSchedule = workHours.length > 0 ? workHours[0] : { start: '08:00', end: '18:00' };
    
    return {
      therapistId,
      date,
      availableSlots: slots,
      busySlots: [],
      workSchedule
    };
  } catch (error) {
    // Em caso de erro, retornar estrutura vazia
    return {
      therapistId,
      date,
      availableSlots: [],
      busySlots: [],
      workSchedule: undefined // Não definir workSchedule em caso de erro
    };
  }
};

// Buscar slots disponíveis detalhados para um serviço em uma data
export const getDetailedAvailableSlots = async (
  date: string,
  serviceId: string,
  branchId?: string,
  therapistId?: string
): Promise<AvailabilitySlot[]> => {
  try {
    const params = new URLSearchParams({
      date,
      serviceId,
      ...(branchId && { branchId }),
      ...(therapistId && { therapistId })
    });

    const response = await api.get(`/appointments/availability/slots?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar disponibilidade de múltiplos terapeutas
export const getMultipleTherapistsAvailability = async (
  therapistIds: string[],
  date: string,
  serviceId?: string,
  branchId?: string
): Promise<TherapistAvailability[]> => {
  try {
    const promises = therapistIds.map(id =>
      getTherapistAvailability(id, date, serviceId, branchId)
    );
    
    const results = await Promise.allSettled(promises);
    
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<TherapistAvailability>).value);
  } catch (error) {
    throw error;
  }
};

// Buscar próximas datas disponíveis para um terapeuta
export const getNextAvailableDates = async (
  therapistId: string,
  serviceId: string,
  startDate: string,
  daysToCheck: number = 30,
  branchId?: string
): Promise<string[]> => {
  try {
    const params = new URLSearchParams({
      therapistId,
      serviceId,
      startDate,
      daysToCheck: daysToCheck.toString(),
      ...(branchId && { branchId })
    });

    const response = await api.get(`/appointments/availability/next-dates?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verificar se um horário específico está disponível
export const checkSlotAvailability = async (
  therapistId: string,
  date: string,
  startTime: string,
  endTime: string,
  branchId?: string,
  excludeAppointmentId?: string
): Promise<boolean> => {
  try {
    const params = new URLSearchParams({
      therapistId,
      date,
      startTime,
      endTime,
      ...(branchId && { branchId }),
      ...(excludeAppointmentId && { excludeAppointmentId })
    });

    const response = await api.get(`/appointments/availability/check?${params.toString()}`);
    return response.data.available;
  } catch (error) {
    throw error;
  }
};

// Buscar sugestões de horários alternativos
export const getSuggestedSlots = async (
  therapistId: string,
  date: string,
  preferredTime: string,
  serviceId: string,
  numberOfSuggestions: number = 5,
  branchId?: string
): Promise<AvailabilitySlot[]> => {
  try {
    const params = new URLSearchParams({
      therapistId,
      date,
      preferredTime,
      serviceId,
      numberOfSuggestions: numberOfSuggestions.toString(),
      ...(branchId && { branchId })
    });

    const response = await api.get(`/appointments/availability/suggestions?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar disponibilidade de um terapeuta em todas as filiais
export const getTherapistAvailabilityAcrossBranches = async (
  therapistId: string,
  date: string
): Promise<{
  therapistId: string;
  date: string;
  branches: Array<{
    branchId: string;
    branchName: string;
    available: boolean;
    slots: string[];
    workHours: Array<{ start: string; end: string }>;
  }>;
}> => {
  try {
    const response = await api.get(`/therapists/${therapistId}/availability/all-branches`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ENDPOINT = "/therapists";

// Verificar conflitos entre horários em filiais diferentes
export const checkScheduleConflicts = async (
  therapistId: string, 
  scheduleData: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    branchId: string;
    id?: string;
  }
) => {
  try {
    const response = await api.post(
      `${ENDPOINT}/${therapistId}/schedule/check-conflicts`,
      scheduleData
    );
    return response.data;
  } catch (error: unknown) {
    return { hasConflict: false }; // Em caso de erro, assumimos que não há conflito
  }
};

// Obter a disponibilidade detalhada de um terapeuta em uma filial específica
export const getDetailedTherapistAvailability = async (
  therapistId: string,
  date: string,
  branchId?: string
): Promise<{
  available: boolean;
  reason?: string;
  slots: string[];
  workHours?: Array<{ start: string; end: string }>;
}> => {
  try {
    const params: Record<string, string> = { date };
    if (branchId) params.branchId = branchId;

    const response = await api.get(`/therapists/${therapistId}/availability`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 