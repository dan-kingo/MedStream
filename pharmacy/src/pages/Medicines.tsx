import React, { useState } from 'react'
import { Plus, Search, Edit, Trash2, AlertTriangle, Package } from 'lucide-react'
import { useApi, useApiMutation } from '../hooks/useApi'
import { medicineAPI } from '../services/api'

interface Medicine {
  _id: string
  name: string
  strength: string
  type: 'Tablet' | 'Syrup' | 'Injection'
  price: number
  quantity: number
  requiresPrescription: boolean
  outOfStock: boolean
  description?: string
}

const Medicines: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)

  const { data, loading, error, refetch } = useApi<{ medicines: Medicine[] }>('/medicines')
  const { loading: addLoading } = useApiMutation()
  const {  loading: updateLoading } = useApiMutation()
  const { loading: deleteLoading } = useApiMutation()

// Remove getAllMedicines and use the data from useApi hook
const medicines = data?.medicines || []

const filteredMedicines = medicines.filter(medicine => {
  const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       medicine.type.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesType = !typeFilter || medicine.type.toLowerCase() === typeFilter.toLowerCase()
  return matchesSearch && matchesType
})

  const handleAddMedicine = async (formData: any) => {
    try {
      await medicineAPI.addMedicine(formData)
      setShowAddModal(false)
      refetch()
    } catch (error) {
      console.error('Error adding medicine:', error)
    }
  }

  const handleUpdateMedicine = async (id: string, formData: any) => {
    try {
      await medicineAPI.updateMedicine(id, formData)
      setEditingMedicine(null)
      refetch()
    } catch (error) {
      console.error('Error updating medicine:', error)
    }
  }

  const handleDeleteMedicine = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineAPI.deleteMedicine(id)
        refetch()
      } catch (error) {
        console.error('Error deleting medicine:', error)
      }
    }
  }

  const handleMarkOutOfStock = async (id: string) => {
    try {
      await medicineAPI.markOutOfStock(id)
      refetch()
    } catch (error) {
      console.error('Error marking out of stock:', error)
    }
  }

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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading medicines</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={refetch} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="text-gray-600">Manage your pharmacy inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select 
              className="input sm:w-48"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="tablet">Tablet</option>
              <option value="syrup">Syrup</option>
              <option value="injection">Injection</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine) => (
          <div key={medicine._id} className="card">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{medicine.name}</h3>
                  <p className="text-sm text-gray-600">{medicine.strength} • {medicine.type}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button 
                    onClick={() => setEditingMedicine(medicine)}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMedicine(medicine._id)}
                    className="p-2 text-gray-400 hover:text-error-600 rounded-lg hover:bg-gray-50"
                    disabled={deleteLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">${medicine.price}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <div className="flex items-center">
                    {medicine.quantity <= 10 && medicine.quantity > 0 && (
                      <AlertTriangle className="h-4 w-4 text-warning-500 mr-1" />
                    )}
                    <span className={`font-semibold ${
                      medicine.outOfStock ? 'text-error-600' :
                      medicine.quantity <= 10 ? 'text-warning-600' : 'text-success-600'
                    }`}>
                      {medicine.outOfStock ? 'Out of Stock' : medicine.quantity}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prescription:</span>
                  <span className={`badge ${
                    medicine.requiresPrescription ? 'badge-warning' : 'badge-success'
                  }`}>
                    {medicine.requiresPrescription ? 'Required' : 'Not Required'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {!medicine.outOfStock ? (
                  <button
                    onClick={() => handleMarkOutOfStock(medicine._id)}
                    className="btn-secondary w-full"
                    disabled={updateLoading}
                  >
                    Mark Out of Stock
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingMedicine(medicine)}
                    className="btn-primary w-full"
                  >
                    Restock
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-600">Try adjusting your search or add a new medicine.</p>
        </div>
      )}

      {/* Add/Edit Medicine Modal */}
      {(showAddModal || editingMedicine) && (
        <MedicineModal
          medicine={editingMedicine}
          onClose={() => {
            setShowAddModal(false)
            setEditingMedicine(null)
          }}
          onSave={editingMedicine ? 
            (data) => handleUpdateMedicine(editingMedicine._id, data) : 
            handleAddMedicine
          }
          loading={addLoading || updateLoading}
        />
      )}
    </div>
  )
}

// Medicine Modal Component
interface MedicineModalProps {
  medicine?: Medicine | null
  onClose: () => void
  onSave: (data: any) => void
  loading: boolean
}

const MedicineModal: React.FC<MedicineModalProps> = ({ medicine, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: medicine?.name || '',
    strength: medicine?.strength || '',
    type: medicine?.type || 'Tablet',
    price: medicine?.price || 0,
    quantity: medicine?.quantity || 0,
    requiresPrescription: medicine?.requiresPrescription || false,
    description: medicine?.description || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strength
                </label>
                <input
                  type="text"
                  name="strength"
                  className="input"
                  placeholder="e.g., 500mg"
                  value={formData.strength}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  required
                  className="input"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  className="input"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="0"
                  className="input"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="input"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="requiresPrescription"
                id="requiresPrescription"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.requiresPrescription}
                onChange={handleChange}
              />
              <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-900">
                Requires prescription
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  medicine ? 'Update Medicine' : 'Add Medicine'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Medicines