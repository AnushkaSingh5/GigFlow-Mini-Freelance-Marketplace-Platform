import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchGig, addAdmin, removeAdmin } from '../api/gigs';
import { submitBid, fetchBidsForGig, hireBid } from '../api/bids';

const GigDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ message: '', price: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin management state
  const [adminEmail, setAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const currentUserId = user?._id || user?.id;
  const ownerId = gig?.ownerId?._id || gig?.ownerId;
  const isOwner = String(ownerId) === String(currentUserId);
  const isAdmin = gig?.admins && gig.admins.some(a => String(a._id || a) === String(currentUserId));

  // Handlers to add/remove admins
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    if (!adminEmail) return setAdminError('Please provide an email');
    setAddingAdmin(true);
    try {
      await addAdmin(id, { email: adminEmail });
      setAdminSuccess('Admin added successfully');
      setAdminEmail('');
      await loadGig();
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Failed to add admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!confirm('Remove this admin?')) return;
    try {
      await removeAdmin(id, userId);
      await loadGig();
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Failed to remove admin');
    }
  };

  useEffect(() => {
    loadGig();
  }, [id]);

  useEffect(() => {
    if ((isOwner || isAdmin) && gig) {
      loadBids();
    }
  }, [isOwner, isAdmin, gig]);

  const loadGig = async () => {
    try {
      const response = await fetchGig(id);
      setGig(response.data.gig);
    } catch {
      setError('Failed to load gig');
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async () => {
    try {
      const response = await fetchBidsForGig(id);
      setBids(response.data.bids);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await submitBid({
        gigId: id,
        message: bidForm.message,
        price: Number(bidForm.price)
      });
      setSuccess('Bid submitted successfully!');
      setBidForm({ message: '', price: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHire = async (bidId) => {
    if (!confirm('Are you sure you want to hire this freelancer?')) return;

    try {
      await hireBid(bidId);
      setSuccess('Freelancer hired successfully!');
      loadGig();
      loadBids();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to hire');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-dark"></div>
      </div>
    );
  }

  if (!gig) {
    return <p className="text-center py-5">Gig not found</p>;
  }

  return (
    <div className="container py-5">

      {/* Gig Details */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 className="fw-bold d-inline me-2">{gig.title}</h3>
              {isAdmin && (
                <span className="badge bg-info text-dark me-2">You are an Admin</span>
              )}
            </div>
            <span className={`badge ${
              gig.status === 'open' ? 'bg-success' : 'bg-secondary'
            }`}>
              {gig.status.toUpperCase()}
            </span>
          </div>

          <p className="text-muted">{gig.description}</p>

          <hr />

          <div className="d-flex justify-content-between">
            <div>
              <small className="text-muted">Budget</small>
              <div className="fs-4 fw-bold text-success">
                ${gig.budget}
              </div>
            </div>
            <div className="text-end">
              <small className="text-muted">Posted by</small>
              <div className="fw-semibold">
                {gig.ownerId?.name}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Submit Bid */}
      {isAuthenticated && !isOwner && !isAdmin && gig.status === 'open' && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-semibold mb-3">Submit Your Bid</h5>

            <form onSubmit={handleSubmitBid}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Your Proposal
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={bidForm.message}
                  onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Your Price ($)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={bidForm.price}
                  onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-dark w-100"
              >
                {submitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Owner: Manage Admins */}
      {isOwner && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-semibold mb-3">Manage Admins</h5>

            <form onSubmit={handleAddAdmin} className="mb-3">
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Admin's email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-dark" disabled={addingAdmin}>{addingAdmin ? 'Adding...' : 'Add'}</button>
              </div>
            </form>

            {adminError && <div className="text-danger small mb-2">{adminError}</div>}
            {adminSuccess && <div className="text-success small mb-2">{adminSuccess}</div>}

            <div>
              <h6 className="small text-muted">Current Admins</h6>
              {(!gig.admins || gig.admins.length === 0) ? (
                <p className="text-muted small">No admins yet.</p>
              ) : (
                gig.admins.map((a) => (
                  <div key={a._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-semibold">{a.name}</div>
                      <small className="text-muted">{a.email}</small>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveAdmin(a._id)}>Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bids (Owner / Admin) */}
      {(isOwner || isAdmin) && (
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="fw-semibold mb-4">
              Bids Received ({bids.length})
            </h5>

            {bids.length === 0 ? (
              <p className="text-muted text-center">No bids received yet.</p>
            ) : (
              bids.map((bid) => (
                <div
                  key={bid._id}
                  className={`border rounded p-3 mb-3 ${
                    bid.status === 'hired'
                      ? 'border-success bg-success bg-opacity-10'
                      : bid.status === 'rejected'
                      ? 'border-secondary bg-light opacity-75'
                      : ''
                  }`}
                >
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <div className="fw-semibold">
                        {bid.freelancerId?.name}
                      </div>
                      <small className="text-muted">
                        {bid.freelancerId?.email}
                      </small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-success fs-5">
                        ${bid.price}
                      </div>
                      <span className="badge bg-warning text-dark">
                        {bid.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted">{bid.message}</p>

                  {gig.status === 'open' && bid.status === 'pending' && (
                    <button
                      onClick={() => handleHire(bid._id)}
                      className="btn btn-success btn-sm"
                    >
                      Hire Freelancer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default GigDetail;
