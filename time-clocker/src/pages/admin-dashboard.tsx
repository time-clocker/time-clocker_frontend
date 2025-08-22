import { Card, Title, DonutChart, BarChart, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Metric, Text, Flex, Divider } from "@tremor/react";

const usersData = [
  { id: 1, name: "Juan Pérez", hours: 40, earnings: 1200, rate: 30, projects: 5 },
  { id: 2, name: "Ana García", hours: 35, earnings: 1400, rate: 40, projects: 4 },
  { id: 3, name: "Carlos López", hours: 45, earnings: 1575, rate: 35, projects: 6 },
  { id: 4, name: "María Rodríguez", hours: 32, earnings: 1120, rate: 35, projects: 3 },
  { id: 5, name: "Pedro Martínez", hours: 38, earnings: 1330, rate: 35, projects: 4 },
  { id: 6, name: "Laura Sánchez", hours: 42, earnings: 1680, rate: 40, projects: 5 },
  { id: 7, name: "Diego Fernández", hours: 28, earnings: 980, rate: 35, projects: 2 },
];

const hoursDistributionData = [
  { name: "Juan Pérez", value: 40 },
  { name: "Ana García", value: 35 },
  { name: "Carlos López", value: 45 },
  { name: "María Rodríguez", value: 32 },
  { name: "Otros", value: 108 },
];

const earningsData = [
  { name: "Juan Pérez", earnings: 1200 },
  { name: "Ana García", earnings: 1400 },
  { name: "Carlos López", earnings: 1575 },
  { name: "María Rodríguez", earnings: 1120 },
  { name: "Pedro Martínez", earnings: 1330 },
  { name: "Laura Sánchez", earnings: 1680 },
  { name: "Diego Fernández", earnings: 980 },
];

const donutColors = ["blue", "cyan", "indigo", "violet", "slate"];
const barColors = ["blue"];

export default function AdminDashboard() {
  const totalHours = usersData.reduce((acc, user) => acc + user.hours, 0);
  const totalEarnings = usersData.reduce((acc, user) => acc + user.earnings, 0);
  const totalProjects = usersData.reduce((acc, user) => acc + user.projects, 0);
  const avgHourlyRate = totalEarnings / totalHours;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard de Administrador</h1>
              <p className="text-gray-600 mt-2">Resumen del rendimiento del equipo</p>
            </div>
          </div>
          <Divider />
        </div>
        
        {/* Resumen de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="blue">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <Text>Total Empleados</Text>
                <Metric className="text-gray-800">{usersData.length}</Metric>
              </div>
            </Flex>
          </Card>
          
          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="green">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <Text>Total Horas</Text>
                <Metric className="text-gray-800">{totalHours} hrs</Metric>
              </div>
            </Flex>
          </Card>
          
          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="violet">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-violet-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <Text>Ganancias Totales</Text>
                <Metric className="text-gray-800">${totalEarnings.toLocaleString()}</Metric>
              </div>
            </Flex>
          </Card>
          
          <Card className="rounded-xl shadow-lg border-0 bg-white" decoration="top" decorationColor="amber">
            <Flex justifyContent="start" className="space-x-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <Text>Total</Text>
                <Metric className="text-gray-800">{totalProjects}</Metric>
              </div>
            </Flex>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de donut (distribución de horas) */}
          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <Title className="text-lg font-semibold text-gray-800 mb-4">Distribución de Horas por Empleado</Title>
            <DonutChart
              data={hoursDistributionData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} hrs`}
              colors={donutColors}
              variant="donut"
              className="h-72"
              showAnimation={true}
              showTooltip={true}
            />
            <div className="mt-4 text-center text-sm text-gray-600">
              Total: {totalHours} horas esta semana
            </div>
          </Card>
          
          {/* Gráfico de barras (ganancias por usuario) */}
          <Card className="rounded-xl shadow-lg border-0 bg-white">
            <Title className="text-lg font-semibold text-gray-800 mb-4">
              Ganancias por Empleado
            </Title>
            <BarChart
              data={earningsData}
              index="name"
              categories={['earnings']}
              colors={barColors}
              valueFormatter={(value) => `$${value}`}
              yAxisWidth={60}
              showAnimation={true}
              className="h-72"
            />
            <div className="mt-4 text-center text-sm text-gray-600">
              Total: ${totalEarnings.toLocaleString()}
            </div>
          </Card>
        </div>
        
        {/* Tabla de usuarios */}
        <Card className="rounded-xl shadow-lg border-0 bg-white">
          <Title className="text-lg font-semibold text-gray-800 mb-4">Resumen de Rendimiento por Empleado</Title>
          <Table className="mt-5">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Nombre</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Horas Trabajadas</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Tarifa por Hora</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Ganancias</TableHeaderCell>
                <TableHeaderCell className="bg-blue-50 text-blue-700">Total</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.hours} hrs</TableCell>
                  <TableCell>${user.rate}/hr</TableCell>
                  <TableCell>${user.earnings}</TableCell>
                  <TableCell>{user.projects}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-between items-center">
            <Text className="text-sm text-gray-600">
              Mostrando {usersData.length} empleados
            </Text>
            <Text className="text-sm text-gray-600">
              Promedio: ${avgHourlyRate.toFixed(2)}/hora
            </Text>
          </div>
        </Card>
        
        {/* Footer con información adicional */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Actualizado por última vez: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}