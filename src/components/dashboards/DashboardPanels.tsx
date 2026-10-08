import React, { useState } from 'react';
import { api, mutate, usePlatform } from '../../services/journey';
import { AuthorityMapIntelligence } from '../maps/smart/AuthorityMapIntelligence';
import '../journey/journey.css';

type Props = { role: 'authority' | 'business'; panel: string; onNavigate: (panel: string) => void };
const money = (value: number) => `₹${Number(value || 0).toLocaleString()}`;
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-empty"><strong>All clear for now</strong><p>{children}</p></div>;
}
export function DashboardPanels({ role, panel, onNavigate }: Props) {
  const { guides, packages, hotels, assistance, bookings, contributions, analytics, user } = usePlatform();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState('guide');
  const [listingType, setListingType] = useState('package');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [pack, setPack] = useState({ title: '', city: '', description: '', price: 500, minutes: 120, accessible: false });
  const [hotel, setHotel] = useState({ name: '', city: '', photo: '', accessible: false });
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setMessage('');
    try { await action(); setMessage(success); } catch (error) { setMessage(error instanceof Error ? error.message : 'Please retry.'); }
    finally { setBusy(false); }
  }
  const pending = [...guides, ...packages, ...hotels].filter(record => record.status === 'pending').length;
  const cards = role === 'authority'
    ? [['applications', 'Applications to review', pending, 'Guides, packages and hotels'], ['assistance', 'Open assistance requests', assistance.filter(r => r.status !== 'resolved').length, 'Coordinate and track responses'], ['feedback', 'Community contributions', contributions.length, 'Reviews, reports and evidence']]
    : [['listings', 'Your listings', packages.filter(p => p.owner === user?.id).length + hotels.filter(h => h.owner === user?.id).length, 'Packages and hotel profiles'], ['bookings', 'Active bookings', bookings.filter(b => !['cancelled', 'completed'].includes(b.status)).length, 'Confirm requests and manage tours'], ['customer_experience', 'Community feedback', contributions.length, 'Review visitor experiences']];
  const activeRecords = (category === 'guide' ? guides : category === 'package' ? packages : hotels).filter(r => status === 'all' || r.status === status);
  const filteredBookings = bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter);
  if (!['overview', 'applications', 'assistance', 'bookings', 'listings', 'feedback', 'customer_experience', 'intelligence', 'growth'].includes(panel)) return null;
  return <section className="journey-panel dashboard-connected" aria-label={`${role} ${panel} workspace`}>
    {message && <p role="status" className="dashboard-message">{message}</p>}
    {panel === 'overview' && <>
      <p className="journey-eyebrow">Your workspace at a glance</p><h2>What needs your attention?</h2>
      <div className="dashboard-summary-grid">{cards.map(([target, title, count, hint]) => <button key={String(target)} className="dashboard-summary-card" onClick={() => onNavigate(String(target))}><span>{title}</span><strong>{count}</strong><small>{hint}</small><span className="dashboard-card-link">Open workspace →</span></button>)}</div>
    </>}
    {panel === 'applications' && <>
      <h2>Applications</h2><p>Review each submission and record a decision. Demo approvals remain labelled as demo reviews.</p>
      <div className="dashboard-toolbar"><label>Category<select value={category} onChange={e => setCategory(e.target.value)}><option value="guide">Local guides</option><option value="package">Travel packages</option><option value="hotel">Hotels & stays</option></select></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="pending">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All applications</option></select></label></div>
      {!activeRecords.length && <Empty>No {status === 'all' ? '' : status} {category} applications. New submissions will appear here.</Empty>}
      {activeRecords.map(record => <article className="journey-card" key={record.id}><span className="journey-pill">{record.status}</span><h3>{record.name || record.title}</h3><p>{record.city} · {record.description || record.specialties || 'Hotel profile'}</p>{record.license && <p>Registration reference: {record.license}</p>}{record.photo && <a href={record.photo} target="_blank" rel="noreferrer">View submitted photo</a>}{record.status === 'pending' ? <><label>Review notes for {record.name || record.title}<textarea value={notes[record.id] || ''} onChange={e => setNotes({ ...notes, [record.id]: e.target.value })} placeholder="Explain what you checked and your decision." /></label><div className="journey-actions">{['approved', 'rejected'].map(decision => <button key={decision} disabled={busy || (notes[record.id] || '').trim().length < 5} onClick={() => run(() => mutate(`/review/${category}/${record.id}`, { status: decision, note: notes[record.id] }), 'Decision saved')}>{decision === 'approved' ? 'Approve application' : 'Reject application'}</button>)}</div></> : <p>{record.reviewNote || 'No review note recorded.'}</p>}</article>)}
    </>}
    {panel === 'assistance' && <>
      <h2>Assistance requests</h2><p>Track incoming requests and keep travellers informed. This prototype does not dispatch emergency services.</p>
      {!assistance.length && <Empty>No assistance requests have been submitted.</Empty>}
      {assistance.map(request => <article key={request.id} className="journey-card"><span className="journey-pill">{request.status}</span><h3>{request.place}</h3><p>{request.type} · {request.notes || 'No additional notes'}</p><div className="journey-actions"><button disabled={busy || request.status !== 'demo-pending'} onClick={() => run(() => mutate(`/assistance/${request.id}`, { status: 'acknowledged' }), 'Request acknowledged')}>Acknowledge</button><button disabled={busy || request.status === 'resolved'} onClick={() => run(() => mutate(`/assistance/${request.id}`, { status: 'resolved' }), 'Request resolved')}>Mark resolved</button></div></article>)}
      <AuthorityMapIntelligence />
      <details><summary>Guide booking coordination</summary>{renderBookings()}</details>
    </>}
    {panel === 'bookings' && <><h2>Bookings</h2><p>Manage incoming guide bookings, confirmations and completed tours.</p>{renderBookings()}</>}
    {panel === 'listings' && <>
      <h2>Listings & experiences</h2><p>Manage the information travellers see and submit new listings for review.</p>
      <label>Listing category<select value={listingType} onChange={e => setListingType(e.target.value)}><option value="package">Travel packages & experiences</option><option value="hotel">Hotels & stays</option></select></label>
      {(listingType === 'package' ? packages.filter(p => p.owner === user?.id) : hotels.filter(h => h.owner === user?.id)).map(record => <article className="journey-card" key={record.id}><span className="journey-pill">{record.status}</span><h3>{record.title || record.name}</h3><p>{record.city}{record.price !== undefined ? ` · ${money(record.price)}` : ''}</p>{record.reviewNote && <p>{record.reviewNote}</p>}</article>)}
      {!(listingType === 'package' ? packages.filter(p => p.owner === user?.id) : hotels.filter(h => h.owner === user?.id)).length && <Empty>No listings in this category. Add your first listing below.</Empty>}
      <details><summary>{listingType === 'package' ? 'Add a travel package' : 'Add a hotel profile'}</summary>{listingType === 'package' ? <form onSubmit={e => { e.preventDefault(); run(() => mutate('/packages', pack), 'Package submitted for review'); }}><div className="journey-grid"><label>Package title<input required value={pack.title} onChange={e => setPack({ ...pack, title: e.target.value })} /></label><label>City<input required value={pack.city} onChange={e => setPack({ ...pack, city: e.target.value })} /></label><label>Price (₹)<input type="number" min={0} value={pack.price} onChange={e => setPack({ ...pack, price: Number(e.target.value) })} /></label><label>Duration (minutes)<input type="number" min={30} value={pack.minutes} onChange={e => setPack({ ...pack, minutes: Number(e.target.value) })} /></label></div><label>Description<textarea required value={pack.description} onChange={e => setPack({ ...pack, description: e.target.value })} /></label><label className="journey-check"><input type="checkbox" checked={pack.accessible} onChange={e => setPack({ ...pack, accessible: e.target.checked })} />Accessible experience</label><button disabled={busy} className="journey-primary">Submit package</button></form> : <form onSubmit={e => { e.preventDefault(); run(() => mutate('/hotels', hotel), 'Hotel profile submitted for review'); }}><div className="journey-grid"><label>Hotel name<input required value={hotel.name} onChange={e => setHotel({ ...hotel, name: e.target.value })} /></label><label>City<input required value={hotel.city} onChange={e => setHotel({ ...hotel, city: e.target.value })} /></label></div><label>Current photo URL<input type="url" placeholder="https://…" value={hotel.photo} onChange={e => setHotel({ ...hotel, photo: e.target.value })} /></label><label className="journey-check"><input type="checkbox" checked={hotel.accessible} onChange={e => setHotel({ ...hotel, accessible: e.target.checked })} />Wheelchair access reported</label><button disabled={busy} className="journey-primary">Submit hotel profile</button></form>}</details>
    </>}
    {['feedback', 'customer_experience'].includes(panel) && <>
      <h2>{role === 'authority' ? 'Community reports & evidence' : 'Visitor feedback'}</h2><p>Recent community contributions, grouped by the place or business named by the traveller.</p>
      {!contributions.length && <Empty>No community contributions yet.</Empty>}
      {contributions.slice().reverse().map(record => <article key={record.id} className="journey-card"><span className="journey-pill">{record.kind}</span><span className="journey-pill">{record.status}</span><h3>{record.place}</h3><p>{record.text}</p>{role === 'authority' && record.hasEvidence && <button disabled={busy} onClick={() => run(async () => setEvidence((await api(`/evidence/${record.id}`)).evidence || ''), 'Evidence loaded')}>Review evidence</button>}</article>)}
      {evidence && <div className="journey-card"><img src={evidence} alt="Submitted contribution evidence" /><button onClick={() => setEvidence('')}>Close evidence</button></div>}
    </>}
    {['intelligence', 'growth'].includes(panel) && <>
      <h2>Community insights</h2><div className="journey-summary"><span>{analytics.reviews || 0} contributions</span><span>{analytics.positive || 0} positive ratings</span><span>{analytics.negative || 0} ratings needing attention</span></div>
      <div className="journey-grid"><article className="journey-card"><h3>Contributions by place</h3>{Object.entries(analytics.byPlace || {}).map(([place, count]) => <p key={place}>{place}: {String(count)}</p>)}{!Object.keys(analytics.byPlace || {}).length && <p>No contributions recorded yet.</p>}</article><article className="journey-card"><h3>Opt-in confirmed visits</h3><p>Counts reflect consented arrivals, not continuous location tracking.</p>{Object.entries(analytics.visits || {}).map(([place, count]) => <p key={place}>{place}: {String(count)}</p>)}{!Object.keys(analytics.visits || {}).length && <p>No opted-in visits recorded yet.</p>}</article></div>
    </>}
  </section>;

  function renderBookings() {
    return <><label>Booking status<select value={bookingFilter} onChange={e => setBookingFilter(e.target.value)}>{['all', 'requested', 'confirmed', 'completed', 'cancelled'].map(value => <option key={value} value={value}>{value === 'all' ? 'All bookings' : value}</option>)}</select></label>{!filteredBookings.length && <Empty>No bookings match this status.</Empty>}{filteredBookings.map(booking => <article className="journey-card" key={booking.id}><span className="journey-pill">{booking.status}</span><h3>{booking.guideName}</h3><p>{booking.date} · {money(booking.cost)}</p><div className="journey-actions">{booking.status === 'requested' && (role === 'authority' || guides.some(g => g.id === booking.guideId && g.owner === user?.id)) && <button disabled={busy} onClick={() => run(() => mutate(`/bookings/${booking.id}`, { action: 'confirmed' }), 'Booking confirmed')}>Confirm request</button>}{booking.status === 'confirmed' && <button disabled={busy} onClick={() => run(() => mutate(`/bookings/${booking.id}`, { action: 'completed' }), 'Tour marked completed')}>Mark completed</button>}{!['completed', 'cancelled'].includes(booking.status) && <button disabled={busy} onClick={() => run(() => mutate(`/bookings/${booking.id}`, { action: 'cancelled' }), 'Booking cancelled')}>Cancel booking</button>}</div>{booking.review && <p>{booking.review.rating} ★ · {booking.review.text}</p>}</article>)}</>;
  }
}
