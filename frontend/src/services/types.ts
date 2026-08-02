export interface Event {
  id: number;
  host_id: number;
  title: string;
  description: string;
  event_date: string | null;
  location: string;
  capacity: number;
  created_at: string;
}

export interface Registration {
  id: number;
  event_id: number;
  visitor_id: number | null;
  visitor_name: string;
  visitor_email: string;
  phone: string;
  organization: string;
  purpose: string;
  status: 'pending' | 'accepted' | 'rejected';
  qr_code: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_out: boolean;
  checked_out_at: string | null;
  created_at: string;
  decided_at: string | null;
  event?: Event | null;
}

export interface EventReport {
  event_id: number;
  title: string;
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  checked_in: number;
}

export interface ReportsSummary {
  total_events: number;
  total_registrations: number;
  pending: number;
  accepted: number;
  rejected: number;
  checked_in: number;
  per_event: EventReport[];
}
