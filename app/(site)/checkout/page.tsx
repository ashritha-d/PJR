"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Check, Loader2, MapPin, User, CreditCard, ClipboardList, Plus } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { usePublicSettings } from "@/lib/use-public-settings";
import { calculateOrderTotals } from "@/lib/order-math";
import { formatCurrency, cn } from "@/lib/utils";
import { addressSchema } from "@/lib/validations";

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const STEPS = [
  { id: 1, label: "Customer Info", icon: User },
  { id: 2, label: "Delivery Address", icon: MapPin },
  { id: 3, label: "Order Summary", icon: ClipboardList },
  { id: 4, label: "Payment", icon: CreditCard },
];

export default function CheckoutPage() {
  const { status } = useSession();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { settings } = usePublicSettings();

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({ customerName: "", customerPhone: "", customerEmail: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "ONLINE">("COD");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCustomer({
            customerName: data.user.name ?? "",
            customerPhone: data.user.phone ?? "",
            customerEmail: data.user.email ?? "",
          });
        }
      });
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data.items ?? []);
        const def = (data.items ?? []).find((a: Address) => a.isDefault) ?? data.items?.[0];
        if (def) setSelectedAddressId(def.id);
        else setShowNewAddress(true);
      });
  }, [status]);

  const { deliveryCharge, tax, grandTotal } = calculateOrderTotals({
    subtotal,
    deliveryChargeFlat: settings.deliveryChargeFlat,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    taxPercent: settings.taxPercent,
    discount: couponResult?.discount ?? 0,
  });

  async function applyCoupon() {
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCouponError(data.error ?? "Invalid coupon");
      setCouponResult(null);
      return;
    }
    setCouponResult({ code: data.code, discount: data.discount });
    toast.success(`Coupon applied! You saved ${formatCurrency(data.discount)}`);
  }

  function validateStep1() {
    if (!customer.customerName.trim() || customer.customerName.trim().length < 2) {
      setErrors({ customerName: "Name is required" });
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(customer.customerPhone)) {
      setErrors({ customerPhone: "Enter a valid 10-digit mobile number" });
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(customer.customerEmail)) {
      setErrors({ customerEmail: "Enter a valid email address" });
      return false;
    }
    setErrors({});
    return true;
  }

  async function saveNewAddress() {
    const parsed = addressSchema.safeParse(newAddress);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return false;
    }
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not save address");
      return false;
    }
    setAddresses((prev) => [data.address, ...prev]);
    setSelectedAddressId(data.address.id);
    setShowNewAddress(false);
    setErrors({});
    return true;
  }

  async function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2) {
      if (showNewAddress) {
        const ok = await saveNewAddress();
        if (!ok) return;
      } else if (!selectedAddressId) {
        toast.error("Please select or add a delivery address");
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
  }

  async function placeOrder() {
    setPlacing(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...customer,
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: couponResult?.code ?? null,
      }),
    });
    const data = await res.json();
    setPlacing(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not place order");
      return;
    }

    await clearCart();
    toast.success("Order placed successfully!");
    router.push(`/order-confirmation/${data.orderNumber}`);
  }

  if (status === "loading" || items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        {status === "loading" ? (
          <Loader2 className="mx-auto animate-spin text-forest-400" size={32} />
        ) : (
          <p className="text-forest-500">Your cart is empty. Add some products before checking out.</p>
        )}
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="section-heading">Checkout</h1>

      <div className="mt-8 flex items-center justify-between overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  step > s.id
                    ? "border-forest-700 bg-forest-700 text-cream-100"
                    : step === s.id
                    ? "border-forest-700 text-forest-700"
                    : "border-forest-200 text-forest-300"
                )}
              >
                {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
              </div>
              <span className="hidden text-xs font-medium text-forest-600 sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1", step > s.id ? "bg-forest-700" : "bg-forest-200")} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-forest-800">Customer Information</h2>
              <div>
                <label className="label-field">Full Name</label>
                <input
                  className="input-field"
                  value={customer.customerName}
                  onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
                />
                {errors.customerName && <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>}
              </div>
              <div>
                <label className="label-field">Mobile Number</label>
                <input
                  className="input-field"
                  value={customer.customerPhone}
                  onChange={(e) => setCustomer({ ...customer, customerPhone: e.target.value })}
                />
                {errors.customerPhone && <p className="mt-1 text-xs text-red-600">{errors.customerPhone}</p>}
              </div>
              <div>
                <label className="label-field">Email Address</label>
                <input
                  className="input-field"
                  value={customer.customerEmail}
                  onChange={(e) => setCustomer({ ...customer, customerEmail: e.target.value })}
                />
                {errors.customerEmail && <p className="mt-1 text-xs text-red-600">{errors.customerEmail}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-forest-800">Delivery Address</h2>
                {!showNewAddress && (
                  <button
                    onClick={() => setShowNewAddress(true)}
                    className="flex items-center gap-1 text-sm font-semibold text-forest-700 hover:underline"
                  >
                    <Plus size={16} /> Add New
                  </button>
                )}
              </div>

              {!showNewAddress ? (
                <div className="space-y-3">
                  {addresses.length === 0 && (
                    <p className="text-sm text-forest-500">No saved addresses. Please add one.</p>
                  )}
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "block cursor-pointer rounded-2xl border-2 p-4 transition",
                        selectedAddressId === a.id ? "border-forest-700 bg-forest-50" : "border-forest-100"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="mt-1 accent-forest-700"
                        />
                        <div>
                          <p className="text-sm font-semibold text-forest-800">
                            {a.label} — {a.fullName}
                          </p>
                          <p className="text-sm text-forest-500">
                            {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}
                          </p>
                          <p className="text-xs text-forest-400">Phone: {a.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label-field">Full Name</label>
                      <input
                        className="input-field"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      />
                      {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className="label-field">Phone</label>
                      <input
                        className="input-field"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label-field">Address Line 1</label>
                    <input
                      className="input-field"
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    />
                    {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1}</p>}
                  </div>
                  <div>
                    <label className="label-field">Address Line 2 (optional)</label>
                    <input
                      className="input-field"
                      value={newAddress.line2}
                      onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="label-field">City</label>
                      <input
                        className="input-field"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                      {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="label-field">State</label>
                      <input
                        className="input-field"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                      {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="label-field">Pincode</label>
                      <input
                        className="input-field"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      />
                      {errors.pincode && <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>}
                    </div>
                  </div>
                  {addresses.length > 0 && (
                    <button onClick={() => setShowNewAddress(false)} className="text-sm font-medium text-forest-600 hover:underline">
                      ← Use a saved address instead
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-forest-800">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-forest-50">
                      <Image src={item.image || "/placeholders/vegetables.svg"} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-forest-800">{item.name}</p>
                      <p className="text-xs text-forest-500">{item.unit} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-forest-800">
                      {formatCurrency((item.discountPrice ?? item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t border-forest-100 pt-4">
                <input
                  className="input-field"
                  placeholder="Have a coupon code?"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button onClick={applyCoupon} className="btn-secondary shrink-0 !py-2.5">
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs text-red-600">{couponError}</p>}
              {couponResult && (
                <p className="text-xs font-medium text-forest-700">
                  Coupon {couponResult.code} applied — you saved {formatCurrency(couponResult.discount)}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-forest-800">Payment Method</h2>
              {[
                { id: "COD", label: "Cash on Delivery", desc: "Pay with cash when your order arrives." },
                { id: "UPI", label: "UPI", desc: "Pay instantly using any UPI app." },
                { id: "ONLINE", label: "Online Payment", desc: "Pay securely via card / net banking." },
              ].map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "block cursor-pointer rounded-2xl border-2 p-4 transition",
                    paymentMethod === m.id ? "border-forest-700 bg-forest-50" : "border-forest-100"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id as typeof paymentMethod)}
                      className="mt-1 accent-forest-700"
                    />
                    <div>
                      <p className="text-sm font-semibold text-forest-800">{m.label}</p>
                      <p className="text-xs text-forest-500">{m.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
              {paymentMethod !== "COD" && (
                <p className="rounded-xl bg-gold/10 p-3 text-xs text-gold-dark">
                  A live payment gateway isn&apos;t connected yet in this environment — this payment will be
                  simulated as successful so you can test the full order flow.
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-secondary">
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button onClick={handleNext} className="btn-primary">
                Continue
              </button>
            ) : (
              <button onClick={placeOrder} disabled={placing} className="btn-primary">
                {placing && <Loader2 size={16} className="animate-spin" />}
                Place Order
              </button>
            )}
          </div>
        </div>

        <div className="card h-fit p-6">
          <h3 className="font-display text-lg font-bold text-forest-800">Order Total</h3>
          <div className="mt-4 space-y-2 text-sm text-forest-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {couponResult && (
              <div className="flex justify-between text-forest-700">
                <span>Discount ({couponResult.code})</span>
                <span>-{formatCurrency(couponResult.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>{deliveryCharge === 0 ? "FREE" : formatCurrency(deliveryCharge)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between border-t border-forest-100 pt-4 font-display text-lg font-bold text-forest-800">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
