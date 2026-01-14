import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      {/* HERO */}
      <section className="bg-dark text-white py-5">
        <div className="container py-5 text-center">
          <h1 className="display-4 fw-bold mb-4">
            Welcome to <span className="text-warning">GigFlow</span>
          </h1>
          <p className="lead text-light mb-5">
            The mini freelance marketplace where talent meets opportunity.
            Post jobs, find work, and grow your career.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/gigs" className="btn btn-light btn-lg fw-semibold px-4">
              🔍 Browse Gigs
            </Link>

            {isAuthenticated ? (
              <Link to="/post-gig" className="btn btn-warning btn-lg fw-semibold px-4">
                📝 Post a Gig
              </Link>
            ) : (
              <Link to="/register" className="btn btn-warning btn-lg fw-semibold px-4">
                🚀 Get Started Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">
            How GigFlow Works
          </h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center border-0">
                <div className="card-body p-4">
                  <div className="display-6 mb-3">📋</div>
                  <h5 className="fw-semibold">Post a Job</h5>
                  <p className="text-muted">
                    Describe your project, set a budget, and publish your gig.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center border-0">
                <div className="card-body p-4">
                  <div className="display-6 mb-3">💼</div>
                  <h5 className="fw-semibold">Receive Bids</h5>
                  <p className="text-muted">
                    Freelancers submit proposals with pricing and messages.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center border-0">
                <div className="card-body p-4">
                  <div className="display-6 mb-3">🤝</div>
                  <h5 className="fw-semibold">Hire & Collaborate</h5>
                  <p className="text-muted">
                    Hire the best freelancer and bring ideas to life.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-secondary text-white py-5">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-warning">1000+</h3>
              <p className="mb-0">Active Gigs</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-info">5000+</h3>
              <p className="mb-0">Freelancers</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-success">$2M+</h3>
              <p className="mb-0">Paid Out</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold text-warning">98%</h3>
              <p className="mb-0">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark text-white py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">
            Ready to Start Your Journey?
          </h2>
          <p className="text-light mb-4">
            Whether you're looking to hire or find work, GigFlow has you covered.
          </p>

          {!isAuthenticated && (
            <Link to="/register" className="btn btn-light btn-lg fw-semibold px-5">
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-center py-3">
        <p className="text-secondary mb-0">
          © 2026 GigFlow. Built with ❤️ for freelancers everywhere.
        </p>
      </footer>
    </>
  );
};

export default Home;
