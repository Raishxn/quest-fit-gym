import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

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
  { value: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício', factor: '×1.2' },
  { value: 'light', label: 'Leve', desc: 'Exercício 1-3 dias/semana', factor: '×1.375' },
  { value: 'moderate', label: 'Moderado', desc: 'Exercício 3-5 dias/semana', factor: '×1.55' },
  { value: 'active', label: 'Ativo', desc: 'Exercício 6-7 dias/semana', factor: '×1.725' },
  { value: 'athlete', label: 'Atleta', desc: 'Treinos intensos diários', factor: '×1.9' },
];

export default function AnamnesisPage() {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const navigate = useNavigate();

  const progress = ((step + 1) / steps.length) * 100;

  const handleComplete = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="text-center space-y-2">
          <Swords className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-display font-bold">Anamnese</h1>
          <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
        </div>

        <Progress value={progress} className="h-2" />
        <p className="text-xs text-center text-muted-foreground font-mono">
          Passo {step + 1} de {steps.length}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/10">
              <CardContent className="pt-6 space-y-4">
                {step === 0 && (
                  <>
                    <h2 className="font-display font-bold text-lg">{steps[0].title}</h2>
                    <div className="space-y-2">
                      <Label>Sexo biológico</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">♂️ Masculino</Button>
                        <Button variant="outline" className="flex-1">♀️ Feminino</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Data de nascimento</Label>
                      <Input type="date" />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h2 className="font-display font-bold text-lg">{steps[1].title}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Altura (cm)</Label>
                        <Input type="number" placeholder="175" min={100} max={250} />
                      </div>
                      <div className="space-y-2">
                        <Label>Peso (kg)</Label>
                        <Input type="number" placeholder="80" min={30} max={500} />
                      </div>
                      <div className="space-y-2">
                        <Label>% Gordura (opcional)</Label>
                        <Input type="number" placeholder="18" />
                      </div>
                      <div className="space-y-2">
                        <Label>Cintura (cm, opcional)</Label>
                        <Input type="number" placeholder="85" />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="font-display font-bold text-lg">{steps[2].title}</h2>
                    <div className="space-y-2">
                      {goals.map((goal) => (
                        <button
                          key={goal.value}
                          onClick={() => setSelectedGoal(goal.value)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedGoal === goal.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
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
                        <button
                          key={al.value}
                          onClick={() => setSelectedActivity(al.value)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedActivity === al.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-display font-bold text-sm">{al.label}</p>
                            <span className="font-mono text-xs text-primary">{al.factor}</span>
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
            <Button onClick={handleComplete} className="flex-1 font-display">
              <Check className="h-4 w-4 mr-1" /> Completar Anamnese (+200 XP)
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
