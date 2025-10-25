interface EmptyStateProps {
  isCreating: boolean;
  onCreate: () => void;
}

export function EmptyState({ isCreating, onCreate }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <h2 className="empty-state__title">Ask the dashboard agent</h2>
      <p className="empty-state__body">
        Generate data summaries, iterate on visualizations, and capture the final dashboard plan.
        Start a fresh session to load the latest documentation.
      </p>
      <button
        type="button"
        className="button-primary"
        onClick={onCreate}
        disabled={isCreating}
      >
        {isCreating ? 'Starting…' : 'Start new session'}
      </button>
    </section>
  );
}
