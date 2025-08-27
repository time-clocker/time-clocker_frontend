export interface ClockState {
  isClockedIn: boolean;
  clockInTime: string | null;
  employeeId: string | null;
  // Agregar un timestamp para mejor control
  lastUpdated: string;
}

export const clockService = {
  // Guardar estado del clock
  setClockState: (state: ClockState) => {
    const stateWithTimestamp = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('globalClockState', JSON.stringify(stateWithTimestamp));
  },

  // Obtener estado del clock
  getClockState: (): ClockState | null => {
    const stored = localStorage.getItem('globalClockState');
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // Limpiar estado
  clearClockState: () => {
    localStorage.removeItem('globalClockState');
  },

  // Verificar si el estado es válido para un empleado específico
  isValidForEmployee: (state: ClockState, currentEmployeeId: string | null): boolean => {
    if (!state.clockInTime || !state.employeeId || !currentEmployeeId) return false;
    
    // Solo es válido si pertenece al mismo empleado
    if (state.employeeId !== currentEmployeeId) return false;
    
    const clockInDate = new Date(state.clockInTime);
    const now = new Date();
    
    // Verificar que la fecha sea válida
    if (isNaN(clockInDate.getTime())) return false;
    
    // Considerar válido solo si fue hoy
    const isToday = clockInDate.toDateString() === now.toDateString();
    
    return isToday && state.isClockedIn === true;
  },

  // Limpiar estado si pertenece a un empleado diferente
  clearIfNotCurrentEmployee: (currentEmployeeId: string | null) => {
    const storedState = clockService.getClockState();
    if (storedState && storedState.employeeId !== currentEmployeeId) {
      clockService.clearClockState();
    }
  }
};