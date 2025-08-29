import { useEffect, useMemo, useState } from "react";
import { Card, Title, DonutChart, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Metric, Text, Flex, Divider, Badge, Select, SelectItem } from "@tremor/react";

import { authService } from "../services/auth-service";
import EmployeeEditModal from "../components/employees-edit";
import { API } from "../constants/auth-service";
import { BAR_COLORS, currency, fixed2 } from "../constants/admin-dashboard";

import { type EmployeeData } from "../types/employees";
import type { GlobalMonthlyResponse } from "../types/admin-dashboard";

export default function AdminDashboard() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [data, setData] = useState<GlobalMonthlyResponse>({ rows: [] });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(current - i));
  }, []);

  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1)), []);

  const fetchMonthly = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(null);

      const headers = {
        "Content-Type": "application/json",
        ...authService.getAuthorizationHeader(),
      };

      if (!headers["Authorization" as keyof typeof headers]) {
        setAuthError("No hay sesión activa. Inicia sesión como administrador.");
        setData({ rows: [] });
        return;
      }

      const res = await fetch(`${API}/reports/global/monthly?year=${year}&month=${month}`, { headers });

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
  };

  useEffect(() => {
    fetchMonthly();
  }, []);

  const totalEmployees = data?.rows?.length ?? 0;
  const totalHours = data?.totals?.hours_total ?? data.rows.reduce((acc, r) => acc + (r.hours?.total ?? 0), 0);
  const totalPay = data?.totals?.pay_total ?? data.rows.reduce((acc, r) => acc + (r.pay_total ?? 0), 0);

  const hoursDistributionData = data.rows.map(r => ({
    name: r.full_name ?? "—",
    value: r.hours?.total ?? 0,
  }));

  const earningsData = data.rows.map(r => ({
    name: r.full_name ?? "—",
    earnings: r.pay_total ?? 0,
  }));

  const handleEmployeeClick = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (employeeData: EmployeeData) => {
    setData(prev => ({
      ...prev,
      rows: prev.rows.map(row =>
        row.employee_id === employeeData.employee_id
          ? { ...row, full_name: employeeData.full_name ?? row.full_name }
          : row
      ),
    }));
    await fetchMonthly();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">📊 Dashboard de Administrador</h1>
              <p className="text-gray-600 mt-2">Resumen del rendimiento del equipo</p>
            </div>
            <div className="flex items-end gap-3 mt-2 md:mt-0">
              <div className="flex flex-col min-w-36">
                <label className="text-xs text-gray-600 mb-1">Año</label>
                <Select
                  value={String(year)}
                  onValueChange={v => setYear(Number(v))}
                  className="!bg-white !border !border-gray-300 !shadow-sm hover:!bg-yellow-50 focus:!bg-yellow-100"
                >
                  {yearOptions.map(y => <SelectItem key={y} value={y} className="tremor-option-solid">{y}</SelectItem>)}
                </Select>
              </div>
              <div className="flex flex-col min-w-52">
                <label className="text-xs text-gray-600 mb-1">Mes</label>
                <Select
                  value={String(month)}
                  onValueChange={v => setMonth(Number(v))}
                  className="!bg-white !border !border-gray-300 !shadow-sm hover:!bg-blue-50 focus:!bg-blue-100"
                >
                  {monthOptions.map(m => (
                    <SelectItem key={m} value={m} className="tremor-option-solid">
                      {m.toString().padStart(2, "0")} — {new Date(0, Number(m) - 1).toLocaleString(undefined, { month: "long" })}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <button
                onClick={fetchMonthly}
                className="h-10 px-4 rounded-lg bg-pandora-yellow text-white hover:bg-pandora-yellow-dark transition"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
          </div>
          <Divider />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard color="blue" icon="👥" title="Total Empleados" value={totalEmployees} />
          <SummaryCard color="green" icon="⏱️" title="Total Horas" value={`${fixed2(totalHours)} hrs`} />
          <SummaryCard color="violet" icon="💰" title="Ganancias Totales" value={`$${currency(totalPay)}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CardChartDonut title="Distribución de Horas por Empleado" data={hoursDistributionData} total={fixed2(totalHours)} />
          <CardBarList title="Ganancias por Empleado" data={earningsData} total={totalPay} />
        </div>

        <EmployeeTable
          data={data}
          loading={loading}
          onRowClick={handleEmployeeClick}
          totalHours={totalHours}
          totalPay={totalPay}
          year={year}
          month={month}
          error={error}
          authError={authError}
        />

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

function SummaryCard({ color, icon, title, value }: { color: string; icon: string; title: string; value: string | number }) {
  return (
    <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor={color}>
      <Flex justifyContent="start" className="space-x-4">
        <div className={`p-3 bg-${color}-100 rounded-lg`}>{icon}</div>
        <div>
          <Text>{title}</Text>
          <Metric className="text-gray-800">{value}</Metric>
        </div>
      </Flex>
    </Card>
  );
}

function CardChartDonut({ title, data, total }: { title: string; data: { name: string; value: number }[]; total: string }) {
  return (
    <Card className="rounded-xl shadow-lg border-0 bg-white">
      <Title className="text-lg font-semibold text-gray-800 mb-4">{title}</Title>
      <DonutChart
        data={data}
        category="value"
        index="name"
        valueFormatter={v => `${v.toFixed(2)} hrs`}
        colors={["green", "blue", "yellow", "orange", "indigo", "violet", "cyan", "pink", "rose"]}
        variant="donut"
        className="h-72"
        showAnimation
        showTooltip
      />
      <div className="mt-4 text-center text-sm text-gray-600">Total: {total} horas este mes</div>
    </Card>
  );
}

function CardBarList({ title, data, total }: { title: string; data: { name: string; earnings: number }[]; total: number }) {
  return (
    <Card className="rounded-xl shadow-lg border-0 bg-white">
      <Title className="text-lg font-semibold text-gray-800 mb-4">{title}</Title>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.map((item, index) => {
          const max = Math.max(...data.map(i => i.earnings));
          const width = max > 0 ? (item.earnings / max) * 100 : 0;
          const color = BAR_COLORS[index % BAR_COLORS.length];
          return (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 truncate w-32">{item.name}</span>
              <div className="flex-1 mx-3">
                <div className="h-4 rounded" style={{ width: `${width}%`, backgroundColor: color }} />
              </div>
              <span className="text-sm text-gray-600 w-20 text-right">${currency(item.earnings)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
        <Text className="text-gray-600">Total:</Text>
        <Text className="font-semibold">${currency(total)}</Text>
      </div>
    </Card>
  );
}

function EmployeeTable({ data, loading, onRowClick, totalHours, totalPay, year, month, error, authError }: {
  data: GlobalMonthlyResponse;
  loading: boolean;
  onRowClick: (employee: EmployeeData) => void;
  totalHours: number;
  totalPay: number;
  year: number;
  month: number;
  error: string | null;
  authError: string | null;
}) {
  return (
    <Card className="rounded-xl shadow-lg border-0 bg-white">
      <Title className="text-lg font-semibold text-gray-800 flex-1">
        Totales del mes por empleado ({new Date(year, month - 1).toLocaleString(undefined, { month: "long", year: "numeric" })})
      </Title>

      <div className="mt-3 flex flex-wrap gap-3 items-center">
        {data.range?.from && data.range?.to && <Badge color="pandora-green">Rango: {data.range.from} → {data.range.to} {data.range.timezone ? `(${data.range.timezone})` : ""}</Badge>}
        {authError && <span className="text-sm text-red-600">{authError}</span>}
        {error && <span className="text-sm text-red-600">Error: {error}</span>}
      </div>

      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="bg-blue-50 text-pandora-green-dark">Empleado</TableHeaderCell>
            <TableHeaderCell className="bg-blue-50 text-pandora-green-dark">Diurna</TableHeaderCell>
            <TableHeaderCell className="bg-blue-50 text-pandora-green-dark">Nocturna</TableHeaderCell>
            <TableHeaderCell className="bg-blue-50 text-pandora-green-dark">Extra</TableHeaderCell>
            <TableHeaderCell className="bg-blue-50 text-pandora-green-dark">Total hrs</TableHeaderCell>
            <TableHeaderCell className="bg-blue-50 text-pandora-green-dark">Pago</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && <TableRow><TableCell colSpan={6}>Cargando…</TableCell></TableRow>}
          {!loading && data.rows.length === 0 && <TableRow><TableCell colSpan={6}>Sin datos para este mes.</TableCell></TableRow>}
          {!loading && data.rows.map(row => (
            <TableRow key={row.employee_id} className="cursor-pointer hover:bg-gray-50" onClick={() => onRowClick({ ...row })}>
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
        <Text className="text-sm text-gray-600">Mostrando {data.rows.length} empleados</Text>
        <div className="text-sm text-gray-700">
          <span className="mr-4">Horas totales: <b>{fixed2(totalHours)}</b></span>
          <span>Pago total: <b>${currency(totalPay)}</b></span>
        </div>
      </div>
    </Card>
  );
}
