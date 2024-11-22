export interface Client {
  id: string;
  name: string;
  clinician: string;
  assignedDate: string;
  unitsUsed: number;
  status: ClientStatus;
  lastUpdated: string;
  monthsAssigned: number;
}

export type ClientStatus = 
  | 'New Authorization'
  | 'Newly Assigned'
  | 'Client Hospitalized'
  | 'Frequent Caregiver Cancellations'
  | 'Current Authorization'
  | 'Current Authorization (New LBS)';

export const CLIENT_STATUSES: ClientStatus[] = [
  'New Authorization',
  'Current Authorization',
  'Current Authorization (New LBS)',
  'Newly Assigned',
  'Client Hospitalized',
  'Frequent Caregiver Cancellations'
];