import React from 'react';
import { X } from 'lucide-react';
import { ClientStatus, CLIENT_STATUSES } from '../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    clinician: string;
    assignedDate: string;
    unitsUsed: number;
    status: ClientStatus;
    monthsAssigned: number;
  }) => void;
}

export function AddClientModal({ isOpen, onClose, onSubmit }: AddClientModalProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    clinician: '',
    assignedDate: new Date().toISOString().split('T')[0],
    unitsUsed: 0,
    status: CLIENT_STATUSES[0],
    monthsAssigned: 1
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      clinician: '',
      assignedDate: new Date().toISOString().split('T')[0],
      unitsUsed: 0,
      status: CLIENT_STATUSES[0],
      monthsAssigned: 1
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Add New Client</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Clinician
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={formData.clinician}
              onChange={(e) => setFormData({ ...formData, clinician: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Date
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={formData.assignedDate}
              onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Hours Used
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                step="0.5"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={formData.unitsUsed}
                onChange={(e) => setFormData({ ...formData, unitsUsed: parseFloat(e.target.value) || 0 })}
              />
              <span className="text-sm text-gray-500">for</span>
              <input
                type="number"
                min="1"
                max="12"
                required
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={formData.monthsAssigned}
                onChange={(e) => setFormData({ ...formData, monthsAssigned: parseInt(e.target.value) || 1 })}
              />
              <span className="text-sm text-gray-500">months</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
            >
              {CLIENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors order-1 sm:order-2"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}