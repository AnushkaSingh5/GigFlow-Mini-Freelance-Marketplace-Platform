import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (formData.name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters');
      return;
    }

    dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    }));
  };

  const getPasswordStrength = () => {
    const p = formData.password.length;
    if (!p) return { value: 0, label: '', variant: '' };
    if (p < 6) return { value: 25, label: 'Weak', variant: 'danger' };
    if (p < 8) return { value: 50, label: 'Fair', variant: 'warning' };
    if (p < 12) return { value: 75, label: 'Good', variant: 'info' };
    return { value: 100, label: 'Strong', variant: 'success' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div className="card shadow border-0" style={{ maxWidth: '460px', width: '100%', borderRadius: '16px' }}>
        <div className="card-body p-4 p-md-5">

          {/* Logo */}
          <div className="text-center mb-4">
            <Link to="/" className="fs-3 fw-bold text-decoration-none text-dark">
              🚀 GigFlow
            </Link>
            <p className="text-muted mt-1">Join our community today</p>
          </div>

          <h5 className="fw-semibold text-center mb-4">
            Create your account
          </h5>

          {/* Errors */}
          {(error || validationError) && (
            <div className="alert alert-danger text-center py-2">
              {validationError || error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control rounded-pill px-3 py-2"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control rounded-pill px-3 py-2"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control rounded-start-pill px-3 py-2"
                  placeholder="Create a password"
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

              {formData.password && (
                <>
                  <div className="progress mt-2" style={{ height: '6px' }}>
                    <div
                      className={`progress-bar bg-${strength.variant}`}
                      style={{ width: `${strength.value}%` }}
                    ></div>
                  </div>
                  <small className={`text-${strength.variant}`}>
                    Password strength: {strength.label}
                  </small>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label small fw-semibold">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-control rounded-pill px-3 py-2 ${
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? 'is-invalid'
                    : ''
                }`}
                placeholder="Confirm password"
                required
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <div className="invalid-feedback">
                    Passwords do not match
                  </div>
                )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-secondary w-100 rounded-pill py-2 fw-semibold"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="d-flex align-items-center my-4">
            <div className="flex-grow-1 border-top"></div>
            <span className="px-3 text-muted small">Or</span>
            <div className="flex-grow-1 border-top"></div>
          </div>

          {/* Login Link */}
          <p className="text-center small mb-0">
            Already have an account?{' '}
            <Link to="/login" className="fw-semibold text-decoration-none">
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
