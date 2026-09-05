'use client';

import type { TicketStatus, Priority, Category, TicketFilters as Filters } from '../types';
import { Search, RotateCcw } from 'lucide-react';
import {
  Button,
  Select,
  ListBox,
  InputGroup,
  type Key,
} from '@heroui/react';

interface TicketFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.status || filters.priority || filters.category || filters.search
  );

  const handleReset = () => {
    onChange({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const currentStatus = filters.status ?? 'all';
  const currentPriority = filters.priority ?? 'all';
  const currentCategory = filters.category ?? 'all';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
        {/* Search Input using HeroUI InputGroup */}
        <div className="lg:col-span-2">
          <InputGroup className="w-full">
            <InputGroup.Prefix>
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </InputGroup.Prefix>
            <InputGroup.Input
              value={filters.search ?? ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Search by title, description or ID..."
              className="w-full text-xs"
            />
          </InputGroup>
        </div>

        {/* Status Filter using HeroUI Select */}
        <div>
          <Select
            fullWidth
            aria-label="Filter by Status"
            value={currentStatus}
            onChange={(val: Key | null) => {
              onChange({
                ...filters,
                status: val && val !== 'all' ? (val as TicketStatus) : undefined,
                page: 1,
              });
            }}
            placeholder="All Statuses"
            className="w-full"
          >
            <Select.Trigger className="w-full text-xs">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50 min-w-36">
              <ListBox className="text-xs">
                <ListBox.Item id="all" textValue="All Statuses">
                  All Statuses
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="open" textValue="Open">
                  Open
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="in_progress" textValue="In Progress">
                  In Progress
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="resolved" textValue="Resolved">
                  Resolved
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* Priority Filter using HeroUI Select */}
        <div>
          <Select
            fullWidth
            aria-label="Filter by Priority"
            value={currentPriority}
            onChange={(val: Key | null) => {
              onChange({
                ...filters,
                priority: val && val !== 'all' ? (val as Priority) : undefined,
                page: 1,
              });
            }}
            placeholder="All Priorities"
            className="w-full"
          >
            <Select.Trigger className="w-full text-xs">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50 min-w-36">
              <ListBox className="text-xs">
                <ListBox.Item id="all" textValue="All Priorities">
                  All Priorities
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="low" textValue="Low">
                  Low
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="medium" textValue="Medium">
                  Medium
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="high" textValue="High">
                  High
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="urgent" textValue="Urgent">
                  Urgent
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* Category Filter using HeroUI Select + Reset Button */}
        <div className="flex items-center gap-2">
          <Select
            fullWidth
            aria-label="Filter by Category"
            value={currentCategory}
            onChange={(val: Key | null) => {
              onChange({
                ...filters,
                category: val && val !== 'all' ? (val as Category) : undefined,
                page: 1,
              });
            }}
            placeholder="All Categories"
            className="flex-1"
          >
            <Select.Trigger className="w-full text-xs">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50 min-w-40">
              <ListBox className="text-xs">
                <ListBox.Item id="all" textValue="All Categories">
                  All Categories
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="bug" textValue="Bug">
                  Bug
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="feature" textValue="Feature">
                  Feature
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="question" textValue="Question">
                  Question
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="uncategorized" textValue="Uncategorized">
                  Uncategorized
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="other" textValue="Other">
                  Other
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>

          {hasActiveFilters && (
            <Button
              size="sm"
              variant="secondary"
              onPress={handleReset}
              className="text-slate-400 hover:text-slate-900 p-2 min-w-0 rounded-xl bg-slate-100 border border-slate-200 h-9 shrink-0 cursor-pointer"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
