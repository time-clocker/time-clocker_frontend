import type { ClockState } from "../types/clock-service";

export const clockService = {
  setClockState: (state: ClockState) => {
    const stateWithTimestamp = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('globalClockState', JSON.stringify(stateWithTimestamp));
  },

  getClockState: (): ClockState | null => {
    const stored = localStorage.getItem('globalClockState');
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  clearClockState: () => {
    localStorage.removeItem('globalClockState');
  },

  isValidForEmployee: (state: ClockState, currentEmployeeId: string | null): boolean => {
    if (!state.clockInTime || !state.employeeId || !currentEmployeeId) return false;
    
    if (state.employeeId !== currentEmployeeId) return false;
    
    const clockInDate = new Date(state.clockInTime);
    const now = new Date();
    
    if (isNaN(clockInDate.getTime())) return false;
    
    const isToday = clockInDate.toDateString() === now.toDateString();
    
    return isToday && state.isClockedIn === true;
  },

  clearIfNotCurrentEmployee: (currentEmployeeId: string | null) => {
    const storedState = clockService.getClockState();
    if (storedState && storedState.employeeId !== currentEmployeeId) {
      clockService.clearClockState();
    }
  }
};