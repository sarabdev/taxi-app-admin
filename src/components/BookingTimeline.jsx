export default function BookingTimeline({ logs }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                No activity recorded yet.
            </div>
        );
    }

    return (
        <ul className="space-y-4">
            {logs.map((l, index) => (
                <li key={l._id} className="relative flex gap-3">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                        <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary-600 ring-4 ring-primary-50" />

                        {index !== logs.length - 1 && (
                            <div className="mt-1 h-full min-h-8 w-px bg-gray-200" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pb-1">
                        <div className="break-words text-sm font-semibold text-gray-900">
                            {l.action}
                        </div>

                        <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center">
                            <span className="break-words">
                                {l.performedByRole || "—"}
                            </span>

                            <span className="hidden sm:inline">•</span>

                            <span>
                                {new Date(l.createdAt).toLocaleString()}
                            </span>
                        </div>

                        {l.note && (
                            <div className="mt-2 break-words rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
                                {l.note}
                            </div>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}