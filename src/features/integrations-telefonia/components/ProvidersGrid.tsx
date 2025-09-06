import { ProviderCard } from "./ProviderCard";
import { useProviders } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";

export function ProvidersGrid() {
  const {
    providers,
    isLoading,
    connectProvider,
    testProvider,
    isConnecting,
    isTesting,
  } = useProviders();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          onConnect={connectProvider}
          onTest={testProvider}
          isConnecting={isConnecting}
          isTesting={isTesting}
        />
      ))}
    </div>
  );
}