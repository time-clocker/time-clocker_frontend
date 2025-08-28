export interface ClockState {
  isClockedIn: boolean;
  clockInTime: string | null;
  employeeId: string | null;
  lastUpdated: string;
}