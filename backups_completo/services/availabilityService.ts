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