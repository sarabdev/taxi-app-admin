import { useEffect, useMemo, useState } from "react";
import { Calculator, CarFront, Info, MapPin, ReceiptPoundSterling } from "lucide-react";
import { fetchCars } from "../../api/cars";
import { fetchSettings } from "../../api/settings";

const AIRPORTS = [
  { code: "EDI", name: "Edinburgh Airport" },
  { code: "GLA", name: "Glasgow Airport" },
];

function money(value) {
  return `£${Number(value || 0).toFixed(2)}`;
}

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function bandLabel(band, index, bands) {
  const previousLimit = index === 0 ? 0 : bands[index - 1].upToMiles;
  return band.upToMiles == null
    ? `Over ${previousLimit || 0} miles`
    : `${previousLimit || 0}–${band.upToMiles} miles`;
}

function findBand(car, airportCode, distance) {
  const bands = car?.airportPricing?.[airportCode]?.bands || [];
  return bands.find(
    (band) => band.upToMiles == null || Number(distance) <= Number(band.upToMiles)
  );
}

function discountAmount(amount, discount) {
  if (!discount?.isActive) return 0;
  const value = Number(discount.value || 0);
  const calculated =
    discount.type === "PERCENTAGE" ? (amount * Math.min(value, 100)) / 100 : value;
  return roundMoney(Math.min(amount, Math.max(0, calculated)));
}

function Step({ number, title, children }) {
  return (
    <div className="relative flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
        {number}
      </div>
      <div className="pb-6">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="mt-1 text-sm leading-6 text-gray-600">{children}</div>
      </div>
    </div>
  );
}

