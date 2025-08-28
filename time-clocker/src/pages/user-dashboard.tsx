import { Card, Title, DonutChart, Flex, Button, Metric, Text, Divider, Select, SelectItem, DatePicker } from "@tremor/react";
import { useEffect, useMemo, useState } from "react";
import { authService } from "../services/auth-service";
import { clockService } from "../services/clock-service";

const TZ = "America/Bogota";
const API_BASE = import.meta.env.VITE_API_BASE ?? "https://time-clocker-backend.onrender.com";

const moneyCO = (n: number) => (n ?? 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const BAR_COLORS = ["#008037", "#E0AF00", "#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#f97316", "#14b8a6", "#ec4899"];

function monthNameLong(m1: number) {
  return new Date(0, m1 - 1).toLocaleString("es-CO", { month: "long" });
}
function firstSundayOfWeek(ref: Date) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function todayLocal() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseAsLocalDate(raw: string): Date {
  if (!raw) return new Date(NaN);
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
  return new Date(raw);
}
const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysDiff = (a: Date, b: Date) =>
  Math.floor((stripTime(a).getTime() - stripTime(b).getTime()) / 86400000);

type AnyObj = Record<string, any>;
type EmployeeReport = AnyObj;

export default function UserDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  const [refDate, setRefDate] = useState<string>(() => todayLocal());

  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [donutMonth, setDonutMonth] = useState<number>(today.getMonth() + 1); // 1..12

  const [userName, setUserName] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeRate, setEmployeeRate] = useState<number>(0);

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [, setLoadingReport] = useState(false);
  const [loadingClock, setLoadingClock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reportes
  const [report, setReport] = useState<EmployeeReport | null>(null);
  const [donutMonthReport, setDonutMonthReport] = useState<EmployeeReport | null>(null);

  /* --- Perfil --- */
  useEffect(() => {
    (async () => {
      try {
        const cached = authService.getUserData?.();
        let profile = cached;
        if (!profile) {
          profile = await authService.getEmployeeProfile();
          if (profile) localStorage.setItem("userData", JSON.stringify(profile));
        }
        if (profile) {
          setUserName(profile.full_name ?? profile.email ?? "Usuario");
          setEmployeeId(profile.id ?? profile.employee_id ?? null);
          const r = Number(profile.hourly_rate ?? profile.rate ?? 0);
          setEmployeeRate(isFinite(r) ? r : 0);
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    if (!employeeId) return;

    clockService.clearIfNotCurrentEmployee(employeeId);

    (async () => {
      try {
        const token = authService.getToken?.();
        if (!token) return;

        // Verificar estado guardado después de la limpieza
        const storedState = clockService.getClockState();

        // Si hay estado válido para este empleado, usarlo
        if (storedState && clockService.isValidForEmployee(storedState, employeeId)) {
          setIsClockedIn(storedState.isClockedIn);
          return;
        }

        // Consultar al servidor para el estado actual
        const r = await fetch(`${API_BASE}/time-entries/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!r.ok) {
          setIsClockedIn(false);
          return;
        }

        const st = await r.json();
        const clockedIn = !!st?.clocked_in;

        setIsClockedIn(clockedIn);

        // Actualizar el estado local
        if (clockedIn) {
          clockService.setClockState({
            isClockedIn: true,
            clockInTime: new Date().toISOString(),
            employeeId,
            lastUpdated: ""
          });
        } else {
          clockService.clearClockState();
        }

      } catch (error) {
        console.error('Error checking clock status:', error);
        setIsClockedIn(false);
      }
    })();
  }, [employeeId]);

  useEffect(() => {
    if (!employeeId) return;
    const ac = new AbortController();
    (async () => {
      setLoadingReport(true);
      setError(null);
      try {
        const token = authService.getToken?.();
        if (!token) throw new Error("No authentication token found");

        let url = `${API_BASE}/reports/employee/${employeeId}`;
        if (timeRange === "week") {
          const refIso = `${refDate}T00:00:00`;
          const qs = new URLSearchParams({ timezone: TZ, ref_date: refIso });
          url += `/weekly?${qs.toString()}`;
        } else {
          const qs = new URLSearchParams({ year: String(year), timezone: TZ });
          url += `/yearly?${qs.toString()}`;
        }

        const resp = await fetch(url, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: ac.signal,
        });
        if (!resp.ok) {
          if (resp.status === 401) throw new Error("Autenticación fallida. Inicia sesión de nuevo.");
          throw new Error(`Error del servidor: ${resp.status}`);
        }
        const data: EmployeeReport = await resp.json();
        setReport(data);

        const r = Number(data?.employee?.hourly_rate ?? data?.employee?.rate ?? employeeRate);
        if (isFinite(r) && r > 0) setEmployeeRate(r);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message ?? "Ocurrió un error desconocido");
          setReport(null);
        }
      } finally {
        setLoadingReport(false);
      }
    })();
    return () => ac.abort();
  }, [employeeId, timeRange, refDate, year]);

  useEffect(() => {
    if (!employeeId || timeRange !== "month" || !donutMonth) {
      setDonutMonthReport(null);
      return;
    }
    const ac = new AbortController();
    (async () => {
      try {
        const token = authService.getToken?.();
        if (!token) throw new Error("No authentication token found");
        const qs = new URLSearchParams({
          year: String(year),
          month: String(donutMonth),
          timezone: TZ,
        });
        const url = `${API_BASE}/reports/employee/${employeeId}/monthly?${qs.toString()}`;
        const resp = await fetch(url, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: ac.signal,
        });
        if (!resp.ok) { setDonutMonthReport(null); return; }
        const data: EmployeeReport = await resp.json();
        setDonutMonthReport(data);
      } catch (e: any) {
        if (e?.name !== "AbortError") setDonutMonthReport(null);
      }
    })();
    return () => ac.abort();
  }, [employeeId, timeRange, year, donutMonth]);

  useEffect(() => {
    if (employeeId) {
      clockService.clearIfNotCurrentEmployee(employeeId);
    }
  }, [employeeId]);

  // Efecto para limpiar estado obsoleto al cargar el componente
  useEffect(() => {
    const storedState = clockService.getClockState();
    if (storedState) {
      const clockInDate = new Date(storedState.clockInTime || '');
      const now = new Date();
      const isToday = clockInDate.toDateString() === now.toDateString();

      // Limpiar si no es de hoy
      if (!isToday) {
        clockService.clearClockState();
        setIsClockedIn(false);
      }
    }
  }, []);

  const rawSeries = useMemo(() => {
    if (!report) return [] as AnyObj[];
    const candidates: AnyObj[] = [];
    const pushIf = (v: any) => {
      if (!v) return;
      if (Array.isArray(v)) { if (v.length) candidates.push(v); }
      else if (typeof v === "object" && Object.keys(v).length) candidates.push(v);
    };
    pushIf(report.bars);
    pushIf(report.days);
    pushIf(report.daily);
    pushIf(report.series);
    pushIf(report.data);
    pushIf(report.by_day);
    pushIf(report.by_date);
    pushIf(report.months);
    pushIf(report.by_month);
    pushIf(report.bar_by_day);

    let rows: AnyObj[] = [];
    for (const c of candidates) {
      if (Array.isArray(c)) { rows = c; break; }
      if (typeof c === "object") {
        rows = Object.entries(c).map(([k, v]: any) => ({ ...(v || {}), date: k }));
        break;
      }
    }
    return rows;
  }, [report]);

  const rawEntries = useMemo(() => {
    const entries = (report?.entries ?? report?.time_entries ?? []) as any[];
    return Array.isArray(entries) ? entries : [];
  }, [report]);

  const barWeekly = useMemo(() => {
    const ref = new Date(refDate + "T00:00:00");
    const weekStart = stripTime(firstSundayOfWeek(ref));
    const base = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return { label: DAYS_ES[i], _date: d, hours: 0, pay_total: 0 };
    });

    let usedSeries = false;

    for (const r of rawSeries) {
      const raw = r?.date ?? r?.day ?? r?.ts ?? r?.label;
      if (!raw) continue;
      const d = parseAsLocalDate(raw);
      if (isNaN(d.getTime())) continue;

      const idx = daysDiff(d, weekStart);
      if (idx < 0 || idx > 6) continue;

      const hours = Number(
        r?.hours ?? r?.total ?? r?.hours_total ??
        (r?.diurnal ?? 0) + (r?.nocturnal ?? 0) + (r?.extra ?? 0)
      ) || 0;

      base[idx].hours += hours;
      if (Number.isFinite(r?.pay_total)) base[idx].pay_total += Number(r.pay_total);
      usedSeries = true;
    }
    if (!usedSeries && rawEntries.length) {
      const msPerDay = 24 * 60 * 60 * 1000;
      for (const e of rawEntries) {
        const ci = new Date(e?.clock_in ?? e?.start_time ?? e?.start);
        const co = new Date(e?.clock_out ?? e?.end_time ?? e?.end);
        if (!ci || !co || isNaN(ci.getTime()) || isNaN(co.getTime())) continue;

        let start = ci.getTime();
        let end = Math.max(co.getTime(), start);

        while (start < end) {
          const startDate = new Date(start);
          const dayStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
          const nextMidnight = dayStart + msPerDay;
          const segmentEnd = Math.min(end, nextMidnight);

          const idx = daysDiff(new Date(dayStart), weekStart);
          const hours = Math.max(0, (segmentEnd - start) / 36e5);

          if (idx >= 0 && idx <= 6) base[idx].hours += hours;

          start = segmentEnd;
        }
      }
    }

    return base.map(({ label, hours, pay_total }) => ({
      label,
      hours: Number(hours.toFixed(2)),
      pay_total: Number(pay_total || 0),
    }));
  }, [rawSeries, rawEntries, refDate]);

  const barYear = useMemo(() => {
    const base = MONTHS_SHORT.map((m) => ({ label: m, hours: 0 }));
    for (const r of rawSeries) {
      let mIndex = -1;
      if (typeof r?.month === "number") {
        mIndex = r.month - 1;
      } else {
        const raw = r?.date ?? r?.label ?? r?.ts;
        if (raw) {
          const d = parseAsLocalDate(raw);
          if (!isNaN(d.getTime()) && (!r?.year || Number(r?.year) === year)) mIndex = d.getMonth();
        }
      }
      if (mIndex < 0 || mIndex > 11) continue;
      const hours = Number(
        r?.hours ?? r?.total ?? r?.hours_total ??
        (r?.diurnal ?? 0) + (r?.nocturnal ?? 0) + (r?.extra ?? 0)
      ) || 0;
      base[mIndex].hours += hours;
    }
    return base.map(r => ({ ...r, hours: Number(r.hours.toFixed(2)) }));
  }, [rawSeries, year]);

  const donutData = useMemo(() => {
    const extract = (rep: EmployeeReport | null) => {
      if (!rep) return { diurnal: 0, nocturnal: 0, extra: 0, total: 0 };
      const src = rep?.pie_hours ?? rep?.totals?.hours ?? {};
      const diurnal = Number(src?.diurnal ?? 0);
      const nocturnal = Number(src?.nocturnal ?? 0);
      const extra = Number(src?.extra ?? 0);
      const total =
        Number(rep?.pie_hours?.total ?? rep?.totals?.hours_total ?? diurnal + nocturnal + extra);
      return { diurnal, nocturnal, extra, total };
    };

    if (timeRange === "week") {
      const { diurnal, nocturnal, extra, total } = extract(report);
      const parts = [
        { name: "Diurnas", value: diurnal },
        { name: "Nocturnas", value: nocturnal },
        { name: "Extra", value: extra },
      ].filter(p => p.value > 0);
      return parts.length ? parts : (total > 0 ? [{ name: "Horas", value: total }] : []);
    }

    const { diurnal, nocturnal, extra, total } = extract(donutMonthReport);
    const parts = [
      { name: "Diurnas", value: diurnal },
      { name: "Nocturnas", value: nocturnal },
      { name: "Extra", value: extra },
    ].filter(p => p.value > 0);
    return parts.length ? parts : (total > 0 ? [{ name: "Horas", value: total }] : []);
  }, [timeRange, report, donutMonthReport]);

  const headTotals = useMemo(() => {
    const t = report?.totals ?? {};
    const hours_total =
      Number.isFinite(t?.hours_total) ? Number(t.hours_total)
        : Number.isFinite(t?.hours?.total) ? Number(t.hours.total)
          : 0;
    const pay_total = Number.isFinite(t?.pay_total) ? Number(t.pay_total) : 0;
    return { hours_total, pay_total };
  }, [report]);

  const barData = timeRange === "week" ? barWeekly : barYear;
  const totalHoursFromBars = barData.reduce((a, r: any) => a + (Number(r.hours) || 0), 0);

  const monthTotals = useMemo(() => {
    const t = donutMonthReport?.totals ?? {};
    return {
      hours_total: Number(donutMonthReport?.pie_hours?.total ?? t?.hours_total ?? 0) || 0,
      pay_total: Number(t?.pay_total ?? 0) || 0,
    };
  }, [donutMonthReport]);

  const totalHours =
    timeRange === "month"
      ? monthTotals.hours_total
      : (headTotals.hours_total && headTotals.hours_total > 0
        ? headTotals.hours_total
        : totalHoursFromBars);

  const totalEarnings =
    timeRange === "month"
      ? monthTotals.pay_total
      : Number(headTotals.pay_total) || 0;

  const avgHourlyRate = employeeRate || Number(report?.employee?.hourly_rate ?? 0) || 0;

  const clockIn = async () => {
    setLoadingClock(true);
    setError(null);

    try {
      const token = authService.getToken?.();
      if (!token) throw new Error("No authentication token found");

      const r = await fetch(`${API_BASE}/time-entries/clock-in`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tz: TZ }),
      });

      if (!r.ok) throw new Error(`Error ${r.status}`);

      setIsClockedIn(true);

      clockService.setClockState({
        isClockedIn: true,
        clockInTime: new Date().toISOString(),
        employeeId,
        lastUpdated: ""
      });

    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoadingClock(false);
    }
  };

  const clockOut = async () => {
    setLoadingClock(true);
    setError(null);

    try {
      const token = authService.getToken?.();
      if (!token) throw new Error("No authentication token found");

      const r = await fetch(`${API_BASE}/time-entries/clock-out`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });

      if (!r.ok) throw new Error(`Error ${r.status}`);

      setIsClockedIn(false);
      clockService.clearClockState();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoadingClock(false);
    }
  };

  const formatUserName = (name: string | null) => {
    if (!name || name === "Usuario") return "Usuario";

    const parts = name.split(' ');
    if (parts.length <= 2) return name;
    return (
      <>
        <div>{parts.slice(0, 2).join(' ')}</div>
        <div>{parts.slice(2).join(' ')}</div>
      </>
    );
  };

  const barWeeklyForBarList = useMemo(() => {
    return barWeekly.map((item, index) => ({
      name: item.label,
      value: item.hours,
      color: BAR_COLORS[index % BAR_COLORS.length]
    }));
  }, [barWeekly]);

  const barYearForBarList = useMemo(() => {
    return barYear.map((item, index) => ({
      name: item.label,
      value: item.hours,
      color: BAR_COLORS[index % BAR_COLORS.length]
    }));
  }, [barYear]);

  const btnBase = "rounded-lg transition-all duration-300 hover:scale-105";
  const active = "bg-pandora-yellow hover:bg-pandora-yellow-dark text-white hover:scale-105";
  const inactive = "bg-white border border-gray-300 text-gray-800";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>

              <div>
                <h1 className="text-3xl font-bold text-gray-800">Panel de Usuario</h1>
                <p className="text-gray-600 mt-2">
                  {error ? (
                    <span className="text-red-600">{error}</span>
                  ) : (
                    "Resumen de tu actividad y ganancias"
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={clockIn}
                  disabled={isClockedIn || loadingClock}
                  loading={loadingClock && !isClockedIn}
                  className={`w-full sm:w-auto bg-pandora-yellow rounded-lg transition-all duration-300 hover:scale-105 ${isClockedIn ? "opacity-70" : ""}`}
                >
                  {isClockedIn ? "Registro Iniciado" : "Clock-In"}
                </Button>
                <Button
                  size="lg"
                  onClick={clockOut}
                  disabled={!isClockedIn || loadingClock}
                  loading={loadingClock && isClockedIn}
                  className={`w-full sm:w-auto bg-pandora-yellow rounded-lg transition-all duration-300 hover:scale-105 ${!isClockedIn ? "opacity-70" : ""}`}
                >
                  Clock-Out
                </Button>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-sm font-medium text-gray-700">Bienvenido</p>
                <div className="text-lg font-semibold text-gray-900">
                  {formatUserName(userName)}
                </div>
              </div>
            </div>
          </div>
          <Divider />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="blue">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <Text>Total Horas</Text>
                <Metric className="text-gray-800">{(totalHours || 0).toFixed(2)} hrs</Metric>
              </div>
            </Flex>
          </Card>

          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="green">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <Text>Ganancias Totales</Text>
                <Metric className="text-gray-800">${moneyCO(totalEarnings)}</Metric>
              </div>
            </Flex>
          </Card>

          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="violet">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-violet-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <Text>Tarifa Promedio</Text>
                <Metric className="text-gray-800">${(isFinite(avgHourlyRate) ? avgHourlyRate : 0).toFixed(2)}/hr</Metric>
              </div>
            </Flex>
          </Card>
        </div>

        <Card className="rounded-xl shadow-lg border-0 bg-white mb-8">
          <Title className="text-lg font-semibold text-gray-800 mb-4">Seleccionar Rango de Tiempo</Title>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <Flex justifyContent="start" className="gap-4">
              <button
                onClick={() => setTimeRange("week")}
                className={`${btnBase} px-5 py-2 ${timeRange === "week" ? active : inactive}`}
              >
                Semanal
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`${btnBase} px-5 py-2 ${timeRange === "month" ? active : inactive}`}
              >
                Mensual
              </button>
            </Flex>
            <Card className="flex flex-col gap-2 p-3 rounded-lg shadow-sm border-0 bg-white">
              {timeRange === "week" ? (
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Fecha de referencia (semana dom–sáb)</label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm hover:bg-blue-50 focus:bg-blue-100 outline-none"
                    value={refDate}
                    onChange={(e) => setRefDate(e.target.value)}
                    max={todayLocal()}
                  />
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="flex flex-col min-w-36">
                    <label className="text-xs text-gray-600 mb-1">Año</label>
                    <Select
                      value={String(year)}
                      onValueChange={(v) => setYear(Number(v))}
                      className="!bg-white !border !border-gray-300 !shadow-sm !transition-colors hover:!bg-blue-50 focus:!bg-blue-100"
                    >
                      {Array.from({ length: 6 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={y} value={String(y)} className="tremor-option-solid">
                            {y}
                          </SelectItem>
                        );
                      })}
                    </Select>
                  </div>
                  <div className="flex flex-col min-w-44">
                    <label className="text-xs text-gray-600 mb-1">Mes (solo pastel)</label>
                    <Select
                      value={String(donutMonth)}
                      onValueChange={(v) => setDonutMonth(Number(v))}
                      className="!bg-white !border !border-gray-300 !shadow-sm !transition-colors hover:!bg-blue-50 focus:!bg-blue-100"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = i + 1;
                        return (
                          <SelectItem key={m} value={String(m)} className="tremor-option-solid">
                            {String(m).padStart(2, "0")} — {MONTHS_SHORT[i]}
                          </SelectItem>
                        );
                      })}
                    </Select>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <div className="flex items-center justify-between">
              <Title className="text-lg font-semibold text-gray-800 mb-4">Distribución de Horas</Title>
            </div>

            <DonutChart
              data={donutData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} hrs`}
              colors={["amber", "slate", "emerald", "teal", "blue", "indigo", "violet", "pink", "rose", "red",]}
              variant="donut"
              className="h-72"
              showAnimation
              showTooltip
            />
            <div className="mt-4 text-center text-sm text-gray-600">
              {timeRange === "week" ? (
                <>Total: {(totalHours || 0).toFixed(2)} horas esta semana</>
              ) : (
                <>
                  Mes seleccionado: <b>{monthNameLong(donutMonth)}</b> · Año <b>{year}</b>
                  <br />
                  Total horas: <b>{monthTotals.hours_total.toFixed(2)}</b>
                  {" · "}
                  Total $$: <b>${moneyCO(monthTotals.pay_total)}</b>
                </>
              )}
            </div>
          </Card>

          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <Title className="text-lg font-semibold text-gray-800 mb-4">
              {timeRange === "week" ? "Horas Semanales (Dom–Sáb)" : "Horas por mes (Ene–Dic)"}
            </Title>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(timeRange === "week" ? barWeeklyForBarList : barYearForBarList).map((item, index) => {
                const max = Math.max(...(timeRange === "week" ? barWeeklyForBarList : barYearForBarList).map(i => i.value));
                const width = max > 0 ? (item.value / max) * 100 : 0;

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-12">{item.name}</span>
                    <div className="flex-1 mx-3">
                      <div
                        className="h-4 rounded"
                        style={{
                          width: `${width}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {Number(item.value || 0).toFixed(2)} h
                    </span>
                  </div>
                );
              })}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <Text className="text-gray-600">Total horas:</Text>
                  <Text className="font-semibold">{(totalHours || 0).toFixed(2)} hrs</Text>
                </div>
                {timeRange === "week" && (
                  <div className="flex justify-between items-center text-sm">
                    <Text className="text-gray-600">Total ganancias:</Text>
                    <Text className="font-semibold text-green-600">${moneyCO(totalEarnings)}</Text>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Pandora Restaurante, Inc. All rights reserved.</p>
          <p>Desarrollado por JDT Software</p>
        </div>
      </div>
    </div>
  );
}
