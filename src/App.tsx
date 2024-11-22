import React from 'react';
import { Clock } from 'lucide-react';
import { Client, ClientStatus } from './types';
import { ClientTable } from './components/ClientTable';
import { AddClientModal } from './components/AddClientModal';
import { ImportModal } from './components/ImportModal';

function App() {
  const [clients, setClients] = React.useState<Client[]>(() => {
    const saved = localStorage.getItem('clients');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map((client: Client) => ({
      ...client,
      monthsAssigned: client.monthsAssigned || 1
    }));
  });
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const handleStatusChange = (id: string, status: ClientStatus) => {
    setClients(clients.map(client =>
      client.id === id
        ? { ...client, status, lastUpdated: new Date().toISOString() }
        : client
    ));
  };

  const handleUnitsChange = (id: string, hours: number, months: number) => {
    setClients(clients.map(client =>
      client.id === id
        ? {
            ...client,
            unitsUsed: hours,
            monthsAssigned: months,
            lastUpdated: new Date().toISOString()
          }
        : client
    ));
  };

  const handleAddClient = (data: {
    name: string;
    clinician: string;
    assignedDate: string;
    unitsUsed: number;
    status: ClientStatus;
    monthsAssigned: number;
  }) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
      ...data,
    };
    setClients([...clients, newClient]);
  };

  const handleImportClients = (importedClients: Client[]) => {
    const clientsWithMonths = importedClients.map(client => ({
      ...client,
      monthsAssigned: client.monthsAssigned || 1
    }));
    setClients([...clients, ...clientsWithMonths]);
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Assigned Clinician', 'Assigned Date', 'Hours Used', 'Months', 'Status', 'Last Updated'],
      ...clients.map(client => [
        client.name,
        client.clinician,
        new Date(client.assignedDate).toLocaleDateString(),
        client.unitsUsed,
        client.monthsAssigned,
        client.status,
        new Date(client.lastUpdated).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
              <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-semibold truncate">
                Clinical Time Tracker
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Total Clients: {clients.length}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Client Management Dashboard</h2>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Track and manage client service hours efficiently
          </p>
        </div>

        <ClientTable
          clients={clients}
          onStatusChange={handleStatusChange}
          onUnitsChange={handleUnitsChange}
          onAddClient={() => setIsAddModalOpen(true)}
          onImport={() => setIsImportModalOpen(true)}
          onExport={handleExport}
          onDelete={handleDeleteClient}
        />

        <AddClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddClient}
        />

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportClients}
        />
      </main>
    </div>
  );
}

export default App;