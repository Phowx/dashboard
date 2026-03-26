import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Container {
  id: string
  name: string
  image: string
  status: string
  state: string
  cpu_percent: number
  memory_percent: number
  memory_usage: number
  created: string
}

async function fetchContainers(): Promise<Container[]> {
  const res = await fetch('/api/containers')
  if (!res.ok) throw new Error('Failed to fetch containers')
  return res.json()
}

async function startContainer(id: string) {
  const res = await fetch(`/api/containers/${id}/start`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to start container')
}

async function stopContainer(id: string) {
  const res = await fetch(`/api/containers/${id}/stop`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to stop container')
}

async function restartContainer(id: string) {
  const res = await fetch(`/api/containers/${id}/restart`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to restart container')
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString()
}

export default function ContainersPage() {
  const queryClient = useQueryClient()
  const { data: containers, isLoading, error } = useQuery({
    queryKey: ['containers'],
    queryFn: fetchContainers,
  })

  const startMutation = useMutation({
    mutationFn: startContainer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['containers'] }),
  })

  const stopMutation = useMutation({
    mutationFn: stopContainer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['containers'] }),
  })

  const restartMutation = useMutation({
    mutationFn: restartContainer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['containers'] }),
  })

  if (isLoading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error: {(error as Error).message}</div>

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Docker Containers</h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Memory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {containers?.map((container) => (
              <tr key={container.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{container.name}</div>
                  <div className="text-sm text-gray-500">{container.id.slice(0, 12)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      container.state === 'running'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {container.state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.cpu_percent.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.memory_percent.toFixed(1)}% ({formatBytes(container.memory_usage)})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.image}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(container.created)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {container.state === 'running' ? (
                    <button
                      onClick={() => stopMutation.mutate(container.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={() => startMutation.mutate(container.id)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => restartMutation.mutate(container.id)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    Restart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
