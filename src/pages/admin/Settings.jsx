import { useEffect, useState } from "react";
import { fetchSettings, updateSettings } from "../../api/settings";

export default function Settings() {
  const [meetAndGreetPrice, setMeetAndGreetPrice] = useState("");
  const [airportPickupFee, setAirportPickupFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings()
      .then((settings) => {
        setMeetAndGreetPrice(Number(settings.meetAndGreetPrice || 0).toFixed(2));
        setAirportPickupFee(Number(settings.airportPickupFee || 0).toFixed(2));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const price = Number(meetAndGreetPrice);
    const pickupFee = Number(airportPickupFee);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid non-negative price.");
      return;
    }
    if (!Number.isFinite(pickupFee) || pickupFee < 0) {
      setError("Enter a valid non-negative airport pickup fee.");
      return;
    }

    setSaving(true);
    try {
      const settings = await updateSettings({
        meetAndGreetPrice: price,
        airportPickupFee: pickupFee,
      });
      setMeetAndGreetPrice(Number(settings.meetAndGreetPrice).toFixed(2));
      setAirportPickupFee(Number(settings.airportPickupFee).toFixed(2));
      setSuccess("Service fees updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage service fees used in customer bookings.
        </p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
          Meet &amp; Greet Service
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          This fixed fee is added to the booking total when a customer selects
          Meet &amp; Greet. Set it to £0.00 to offer the service for free.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Price (£)
            </label>
            <input
              className="input-field max-w-xs"
              type="number"
              min="0"
              step="0.01"
              value={meetAndGreetPrice}
              onChange={(event) => setMeetAndGreetPrice(event.target.value)}
              disabled={loading || saving}
              required
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              Airport Pickup Fee
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Automatically added for each journey leg picked up from Edinburgh
              or Glasgow Airport. Customers only see the final total.
            </p>
            <label className="mb-2 mt-4 block text-sm font-semibold text-gray-700">
              Fee per airport pickup (£)
            </label>
            <input
              className="input-field max-w-xs"
              type="number"
              min="0"
              step="0.01"
              value={airportPickupFee}
              onChange={(event) => setAirportPickupFee(event.target.value)}
              disabled={loading || saving}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || saving}
          >
            {loading ? "Loading..." : saving ? "Saving..." : "Save Fees"}
          </button>
        </form>
      </div>
    </div>
  );
}
