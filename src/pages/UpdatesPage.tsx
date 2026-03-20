import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('app_updates' as any).select('*').order('published_at', { ascending: false })
      .then(({ data }) => setUpdates(data || []));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/settings" className="p-2 bg-secondary rounded-full hover:bg-secondary/80">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Atualizações</h1>
          <p className="text-muted-foreground text-sm">Patch notes e novidades</p>
        </div>
      </div>
      
      {updates.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">Nenhuma atualização registrada no momento.</p>
      ) : updates.map(update => (
        <Card key={update.id} className="border-border bg-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{update.title}</CardTitle>
                <CardDescription>Versão {update.version}</CardDescription>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(update.published_at).toLocaleDateString()}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap leading-relaxed opacity-80">{update.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
