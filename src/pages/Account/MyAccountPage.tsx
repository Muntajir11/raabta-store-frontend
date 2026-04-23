import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ApiRequestError,
  notifyAuthChanged,
  profileGet,
  profileUpdate,
  type ProfileUser,
} from '../../lib/api';
import RequireAuth from '../../components/RequireAuth';
import { INDIAN_STATES } from '../../lib/india-states';
import { avatarDataUrlFromSeed, randomAvatarDataUrl } from '../../lib/avatar';
import './AccountPages.css';

export default function MyAccountPage() {
  return (
    <RequireAuth>
      <MyAccountContent />
    </RequireAuth>
  );
}

function MyAccountContent() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileUser | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // legacy / optional
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddressLine1, setShippingAddressLine1] = useState('');
  const [shippingAddressLine2, setShippingAddressLine2] = useState('');
  const [shippingLandmark, setShippingLandmark] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const phoneTrimmed = phone.trim();
  const phoneOk = phoneTrimmed === '' || /^[6-9]\d{9}$/.test(phoneTrimmed);

  const shipNameOk = shippingName.trim().length >= 2;
  const shipPhoneOk = /^[6-9]\d{9}$/.test(shippingPhone.trim());
  const shipLine1Ok = shippingAddressLine1.trim().length >= 2;
  const shipLine2Ok = shippingAddressLine2.trim().length >= 2;
  const shipLandmarkOk = shippingLandmark.trim().length >= 2;
  const shipPincodeOk = /^\d{6}$/.test(shippingPincode.trim());
  const shipCityOk = shippingCity.trim().length >= 2;
  const shipStateOk = INDIAN_STATES.includes(shippingState);
  const canSaveAddress =
    shipNameOk &&
    shipPhoneOk &&
    shipLine1Ok &&
    shipLine2Ok &&
    shipLandmarkOk &&
    shipPincodeOk &&
    shipCityOk &&
    shipStateOk &&
    !savingAddress;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await profileGet();
        if (cancelled) return;
        setProfile(p);
        setName(p.name);
        setPhone(p.phone);
        setGender(p.gender);
        setShippingName(p.shippingName);
        setShippingPhone(p.shippingPhone);
        setShippingAddressLine1(p.shippingAddressLine1);
        setShippingAddressLine2(p.shippingAddressLine2);
        setShippingLandmark(p.shippingLandmark);
        setShippingPincode(p.shippingPincode);
        setShippingCity(p.shippingCity);
        setShippingState(p.shippingState);
        setDeliveryInstructions(p.deliveryInstructions);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiRequestError
            ? err.status === 401
              ? 'Please log in again.'
              : err.message
            : 'Could not load profile';
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmitProfile(e: React.FormEvent) {
    e.preventDefault();
    setTouched((t) => ({ ...t, phone: true }));
    if (!phoneOk) {
      const msg = 'Enter a valid 10-digit phone number (or leave it empty).';
      setError(msg);
      toast.error(msg);
      return;
    }
    setSavingProfile(true);
    setError(null);
    try {
      const updated = await profileUpdate({
        name: name.trim(),
        gender,
      });
      setProfile(updated);
      notifyAuthChanged();
      toast.success('Profile saved');
    } catch (err) {
      const msg =
        err instanceof ApiRequestError ? err.message : err instanceof Error ? err.message : 'Save failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSubmitAddress(e: React.FormEvent) {
    e.preventDefault();
    setTouched((t) => ({
      ...t,
      ship_name: true,
      ship_phone: true,
      ship_line1: true,
      ship_line2: true,
      ship_landmark: true,
      ship_city: true,
      ship_state: true,
      ship_pincode: true,
    }));

    if (!canSaveAddress) {
      const msg = 'Please fill all required address fields.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setSavingAddress(true);
    setError(null);
    try {
      const updated = await profileUpdate({
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddressLine1: shippingAddressLine1.trim(),
        shippingAddressLine2: shippingAddressLine2.trim(),
        shippingCity: shippingCity.trim(),
        shippingState,
        shippingPincode: shippingPincode.trim(),
        shippingLandmark: shippingLandmark.trim(),
        shippingCountry: 'India',
        deliveryInstructions: deliveryInstructions.trim(),
      });
      setProfile(updated);
      notifyAuthChanged();
      toast.success('Address saved');
    } catch (err) {
      const msg =
        err instanceof ApiRequestError ? err.message : err instanceof Error ? err.message : 'Save failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingAddress(false);
    }
  }

  const [avatarSrc, setAvatarSrc] = useState(() => randomAvatarDataUrl());

  useEffect(() => {
    const seed = profile?.avatarSeed || '';
    if (seed) setAvatarSrc(avatarDataUrlFromSeed(seed));
  }, [profile?.avatarSeed]);

  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-header-row">
          <h2 className="cart-title">My Account</h2>
        </div>

        {loading ? (
          <p className="cart-state">Loading…</p>
        ) : error && !profile ? (
          <p className="cart-error" role="alert">
            {error}
          </p>
        ) : (
          <div className="account-grid">
            <div className="account-hero">
              <img className="account-avatar" src={avatarSrc} alt="" aria-hidden />
              <div className="account-hero-main">
                <div className="account-hero-name">{profile?.name || name || 'My Account'}</div>
                <div className="account-hero-email">{profile?.email || ''}</div>
              </div>
            </div>

            <form className="account-card" onSubmit={(e) => void onSubmitProfile(e)}>
              <h3 className="account-card-title">Profile</h3>
              {error ? (
                <p className="account-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="account-form">
                <div className="account-field">
                  <label htmlFor="acc-name">Name</label>
                  <input
                    id="acc-name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={savingProfile}
                    required
                  />
                </div>
                <div className="account-field">
                  <label htmlFor="acc-email">Email</label>
                  <input
                    id="acc-email"
                    type="email"
                    name="email"
                    value={profile?.email ?? ''}
                    readOnly
                    disabled
                    aria-describedby="acc-email-hint"
                  />
                  <p id="acc-email-hint" className="account-hint">
                    Email sign-in cannot be changed here.
                  </p>
                </div>
                <div className="account-field">
                  <label htmlFor="acc-phone">Phone</label>
                  <input
                    id="acc-phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder="Optional"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    disabled={savingProfile}
                    aria-invalid={touched.phone && !phoneOk ? true : undefined}
                  />
                  {touched.phone && !phoneOk ? (
                    <p className="account-hint">Enter a valid 10-digit phone number (or leave it empty).</p>
                  ) : null}
                </div>
                <div className="account-field">
                  <label htmlFor="acc-gender">Gender</label>
                  <select
                    id="acc-gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value === 'female' ? 'female' : 'male')}
                    disabled={savingProfile}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="account-actions">
                  <button type="submit" className="account-submit" disabled={savingProfile}>
                    {savingProfile ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>

            <form className="account-card" id="address" onSubmit={(e) => void onSubmitAddress(e)}>
              <h3 className="account-card-title">Default shipping address</h3>
              <p className="account-hint account-hint-tight">Used for delivery. Contact phone is required for delivery.</p>
              {error ? (
                <p className="account-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="account-form">
                <div className="account-field">
                  <label htmlFor="ship-country">Country/Region</label>
                  <select id="ship-country" name="shippingCountry" value="India" disabled>
                    <option value="India">India</option>
                  </select>
                </div>

                <div className="account-field">
                  <label htmlFor="ship-name">Full name (First and Last name)</label>
                  <input
                    id="ship-name"
                    name="shippingName"
                    autoComplete="name"
                    placeholder="Full name"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, ship_name: true }))}
                    disabled={savingAddress}
                    required
                    aria-invalid={touched.ship_name && !shipNameOk ? true : undefined}
                  />
                  {touched.ship_name && !shipNameOk ? <p className="account-hint">Full name is required.</p> : null}
                </div>

                <div className="account-field">
                  <label htmlFor="ship-phone">Mobile number</label>
                  <input
                    id="ship-phone"
                    type="tel"
                    name="shippingPhone"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, ship_phone: true }))}
                    disabled={savingAddress}
                    inputMode="numeric"
                    maxLength={10}
                    required
                    aria-invalid={touched.ship_phone && !shipPhoneOk ? true : undefined}
                  />
                  {touched.ship_phone && !shipPhoneOk ? <p className="account-hint">Enter a valid 10-digit phone number.</p> : null}
                </div>

                <div className="account-field">
                  <label htmlFor="ship-line1">Flat, House no., Building, Company, Apartment</label>
                  <input
                    id="ship-line1"
                    name="shippingAddressLine1"
                    autoComplete="address-line1"
                    placeholder="Flat / House / Building"
                    value={shippingAddressLine1}
                    onChange={(e) => setShippingAddressLine1(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, ship_line1: true }))}
                    disabled={savingAddress}
                    maxLength={200}
                    required
                    aria-invalid={touched.ship_line1 && !shipLine1Ok ? true : undefined}
                  />
                  {touched.ship_line1 && !shipLine1Ok ? <p className="account-hint">Address line 1 is required.</p> : null}
                </div>

                <div className="account-field">
                  <label htmlFor="ship-line2">Area, Street, Sector, Village</label>
                  <input
                    id="ship-line2"
                    name="shippingAddressLine2"
                    autoComplete="address-line2"
                    placeholder="Area / Street / Sector"
                    value={shippingAddressLine2}
                    onChange={(e) => setShippingAddressLine2(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, ship_line2: true }))}
                    disabled={savingAddress}
                    maxLength={200}
                    required
                    aria-invalid={touched.ship_line2 && !shipLine2Ok ? true : undefined}
                  />
                  {touched.ship_line2 && !shipLine2Ok ? <p className="account-hint">Address line 2 is required.</p> : null}
                </div>

                <div className="account-field">
                  <label htmlFor="ship-landmark">Landmark</label>
                  <input
                    id="ship-landmark"
                    name="shippingLandmark"
                    autoComplete="off"
                    placeholder="E.g. near Apollo hospital"
                    value={shippingLandmark}
                    onChange={(e) => setShippingLandmark(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, ship_landmark: true }))}
                    disabled={savingAddress}
                    maxLength={120}
                    required
                    aria-invalid={touched.ship_landmark && !shipLandmarkOk ? true : undefined}
                  />
                  {touched.ship_landmark && !shipLandmarkOk ? <p className="account-hint">Landmark is required.</p> : null}
                </div>

                <div className="account-field">
                  <label htmlFor="ship-pincode">Pincode</label>
                  <input
                    id="ship-pincode"
                    name="shippingPincode"
                    inputMode="numeric"
                    placeholder="6-digit pincode"
                    value={shippingPincode}
                    onChange={(e) => setShippingPincode(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, ship_pincode: true }))}
                    disabled={savingAddress}
                    maxLength={6}
                    required
                    aria-invalid={touched.ship_pincode && !shipPincodeOk ? true : undefined}
                  />
                  {touched.ship_pincode && !shipPincodeOk ? <p className="account-hint">Enter a valid 6-digit pincode.</p> : null}
                </div>

                <div className="account-field">
                  <label htmlFor="ship-city">Town/City</label>
                  <input
                    id="ship-city"
                    name="shippingCity"
                    autoComplete="address-level2"
                    placeholder="Town/City"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, ship_city: true }))}
                    disabled={savingAddress}
                    maxLength={120}
                    required
                    aria-invalid={touched.ship_city && !shipCityOk ? true : undefined}
                  />
                  {touched.ship_city && !shipCityOk ? <p className="account-hint">City is required.</p> : null}
                </div>

                <div className="account-field">
                  <label htmlFor="ship-state">State</label>
                  <select
                    id="ship-state"
                    name="shippingState"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, ship_state: true }))}
                    disabled={savingAddress}
                    required
                    aria-invalid={touched.ship_state && !shipStateOk ? true : undefined}
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {touched.ship_state && !shipStateOk ? <p className="account-hint">State is required.</p> : null}
                </div>

                <div className="account-field">
                  <label htmlFor="ship-instructions">Delivery instructions (optional)</label>
                  <textarea
                    id="ship-instructions"
                    name="deliveryInstructions"
                    autoComplete="off"
                    placeholder="Notes, preferences and more"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    disabled={savingAddress}
                    maxLength={500}
                  />
                </div>
                <div className="account-actions">
                  <button type="submit" className="account-submit" disabled={!canSaveAddress}>
                    {savingAddress ? 'Saving…' : 'Save address'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
