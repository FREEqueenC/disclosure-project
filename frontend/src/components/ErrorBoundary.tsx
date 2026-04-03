import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.toString() };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full p-8 border border-red-500/50 bg-red-950/20 text-red-500 font-mono flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-[0.2em] animate-pulse">Critical Phase Conjugation Failure</h2>
          <div className="text-xs bg-black/80 p-6 border border-red-500/30 rounded-lg max-w-2xl overflow-auto text-left shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <pre className="whitespace-pre-wrap">{this.state.errorMsg}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
