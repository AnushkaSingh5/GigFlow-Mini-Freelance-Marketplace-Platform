import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGig } from '../api/gigs';

const PostGig = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createGig({
        ...form,
        budget: Number(form.budget)
      });
      navigate(`/gigs/${response.data.gig._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">

          {/* Heading */}
          <h3 className="fw-bold text-center mb-4">
            Post a New Gig
          </h3>

          {/* Error */}
          {error && (
            <div className="alert alert-danger text-center">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">

              <form onSubmit={handleSubmit}>

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Job Title
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-pill px-3 py-2"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Build a React Dashboard"
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Description
                  </label>
                  <textarea
                    className="form-control px-3 py-2"
                    rows="5"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the job requirements, deliverables, timeline..."
                    required
                  />
                </div>

                {/* Budget */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    className="form-control rounded-pill px-3 py-2"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="Enter your budget"
                    min="1"
                    required
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-dark w-100 rounded-pill py-2 fw-semibold"
                >
                  {loading ? 'Posting...' : 'Post Gig'}
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostGig;
