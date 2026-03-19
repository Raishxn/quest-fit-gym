import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Upload, Crown } from 'lucide-react';

export function VIPCustomizerDialog() {
  const { profile, user, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [glow, setGlow] = useState(profile?.avatarGlowColor || '#ffaa00');
  const [nameColor, setNameColor] = useState(profile?.nameColor || '#ffffff');
  const [isPremium, setIsPremium] = useState(profile?.isPremium || false);
  const frameInput = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const handleSave = async () => {
     const { error } = await supabase.from('profiles').update({
       is_premium: isPremium,
       avatar_glow_color: glow,
       name_color: nameColor,
     } as any).eq('user_id', user!.id);
     
     if (error) {
       toast.error(`Erro: ${error.message}`);
       return;
     }
     await refreshProfile();
     toast.success('Cosméticos VIP atualizados!');
     setOpen(false);
  };

  const uploadFrame = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `${user!.id}/frame_${Date.now()}.${ext}`;
    
    toast('Enviando moldura...');
    const { error } = await supabase.storage.from('avatars').upload(path, file); 
    if (error) return toast.error('Erro no upload da moldura');
    
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ frame_url: data.publicUrl } as any).eq('user_id', user!.id);
    await refreshProfile();
    toast.success('Moldura aplicada com majestade!');
  };

  const removeFrame = async () => {
    await supabase.from('profiles').update({ frame_url: null } as any).eq('user_id', user!.id);
    await refreshProfile();
    toast.success('Moldura removida.');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-warning text-warning hover:bg-warning/10 font-bold w-full sm:w-auto">
          <Sparkles className="w-4 h-4 mr-2" /> Estúdio VIP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-warning/50 shadow-[0_0_40px_rgba(255,170,0,0.15)]">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-warning font-display text-2xl">
             <Crown className="w-6 h-6" /> Estúdio VIP
           </DialogTitle>
           <DialogDescription>
             Customize sua imersão. Banners e Fotos de perfil animadas (GIF) já funcionam nativamente clicando neles lá atrás!
           </DialogDescription>
         </DialogHeader>
         
         <div className="space-y-5 py-4">
            <div className="p-4 bg-secondary/50 rounded-xl border border-warning/20">
               <Label className="text-warning font-bold">Acesso Premium (Modo Teste)</Label>
               <p className="text-xs text-muted-foreground mb-3">Ative para testar todos os efeitos luminosos no Ranking e Perfil.</p>
               <Button onClick={() => setIsPremium(!isPremium)} variant={isPremium ? 'default' : 'outline'} className={`w-full ${isPremium ? 'bg-warning text-warning-foreground hover:bg-warning/80' : ''}`}>
                 {isPremium ? '👑 Acesso VIP Ativo' : 'Adquirir Passe VIP'}
               </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <Label className="font-bold">Aura Glow do Avatar</Label>
                 <div className="flex gap-2 mt-2">
                    <Input type="color" value={glow} onChange={e => setGlow(e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
                    <Input type="text" value={glow} onChange={e => setGlow(e.target.value)} className="flex-1 font-mono text-xs" />
                 </div>
              </div>
              <div>
                 <Label className="font-bold">Cor Metálica do Nome</Label>
                 <div className="flex gap-2 mt-2">
                    <Input type="color" value={nameColor} onChange={e => setNameColor(e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
                    <Input type="text" value={nameColor} onChange={e => setNameColor(e.target.value)} className="flex-1 font-mono text-xs" />
                 </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
               <Label className="font-bold">Moldura Personalizada (Frame PNG/GIF)</Label>
               <p className="text-xs text-muted-foreground mb-3">Faça upload de uma borda vazada para sobrepor seu avatar.</p>
               <div className="flex gap-2">
                 <input ref={frameInput} type="file" accept="image/png, image/gif" className="hidden" onChange={e => e.target.files?.[0] && uploadFrame(e.target.files[0])} />
                 <Button variant="secondary" className="flex-1" onClick={() => frameInput.current?.click()}>
                   <Upload className="w-4 h-4 mr-2" /> Upload Moldura
                 </Button>
                 {profile?.frameUrl && (
                   <Button variant="destructive" onClick={removeFrame}>Remover</Button>
                 )}
               </div>
            </div>

         </div>

         <div className="pt-2">
           <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-lg">
             Salvar Visuais
           </Button>
         </div>
      </DialogContent>
    </Dialog>
  );
}
