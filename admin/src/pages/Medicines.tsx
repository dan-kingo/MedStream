import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Pill } from 'lucide-react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

interface Medicine {
  _id: string
  name: string
  strength?: string
  unit?: string
  type: 'Tablet' | 'Syrup' | 'Injection'
  description?: string
  requiresPrescription: boolean
  relatedNames?: string[]
}

const Medicines: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const response = await adminAPI.getMedicines()
      setMedicines(response.data)
    } catch (error) {
      console.error('Error fetching medicines:', error)
      toast.error('Failed to load medicines')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicine = async (formData: any) => {
    try {
      await adminAPI.createMedicine(formData)
      setShowAddModal(false)
      fetchMedicines()
      toast.success('Medicine added successfully')
    } catch (error) {
      toast.error('Failed to add medicine')
    }
  }

  const handleUpdateMedicine = async (id: string, formData: any) => {
    try {
      await adminAPI.updateMedicine(id, formData)
      setEditingMedicine(null)
      fetchMedicines()
      toast.success('Medicine updated successfully')
    } catch (error) {
      toast.error('Failed to update medicine')
    }
  }

  const handleDeleteMedicine = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await adminAPI.deleteMedicine(id)
        fetchMedicines()
        toast.success('Medicine deleted successfully')
      } catch (error) {
        toast.error('Failed to delete medicine')
      }
    }
  }

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Master List</h1>
          <p className="text-gray-600">Manage the master list of medicines</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
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
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prescription:</span>
                  <span className={`badge ${
                    medicine.requiresPrescription ? 'badge-warning' : 'badge-success'
                  }`}>
                    {medicine.requiresPrescription ? 'Required' : 'Not Required'}
                  </span>
                </div>

                {medicine.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{medicine.description}</p>
                  </div>
                )}

                {medicine.relatedNames && medicine.relatedNames.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Related Names:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {medicine.relatedNames.map((name, index) => (
                        <span key={index} className="badge badge-gray text-xs">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <Pill className="h-12 w-12 mx-auto text-gray-300 mb-4" />
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
}

const MedicineModal: React.FC<MedicineModalProps> = ({ medicine, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: medicine?.name || '',
    strength: medicine?.strength || '',
    unit: medicine?.unit || '',
    type: medicine?.type || 'Tablet',
    description: medicine?.description || '',
    requiresPrescription: medicine?.requiresPrescription || false,
    relatedNames: medicine?.relatedNames?.join(', ') || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      relatedNames: formData.relatedNames.split(',').map(name => name.trim()).filter(Boolean)
    }
    onSave(data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related Names (comma separated)
              </label>
              <input
                type="text"
                name="relatedNames"
                className="input"
                placeholder="e.g., Panadol, Tylenol"
                value={formData.relatedNames}
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
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {medicine ? 'Update Medicine' : 'Add Medicine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Medicines