export default function FareCalculation() {
  const [cars, setCars] = useState([]);
  const [settings, setSettings] = useState({
    meetAndGreetPrice: 0,
    airportPickupFee: 0,
  });
  const [carId, setCarId] = useState("");
  const [airportCode, setAirportCode] = useState("EDI");
  const [distance, setDistance] = useState(10);
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [returnAirportCode, setReturnAirportCode] = useState("EDI");
  const [returnDistance, setReturnDistance] = useState(10);
  const [airportPickup, setAirportPickup] = useState(false);
  const [returnAirportPickup, setReturnAirportPickup] = useState(false);
  const [meetAndGreet, setMeetAndGreet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchCars(), fetchSettings()])
      .then(([carData, settingsData]) => {
        setCars(carData);
        setSettings(settingsData);
        setCarId(carData[0]?._id || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedCar = cars.find((car) => car._id === carId) || cars[0];

  const preview = useMemo(() => {
    if (!selectedCar) return null;

    const outboundDistance = Math.max(0.01, Number(distance) || 0.01);
    const inboundDistance = Math.max(0.01, Number(returnDistance) || 0.01);
    const outboundBand = findBand(selectedCar, airportCode, outboundDistance);
    const returnBand = findBand(selectedCar, returnAirportCode, inboundDistance);
    if (!outboundBand || (isReturnTrip && !returnBand)) return null;

    const basePrice = Number(selectedCar.basePrice || 0);
    const outboundRate = Number(outboundBand.pricePerMile || 0);
    const returnRate = Number(returnBand?.pricePerMile || 0);
    const outboundFare = roundMoney(basePrice + outboundDistance * outboundRate);
    const inboundFare = isReturnTrip
      ? roundMoney(basePrice + inboundDistance * returnRate)
      : 0;

    const applicableDiscount = (selectedCar.discounts || []).find(
      (discount) =>
        discount.isActive &&
        discount.condition === (isReturnTrip ? "RETURN_TRIP" : "ALWAYS")
    );
    const discountBase = isReturnTrip ? inboundFare : outboundFare;
    const carDiscount = discountAmount(discountBase, applicableDiscount);
    const airportFeeCount = Number(airportPickup) +
      Number(isReturnTrip && returnAirportPickup);
    const airportFee = roundMoney(
      airportFeeCount * Number(settings.airportPickupFee || 0)
    );
    const meetAndGreetFee = meetAndGreet
      ? Number(settings.meetAndGreetPrice || 0)
      : 0;
    const beforeRounding = roundMoney(
      outboundFare + inboundFare - carDiscount + airportFee + meetAndGreetFee
    );

    return {
      outboundDistance,
      inboundDistance,
      outboundBand,
      returnBand,
      outboundRate,
      returnRate,
      outboundFare,
      inboundFare,
      carDiscount,
      airportFee,
      airportFeeCount,
      meetAndGreetFee,
      beforeRounding,
      total: Math.round(beforeRounding),
    };
  }, [
    airportCode,
    airportPickup,
    distance,
    isReturnTrip,
    meetAndGreet,
    returnAirportPickup,
    returnAirportCode,
    returnDistance,
    selectedCar,
    settings,
  ]);

  const activeBands = selectedCar?.airportPricing?.[airportCode]?.bands || [];

  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
          Fare Calculation
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Understand how airport bands, vehicle pricing, discounts, and fees produce the final fare.
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-primary-700 to-primary-900 p-5 text-white shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/10 p-3">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/70">
              Core formula per journey leg
            </p>
            <p className="mt-2 text-xl font-bold sm:text-2xl">
              Base price + (journey miles × matching band rate)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="card">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Calculation order</h2>
          <Step number="1" title="Select the airport pricing table">
            The system uses Edinburgh or Glasgow pricing. When neither endpoint is an airport,
            it selects whichever supported airport is nearest to the journey.
          </Step>
          <Step number="2" title="Match the distance band">
            The complete leg distance selects one band. Its per-mile rate applies to every mile
            in that leg—not only the miles above the previous limit.
          </Step>
          <Step number="3" title="Calculate each leg">
            Base price is added once to the outbound leg and once again to the return leg.
            Each leg can match a different distance band.
          </Step>
          <Step number="4" title="Apply discounts">
            One-way discounts apply to the one-way fare. Return-trip discounts apply only to the
            return leg. Eligible coupons are applied afterward by the booking system.
          </Step>
          <Step number="5" title="Add fixed service fees">
            Meet &amp; Greet is added when selected. The airport pickup fee is added once for each
            leg that starts at Edinburgh or Glasgow Airport and is hidden from customers.
          </Step>
          <Step number="6" title="Round the displayed total">
            After discounts and service fees, the final booking total is rounded to the nearest
            whole pound.
          </Step>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                This preview does not apply a coupon. Coupon eligibility, minimum spend, and caps
                are checked separately when the customer enters a voucher.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-2.5 text-primary-700">
              <ReceiptPoundSterling className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Interactive example</h2>
              <p className="text-sm text-gray-500">Uses your saved car bands and service fees.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading pricing data…</div>
          ) : !selectedCar ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Add a car before using the fare example.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Car</label>
                  <select className="input-field" value={selectedCar._id} onChange={(e) => setCarId(e.target.value)}>
                    {cars.map((car) => (
                      <option key={car._id} value={car._id}>{car.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Airport rates</label>
                  <select className="input-field" value={airportCode} onChange={(e) => setAirportCode(e.target.value)}>
                    {AIRPORTS.map((airport) => (
                      <option key={airport.code} value={airport.code}>{airport.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Outbound miles</label>
                  <input className="input-field" type="number" min="0.01" step="0.01" value={distance} onChange={(e) => setDistance(e.target.value)} />
                </div>
                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 sm:self-end">
                  <input type="checkbox" checked={airportPickup} onChange={(e) => setAirportPickup(e.target.checked)} />
                  Pickup starts at airport
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                  <input type="checkbox" checked={isReturnTrip} onChange={(e) => setIsReturnTrip(e.target.checked)} />
                  Include return journey
                </label>
                {isReturnTrip && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">Return miles</label>
                      <input className="input-field" type="number" min="0.01" step="0.01" value={returnDistance} onChange={(e) => setReturnDistance(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">Return airport rates</label>
                      <select className="input-field" value={returnAirportCode} onChange={(e) => setReturnAirportCode(e.target.value)}>
                        {AIRPORTS.map((airport) => (
                          <option key={airport.code} value={airport.code}>{airport.name}</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 sm:self-end">
                      <input type="checkbox" checked={returnAirportPickup} onChange={(e) => setReturnAirportPickup(e.target.checked)} />
                      Return starts at airport
                    </label>
                  </div>
                )}
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={meetAndGreet} onChange={(e) => setMeetAndGreet(e.target.checked)} />
                Include Meet &amp; Greet ({money(settings.meetAndGreetPrice)})
              </label>

              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  Active {airportCode} bands
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeBands.map((band, index) => (
                    <span
                      key={`${band.upToMiles}-${index}`}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${band === preview?.outboundBand
                        ? "border-primary-300 bg-primary-50 text-primary-800"
                        : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      {bandLabel(band, index, activeBands)} · {money(band.pricePerMile)}/mi
                    </span>
                  ))}
                </div>
              </div>

              {preview && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                  <div className="bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <CarFront className="h-4 w-4 text-primary-600" />
                      Example breakdown
                    </div>
                  </div>
                  <div className="space-y-2.5 p-4 text-sm">
                    <div className="flex justify-between gap-3 text-gray-600">
                      <span>Outbound: {money(selectedCar.basePrice)} + ({preview.outboundDistance} × {money(preview.outboundRate)})</span>
                      <span className="font-semibold text-gray-900">{money(preview.outboundFare)}</span>
                    </div>
                    {isReturnTrip && (
                      <div className="flex justify-between gap-3 text-gray-600">
                        <span>Return: {money(selectedCar.basePrice)} + ({preview.inboundDistance} × {money(preview.returnRate)})</span>
                        <span className="font-semibold text-gray-900">{money(preview.inboundFare)}</span>
                      </div>
                    )}
                    {preview.carDiscount > 0 && (
                      <div className="flex justify-between gap-3 text-green-700">
                        <span>Car discount</span>
                        <span className="font-semibold">−{money(preview.carDiscount)}</span>
                      </div>
                    )}
                    {preview.airportFee > 0 && (
                      <div className="flex justify-between gap-3 text-gray-600">
                        <span>Airport pickup fee × {preview.airportFeeCount}</span>
                        <span className="font-semibold text-gray-900">{money(preview.airportFee)}</span>
                      </div>
                    )}
                    {preview.meetAndGreetFee > 0 && (
                      <div className="flex justify-between gap-3 text-gray-600">
                        <span>Meet &amp; Greet</span>
                        <span className="font-semibold text-gray-900">{money(preview.meetAndGreetFee)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-4 border-t bg-primary-50 px-4 py-4">
                    <div>
                      <p className="text-xs font-medium text-primary-700">Before whole-pound rounding</p>
                      <p className="mt-0.5 text-sm font-semibold text-primary-900">{money(preview.beforeRounding)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-primary-700">Final fare</p>
                      <p className="text-2xl font-black text-primary-900">£{preview.total}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
