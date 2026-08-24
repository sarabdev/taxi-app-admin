const EXTRA_ITEM_LABELS = {
    none: "None",
    extra_large_bag_35kg: "Extra-large bag (35kg)",
    wheelchair: "Wheelchair",
    pram: "Pram",
    golf_bag: "Golf bag",
    other: "Other",
};

export default function BookingInformation({ booking }) {
    const luggage = booking.luggage || {};
    const flight = booking.flight || {};
    const returnTrip = booking.returnTrip || {};
    const bags = Number(luggage.largeBags23kg || 0)
        + Number(luggage.smallBags15kg || 0)
        + Number(luggage.shoulderBags || 0);

    return (
        <div className="space-y-4">
            <Section title="Journey details">
                <Info label="Pickup" value={booking.pickupLocation} />
                <Info label="Destination" value={booking.dropoffLocation} />
                <Info label="Pickup date" value={formatDate(booking.pickupDate)} />
                <Info label="Pickup time" value={booking.pickupTime} />
                {booking.isReturnTrip && (
                    <>
                        <Info label="Return pickup" value={returnTrip.pickupLocation} />
                        <Info label="Return destination" value={returnTrip.dropoffLocation} />
                        <Info label="Return date" value={formatDate(returnTrip.pickupDate)} />
                        <Info label="Return time" value={returnTrip.pickupTime} />
                    </>
                )}
            </Section>

            <Section title="Passenger details">
                <Info label="Lead passenger" value={booking.customerName} />
                <Info label="Confirmation email" value={booking.customerEmail} />
                <Info label="Phone number" value={booking.customerPhone} />
                <Info label="Passengers" value={booking.passengers ?? 1} />
                <Info label="Luggage" value={`${bags} ${bags === 1 ? "item" : "items"}`} />
                <Info label="Large bags (23kg)" value={luggage.largeBags23kg ?? 0} />
                <Info label="Small bags (15kg)" value={luggage.smallBags15kg ?? 0} />
                <Info label="Shoulder / hand carry" value={luggage.shoulderBags ?? 0} />
                <Info label="Extra-large item" value={EXTRA_ITEM_LABELS[luggage.extraLargeItemType] || luggage.extraLargeItemType || "None"} />
                {luggage.extraLargeItemNote && <Info label="Extra item note" value={luggage.extraLargeItemNote} />}
            </Section>

            <Section title="Order summary">
                <Info label="Booking reference" value={bookingReference(booking)} />
                <Info label="Vehicle" value={booking.carId?.name || booking.carId || "Airport taxi"} />
                <Info label="Journey type" value={booking.isReturnTrip ? "Return journey" : "One way"} />
                {flight.flightNumber && <Info label="Flight number" value={flight.flightNumber} />}
                {flight.meetAndGreet && <Info label="Meet & Greet" value="Service included" />}
                <Info label="Total paid" value={money(booking.pricing?.totalFare)} strong />
                <Info label="Status" value={booking.status} />
                {booking.completionNote && <Info label="Completion note" value={booking.completionNote} />}
            </Section>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">{title}</h2>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">{children}</div>
        </section>
    );
}

function Info({ label, value, strong = false }) {
    const displayed = value === 0 ? 0 : value || "Not provided";
    return (
        <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            <p className={`mt-1 break-words text-sm ${strong ? "font-bold text-primary-600" : "font-medium text-gray-800"}`}>{displayed}</p>
        </div>
    );
}

function bookingReference(booking) {
    return String(booking._id || "").slice(-8).toUpperCase() || "—";
}

function money(value) {
    return `£${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
    if (!value) return "Not provided";
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime())
        ? value
        : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(parsed);
}
