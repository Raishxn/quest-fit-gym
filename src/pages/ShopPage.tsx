import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Coins, Loader2, Sparkles, Shield, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ShopPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const loadShop = async () => {
    setLoading(true);
    try {
      // Fetch shop items
      const { data: itemsData, error: itemsErr } = await supabase
        .from('shop_items')
        .select('*')
        .order('price', { ascending: true });
        
      if (itemsErr) throw itemsErr;
      setItems(itemsData || []);

      // Fetch user purchases
      const { data: purchasesData, error: purchErr } = await supabase
        .from('user_purchases')
        .select('item_id')
        .eq('user_id', user!.id);
        
      if (purchErr) throw purchErr;
      setPurchases(purchasesData || []);
    } catch (e: any) {
      console.error(e);
      toast.error('Erro ao carregar a loja: ' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadShop();
  }, [user]);

  const handleBuy = async (item: any) => {
    if (!profile) return;
    
    // Check if affordable
    if ((profile.coins || 0) < item.price) {
      toast.error('QuestCoins insuficientes!');
      return;
    }

    setBuyingId(item.id);
    try {
      // 1. Deduct coins
      const newCoins = (profile.coins || 0) - item.price;
      const { error: updateErr } = await (supabase as any)
        .from('profiles')
        .update({ coins: newCoins })
        .eq('user_id', user!.id);

      if (updateErr) throw updateErr;

      // 2. Register purchase
      const { error: insertErr } = await supabase
        .from('user_purchases')
        .insert({ user_id: user!.id, item_id: item.id });

      if (insertErr) throw insertErr;

      const audio = new Audio('/buy.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio error:', e));

      toast.success(`Você comprou: ${item.name}!`);
      
      // Refresh state
      await refreshProfile();
      setPurchases([...purchases, { item_id: item.id }]);
    } catch (e: any) {
      console.error(e);
      toast.error('Erro ao realizar compra: ' + e.message);
    }
    setBuyingId(null);
  };

  const hasPurchased = (itemId: string) => {
    return purchases.some(p => p.item_id === itemId);
  };

  const getItemIcon = (type: string) => {
    switch(type) {
      case 'title': return <Tag className="w-5 h-5 text-blue-400" />;
      case 'frame': return <Shield className="w-5 h-5 text-yellow-400" />;
      default: return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        
        <div>
          <h1 className="text-3xl font-display font-bold text-glow flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Loja do Aventureiro
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg">
            Gaste suas suadas QuestCoins em títulos épicos, molduras de avatar exclusivas e itens consumíveis para destacar seu perfil.
          </p>
        </div>

        <div className="bg-secondary/80 border border-primary/30 px-6 py-4 rounded-xl flex items-center gap-4 backdrop-blur-sm z-10 shrink-0">
          <div className="p-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <img src="/questcoin.png" alt="QuestCoin" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <p className="text-sm text-yellow-500/80 font-medium uppercase tracking-wider">Seu Saldo</p>
            <p className="text-3xl font-bold text-yellow-400 drop-shadow-md">{profile?.coins || 0} QC</p>
          </div>
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const bought = hasPurchased(item.id);
          const canAfford = (profile?.coins || 0) >= item.price;
          
          return (
            <Card key={item.id} className={`bg-secondary/30 border-border overflow-hidden flex flex-col ${bought ? 'opacity-80 grayscale-[30%]' : 'hover:border-primary/50 transition-colors'}`}>
              <div className="h-32 bg-gradient-to-br from-background to-secondary/50 flex items-center justify-center p-6 relative">
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm flex gap-1.5 items-center">
                    {getItemIcon(item.item_type)}
                    <span className="capitalize">{item.item_type === 'title' ? 'Título' : item.item_type === 'frame' ? 'Moldura' : 'Item'}</span>
                  </Badge>
                </div>
                {item.item_type === 'title' ? (
                  <div className="px-6 py-2 bg-background/50 border border-primary/30 rounded-lg backdrop-blur-md shadow-lg">
                    <span className="font-display font-bold text-xl text-primary">{item.content}</span>
                  </div>
                ) : item.item_type === 'frame' ? (
                  <div className={`w-20 h-20 rounded-full border-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${item.content === 'frame-gold' ? 'border-yellow-400 shadow-yellow-500/50' : item.content === 'frame-fire' ? 'border-red-500 shadow-red-500/50' : 'border-primary'}`}></div>
                ) : (
                  <Sparkles className="w-16 h-16 text-primary/50" />
                )}
              </div>
              <CardHeader className="flex-1">
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                {bought ? (
                  <Button disabled variant="secondary" className="w-full">
                    Adquirido
                  </Button>
                ) : (
                  <Button 
                    className={`w-full font-bold shadow-md ${canAfford ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950' : 'bg-muted text-muted-foreground'}`}
                    disabled={!canAfford || buyingId === item.id}
                    onClick={() => handleBuy(item)}
                  >
                    {buyingId === item.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <img src="/questcoin.png" alt="QC" className="w-5 h-5 mr-2 object-contain" />
                        Comprar por {item.price} QC
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {items.length === 0 && !loading && (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
          Nenhum item disponível na loja no momento.
        </div>
      )}
    </div>
  );
}
