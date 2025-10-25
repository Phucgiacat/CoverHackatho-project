import type { SuggestedAction } from '../types/chat';

interface SuggestedActionTagProps {
  action: SuggestedAction | null;
}

const labelMap: Record<NonNullable<SuggestedAction['type']>, string> = {
  CONTINUE: 'Continue exploring',
  TRANSITION: 'Ready to transition',
  COMPLETE: 'Complete',
};

export function SuggestedActionTag({ action }: SuggestedActionTagProps) {
  if (!action) {
    return null;
  }

  return (
    <div className={`suggested-action suggested-action--${action.type.toLowerCase()}`}>
      <span className="suggested-action__label">{labelMap[action.type]}</span>
      {action.message && <span className="suggested-action__message">{action.message}</span>}
      {action.nextPhase && (
        <span className="suggested-action__phase">Next phase: {action.nextPhase}</span>
      )}
    </div>
  );
}
