import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark shadow">
      <div className="container-fluid px-4">

        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-4" to="/">
          🚀 GigFlow
        </Link>

        {/* Left Links */}
        <ul className="navbar-nav me-auto mb-0">
          <li className="nav-item">
            <Link className="nav-link" to="/gigs">
              Browse Gigs
            </Link>
          </li>

          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/post-gig">
                  Post a Gig
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Right Side */}
        <div className="d-flex align-items-center gap-3">

          {isAuthenticated ? (
            <>
              <span className="text-white">
                Hi, <strong>{user?.name}</strong>
              </span>

              <button
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Login
              </Link>

              <Link to="/register" className="btn btn-light btn-sm">
                Sign Up
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
