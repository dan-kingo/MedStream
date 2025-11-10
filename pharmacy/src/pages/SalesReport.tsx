import React, { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { orderAPI } from '../services/api'
import toast from 'react-hot-toast'

interface SalesData {
  totalOrders: number
  placed: number
  delivered: number
  cancelled: number
}

const SalesReport: React.FC = () => {
  const [data, setData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await orderAPI.getSalesOverview()
        setData(res.data)
      } catch (err) {
        console.error('Failed to fetch sales report:', err)
        setError('Failed to load sales report')
        toast.error('Failed to load sales report')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartData = data
    ? [
        { label: 'Placed', value: data.placed },
        { label: 'Delivered', value: data.delivered },
        { label: 'Cancelled', value: data.cancelled },
      ]
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error-500 mb-4">
          <AlertTriangle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading report</h3>
        <p className="text-gray-600 mb-4">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
        <p className="text-gray-600">Overview of your order statistics</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl font-semibold text-gray-800">{data?.totalOrders ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Placed</p>
              <p className="text-xl font-semibold text-gray-800">{data?.placed ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-xl font-semibold text-green-600">{data?.delivered ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-xl font-semibold text-red-500">{data?.cancelled ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Orders Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default SalesReport
