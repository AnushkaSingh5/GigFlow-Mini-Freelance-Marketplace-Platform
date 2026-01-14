import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyGigs } from '../api/gigs';
import { fetchMyBids } from '../api/bids';
import { fetchNotifications, markNotificationRead } from '../api/notifications';
import { removeNotification, setNotifications, markRead } from '../store/slices/notificationsSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications || []);

  const [activeTab, setActiveTab] = useState('gigs');
  const [myGigs, setMyGigs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (opts = { silent: false }) => {
    if (!opts.silent) setLoading(true);
    try {
      const [gigsRes, bidsRes, notifRes] = await Promise.all([
        fetchMyGigs(),
        fetchMyBids(),
        fetchNotifications()
      ]);

      setMyGigs(gigsRes.data.gigs);
      setMyBids(bidsRes.data.bids);

      if (notifRes?.data?.notifications) {
        dispatch(setNotifications(notifRes.data.notifications));
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  const stats = {
    totalGigs: myGigs.length,
    openGigs: myGigs.filter(g => g.status === 'open').length,
    assignedGigs: myGigs.filter(g => g.status === 'assigned').length,
    totalBids: myBids.length,
    pendingBids: myBids.filter(b => b.status === 'pending').length,
    hiredBids: myBids.filter(b => b.status === 'hired').length
  };

  const getBadge = (status) => {
    const map = {
      open: 'success',
      assigned: 'primary',
      pending: 'warning',
      hired: 'success',
      rejected: 'secondary'
    };
    return <span className={`badge bg-${map[status]}`}>{status.toUpperCase()}</span>;
  };

  const location = useLocation();
  const timersRef = useRef({});

  useEffect(() => {
    notifications.forEach((n) => {
      const id = n._id || n.id;
      if (n.read || timersRef.current[id]) return;

      timersRef.current[id] = setTimeout(async () => {
        try {
          await markNotificationRead(id);
          dispatch(markRead(id));
        } catch {
          dispatch(removeNotification(id));
        } finally {
          clearTimeout(timersRef.current[id]);
          delete timersRef.current[id];
        }
      }, 8000);
    });
  }, [notifications, dispatch]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-dark"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold">Welcome back, {user?.name} 👋</h3>
        <p className="text-muted">
          Manage your gigs and track your bids.
        </p>

        {notifications.filter(n => !n.read).map((n) => (
          <div key={n._id || n.id} className="alert alert-warning py-2">
            {n.message}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <small className="text-muted">My Gigs</small>
              <h4 className="fw-bold text-primary">{stats.totalGigs}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <small className="text-muted">My Bids</small>
              <h4 className="fw-bold text-secondary">{stats.totalBids}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <small className="text-muted">Jobs Won</small>
              <h4 className="fw-bold text-success">{stats.hiredBids}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <small className="text-muted">Success Rate</small>
              <h4 className="fw-bold text-warning">
                {stats.totalBids ? Math.round((stats.hiredBids / stats.totalBids) * 100) : 0}%
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex gap-3 mb-4">
        <Link to="/post-gig" className="btn btn-dark">
          + Post New Gig
        </Link>
        <Link to="/gigs" className="btn btn-outline-dark">
          Browse Gigs
        </Link>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'gigs' ? 'active' : ''}`}
            onClick={() => setActiveTab('gigs')}
          >
            My Gigs ({myGigs.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'bids' ? 'active' : ''}`}
            onClick={() => setActiveTab('bids')}
          >
            My Bids ({myBids.length})
          </button>
        </li>
      </ul>

      {/* Content */}
      {activeTab === 'gigs' && (
        myGigs.length === 0 ? (
          <p className="text-muted text-center">No gigs posted yet.</p>
        ) : (
          myGigs.map((gig) => (
            <div key={gig._id} className="card mb-3 shadow-sm">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <h6 className="fw-semibold">{gig.title}</h6>
                  {getBadge(gig.status)}
                  <p className="text-muted small mt-1">${gig.budget}</p>
                </div>
                <Link to={`/gigs/${gig._id}`} className="btn btn-outline-secondary btn-sm">
                  View
                </Link>
              </div>
            </div>
          ))
        )
      )}

      {activeTab === 'bids' && (
        myBids.length === 0 ? (
          <p className="text-muted text-center">No bids placed yet.</p>
        ) : (
          myBids.map((bid) => (
            <div key={bid._id} className="card mb-3 shadow-sm">
              <div className="card-body d-flex justify-content-between">
                <div>
                  <h6 className="fw-semibold">{bid.gigId?.title || 'Gig Deleted'}</h6>
                  {getBadge(bid.status)}
                  <p className="text-muted small mt-1">${bid.price}</p>
                </div>
                {bid.gigId?._id && (
                  <Link to={`/gigs/${bid.gigId._id}`} className="btn btn-outline-secondary btn-sm">
                    View
                  </Link>
                )}
              </div>
            </div>
          ))
        )
      )}

    </div>
  );
};

export default Dashboard;
