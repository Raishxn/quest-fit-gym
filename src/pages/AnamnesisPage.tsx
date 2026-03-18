import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const steps = [
  { title: 'Dados Básicos', subtitle: 'Informações pessoais' },
  { title: 'Medidas', subtitle: 'Composição corporal' },
  { title: 'Objetivo', subtitle: 'Qual sua meta?' },
  { title: 'Nível de Atividade', subtitle: 'Sua rotina atual' },
];

const goals = [
  { value: 'fat_loss', label: '🔥 Perda de gordura', desc: 'Déficit calórico moderado' },
  { value: 'muscle_gain', label: '💪 Ganho muscular', desc: 'Superávit calórico leve' },
  { value: 'maintenance', label: '⚖️ Manutenção', desc: 'Manter peso atual' },
  { value: 'cardio', label: '🏃 Resistência cardio', desc: 'Foco em performance aeróbica' },
  { value: 'health', label: '💚 Saúde geral', desc: 'Bem-estar e qualidade de vida' },
];

const activityLevels = [
  { value: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício', factor: 1.2 },
  { value: 'light', label: 'Leve', desc: 'Exercício 1-3 dias/semana', factor: 1.375 },
  { value: 'moderate', label: 'Moderado', desc: 'Exercício 3-5 dias/semana', factor: 1.55 },
  { value: 'active', label: 'Ativo', desc: 'Exercício 6-7 dias/semana', factor: 1.725 },
  { value: 'athlete', label: 'Atleta', desc: 'Treinos intensos diários', factor: 1.9 },
];

export default function AnamnesisPage() {
  const [step, setStep] = useState(0);
  const [sex, setSex] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const progress = ((step + 1) / steps.length) * 100;

  const handleComplete = async () => {
    if (!user || !sex || !birthDate || !height || !weight || !selectedGoal || !selectedActivity) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);

    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const heightM = heightCm / 100;
    const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // BMI calculation
    const bmi = weightKg / (heightM * heightM);
    const bmiCategory = bmi < 18.5 ? 'Abaixo' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Sobrepeso' : 'Obesidade';

    // Lean mass = BMI threshold (24.9) × height² — upper limit of "Normal"
    const leanWeight = Math.min(weightKg, 24.9 * heightM * heightM);

    // BMR Mifflin-St Jeor (uses actual weight for metabolic rate)
    const bmr = sex === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const actLevel = activityLevels.find(a => a.value === selectedActivity);
    const tdee = bmr * (actLevel?.factor || 1.55);

    const goalMultiplier = selectedGoal === 'fat_loss' ? 0.8 : selectedGoal === 'muscle_gain' ? 1.1 : 1.0;
    const targetCalories = tdee * goalMultiplier;

    // Macros based on LEAN MASS (not current weight)
    // Protein: leanWeight × 2 (male) or × 1.6 (female)
    const targetProtein = sex === 'male' ? leanWeight * 2 : leanWeight * 1.6;
    // Fat: leanWeight in grams
    const targetFat = leanWeight;
    // Indispensable calories: (protein × 4) + (fat × 9)
    const indispensableCals = (targetProtein * 4) + (targetFat * 9);
    // Remaining calories from carbs
    const remainingCals = Math.max(0, targetCalories - indispensableCals);
    const targetCarbs = remainingCals / 4;
    const targetWater = 35 * weightKg;

    const { error: anamError } = await supabase.from('anamnesis').upsert({
      user_id: user.id,
      biological_sex: sex,
      birth_date: birthDate,
      height_cm: heightCm,
      weight_kg: weightKg,
      body_fat_percent: bodyFat ? parseFloat(bodyFat) : null,
      waist_cm: waist ? parseFloat(waist) : null,
      goal: selectedGoal,
      activity_level: selectedActivity,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target_calories: Math.round(targetCalories),
      target_protein_g: Math.round(targetProtein),
      target_fat_g: Math.round(targetFat),
      target_carbs_g: Math.round(targetCarbs),
      target_water_ml: Math.round(targetWater),
      bmi: Math.round(bmi * 10) / 10,
      bmi_category: bmiCategory,
    }, { onConflict: 'user_id' });

    if (anamError) {
      toast.error('Erro ao salvar anamnese');
      setSaving(false);
      return;
    }

    // Mark anamnesis complete + add XP
    await supabase.from('profiles').update({ anamnesis_complete: true, xp: 200 }).eq('user_id', user.id);
    await supabase.from('xp_transactions').insert({
      user_id: user.id,
      amount: 200,
      source: 'anamnesis_complete',
    });

    await refreshProfile();
    setSaving(false);
    toast.success('🧠 Anamnese completa! +200 XP');
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Swords className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-display font-bold">Anamnese</h1>
          <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
        </div>

        <Progress value={progress} className="h-2" />
        <p className="text-xs text-center text-muted-foreground font-mono">Passo {step + 1} de {steps.length}</p>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
            <Card className="border-primary/10">
              <CardContent className="pt-6 space-y-4">
                {step === 0 && (
                  <>
                    <h2 className="font-display font-bold text-lg">{steps[0].title}</h2>
                    <div className="space-y-2">
                      <Label>Sexo biológico</Label>
                      <div className="flex gap-2">
                        <Button variant={sex === 'male' ? 'default' : 'outline'} className="flex-1" onClick={() => setSex('male')}>♂️ Masculino</Button>
                        <Button variant={sex === 'female' ? 'default' : 'outline'} className="flex-1" onClick={() => setSex('female')}>♀️ Feminino</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Data de nascimento</Label>
                      <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                    </div>
                  </>
                )}
                {step === 1 && (
                  <>
                    <h2 className="font-display font-bold text-lg">{steps[1].title}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label>Altura (cm) *</Label><Input type="number" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} min={100} max={250} /></div>
                      <div className="space-y-2"><Label>Peso (kg) *</Label><Input type="number" placeholder="80" value={weight} onChange={(e) => setWeight(e.target.value)} min={30} max={500} /></div>
                      <div className="space-y-2"><Label>% Gordura (opcional)</Label><Input type="number" placeholder="18" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Cintura (cm, opcional)</Label><Input type="number" placeholder="85" value={waist} onChange={(e) => setWaist(e.target.value)} /></div>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <h2 className="font-display font-bold text-lg">{steps[2].title}</h2>
                    <div className="space-y-2">
                      {goals.map((goal) => (
                        <button key={goal.value} onClick={() => setSelectedGoal(goal.value)} className={`w-full text-left p-3 rounded-lg border transition-all ${selectedGoal === goal.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <p className="font-display font-bold text-sm">{goal.label}</p>
                          <p className="text-xs text-muted-foreground">{goal.desc}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <h2 className="font-display font-bold text-lg">{steps[3].title}</h2>
                    <div className="space-y-2">
                      {activityLevels.map((al) => (
                        <button key={al.value} onClick={() => setSelectedActivity(al.value)} className={`w-full text-left p-3 rounded-lg border transition-all ${selectedActivity === al.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <div className="flex items-center justify-between">
                            <p className="font-display font-bold text-sm">{al.label}</p>
                            <span className="font-mono text-xs text-primary">×{al.factor}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{al.desc}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 font-display">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1 font-display">
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="flex-1 font-display" disabled={saving}>
              <Check className="h-4 w-4 mr-1" /> {saving ? 'Salvando...' : 'Completar Anamnese (+200 XP)'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
