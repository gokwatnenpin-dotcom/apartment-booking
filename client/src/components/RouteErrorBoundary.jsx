import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class RouteErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Page rendering failed:', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="page-shell py-20 text-center">
          <p className="eyebrow">Apartment details</p>
          <h1 className="mt-2 text-2xl font-bold">This stay couldn’t be displayed</h1>
          <p className="mt-3 text-sm text-slate">Return to the listings and try opening the stay again.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>Reload page</button>
            <Link to="/apartments" className="btn-primary">Back to stays</Link>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
