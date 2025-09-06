import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Quality } from "../types";

interface QualityBadgeProps {
  quality: Quality;
  className?: string;
}

const qualityConfig = {
  A: {
    label: "A",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
    title: "Excelente: Reciente, cercano, datos completos"
  },
  B: {
    label: "B", 
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    title: "Bueno: Aceptable antigüedad y distancia"
  },
  C: {
    label: "C",
    className: "bg-red-100 text-red-800 hover:bg-red-100", 
    title: "Limitado: Antiguo, lejano o datos faltantes"
  }
};

export function QualityBadge({ quality, className }: QualityBadgeProps) {
  const config = qualityConfig[quality];

  return (
    <Badge 
      variant="secondary"
      className={cn(config.className, className)}
      title={config.title}
    >
      {config.label}
    </Badge>
  );
}