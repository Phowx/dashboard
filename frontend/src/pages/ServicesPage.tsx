import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Service {
  name: string
  load_state: string
  active_state: string
  sub_state: string
  description: string
}

async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/services')
  if (!res.ok) throw new Error('Failed to fetch services')
  return res.json()
}

async function restartService(name: string) {
  const res = await fetch(`/api/services/${name}/restart`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to restart service')
}

export default function ServicesPage() {
  const queryClient = useQueryClient()
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  })

  const restartMutation = useMutation({
    mutationFn: restartService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })

  if (isLoading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error: {(error as Error).message}</div>

  const getStatusColor = (activeState: string) => {
    switch (activeState) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Systemd Services</h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sub State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services?.map((service) => (
              <tr key={service.name}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{service.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      service.active_state
                    )}`}
                  >
                    {service.active_state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.sub_state}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{service.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => restartMutation.mutate(service.name)}
                    className="text-indigo-600 hover:text-indigo-900"
                    disabled={service.active_state !== 'active'}
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
