export default function BookingTimeline({ logs }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="text-sm text-gray-500">
                No activity recorded yet.
            </div>
        );
    }

    return (
        <ul className="space-y-4">
            {logs.map((l) => (
                <li key={l._id} className="flex gap-3">
                    <div className="mt-1 h-3 w-3 rounded-full bg-primary-600" />
                    <div>
                        <div className="text-sm font-semibold">
                            {l.action}
                        </div>
                        <div className="text-xs text-gray-500">
                            {l.performedByRole} •{" "}
                            {new Date(l.createdAt).toLocaleString()}
                        </div>
                        {l.note && (
                            <div className="text-sm mt-1 text-gray-700">
                                {l.note}
                            </div>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}
