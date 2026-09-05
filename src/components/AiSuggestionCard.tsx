import type { AiSuggestion } from '../types';
import { Sparkles, Check, CheckCircle } from 'lucide-react';
import { Button } from '@heroui/react';
import { PriorityChip } from './PriorityChip';

interface AiSuggestionCardProps {
  suggestion: AiSuggestion;
  isAdmin: boolean;
  onApply?: () => void;
  isApplying?: boolean;
}

export function AiSuggestionCard({
  suggestion,
  isAdmin,
  onApply,
  isApplying = false,
}: AiSuggestionCardProps) {
  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-tight text-slate-900">
              AI Triage
            </h4>
            <p className="text-[11px] text-slate-400">
              Confidence score: <span className="font-medium text-slate-700">{confidencePercent}%</span>
            </p>
          </div>
        </div>

        {suggestion.applied ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" />
            Applied
          </span>
        ) : (
          isAdmin && onApply && (
            <Button
              size="sm"
              isDisabled={isApplying}
              onPress={onApply}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3 py-1 rounded-lg shadow-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Apply
            </Button>
          )
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
        <div>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Suggested Category
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize inline-block">
            {suggestion.suggestedCategory}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Suggested Priority
          </span>
          <PriorityChip priority={suggestion.suggestedPriority} size="sm" />
        </div>
      </div>
    </div>
  );
}
