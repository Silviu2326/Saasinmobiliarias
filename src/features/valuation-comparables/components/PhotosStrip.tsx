import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotosStripProps {
  photos: string[];
  className?: string;
}

export function PhotosStrip({ photos, className }: PhotosStripProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-12 bg-gray-50 rounded text-gray-400", className)}>
        <Image className="h-4 w-4 mr-1" />
        <span className="text-xs">Sin fotos</span>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {photos.slice(0, 3).map((photo, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <button
                className="flex-shrink-0 relative group"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="h-12 w-16 object-cover rounded border hover:border-blue-300 transition-colors"
                />
                {photos.length > 3 && index === 2 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      +{photos.length - 2}
                    </span>
                  </div>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0">
              <div className="relative">
                <img
                  src={photos[selectedIndex]}
                  alt={`Foto ${selectedIndex + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={handleNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {selectedIndex + 1} / {photos.length}
                </div>
              </div>

              <div className="flex justify-center gap-1 p-4 bg-gray-50 max-h-20 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "flex-shrink-0 border-2 rounded",
                      selectedIndex === index ? "border-blue-500" : "border-transparent"
                    )}
                  >
                    <img
                      src={photo}
                      alt={`Miniatura ${index + 1}`}
                      className="h-12 w-16 object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
      
      {photos.length > 0 && (
        <div className="text-xs text-gray-500">
          {photos.length} foto{photos.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}