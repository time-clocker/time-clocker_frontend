import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { toast } from "react-toastify";

import type { EmployeeData, EmployeeEditModalProps } from "../types/employees";
import { employeeService } from "../services/employee-service";
import { ConfirmDialog } from "./messages/confirm-dialog";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Pdf from "./pdf";

export default function EmployeeEdit({ isOpen, onClose, employee, onSave }: EmployeeEditModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<Required<Pick<EmployeeData, 'full_name'>> & {
    email: string;
    document_number: string;
    hourly_rate: number;
  }>({
    full_name: '',
    email: '',
    document_number: '',
    hourly_rate: 0
  });

  const [original, setOriginal] = useState<typeof form | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !employee?.employee_id) return;
      setIsLoading(true);
      try {
        const data = await employeeService.getEmployee(employee.employee_id);
        const loaded = {
          full_name: data.full_name ?? employee.full_name ?? '',
          email: data.email ?? '',
          document_number: (data.document_number ?? '') as string,
          hourly_rate: Number(data.hourly_rate ?? 0),
        };
        setForm(loaded);
        setOriginal(loaded);
      } catch (e: any) {

        setForm(prev => ({
          ...prev,
          full_name: employee?.full_name ?? prev.full_name,
        }));
        toast.warn(e?.message ?? "No se pudieron cargar los datos del empleado.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      load();
    } else {
      setForm({ full_name: '', email: '', document_number: '', hourly_rate: 0 });
      setOriginal(null);
      setIsLoading(false);
      setIsSaving(false);
      setConfirmOpen(false);
    }
  }, [isOpen, employee?.employee_id, employee?.full_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'hourly_rate') {
      const n = Number(value);
      setForm(prev => ({ ...prev, hourly_rate: Number.isFinite(n) ? n : 0 }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const buildPatchPayload = () => {
    if (!original) return {};
    const payload: Record<string, unknown> = {};
    if (form.full_name !== original.full_name) payload.full_name = form.full_name;
    if (form.email !== original.email) payload.email = form.email;
    if (form.hourly_rate !== original.hourly_rate) payload.hourly_rate = form.hourly_rate;
    if (form.document_number !== original.document_number) {
      payload.document_number = form.document_number || null;
    }
    return payload;
  };

  const hasChanges = useMemo(() => {
    return original ? Object.keys(buildPatchPayload()).length > 0 : false;
  }, [form, original]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.employee_id) return;

    const payload = buildPatchPayload();
    if (Object.keys(payload).length === 0) {
      toast.info("No hay cambios para guardar.");
      onClose();
      return;
    }

    try {
      setIsSaving(true);

      const updated = await employeeService.updateEmployee(employee.employee_id, payload);
      toast.success("Empleado actualizado correctamente.");

      onSave?.({
        employee_id: updated.id ?? employee.employee_id,
        full_name: updated.full_name ?? form.full_name,
        email: updated.email ?? form.email,
        document_number: (updated.document_number ?? form.document_number) as string,
        hourly_rate: Number(updated.hourly_rate ?? form.hourly_rate),
      });

      onClose();
    } catch (error: any) {
      toast.error(error?.message ?? "Error al actualizar el empleado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!employee?.employee_id) return;
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
      <Dialog as="div" className="relative z-50" onClose={() => (!isSaving ? onClose() : null)}>
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
                  Gestión de Empleado
                  {form.full_name && (
                    <span className="block text-xs text-gray-500 mt-1">{form.full_name}</span>
                  )}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <fieldset disabled={isLoading || isSaving} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pandora-green"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pandora-green"
                        placeholder="nombre@correo.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tarifa por hora
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          name="hourly_rate"
                          value={form.hourly_rate}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pandora-green"
                          placeholder="15000"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-end">
                      <PDFDownloadLink
                        document={
                          <Pdf
                            employee={{
                              full_name: form.full_name || employee?.full_name || "—",
                              email: form.email || employee?.email,
                              document_number: form.document_number || employee?.document_number,
                              hourly_rate: form.hourly_rate || employee?.hourly_rate,
                            }}
                            summary={{
                              hours: {
                                diurnal: employee?.hours?.diurnal,
                                nocturnal: employee?.hours?.nocturnal,
                                extra: employee?.hours?.extra,
                                total: employee?.hours?.total,
                              },
                              pay_total: employee?.pay_total,
                            }}
                            reportMeta={{
                              monthLabel: new Date().toLocaleString(undefined, { month: "long", year: "numeric" }),
                              generatedBy: "Administrador",
                            }}
                          />
                        }
                        fileName={`reporte-${(form.full_name || employee?.full_name || "empleado")
                          .toLowerCase()
                          .replace(/\s+/g, "-")}.pdf`}
                      >
                        {({ loading }) => (
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {loading ? "Generando..." : "Imprimir reporte"}
                          </button>
                        )}
                      </PDFDownloadLink>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-60"
                        disabled={isSaving || isLoading}
                      >
                        Eliminar
                      </button>

                      <ConfirmDialog
                        isOpen={confirmOpen}
                        title="Eliminar empleado"
                        message={`¿Seguro que deseas eliminar a ${form.full_name || employee?.full_name || 'este empleado'}? Esta acción no se puede deshacer.`}
                        onCancel={() => setConfirmOpen(false)}
                        onConfirm={handleDelete}
                      />

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          disabled={isSaving}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-pandora-green rounded-md hover:bg-pandora-green-dark focus:outline-none focus:ring-2 focus:ring-pandora-green disabled:opacity-60"
                          disabled={isSaving || isLoading || !hasChanges}
                        >
                          {isSaving ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
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
