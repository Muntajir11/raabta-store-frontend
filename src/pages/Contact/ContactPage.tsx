import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import './ContactPage.css';
import { contactSubmit } from '../../lib/api';

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>;

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidPhone(v: string): boolean {
  return /^[0-9+\-\s()]{7,20}$/.test(v);
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const trimmed = useMemo(
    () => ({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    }),
    [email, message, name, phone],
  );

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!trimmed.name) next.name = 'Name is required';
    if (!trimmed.email) next.email = 'Email is required';
    else if (!isValidEmail(trimmed.email)) next.email = 'Enter a valid email';
    if (!trimmed.phone) next.phone = 'Phone number is required';
    else if (!isValidPhone(trimmed.phone)) next.phone = 'Enter a valid phone number';
    if (!trimmed.message) next.message = 'Message is required';
    else if (trimmed.message.length < 10) next.message = 'Please add a little more detail';
    return next;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await contactSubmit({
        name: trimmed.name,
        email: trimmed.email,
        phone: trimmed.phone,
        message: trimmed.message,
      });
      toast.success('Sent. We will get back to you soon.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact">
      <div className="container">
        <div className="contact-head">
          <h1 className="contact-title">Contact us</h1>
          <p className="contact-subtitle">
            Send us your query and our team will reach out as soon as possible.
          </p>
        </div>

        <form className="contact-card" onSubmit={onSubmit} noValidate>
          <div className="contact-grid">
            <div className="contact-field">
              <label className="contact-label" htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                className="contact-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
              {errors.name ? <div className="contact-error">{errors.name}</div> : null}
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="contact-phone">
                Phone
              </label>
              <input
                id="contact-phone"
                className="contact-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                autoComplete="tel"
                required
              />
              {errors.phone ? <div className="contact-error">{errors.phone}</div> : null}
            </div>

            <div className="contact-field full">
              <label className="contact-label" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                className="contact-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              {errors.email ? <div className="contact-error">{errors.email}</div> : null}
            </div>

            <div className="contact-field full">
              <label className="contact-label" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                className="contact-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your query here…"
                required
              />
              {errors.message ? <div className="contact-error">{errors.message}</div> : null}
            </div>

            <div className="contact-actions">
              <button className="contact-btn" type="submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

