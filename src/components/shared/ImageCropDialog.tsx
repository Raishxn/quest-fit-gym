import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Move, Loader2 } from 'lucide-react';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio: number; // e.g., 1 for avatar (square), 3 for banner (3:1)
  shape?: 'circle' | 'rect';
  title?: string;
  outputWidth?: number;
  outputHeight?: number;
}

export default function ImageCropDialog({
  open,
  onOpenChange,
  onCropComplete,
  aspectRatio,
  shape = 'rect',
  title = 'Ajustar Imagem',
  outputWidth = 400,
  outputHeight,
}: ImageCropDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const finalHeight = outputHeight || Math.round(outputWidth / aspectRatio);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setImageSrc(null);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setSaving(false);
    }
  }, [open]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
      setZoom(1);
      setPosition({ x: 0, y: 0 });

      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageSize({ width: img.width, height: img.height });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [dragging, dragStart]);

  const handleCrop = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current) return;
    setSaving(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = outputWidth;
    canvas.height = finalHeight;

    const img = imageRef.current;

    // Calculate the preview container size (matches the CSS)
    const previewContainer = previewRef.current;
    if (!previewContainer) return;

    const containerWidth = previewContainer.offsetWidth;
    const containerHeight = previewContainer.offsetHeight;

    // The image is displayed fitting within the container with zoom
    // We need to calculate what portion of the image maps to the visible area
    const imgAspect = img.width / img.height;
    const containerAspect = containerWidth / containerHeight;

    let displayWidth: number, displayHeight: number;
    // Cover behavior: image fills the container
    if (imgAspect > containerAspect) {
      displayHeight = containerHeight * zoom;
      displayWidth = displayHeight * imgAspect;
    } else {
      displayWidth = containerWidth * zoom;
      displayHeight = displayWidth / imgAspect;
    }

    // Position offset as fraction of the display size
    const offsetX = (containerWidth / 2 - displayWidth / 2 - position.x) / displayWidth;
    const offsetY = (containerHeight / 2 - displayHeight / 2 - position.y) / displayHeight;

    // Source rect in image pixels
    const srcX = offsetX * img.width;
    const srcY = offsetY * img.height;
    const srcW = (containerWidth / displayWidth) * img.width;
    const srcH = (containerHeight / displayHeight) * img.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If circle shape, clip to circle
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    // Draw the cropped portion
    ctx.drawImage(
      img,
      Math.max(0, srcX),
      Math.max(0, srcY),
      Math.min(srcW, img.width - srcX),
      Math.min(srcH, img.height - srcY),
      0,
      0,
      canvas.width,
      canvas.height,
    );

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
      setSaving(false);
      onOpenChange(false);
    }, 'image/webp', 0.85);
  }, [zoom, position, outputWidth, finalHeight, shape, onCropComplete, onOpenChange]);

  // Preview dimensions
  const previewWidth = shape === 'circle' ? 280 : 340;
  const previewHeight = Math.round(previewWidth / aspectRatio);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>

        {!imageSrc ? (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Move className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Clique para selecionar uma imagem</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WebP ou GIF</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview with crop area */}
            <div className="flex justify-center">
              <div
                ref={previewRef}
                className={`relative overflow-hidden bg-black/80 cursor-grab active:cursor-grabbing select-none ${
                  shape === 'circle' ? 'rounded-full' : 'rounded-xl'
                }`}
                style={{
                  width: previewWidth,
                  height: previewHeight,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="absolute pointer-events-none"
                  style={{
                    width: imageSize.width > imageSize.height
                      ? 'auto'
                      : `${previewWidth * zoom}px`,
                    height: imageSize.width > imageSize.height
                      ? `${previewHeight * zoom}px`
                      : 'auto',
                    minWidth: `${previewWidth * zoom}px`,
                    minHeight: `${previewHeight * zoom}px`,
                    left: `calc(50% + ${position.x}px)`,
                    top: `calc(50% + ${position.y}px)`,
                    transform: 'translate(-50%, -50%)',
                    objectFit: 'cover',
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Zoom control */}
            <div className="flex items-center gap-3 px-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.05}
                onValueChange={([val]) => setZoom(val)}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              <Move className="h-3 w-3 inline mr-1" />
              Arraste a imagem para ajustar a posição
            </p>

            {/* Change image button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              Trocar imagem
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Hidden canvas for cropping */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCrop} disabled={!imageSrc || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
