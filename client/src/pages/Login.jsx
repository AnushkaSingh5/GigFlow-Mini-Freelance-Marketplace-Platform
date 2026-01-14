import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div className="card shadow border-0" style={{ maxWidth: '420px', width: '100%', borderRadius: '16px' }}>
        <div className="card-body p-4 p-md-5">

          {/* Logo */}
          <div className="text-center mb-4">
            <Link to="/" className="fs-3 fw-bold text-decoration-none text-dark">
              🚀 GigFlow
            </Link>
            <p className="text-muted mt-1">Welcome back!</p>
          </div>

          <h5 className="fw-semibold text-center mb-4">
            Login to your account
          </h5>

          {/* Error */}
          {error && (
            <div className="alert alert-danger text-center py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control rounded-pill px-3 py-2"
                placeholder="Input your registered email"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control rounded-start-pill px-3 py-2"
                  placeholder="Input your password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-end-pill"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-secondary w-100 rounded-pill py-2 fw-semibold mt-3"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="d-flex align-items-center my-4">
            <div className="flex-grow-1 border-top"></div>
            <span className="px-3 text-muted small">Or</span>
            <div className="flex-grow-1 border-top"></div>
          </div>

          {/* Register */}
          <p className="text-center small mb-0">
            You’re new in here?{' '}
            <Link to="/register" className="fw-semibold text-decoration-none">
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
