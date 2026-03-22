import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useAuth } from '@/hooks/useAuth';

export function InteractiveTutorial() {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    const hasSeenTutorial = localStorage.getItem(`qf_tutorial_${user.id}`);
    if (!hasSeenTutorial) {
      // Delay slightly to ensure elements are rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const steps: Step[] = [
    {
      target: '#tour-profile-avatar',
      content: 'Bem-vindo(a) ao QuestFit! Aqui é onde você acessa seu perfil, configurações de classe e atributos de herói.',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '#tour-nav-bar',
      content: 'Esta é sua bússola de aventuras. Navegue pelas Missões, Treinos, Dieta e o Ranking dos melhores guerreiros!',
      placement: 'top',
    },
    {
      target: '#tour-home-start-workout',
      content: 'Sua jornada épica começa na forja. Clique aqui quando quiser iniciar sua primeira sessão de treino!',
      placement: 'top',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`qf_tutorial_${user.id}`, 'true');
      }
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#F59E0B', // amber-500
          backgroundColor: '#1E293B', // slate-800
          textColor: '#F8FAFC',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          arrowColor: '#1E293B',
        },
        tooltipContainer: {
          textAlign: 'left',
          fontFamily: 'Outfit, sans-serif',
        },
        buttonNext: {
          backgroundColor: '#F59E0B',
          borderRadius: '4px',
          fontWeight: 'bold',
        },
        buttonBack: {
          color: '#CBD5E1',
        },
        buttonSkip: {
          color: '#94A3B8',
        }
      }}
      locale={{
        back: 'Anterior',
        close: 'Fechar',
        last: 'Concluir',
        next: 'Próximo',
        skip: 'Pular',
      }}
    />
  );
}
