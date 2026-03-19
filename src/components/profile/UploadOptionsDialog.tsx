import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, PlaySquare, Crown, Frame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UploadOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSelectStatic: () => void;
  onSelectGif: () => void; // Now opens crop dialog for GIF too
  onSelectFrame?: () => void;
  target: 'avatars' | 'banners' | null;
}

export function UploadOptionsDialog({
  open,
  onOpenChange,
  title,
  onSelectStatic,
  onSelectGif,
  onSelectFrame,
  target,
}: UploadOptionsDialogProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const isVip = profile?.plan && profile.plan !== 'free';

  const handleGifClick = () => {
    if (!isVip) {
      toast.error('GIFs animados são exclusivos para membros VIP!');
      onOpenChange(false);
      navigate('/upgrade');
      return;
    }
    onSelectGif();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>Escolha o tipo de imagem que deseja enviar.</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => {
              onSelectStatic();
              onOpenChange(false);
            }}
          >
            <Image className="h-7 w-7 text-primary" />
            <div className="text-center">
              <p className="font-bold text-sm">Imagem Estática</p>
              <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP (Com recorte)</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-20 relative overflow-hidden flex flex-col items-center justify-center gap-2 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10"
            onClick={handleGifClick}
          >
            <div className="absolute top-2 right-2">
              <Crown className="h-4 w-4 text-amber-500" />
            </div>
            <PlaySquare className="h-7 w-7 text-amber-500" />
            <div className="text-center">
              <p className="font-bold text-sm text-amber-500">GIF Animado</p>
              <p className="text-[10px] text-muted-foreground">Exclusivo VIP (Com recorte, máx 5MB)</p>
            </div>
          </Button>

          {/* Frame selector (only for avatars) */}
          {target === 'avatars' && onSelectFrame && (
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/10"
              onClick={() => {
                onSelectFrame();
                onOpenChange(false);
              }}
            >
              <span className="text-2xl">🖼️</span>
              <div className="text-center">
                <p className="font-bold text-sm">Trocar Moldura</p>
                <p className="text-[10px] text-muted-foreground">Molduras decorativas ao redor do avatar</p>
              </div>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
