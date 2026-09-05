'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useCreateTicketModal } from '../lib/store';
import { apiRequest } from '../lib/api';
import type { Ticket, Priority, Category } from '../types';
import { AttachmentUpload } from './AttachmentUpload';
import {
  Modal,
  Select,
  Label,
  ListBox,
  Switch,
  Input,
  TextArea,
  Button,
  type Key,
} from '@heroui/react';
import { Sparkles, Send, Cpu, X } from 'lucide-react';
import { toast } from 'sonner';

const newTicketSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['bug', 'feature', 'question', 'uncategorized', 'other']),
  customCategory: z.string().max(100, 'Custom category cannot exceed 100 characters').optional(),
});

interface AiConfig {
  isConfigured: boolean;
  provider: string | null;
  model: string;
}

interface CreateTicketModalProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onSuccess?: (ticket: Ticket) => void;
}

export function CreateTicketModal({
  isOpen: propIsOpen,
  onOpenChange: propOnOpenChange,
  onSuccess,
}: CreateTicketModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const store = useCreateTicketModal();
  const { user } = useAuthStore();

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : store.isOpen;
  const handleModalChange = propOnOpenChange !== undefined ? propOnOpenChange : store.setIsOpen;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('question');
  const [customCategory, setCustomCategory] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null);
  const [autoTriage, setAutoTriage] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiRequest<AiConfig>('/tickets/ai-config')
      .then((res) => {
        if (isMounted) {
          setAiConfig(res);
        }
      })
      .catch((err) => {
        console.warn('Unable to load AI configuration:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isLlmConfigured = Boolean(aiConfig?.isConfigured);
  const isAutoTriageActive = Boolean(autoTriage && isLlmConfigured);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('question');
    setCustomCategory('');
    setFiles([]);
    setErrors({});
  };

  const handleClose = () => {
    handleModalChange(false);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!isAutoTriageActive && category === 'other' && !customCategory.trim()) {
      setErrors({ customCategory: 'Please enter a custom category name' });
      return;
    }

    const payload = {
      title,
      description,
      priority,
      category,
      customCategory: category === 'other' ? customCategory.trim() : undefined,
    };

    const result = newTicketSchema.safeParse(payload);
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      const fieldErrors: Record<string, string> = {};
      Object.entries(flattened).forEach(([key, messages]) => {
        if (messages && messages[0]) fieldErrors[key] = messages[0];
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      formData.append('category', category);

      if (!isAutoTriageActive && category === 'other' && customCategory.trim()) {
        formData.append('customCategory', customCategory.trim());
      }

      formData.append('autoTriage', String(isAutoTriageActive));

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await apiRequest<{ ticket: Ticket }>('/tickets', {
        method: 'POST',
        body: formData,
      });

      toast.success(`Ticket ${res.ticket.ticketId} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      handleClose();

      if (onSuccess) {
        onSuccess(res.ticket);
      } else {
        router.push(`/tickets/${res.ticket.id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit ticket';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role === 'admin') return null;

  return (
    <Modal.Backdrop isOpen={isModalOpen} onOpenChange={handleModalChange}>
      <Modal.Container scroll="inside" size="lg">
        <Modal.Dialog className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-7 overflow-hidden my-6">
          <Modal.CloseTrigger />

          <Modal.Header className="pb-4 border-b border-slate-100">
            <Modal.Heading className="text-lg font-semibold tracking-tight text-slate-900">
              Raise a Support Ticket
            </Modal.Heading>
            <p className="text-xs text-slate-500 mt-1">
              Provide details about your request. Our automated AI engine can triage and classify your submission.
            </p>
          </Modal.Header>

          <Modal.Body className="py-4 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
            <form id="create-ticket-modal-form" onSubmit={handleSubmit} className="space-y-4">
              {/* AI Auto-Triage Switch Section */}
              <div
                onClick={() => {
                  if (isLlmConfigured) {
                    setAutoTriage((prev) => !prev);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isAutoTriageActive
                    ? 'border-indigo-300 bg-indigo-50/50 shadow-2xs'
                    : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-3.5 h-3.5 ${isAutoTriageActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold text-slate-900">
                        AI Auto-Triage Classification
                      </span>
                      {isLlmConfigured ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          LLM Connected ({aiConfig?.provider || 'AI'})
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          LLM Not Configured
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isLlmConfigured
                        ? isAutoTriageActive
                          ? 'Enabled - LLM will analyze title and description to classify category and priority upon submission.'
                          : 'Off - toggle on to let AI triage automatically, or configure manually below.'
                        : 'Add GEMINI_API_KEY or OPENAI_API_KEY on the server to enable automatic classification.'}
                    </p>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      isSelected={isAutoTriageActive}
                      onChange={(val) => {
                        if (isLlmConfigured) {
                          setAutoTriage(val);
                        }
                      }}
                      isDisabled={!isLlmConfigured}
                      aria-label="Toggle AI Auto-Triage"
                      size="sm"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  </div>
                </div>

                {isAutoTriageActive && (
                  <div className="mt-2.5 pt-2.5 border-t border-indigo-200/60 flex items-center gap-2 text-[11px] text-indigo-700 font-medium">
                    <Cpu className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                    Category and priority will be determined automatically by the AI model upon submission.
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <Label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Ticket title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unable to export monthly invoice as PDF"
                  className="w-full text-xs"
                />
                {errors.title && (
                  <p className="text-xs text-rose-600 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Category and Priority using HeroUI Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Select
                    fullWidth
                    value={category}
                    onChange={(val: Key | null) => {
                      if (val) setCategory(val as Category);
                    }}
                    isDisabled={isAutoTriageActive}
                    placeholder="Select category"
                    className="w-full"
                  >
                    <Label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Category {isAutoTriageActive && '(Auto-assigned by AI)'}
                    </Label>
                    <Select.Trigger className="w-full">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50">
                      <ListBox>
                        <ListBox.Item id="question" textValue="Question / Help">
                          Question / Help
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="bug" textValue="Software Bug">
                          Software Bug
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="feature" textValue="Feature Request">
                          Feature Request
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="uncategorized" textValue="Uncategorized">
                          Uncategorized
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="other" textValue="Other (Custom)">
                          Other (Custom)
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div>
                  <Select
                    fullWidth
                    value={priority}
                    onChange={(val: Key | null) => {
                      if (val) setPriority(val as Priority);
                    }}
                    isDisabled={isAutoTriageActive}
                    placeholder="Select priority"
                    className="w-full"
                  >
                    <Label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Priority {isAutoTriageActive && '(Auto-assigned by AI)'}
                    </Label>
                    <Select.Trigger className="w-full">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50">
                      <ListBox>
                        <ListBox.Item id="low" textValue="Low - Minor question or feedback">
                          Low - Minor question or feedback
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="medium" textValue="Medium - General inquiry">
                          Medium - General inquiry
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="high" textValue="High - Feature impaired">
                          High - Feature impaired
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="urgent" textValue="Urgent - Critical blocker">
                          Urgent - Critical blocker
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>

              {/* Custom Category input when 'other' is selected and auto-triage is not active */}
              {!isAutoTriageActive && category === 'other' && (
                <div>
                  <Label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Custom Category Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    fullWidth
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Billing, Infrastructure, Compliance, Onboarding"
                    className="w-full text-xs"
                  />
                  {errors.customCategory && (
                    <p className="text-xs text-rose-600 mt-1">{errors.customCategory}</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <Label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Detailed description <span className="text-rose-500">*</span>
                </Label>
                <TextArea
                  rows={4}
                  fullWidth
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the steps to reproduce, what you expected, and what actually occurred..."
                  className="w-full text-xs leading-relaxed"
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Attachments */}
              <div>
                <Label className="block text-xs font-medium text-slate-700 mb-1.5">
                  File attachments (optional)
                </Label>
                <AttachmentUpload files={files} onChange={setFiles} />
              </div>
            </form>
          </Modal.Body>

          <Modal.Footer className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              {isAutoTriageActive
                ? 'AI model will triage upon submission'
                : 'Manual category & priority'}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onPress={handleClose}
                isDisabled={isSubmitting}
                className="text-xs px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-ticket-modal-form"
                isDisabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl px-4 py-1.5 text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
