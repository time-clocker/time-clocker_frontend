import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { toast } from "react-toastify";
import { employeeService } from "../services/employee-service";
import { ConfirmDialog } from "./messages/confirm-dialog";

export interface EmployeeData {
    employee_id: string;
    full_name: string;
    hours: { diurnal: number; nocturnal: number; extra: number; total: number };
    pay_total: number;
}

interface EmployeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: EmployeeData | null;
    onSave: (employeeData: EmployeeData) => void;
    onDelete?: (employeeId: string) => void;
}

export default function EmployeeEdit({ isOpen, onClose, employee, onSave }: EmployeeEditModalProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<EmployeeData>({
        employee_id: '',
        full_name: '',
        hours: { diurnal: 0, nocturnal: 0, extra: 0, total: 0 },
        pay_total: 0
    });

    useEffect(() => {
        if (employee) {
            setFormData(employee);
        }
    }, [employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('hours.')) {
            const hourType = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                hours: {
                    ...prev.hours,
                    [hourType]: parseFloat(value) || 0
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'pay_total' ? parseFloat(value) || 0 : value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleDelete = async () => {
        if (!employee) return;
        try {
            await employeeService.deleteEmployee(employee.employee_id);
            toast.success("Empleado eliminado correctamente");
            setConfirmOpen(false);
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || "Error eliminando empleado");
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 border-b pb-2"
                                >
                                    Gestion de Empleado
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre completo
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pandora-green"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Horas diurnas
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="hours.diurnal"
                                                value={formData.hours.diurnal}
                                                onChange={handleChange}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pandora-green"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Horas nocturnas
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="hours.nocturnal"
                                                value={formData.hours.nocturnal}
                                                onChange={handleChange}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pandora-green"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Horas extra
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="hours.extra"
                                                value={formData.hours.extra}
                                                onChange={handleChange}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pandora-green"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pago total
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="pay_total"
                                                value={formData.pay_total}
                                                onChange={handleChange}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pandora-green"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmOpen(true)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                        >
                                            Eliminar
                                        </button>

                                        <ConfirmDialog
                                            isOpen={confirmOpen}
                                            title="Eliminar empleado"
                                            message={`¿Seguro que deseas eliminar a ${employee?.full_name}? Esta acción no se puede deshacer.`}
                                            onCancel={() => setConfirmOpen(false)}
                                            onConfirm={handleDelete}
                                        />

                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm font-medium text-white bg-pandora-green rounded-md hover:bg-pandora-green-dark focus:outline-none focus:ring-2 focus:ring-pandora-green"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}