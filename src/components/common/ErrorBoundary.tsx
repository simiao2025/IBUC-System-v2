import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border border-red-100">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Algo deu errado</h2>
              <p className="mt-2 text-sm text-gray-600">
                Ocorreu um erro inesperado no sistema. Por favor, tente recarregar a página.
              </p>
              {this.state.error && (
                <div className="mt-4 p-3 bg-red-50 rounded text-left">
                  <p className="text-xs text-red-700 font-mono break-all line-clamp-3">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ibuc-blue hover:bg-ibuc-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ibuc-blue"
                >
                  Recarregar Página
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
