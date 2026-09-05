export type Role = 'customer' | 'admin';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Category = 'bug' | 'feature' | 'question' | 'uncategorized' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  createdAt?: string;
}

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface StatusHistory {
  id: string;
  from: TicketStatus;
  to: TicketStatus;
  note?: string | null;
  changedAt: string;
  changedBy: {
    id: string;
    name: string;
  };
}

export interface AiSuggestion {
  id: string;
  suggestedCategory: Category;
  suggestedPriority: Priority;
  confidence: number;
  applied: boolean;
}

export interface Ticket {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  category: Category;
  customCategory?: string | null;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  attachments: Attachment[];
  statusHistory: StatusHistory[];
  aiSuggestion?: AiSuggestion | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: Priority;
  category?: Category;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTickets {
  tickets: Ticket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalTickets: number;
  resolutionRate: number;
  byStatus: { status: TicketStatus; count: number }[];
  byPriority: { priority: Priority; count: number }[];
  byCategory: { category: Category; count: number }[];
  recentTickets: Ticket[];
  ticketsOverTime: { date: string; count: number }[];
}
