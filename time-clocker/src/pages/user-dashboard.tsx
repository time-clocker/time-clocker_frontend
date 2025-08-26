import { Card, Title, DonutChart, BarChart, Flex, Button, Metric, Text, Divider } from "@tremor/react";
import { useEffect, useState } from "react";
import { authService } from "../services/auth-service";

const hoursData = [
  { name: "Horas trabajadas", value: 35 },
  { name: "Horas libres", value: 13 },
];

const weeklyEarningsData = [
  { day: "Lun", hours: 6, earnings: 180 },
  { day: "Mar", hours: 7, earnings: 210 },
  { day: "Mié", hours: 8, earnings: 240 },
  { day: "Jue", hours: 5, earnings: 150 },
  { day: "Vie", hours: 9, earnings: 270 },
  { day: "Sáb", hours: 0, earnings: 0 },
  { day: "Dom", hours: 0, earnings: 0 },
];

const monthlyEarningsData = [
  { month: "Ene", hours: 120, earnings: 3600 },
  { month: "Feb", hours: 140, earnings: 4200 },
  { month: "Mar", hours: 160, earnings: 4800 },
  { month: "Abr", hours: 110, earnings: 3300 },
  { month: "May", hours: 135, earnings: 4050 },
  { month: "Jun", hours: 170, earnings: 5100 },
];


export default function UserDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTimeEntryId, setCurrentTimeEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(''); 
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const userData = authService.getUserData();
    const userName = authService.getUserName();
    
    setUserData(userData);
    setUserName(userName);
    
    if (!userData) {
      fetchUserData();
    }
  };

  const fetchUserData = async () => {
    try {
      const userProfile = await authService.getEmployeeProfile();
      setUserData(userProfile);
      
      if (userProfile?.full_name) {
        setUserName(userProfile.full_name);
        localStorage.setItem('userData', JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const totalHours = hoursData.reduce((acc, curr) => acc + curr.value, 0);
  const currentData = timeRange === 'week' ? weeklyEarningsData : monthlyEarningsData;
  const totalEarnings = currentData.reduce((acc, curr) => acc + curr.earnings, 0);
  const totalWorkedHours = currentData.reduce((acc, curr) => acc + curr.hours, 0);
  const avgHourlyRate = totalWorkedHours > 0 ? totalEarnings / totalWorkedHours : 0;


  const clockIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch('http://127.0.0.1:8000/time-entries/clock-in', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tz: "America/Bogota"
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setIsClockedIn(true);
      setCurrentTimeEntryId(data.id);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Clock-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch('http://127.0.0.1:8000/time-entries/clock-out', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setIsClockedIn(false);
      setCurrentTimeEntryId(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Clock-out error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Panel de Usuario</h1>
              <p className="text-gray-600 mt-2">Resumen de tu actividad y ganancias</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex space-x-2">
                <Button
                  size="lg"
                  variant={isClockedIn ? "secondary" : "primary"}
                  onClick={clockIn}
                  disabled={isClockedIn || loading}
                  loading={loading && !isClockedIn}
                  className="bg-pandora-yellow rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {isClockedIn ? "Registro Iniciado" : "Clock-In"}
                </Button>
                <Button
                  size="lg"
                  variant={isClockedIn ? "primary" : "secondary"}
                  onClick={clockOut}
                  disabled={!isClockedIn || loading}
                  loading={loading && isClockedIn}
                  className="bg-pandora-yellow rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Clock-Out
                </Button>
              </div>
              <div className="flex items-center space-x-3 text-right">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Bienvenido</p>
                  <p className="text-lg font-semibold text-gray-900">{userName}</p>
                </div>
  
              </div>

            </div>
          </div>
          <Divider />
        </div>

        {/* Resumen de métricas */}
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
                <Metric className="text-gray-800">{totalHours} hrs</Metric>
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
                <Metric className="text-gray-800">${totalEarnings.toLocaleString()}</Metric>
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
                <Metric className="text-gray-800">${avgHourlyRate.toFixed(2)}/hr</Metric>
              </div>
            </Flex>
          </Card>
        </div>

        {/* Selector de rango de tiempo */}
        <Card className="rounded-xl shadow-lg border-0 bg-white mb-8">
          <Title className="text-lg font-semibold text-gray-800 mb-4">Seleccionar Rango de Tiempo</Title>
          <Flex justifyContent="center" className="gap-4">
            <Button
              size="xl"
              variant={timeRange === 'week' ? 'primary' : 'secondary'}
              onClick={() => setTimeRange('week')}
              className="rounded-lg transition-all duration-300 hover:scale-105"
            >
              Semanal
            </Button>
            <Button
              size="xl"
              variant={timeRange === 'month' ? 'primary' : 'secondary'}
              onClick={() => setTimeRange('month')}
              className="rounded-lg transition-all duration-300 hover:scale-105"
            >
              Mensual
            </Button>
          </Flex>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de donut (horas trabajadas) */}
          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <Title className="text-lg font-semibold text-gray-800 mb-4">Distribución de Horas</Title>
            <DonutChart
              data={hoursData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} hrs`}
              colors={["blue", "indigo"]}
              variant="donut"
              className="h-72"
              showAnimation={true}
              showTooltip={true}
            />
            <div className="mt-4 text-center text-sm text-gray-600">
              Total: {totalHours} horas esta semana
            </div>
          </Card>

          {/* Gráfico de barras (ganancias vs tiempo) */}
          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <Title className="text-lg font-semibold text-gray-800 mb-4">
              {timeRange === 'week' ? 'Ganancias Semanales' : 'Ganancias Mensuales'}
            </Title>
            <BarChart
              data={currentData}
              index={timeRange === 'week' ? 'day' : 'month'}
              categories={['earnings']}
              colors={['indigo', 'green', 'yellow', 'red']}
              valueFormatter={(value) => `$${value}`}
              yAxisWidth={60}
              showAnimation={true}
              className="h-72"
            />
            <div className="mt-4 text-center text-sm text-gray-600">
              Total: ${totalEarnings.toLocaleString()} {timeRange === 'week' ? 'esta semana' : 'este mes'}
            </div>
          </Card>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Actualizado por última vez: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}