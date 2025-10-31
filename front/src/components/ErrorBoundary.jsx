import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UI Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center">
          <div className="rounded-xl bg-white shadow-soft p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Une erreur est survenue</h2>
            <p className="mt-2 text-sm text-gray-600">Veuillez rafraîchir la page ou réessayer plus tard.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}