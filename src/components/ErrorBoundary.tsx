'use client';

import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Detectado</h1>
                        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
                            <h2 className="font-bold mb-2">Mensaje:</h2>
                            <pre className="text-sm overflow-auto">{this.state.error?.message}</pre>
                        </div>
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
                            <h2 className="font-bold mb-2">Stack Trace:</h2>
                            <pre className="text-xs overflow-auto">{this.state.error?.stack}</pre>
                        </div>
                        {this.state.errorInfo && (
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                <h2 className="font-bold mb-2">Component Stack:</h2>
                                <pre className="text-xs overflow-auto">{this.state.errorInfo.componentStack}</pre>
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-jazz-gold text-black px-4 py-2 rounded-lg font-bold"
                        >
                            Recargar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
