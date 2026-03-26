import { useQuery } from '@tanstack/react-query'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface SystemInfo {
  hostname: string
  cpu_percent: number
  memory_percent: number
  memory_total: number
  memory_used: number
  disk_percent: number
  disk_total: number
  disk_used: number
  network_rx: number
  network_tx: number
  cpu_history: number[]
  memory_history: number[]
}

async function fetchSystemInfo(): Promise<SystemInfo> {
  const res = await fetch('/api/system')
  if (!res.ok) throw new Error('Failed to fetch system info')
  return res.json()
}

export default function SystemPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['system'],
    queryFn: fetchSystemInfo,
  })

  if (isLoading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error: {(error as Error).message}</div>
  if (!data) return null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v: number) => v + '%' },
      },
    },
  }

  const cpuChartData = {
    labels: data.cpu_history.map((_, i) => `${i}s`),
    datasets: [
      {
        data: data.cpu_history,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const memoryChartData = {
    labels: data.memory_history.map((_, i) => `${i}s`),
    datasets: [
      {
        data: data.memory_history,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{data.hostname}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="CPU Usage"
          value={`${data.cpu_percent.toFixed(1)}%`}
          color="indigo"
        />
        <MetricCard
          title="Memory Usage"
          value={`${data.memory_percent.toFixed(1)}%`}
          subtext={`${formatBytes(data.memory_used)} / ${formatBytes(data.memory_total)}`}
          color="green"
        />
        <MetricCard
          title="Disk Usage"
          value={`${data.disk_percent.toFixed(1)}%`}
          subtext={`${formatBytes(data.disk_used)} / ${formatBytes(data.disk_total)}`}
          color="yellow"
        />
        <MetricCard
          title="Network"
          value={`${formatBytes(data.network_rx)} / ${formatBytes(data.network_tx)}`}
          subtext="RX / TX"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">CPU History</h3>
          <div className="h-64">
            <Line data={cpuChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Memory History</h3>
          <div className="h-64">
            <Line data={memoryChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtext,
  color,
}: {
  title: string
  value: string
  subtext?: string
  color: 'indigo' | 'green' | 'yellow' | 'blue'
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    blue: 'bg-blue-50 text-blue-700',
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-2xl font-semibold ${colorClasses[color].split(' ')[1]}`}>
        {value}
      </p>
      {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
