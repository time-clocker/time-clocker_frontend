import { useEffect, useMemo, useState } from "react";
import { Card, Title, DonutChart, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Metric, Text, Flex, Divider, Badge, Select, SelectItem } from "@tremor/react";
import { authService } from "../services/auth-service";
import EmployeeEditModal from "../components/employees-edit";
import type { EmployeeData } from "../components/employees-edit";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://time-clocker-backend.onrender.com";
const BAR_COLORS = ["#008037", "#FAC300", "#888AA0", "#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#f97316", "#14b8a6", "#ec4899"];

type GlobalMonthlyRow = {
  employee_id: string;
  full_name: string;
  hours: { diurnal: number; nocturnal: number; extra: number; total: number };
  pay_total: number;
};

type GlobalMonthlyResponse = {
  range?: { from?: string; to?: string; timezone?: string };
  rows: GlobalMonthlyRow[];
  totals?: { hours_total?: number; pay_total?: number };
};

function currency(n: number | undefined) {
  const v = Number(n ?? 0);
  return v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fixed2(n: number | undefined) {
  const v = Number(n ?? 0);
  return v.toFixed(2);
}

export default function AdminDashboard() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [data, setData] = useState<GlobalMonthlyResponse>({ rows: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  async function fetchMonthly() {
    try {
      setLoading(true);
      setError(null);
      setAuthError(null);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...authService.getAuthorizationHeader(),
      };

      if (!headers["Authorization"]) {
        setAuthError("No hay sesión activa. Inicia sesión como administrador.");
        setData({ rows: [] });
        return;
      }

      const res = await fetch(
        `${API_BASE}/reports/global/monthly?year=${year}&month=${month}`,
        { headers }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const json = (await res.json()) as GlobalMonthlyResponse;
      setData(json ?? { rows: [] });
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar datos");
      setData({ rows: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMonthly();
  }, []);

  const handleEmployeeClick = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Función para guardar los cambios del empleado
  const handleSaveEmployee = async (employeeData: EmployeeData) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...authService.getAuthorizationHeader(),
      };

      // Aquí debes implementar la llamada a tu API para actualizar los datos del empleado
      const res = await fetch(`${API_BASE}/employees/${employeeData.employee_id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(employeeData),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar empleado");
      }

      // Actualizar los datos locales
      setData(prev => ({
        ...prev,
        rows: prev.rows.map(row =>
          row.employee_id === employeeData.employee_id ? employeeData : row
        )
      }));

      // También puedes recargar los datos completos
      // fetchMonthly();
    } catch (error) {
      console.error("Error al guardar empleado:", error);
      setError("Error al guardar los cambios del empleado");
    }
  };

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(current - i)); // últimos 6 años
  }, []);
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1)),
    []
  );

  const totalEmployees = data?.rows?.length ?? 0;
  const totalHours = data?.totals?.hours_total ??
    (data?.rows?.reduce((acc, r) => acc + (r.hours?.total ?? 0), 0) ?? 0);
  const totalPay = data?.totals?.pay_total ??
    (data?.rows?.reduce((acc, r) => acc + (r.pay_total ?? 0), 0) ?? 0);

  const hoursDistributionData = (data?.rows ?? []).map(r => ({
    name: r.full_name ?? "—",
    value: r.hours?.total ?? 0,
  }));

  const earningsData = (data?.rows ?? []).map(r => ({
    name: r.full_name ?? "—",
    earnings: r.pay_total ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                📊 Dashboard de Administrador
              </h1>
              <p className="text-gray-600 mt-2">Resumen del rendimiento del equipo</p>
            </div>
            <div className="flex items-end gap-3 mt-2 md:mt-0">
              <div className="flex flex-col min-w-36">
                <label className="text-xs text-gray-600 mb-1">Año</label>
                <Select
                  value={String(year)}
                  onValueChange={(v) => setYear(Number(v))}
                  className="!bg-white !border !border-gray-300 !shadow-sm !transition-colors hover:!bg-yellow-50 focus:!bg-yellow-100"
                >
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y} className="tremor-option-solid">
                      {y}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col min-w-52">
                <label className="text-xs text-gray-600 mb-1">Mes</label>
                <Select
                  value={String(month)}
                  onValueChange={(v) => setMonth(Number(v))}
                  className="!bg-white !border !border-gray-300 !shadow-sm !transition-colors hover:!bg-blue-50 focus:!bg-blue-100"
                >
                  {monthOptions.map((m) => (
                    <SelectItem key={m} value={m} className="tremor-option-solid">
                      {m.toString().padStart(2, "0")} — {new Date(0, Number(m) - 1).toLocaleString(undefined, { month: "long" })}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <button
                onClick={fetchMonthly}
                className="h-10 px-4 rounded-lg bg-pandora-yellow text-white text-sm hover:bg-pandora-yellow-dark transition"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
          </div>
          <Divider />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="blue">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <Text>Total Empleados</Text>
                <Metric className="text-gray-800">{totalEmployees}</Metric>
              </div>
            </Flex>
          </Card>

          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="green">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <Text>Total Horas</Text>
                <Metric className="text-gray-800">{fixed2(totalHours)} hrs</Metric>
              </div>
            </Flex>
          </Card>

          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="violet">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-violet-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <Text>Ganancias Totales</Text>
                <Metric className="text-gray-800">${currency(totalPay)}</Metric>
              </div>
            </Flex>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <Title className="text-lg font-semibold text-gray-800 mb-4">Distribución de Horas por Empleado</Title>
            <DonutChart
              data={hoursDistributionData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} hrs`}
              colors={["green", "blue", "yellow", "orange", "indigo", "violet", "cyan", "pink", "rose"]}
              variant="donut"
              className="h-72"
              showAnimation={true}
              showTooltip={true}
            />
            <div className="mt-4 text-center text-sm text-gray-600">
              Total: {fixed2(totalHours)} horas este mes
            </div>
          </Card>

          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <Title className="text-lg font-semibold text-gray-800 mb-4">
              Ganancias por Empleado
            </Title>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {earningsData.map((item, index) => {
                const max = Math.max(...earningsData.map(i => i.earnings));
                const width = max > 0 ? (item.earnings / max) * 100 : 0;
                const color = BAR_COLORS[index % BAR_COLORS.length];

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate w-32">{item.name}</span>
                    <div className="flex-1 mx-3">
                      <div
                        className="h-4 rounded"
                        style={{
                          width: `${width}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-20 text-right">
                      ${currency(item.earnings)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <Text className="text-gray-600">Total:</Text>
                <Text className="font-semibold">${currency(totalPay)}</Text>
              </div>
            </div>
          </Card>
        </div>
        <Card className="rounded-xl shadow-lg border-0 bg-white">
          <div className="flex flex-col">
            <Title className="text-lg font-semibold text-gray-800 flex-1">
              Totales del mes por empleado (
              {new Date(year, month - 1).toLocaleString(undefined, { month: "long", year: "numeric" })}
              )
            </Title>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 items-center">
            {data?.range?.from && data?.range?.to ? (
              <Badge color="blue">
                Rango: {data.range.from} → {data.range.to}
                {data.range?.timezone ? ` (${data.range.timezone})` : ""}
              </Badge>
            ) : null}
            {authError ? <span className="text-sm text-red-600">{authError}</span> : null}
            {error ? <span className="text-sm text-red-600">Error: {error}</span> : null}
          </div>

          <Table className="mt-5">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Empleado</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Diurna</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Nocturna</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Extra</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Total hrs</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Pago</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6}>Cargando…</TableCell>
                </TableRow>
              )}

              {!loading && data?.rows?.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={6}>Sin datos para este mes.</TableCell>
                </TableRow>
              )}

              {!loading &&
                data?.rows?.map((row) => (
                  <TableRow key={row.employee_id} className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleEmployeeClick(row)}>
                    <TableCell className="font-medium">{row.full_name ?? "—"}</TableCell>
                    <TableCell>{fixed2(row.hours?.diurnal)} hrs</TableCell>
                    <TableCell>{fixed2(row.hours?.nocturnal)} hrs</TableCell>
                    <TableCell>{fixed2(row.hours?.extra)} hrs</TableCell>
                    <TableCell>{fixed2(row.hours?.total)} hrs</TableCell>
                    <TableCell>${currency(row.pay_total)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-between items-center">
            <Text className="text-sm text-gray-600">Mostrando {data?.rows?.length ?? 0} empleados</Text>
            <div className="text-sm text-gray-700">
              {data?.totals ? (
                <>
                  <span className="mr-4">Horas totales: <b>{fixed2(data.totals.hours_total ?? 0)}</b></span>
                  <span>Pago total: <b>${currency(data.totals.pay_total ?? 0)}</b></span>
                </>
              ) : (
                <>
                  <span className="mr-4">Horas totales: <b>{fixed2(totalHours)}</b></span>
                  <span>Pago total: <b>${currency(totalPay)}</b></span>
                </>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Pandora Restaurante, Inc. All rights reserved.</p>
          <p>Desarrollado por JDT Software</p>
        </div>
      </div>
      <EmployeeEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}
