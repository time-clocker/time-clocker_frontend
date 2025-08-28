export interface EmployeeData {
    employee_id: string;
    full_name: string;
    hours: { diurnal: number; nocturnal: number; extra: number; total: number };
    pay_total: number;
}

export interface EmployeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: EmployeeData | null;
    onSave: (employeeData: EmployeeData) => void;
    onDelete?: (employeeId: string) => void;
}