import { useEffect, useState } from 'react';
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

export function ConsistencyHeatmap({ userId }: { userId: string }) {
  const [data, setData] = useState<{ date: string; count: number; level: number }[]>([]);

  useEffect(() => {
    if (!userId) return;
    loadWorkoutData();
  }, [userId]);

  const loadWorkoutData = async () => {
    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error || !sessions) return;

    const counts: Record<string, number> = {};
    for (const s of sessions) {
      if (!s.started_at) continue;
      // Get YYYY-MM-DD
      const date = new Date(s.started_at).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    }

    const result: { date: string; count: number; level: number }[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // 6 months ago
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    let current = new Date(sixMonthsAgo);
    let maxCount = 0;
    
    while (current <= today) {
      // Use local timezone format (avoid UTC discrepancy)
      const d = new Date(current.getTime() - (current.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const count = counts[d] || 0;
      if (count > maxCount) maxCount = count;
      result.push({ date: d, count, level: 0 });
      current.setDate(current.getDate() + 1);
    }

    const maxLevel = 4;
    const finalData = result.map(d => {
      let level = 0;
      if (d.count > 0) {
        if (maxCount === 1) level = maxLevel;
        else level = Math.ceil((d.count / maxCount) * maxLevel);
      }
      return { ...d, level };
    });

    setData(finalData);
  };

  const explicitTheme: ThemeInput = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Mapa de Consistência
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center overflow-x-auto pb-4">
        {data.length > 0 ? (
          <div className="min-w-max p-2">
            <ActivityCalendar 
              data={data} 
              theme={explicitTheme}
              colorScheme="dark"
              maxLevel={4}
              labels={{
                months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                weekdays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                totalCount: '{{count}} treinos rastreados',
                legend: {
                  less: 'Menos',
                  more: 'Mais'
                }
              }}
            />
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground w-full">
            Carregando mapa...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
