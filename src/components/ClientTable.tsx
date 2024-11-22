import React from 'react';
import { ArrowUpDown, Download, Plus, Search, Upload, Trash2, Clock } from 'lucide-react';
import { Client, ClientStatus, CLIENT_STATUSES } from '../types';

interface ClientTableProps {
  clients: Client[];
  onStatusChange: (id: string, status: ClientStatus) => void;
  onUnitsChange: (id: string, hours: number, months: number) => void;
  onAddClient: () => void;
  onImport: () => void;
  onExport: () => void;
  onDelete: (id: string) => void;
}

export function ClientTable({ 
  clients, 
  onStatusChange, 
  onUnitsChange, 
  onAddClient, 
  onImport,
  onExport,
  onDelete 
}: ClientTableProps) {
  const [search, setSearch] = React.useState('');
  const [sortField, setSortField] = React.useState<keyof Client>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const HOURS_PER_MONTH = 20;

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    }
    return a[sortField] < b[sortField] ? 1 : -1;
  });

  const handleSort = (field: keyof Client) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const calculateUtilization = (client: Client) => {
    const totalHoursAvailable = HOURS_PER_MONTH * client.monthsAssigned;
    return (client.unitsUsed / totalHoursAvailable) * 100;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={onImport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={onExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onAddClient}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Client</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:-mx-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    <button
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600"
                      onClick={() => handleSort('name')}
                    >
                      Client Name
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">Assignment Info</th>
                  <th scope="col" className="px-4 py-3 text-left">Hours</th>
                  <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left">Utilization</th>
                  <th scope="col" className="px-4 py-3 text-left">Status</th>
                  <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left">Last Updated</th>
                  <th scope="col" className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium">{client.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{client.clinician}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(client.assignedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                          value={client.unitsUsed}
                          onChange={(e) => {
                            const value = Math.max(0, parseFloat(e.target.value) || 0);
                            onUnitsChange(client.id, value, client.monthsAssigned);
                          }}
                        />
                        <span className="text-sm text-gray-500">hrs /</span>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                          value={client.monthsAssigned}
                          onChange={(e) => {
                            const months = Math.max(1, Math.min(12, parseInt(e.target.value) || 1));
                            onUnitsChange(client.id, client.unitsUsed, months);
                          }}
                        />
                        <span className="text-sm text-gray-500">mo</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`rounded-full h-2.5 ${calculateUtilization(client) > 100 ? 'bg-red-500' : 'bg-black'}`}
                          style={{ width: `${Math.min(100, calculateUtilization(client))}%` }}
                        ></div>
                      </div>
                      <div className={`text-sm mt-1 ${calculateUtilization(client) > 100 ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                        {calculateUtilization(client).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={client.status}
                        onChange={(e) => onStatusChange(client.id, e.target.value as ClientStatus)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        {CLIENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {new Date(client.lastUpdated).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDelete(client.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}