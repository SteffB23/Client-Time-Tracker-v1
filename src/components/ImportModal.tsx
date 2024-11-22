import React from 'react';
import { X, Upload, AlertCircle, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { Client, ClientStatus, CLIENT_STATUSES } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (clients: Client[]) => void;
}

interface CSVRow {
  [key: string]: string;
}

const EXPECTED_HEADERS = {
  name: ['name', 'client name', 'clientname', 'client'],
  clinician: ['clinician', 'assigned clinician', 'assignedclinician'],
  assignedDate: ['assigned date', 'assigneddate', 'date', 'assignment date'],
  unitsUsed: ['units', 'units used', 'unitsused'],
  status: ['status', 'client status']
};

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<Client[]>([]);
  const [error, setError] = React.useState<string>('');

  const findMatchingHeader = (headers: string[], row: CSVRow): string | undefined => {
    const headerLower = headers.map(h => h.toLowerCase());
    return Object.keys(row).find(key => 
      headerLower.includes(key.toLowerCase().replace(/\s+/g, ''))
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedClients: Client[] = [];
        const errors: string[] = [];

        results.data.forEach((row: CSVRow, index) => {
          const nameHeader = findMatchingHeader(EXPECTED_HEADERS.name, row);
          const clinicianHeader = findMatchingHeader(EXPECTED_HEADERS.clinician, row);
          const dateHeader = findMatchingHeader(EXPECTED_HEADERS.assignedDate, row);
          const unitsHeader = findMatchingHeader(EXPECTED_HEADERS.unitsUsed, row);
          const statusHeader = findMatchingHeader(EXPECTED_HEADERS.status, row);

          if (!nameHeader || !clinicianHeader || !dateHeader || !unitsHeader || !statusHeader) {
            errors.push(`Row ${index + 1}: Missing or invalid column headers. Required columns: Name, Assigned Clinician, Assigned Date, Units Used, Status`);
            return;
          }

          const name = row[nameHeader]?.trim();
          const clinician = row[clinicianHeader]?.trim();
          const assignedDate = row[dateHeader]?.trim();
          const unitsUsed = row[unitsHeader]?.trim();
          const status = row[statusHeader]?.trim();

          if (!name || !clinician || !assignedDate || !unitsUsed || !status) {
            errors.push(`Row ${index + 1}: Missing required fields`);
            return;
          }

          const units = parseInt(unitsUsed);
          if (isNaN(units) || units < 0) {
            errors.push(`Row ${index + 1}: Invalid units (must be a positive number)`);
            return;
          }

          if (!CLIENT_STATUSES.includes(status as ClientStatus)) {
            errors.push(`Row ${index + 1}: Invalid status. Must be one of: ${CLIENT_STATUSES.join(', ')}`);
            return;
          }

          try {
            const date = new Date(assignedDate);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid date');
            }

            parsedClients.push({
              id: crypto.randomUUID(),
              name,
              clinician,
              assignedDate: date.toISOString(),
              unitsUsed: units,
              status: status as ClientStatus,
              lastUpdated: new Date().toISOString(),
              monthsAssigned: 1
            });
          } catch {
            errors.push(`Row ${index + 1}: Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY`);
          }
        });

        if (errors.length > 0) {
          setError(errors.join('\n'));
          setPreview([]);
        } else {
          setPreview(parsedClients);
          setError('');
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setPreview([]);
      }
    });
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      onClose();
      setFile(null);
      setPreview([]);
      setError('');
    }
  };

  const downloadTemplate = () => {
    const headers = ['Name', 'Assigned Clinician', 'Assigned Date', 'Units Used', 'Status'];
    const sampleData = [
      ['John Smith', 'Dr. Sarah Wilson', '2024-03-01', '18', 'New Authorization'],
      ['Emma Johnson', 'Dr. Michael Chen', '2024-03-02', '15', 'Current Authorization'],
      ['William Brown', 'Dr. Emily Taylor', '2024-03-03', '20', 'Newly Assigned'],
      ['Olivia Davis', 'Dr. James Anderson', '2024-03-04', '12', 'Current Authorization'],
      ['James Wilson', 'Dr. Lisa Martinez', '2024-03-05', '8', 'Client Hospitalized'],
      ['Sophia Garcia', 'Dr. Robert Johnson', '2024-03-06', '16', 'Current Authorization'],
      ['Lucas Miller', 'Dr. Jennifer Lee', '2024-03-07', '19', 'New Authorization'],
      ['Isabella Moore', 'Dr. David Clark', '2024-03-08', '14', 'Current Authorization (New LBS)'],
      ['Mason Taylor', 'Dr. Maria Rodriguez', '2024-03-09', '17', 'Newly Assigned'],
      ['Ava Anderson', 'Dr. Thomas White', '2024-03-10', '20', 'Current Authorization'],
      ['Ethan Thomas', 'Dr. Patricia Brown', '2024-03-11', '11', 'Frequent Caregiver Cancellations'],
      ['Mia Martinez', 'Dr. Kevin Davis', '2024-03-12', '13', 'Current Authorization'],
      ['Alexander White', 'Dr. Susan Miller', '2024-03-13', '18', 'New Authorization'],
      ['Charlotte Lee', 'Dr. Joseph Wilson', '2024-03-14', '16', 'Current Authorization'],
      ['Benjamin Clark', 'Dr. Nancy Taylor', '2024-03-15', '20', 'Newly Assigned'],
      ['Amelia Rodriguez', 'Dr. Christopher Lee', '2024-03-16', '15', 'Current Authorization'],
      ['Henry Johnson', 'Dr. Elizabeth Moore', '2024-03-17', '9', 'Client Hospitalized'],
      ['Harper Davis', 'Dr. Daniel Martinez', '2024-03-18', '17', 'Current Authorization'],
      ['Sebastian Garcia', 'Dr. Margaret Wilson', '2024-03-19', '19', 'New Authorization'],
      ['Victoria Brown', 'Dr. Richard Taylor', '2024-03-20', '14', 'Current Authorization (New LBS)'],
      ['Jack Wilson', 'Dr. Sandra Clark', '2024-03-21', '16', 'Newly Assigned'],
      ['Luna Martinez', 'Dr. Paul Anderson', '2024-03-22', '20', 'Current Authorization'],
      ['Owen Moore', 'Dr. Betty White', '2024-03-23', '10', 'Frequent Caregiver Cancellations'],
      ['Scarlett Taylor', 'Dr. George Brown', '2024-03-24', '13', 'Current Authorization'],
      ['Leo Anderson', 'Dr. Dorothy Davis', '2024-03-25', '18', 'New Authorization'],
      ['Aria Thomas', 'Dr. Kenneth Miller', '2024-03-26', '15', 'Current Authorization'],
      ['Gabriel White', 'Dr. Helen Martinez', '2024-03-27', '20', 'Newly Assigned'],
      ['Chloe Clark', 'Dr. Edward Wilson', '2024-03-28', '16', 'Current Authorization'],
      ['David Lee', 'Dr. Carol Taylor', '2024-03-29', '7', 'Client Hospitalized'],
      ['Zoe Rodriguez', 'Dr. Steven Clark', '2024-03-30', '17', 'Current Authorization'],
      ['Joseph Miller', 'Dr. Amy Johnson', '2024-03-31', '19', 'New Authorization'],
      ['Penelope Davis', 'Dr. Frank Anderson', '2024-04-01', '14', 'Current Authorization (New LBS)'],
      ['Adam Garcia', 'Dr. Rachel White', '2024-04-02', '16', 'Newly Assigned'],
      ['Nora Wilson', 'Dr. Raymond Brown', '2024-04-03', '20', 'Current Authorization'],
      ['Christopher Moore', 'Dr. Sharon Davis', '2024-04-04', '12', 'Frequent Caregiver Cancellations'],
      ['Aurora Martinez', 'Dr. Lawrence Miller', '2024-04-05', '13', 'Current Authorization'],
      ['Elijah Taylor', 'Dr. Virginia Wilson', '2024-04-06', '18', 'New Authorization'],
      ['Grace Anderson', 'Dr. Peter Clark', '2024-04-07', '15', 'Current Authorization'],
      ['Daniel Thomas', 'Dr. Julie Martinez', '2024-04-08', '20', 'Newly Assigned'],
      ['Sophie White', 'Dr. Harold Taylor', '2024-04-09', '16', 'Current Authorization']
    ];
    const csvContent = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'client-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Import Clients from CSV</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">CSV File Requirements:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Required columns: Name, Assigned Clinician, Assigned Date, Units Used, Status</li>
              <li>Date format: YYYY-MM-DD or MM/DD/YYYY</li>
              <li>Units: Numbers between 0-960</li>
              <li>Status must be one of: {CLIENT_STATUSES.join(', ')}</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-3 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <FileText className="h-4 w-4" />
              Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {file ? file.name : 'Click to upload CSV file'}
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview ({preview.length} clients)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinician</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(0, 5).map((client) => (
                      <tr key={client.id}>
                        <td className="px-4 py-2 text-sm">{client.name}</td>
                        <td className="px-4 py-2 text-sm">{client.clinician}</td>
                        <td className="px-4 py-2 text-sm">
                          {new Date(client.assignedDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">{client.unitsUsed}</td>
                        <td className="px-4 py-2 text-sm">{client.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    And {preview.length - 5} more clients...
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={preview.length === 0}
              className="w-full sm:w-auto px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors order-1 sm:order-2"
            >
              Import {preview.length} Clients
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}