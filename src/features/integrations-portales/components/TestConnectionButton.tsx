import { useState } from "react";
import { useConnectionTest } from "../hooks";
import { formatDuration } from "../utils";

interface TestConnectionButtonProps {
  portalId: string;
  size?: "small" | "normal";
  showResults?: boolean;
}

const TestConnectionButton = ({ 
  portalId, 
  size = "normal", 
  showResults = true 
}: TestConnectionButtonProps) => {
  const { testing, testPortal, getResult } = useConnectionTest();
  const [showToast, setShowToast] = useState(false);
  const result = getResult(portalId);

  const handleTest = async () => {
    const testResult = await testPortal(portalId);
    
    if (showResults) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
    
    return testResult;
  };

  const buttonClasses = size === "small" 
    ? "px-3 py-2 text-xs"
    : "px-4 py-2 text-sm";

  const isRecentTest = result && new Date(result.testedAt).getTime() > Date.now() - (5 * 60 * 1000); // 5 min

  return (
    <>
      <button
        onClick={handleTest}
        disabled={testing}
        className={`${buttonClasses} font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          testing
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : result?.success
            ? "bg-green-50 text-green-700 hover:bg-green-100"
            : result?.success === false
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
        }`}
      >
        {testing ? (
          <>
            <span className="animate-spin inline-block mr-1">⏳</span>
            {size === "small" ? "..." : "Probando..."}
          </>
        ) : (
          <>
            {result?.success ? "✅" : result?.success === false ? "❌" : "🔍"}
            {size === "normal" && (
              <span className="ml-1">
                {result?.success 
                  ? "Conexión OK" 
                  : result?.success === false 
                  ? "Error conexión"
                  : "Probar conexión"
                }
              </span>
            )}
          </>
        )}
      </button>

      {/* Results tooltip/badge */}
      {result && isRecentTest && size === "normal" && (
        <div className="mt-1 text-xs text-gray-600">
          {result.success && result.latencyMs && (
            <span>Latencia: {result.latencyMs}ms</span>
          )}
          {result.details?.rateLimitRemaining && (
            <span className="ml-2">Rate limit: {result.details.rateLimitRemaining}</span>
          )}
        </div>
      )}

      {/* Toast notification */}
      {showToast && result && (
        <div className={`fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg border z-50 ${
          result.success 
            ? "bg-green-50 border-green-200" 
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {result.success ? "✅" : "❌"}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${
                result.success ? "text-green-800" : "text-red-800"
              }`}>
                Test de conexión - {result.success ? "Exitoso" : "Error"}
              </div>
              <div className={`text-sm mt-1 ${
                result.success ? "text-green-700" : "text-red-700"
              }`}>
                {result.message}
              </div>
              {result.success && result.latencyMs && (
                <div className="text-xs text-green-600 mt-1">
                  Latencia: {result.latencyMs}ms
                </div>
              )}
              {result.details && (
                <div className="text-xs mt-2 space-y-1">
                  {result.details.apiVersion && (
                    <div className="text-green-600">
                      API: v{result.details.apiVersion}
                    </div>
                  )}
                  {result.details.rateLimitRemaining && (
                    <div className="text-green-600">
                      Rate limit restante: {result.details.rateLimitRemaining}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TestConnectionButton;