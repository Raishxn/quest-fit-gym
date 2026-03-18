import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Salad, Droplets, Plus, Coffee, Sun, Apple, Moon, Sparkles, Dumbbell, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const MEAL_CATEGORIES = [
  { name: 'Café da Manhã', icon: Coffee, time: '07:00', order: 1 },
  { name: 'Almoço', icon: Sun, time: '12:30', order: 2 },
  { name: 'Lanche da Tarde', icon: Apple, time: '16:00', order: 3 },
  { name: 'Pré-Treino', icon: Dumbbell, time: '17:00', order: 4 },
  { name: 'Pós-Treino', icon: Dumbbell, time: '18:30', order: 5 },
  { name: 'Jantar', icon: Moon, time: '20:00', order: 6 },
  { name: 'Ceia', icon: Sparkles, time: '22:00', order: 7 },
];

export default function DietPage() {
  const { user } = useAuth();
  const [dietDay, setDietDay] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState(100);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) return;
    loadDietData();
  }, [user]);

  const loadDietData = async () => {
    if (!user) return;

    // Get anamnesis for targets
    const { data: anam } = await supabase.from('anamnesis').select('*').eq('user_id', user.id).maybeSingle();
    setAnamnesis(anam);

    // Get or create today's diet day
    let { data: dd } = await supabase.from('diet_days').select('*').eq('user_id', user.id).eq('date', today).maybeSingle();

    if (!dd) {
      const { data: newDd } = await supabase.from('diet_days').insert({
        user_id: user.id,
        date: today,
      }).select().single();
      dd = newDd;
    }

    setDietDay(dd);

    if (dd) {
      // Load meals with items
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*, meal_items(*, foods(name))')
        .eq('diet_day_id', dd.id)
        .order('order');
      setMeals(mealsData || []);
    }
  };

  const ensureMeal = async (mealName: string, order: number, time: string) => {
    if (!dietDay) return null;

    const existing = meals.find(m => m.name === mealName);
    if (existing) return existing;

    const { data } = await supabase.from('meals').insert({
      diet_day_id: dietDay.id,
      name: mealName,
      order,
      time,
    }).select().single();

    return data;
  };

  const openFoodSearch = async (mealName: string, order: number, time: string) => {
    const meal = await ensureMeal(mealName, order, time);
    if (meal) {
      setSelectedMealId(meal.id);
      setShowFoodSearch(true);
    }
  };

  const searchFoods = async (query: string) => {
    setFoodSearch(query);
    if (query.length < 2) { setFoods([]); return; }
    const { data } = await supabase.from('foods').select('*').ilike('name', `%${query}%`).limit(20);
    setFoods(data || []);
  };

  const addFoodToMeal = async () => {
    if (!selectedFood || !selectedMealId || !dietDay || !user) return;

    const factor = quantity / 100;
    const calories = Math.round(selectedFood.calories_per_100g * factor);
    const protein = Math.round(selectedFood.protein_per_100g * factor * 10) / 10;
    const carbs = Math.round(selectedFood.carbs_per_100g * factor * 10) / 10;
    const fat = Math.round(selectedFood.fat_per_100g * factor * 10) / 10;
    const fiber = Math.round(selectedFood.fiber_per_100g * factor * 10) / 10;

    await supabase.from('meal_items').insert({
      meal_id: selectedMealId,
      food_id: selectedFood.id,
      quantity_g: quantity,
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: fiber,
    });

    // Update diet day totals
    await supabase.from('diet_days').update({
      total_calories: (dietDay.total_calories || 0) + calories,
      total_protein_g: (dietDay.total_protein_g || 0) + protein,
      total_carbs_g: (dietDay.total_carbs_g || 0) + carbs,
      total_fat_g: (dietDay.total_fat_g || 0) + fat,
      total_fiber_g: (dietDay.total_fiber_g || 0) + fiber,
    }).eq('id', dietDay.id);

    toast.success(`${selectedFood.name} adicionado!`);
    setShowFoodSearch(false);
    setSelectedFood(null);
    setQuantity(100);
    setFoodSearch('');
    loadDietData();
  };

  const addWater = async (ml: number) => {
    if (!dietDay || !user) return;
    const newTotal = (dietDay.total_water_ml || 0) + ml;
    await supabase.from('diet_days').update({ total_water_ml: newTotal }).eq('id', dietDay.id);
    setDietDay({ ...dietDay, total_water_ml: newTotal });
    toast.success(`+${ml}ml 💧`);
  };

  const targetCalories = anamnesis?.target_calories || 2000;
  const targetProtein = anamnesis?.target_protein_g || 120;
  const targetFat = anamnesis?.target_fat_g || 60;
  const targetCarbs = anamnesis?.target_carbs_g || 250;
  const targetWater = anamnesis?.target_water_ml || 2500;

  const macros = [
    { label: 'Calorias', current: dietDay?.total_calories || 0, target: targetCalories, unit: 'kcal' },
    { label: 'Proteína', current: dietDay?.total_protein_g || 0, target: targetProtein, unit: 'g' },
    { label: 'Gordura', current: dietDay?.total_fat_g || 0, target: targetFat, unit: 'g' },
    { label: 'Carbs', current: dietDay?.total_carbs_g || 0, target: targetCarbs, unit: 'g' },
  ];

  const waterPercent = Math.min(100, ((dietDay?.total_water_ml || 0) / targetWater) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Salad className="h-8 w-8 text-attr-vit" /> Dieta
        </h1>
        <p className="text-muted-foreground">Acompanhe suas refeições e macros do dia.</p>
      </motion.div>

      {/* Macro Rings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {macros.map(macro => {
            const pct = Math.min(100, (macro.current / macro.target) * 100);
            return (
              <Card key={macro.label}>
                <CardContent className="pt-4 text-center space-y-2">
                  <div className="relative h-20 w-20 mx-auto">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-secondary" />
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-primary" strokeDasharray={`${pct * 2.136} 213.6`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold">{Math.round(pct)}%</span>
                  </div>
                  <p className="text-xs font-medium">{macro.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{macro.current}/{macro.target}{macro.unit}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Water */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Droplets className="h-4 w-4 text-info" /> Água
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {dietDay?.total_water_ml || 0}ml / {targetWater}ml
              </span>
            </div>
            <Progress value={waterPercent} className="h-3" />
            <div className="flex gap-2">
              {[200, 300, 500].map(ml => (
                <Button key={ml} variant="outline" size="sm" className="font-mono text-xs" onClick={() => addWater(ml)}>
                  +{ml}ml
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Meals */}
      <div className="space-y-3">
        {MEAL_CATEGORIES.map((mealCat, i) => {
          const mealData = meals.find(m => m.name === mealCat.name);
          const items = mealData?.meal_items || [];

          return (
            <motion.div key={mealCat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <mealCat.icon className="h-4 w-4 text-muted-foreground" />
                      {mealCat.name}
                      <span className="text-xs text-muted-foreground font-mono">{mealCat.time}</span>
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openFoodSearch(mealCat.name, mealCat.order, mealCat.time)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                {items.length > 0 ? (
                  <CardContent className="space-y-1">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                        <div>
                          <span className="font-medium">{item.foods?.name || 'Alimento'}</span>
                          <span className="text-xs text-muted-foreground ml-2">{item.quantity_g}g</span>
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {item.calories}kcal • {item.protein_g}g prot
                        </div>
                      </div>
                    ))}
                  </CardContent>
                ) : (
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">Nenhum alimento registrado</p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Food Search Dialog */}
      <Dialog open={showFoodSearch} onOpenChange={setShowFoodSearch}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Adicionar Alimento</DialogTitle>
          </DialogHeader>

          {!selectedFood ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar alimento..." value={foodSearch} onChange={e => searchFoods(e.target.value)} className="pl-9" />
              </div>
              <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                {foods.length === 0 && foodSearch.length >= 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum alimento encontrado</p>
                )}
                {foods.map(food => (
                  <Button key={food.id} variant="ghost" className="w-full justify-start h-auto py-2" onClick={() => setSelectedFood(food)}>
                    <div className="text-left">
                      <p className="font-medium text-sm">{food.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {food.calories_per_100g}kcal • P:{food.protein_per_100g}g • C:{food.carbs_per_100g}g • G:{food.fat_per_100g}g /100g
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="font-medium">{selectedFood.name}</p>
                <p className="text-xs text-muted-foreground font-mono">por 100g: {selectedFood.calories_per_100g}kcal</p>
              </div>
              <div className="space-y-2">
                <Label>Quantidade (g)</Label>
                <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                <div>Calorias: {Math.round(selectedFood.calories_per_100g * quantity / 100)}</div>
                <div>Proteína: {(selectedFood.protein_per_100g * quantity / 100).toFixed(1)}g</div>
                <div>Carbs: {(selectedFood.carbs_per_100g * quantity / 100).toFixed(1)}g</div>
                <div>Gordura: {(selectedFood.fat_per_100g * quantity / 100).toFixed(1)}g</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedFood(null)}>Voltar</Button>
                <Button className="flex-1 font-display" onClick={addFoodToMeal}>Adicionar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
