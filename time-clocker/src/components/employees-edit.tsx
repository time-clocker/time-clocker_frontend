import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "react-toastify";

import { employeeService } from "../services/employee-service";
import { ConfirmDialog } from "./messages/confirm-dialog";
import type { EmployeeData, EmployeeEditModalProps } from "../types/employees";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 " +
  "focus:outline-none focus:ring-2 focus:ring-pandora-green";

const buttonBase =
  "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2";

const buttonVariants = {
  danger: `${buttonBase} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`,
  cancel: `${buttonBase} text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500`,
  primary: `${buttonBase} text-white bg-pandora-green hover:bg-pandora-green-dark focus:ring-pandora-green`,
};

const FormField = ({
  label,
  name,
  type = "text",
  step,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      step={step}
      name={name}
      value={value}
      onChange={onChange}
      className={inputClass}
    />
  </div>
);

export default function EmployeeEdit({
  isOpen,
  onClose,
  employee,
  onSave,
}: EmployeeEditModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<EmployeeData>({
    employee_id: "",
    full_name: "",
    hours: { diurnal: 0, nocturnal: 0, extra: 0, total: 0 },
    pay_total: 0,
  });

  useEffect(() => {
    if (employee) setFormData(employee);
  }, [employee]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("hours.")) {
      const hourType = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        hours: { ...prev.hours, [hourType]: parseFloat(value) || 0 },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "pay_total" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
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

  const fields = [
    { label: "Nombre completo", name: "full_name" },
    [
      { label: "Horas diurnas", name: "hours.diurnal", type: "number", step: "0.01" },
      { label: "Horas nocturnas", name: "hours.nocturnal", type: "number", step: "0.01" },
    ],
    [
      { label: "Horas extra", name: "hours.extra", type: "number", step: "0.01" },
      { label: "Pago total", name: "pay_total", type: "number", step: "0.01" },
    ],
  ];

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden 
                                        rounded-2xl bg-white p-6 text-left 
                                        align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                  Gestión de Empleado
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">

                  {fields.map((row, i) =>
                    Array.isArray(row) ? (
                      <div key={i} className="grid grid-cols-2 gap-4">
                        {row.map((field) => (
                          <FormField
                            key={field.name}
                            {...field}
                            value={
                              field.name.startsWith("hours.")
                                ? (formData.hours as any)[field.name.split(".")[1]]
                                : (formData as any)[field.name]
                            }
                            onChange={handleChange}
                          />
                        ))}
                      </div>
                    ) : (
                      <FormField
                        key={row.name}
                        {...row}
                        value={(formData as any)[row.name]}
                        onChange={handleChange}
                      />
                    )
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={() => setConfirmOpen(true)}
                      className={buttonVariants.danger}
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
                      <button type="button" onClick={onClose} className={buttonVariants.cancel}>
                        Cancelar
                      </button>
                      <button type="submit" className={buttonVariants.primary}>
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
