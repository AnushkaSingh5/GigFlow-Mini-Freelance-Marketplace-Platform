import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGigs } from '../api/gigs';

const GigList = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadGigs();
  }, [page, search]);

  const loadGigs = async () => {
    setLoading(true);
    try {
      const response = await fetchGigs({ search, page, limit: 10 });
      setGigs(response.data.gigs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadGigs();
  };

  return (
    <div className="container py-5">

      {/* Heading */}
      <h2 className="fw-bold mb-4 text-center">
        Browse Open Gigs
      </h2>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-start-pill px-3"
                placeholder="Search gigs by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-dark rounded-end-pill px-4"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Loading */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : gigs.length === 0 ? (
        <p className="text-center text-muted py-5">
          No gigs found. Try a different search term.
        </p>
      ) : (
        <div className="row g-4">
          {gigs.map((gig) => (
            <div key={gig._id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">

                  <h5 className="fw-semibold mb-2">
                    {gig.title}
                  </h5>

                  <p className="text-muted small flex-grow-1">
                    {gig.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="fw-bold text-success fs-5">
                      ${gig.budget}
                    </span>

                    <Link
                      to={`/gigs/${gig._id}`}
                      className="btn btn-outline-dark btn-sm rounded-pill px-3"
                    >
                      View Details
                    </Link>
                  </div>

                  <p className="text-muted small mt-3 mb-0">
                    Posted by {gig.ownerId?.name}
                  </p>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>

          <span className="fw-semibold">
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GigList;
