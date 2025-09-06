import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wifi } from "lucide-react";
import { scoreQuality } from "../utils";

interface TestConnectionButtonProps {
  providerId: string;
  onTest: (id: string) => void;
  isTesting: boolean;
  disabled?: boolean;
}

export function TestConnectionButton({
  providerId,
  onTest,
  isTesting,
  disabled = false,
}: TestConnectionButtonProps) {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  const handleTest = async () => {
    setTestResult(null);
    onTest(providerId);
    
    // Simulate test result (in real app this would come from the hook)
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setTestResult({
        success,
        latencyMs: success ? Math.floor(Math.random() * 100) + 20 : undefined,
        error: success ? undefined : "Connection timeout",
      });
    }, 1500);
  };

  const getLatencyColor = (ms?: number): string => {
    if (!ms) return "text-gray-500";
    if (ms < 50) return "text-green-600";
    if (ms < 100) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTest}
        disabled={disabled || isTesting}
        className="px-2"
      >
        {isTesting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wifi className="h-4 w-4" />
        )}
      </Button>
      
      {testResult && (
        <Badge
          variant="secondary"
          className={
            testResult.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        >
          {testResult.success ? (
            <span className={getLatencyColor(testResult.latencyMs)}>
              {testResult.latencyMs}ms
            </span>
          ) : (
            "Error"
          )}
        </Badge>
      )}
    </div>
  );
}