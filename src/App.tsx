import { useCallback, useEffect, useState } from 'react';
import { StartScene } from './components/StartScene';
import { PhaserIntro } from './components/PhaserIntro';
import { EventOverlay } from './components/story/EventOverlay';
import { FactoryRetrofitPanel } from './components/story/FactoryRetrofitPanel';
import { GameHeader, getDefaultHint } from './components/story/GameHeader';
import { HintBar } from './components/story/HintBar';
import { ReportPanel } from './components/story/ReportPanel';
import { StoryMapStage } from './components/story/StoryMapStage';
import { parkBridge } from './game/parkBridge';
import {
  applyDeepOptimization,
  applyEventDecision,
  applyInitialRetrofit,
  createInitialState,
  getDeepChoice,
  getInitialChoice,
  type GameState,
} from './game/story/gameState';
import {
  DEEP_OPTIONS,
  DEEP_OPT_INTRO,
  formatChoiceHint,
  getEventForStage,
  getFactory,
  isMapFactoryStage,
  TARGET_EMISSION,
  type DecisionOption,
  type FactoryId,
} from './game/story/phase1Script';
import './App.story.css';

type AppScreen = 'start' | 'intro' | 'main';

function StoryGame({ onReturnStart }: { onReturnStart: () => void }) {
  const [game, setGame] = useState<GameState>(createInitialState);
  const [selectedFactory, setSelectedFactory] = useState<FactoryId | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [hint, setHint] = useState(() => getDefaultHint(createInitialState()));
  const [deepIntroDismissed, setDeepIntroDismissed] = useState(false);
  const [butlerIntroDone, setButlerIntroDone] = useState(false);

  const mapVisuals = {
    stageId: game.stageId,
    initialDone: game.initialRetrofitDone,
    deepDone: game.deepOptimizedFactory,
  };

  useEffect(() => {
    parkBridge.resetButlerIntroState();
    setButlerIntroDone(false);
  }, []);

  useEffect(() => {
    return parkBridge.subscribe({
      onFactorySelect: (factory) => {
        if (!isMapFactoryStage(game.stageId)) return;
        setSelectedFactory(factory ? (factory.id as FactoryId) : null);
      },
      onButlerComplete: () => setButlerIntroDone(true),
    });
  }, [game.stageId]);

  useEffect(() => {
    parkBridge.syncMapVisuals(mapVisuals);
    parkBridge.syncEmission(game.emission, game.emission <= TARGET_EMISSION);
  }, [mapVisuals, game.emission, mapKey]);

  useEffect(() => {
    setHint(getDefaultHint(game));
  }, [game]);

  useEffect(() => {
    if (game.stageId !== 'deep_opt') {
      setDeepIntroDismissed(false);
    }
  }, [game.stageId]);

  const closePanel = useCallback(() => {
    setSelectedFactory(null);
    parkBridge.clearSelection();
  }, []);

  const handleEventDecision = useCallback((option: DecisionOption) => {
    setGame((g) => {
      if (g.stageId === 'diagnosis') {
        return applyEventDecision(g, 'diagnosis', '园区诊断', option);
      }
      if (g.stageId === 'inspection') {
        return applyEventDecision(g, 'inspection', '监管抽查', option);
      }
      if (g.stageId === 'carbon') {
        return applyEventDecision(g, 'carbon', '碳资产补充', option);
      }
      return g;
    });
    setHint(formatChoiceHint(option));
  }, []);

  const handleFactoryDecision = useCallback(
    (option: DecisionOption) => {
      if (!selectedFactory) return;
      setGame((g) => {
        if (g.stageId === 'retrofit') {
          return applyInitialRetrofit(g, selectedFactory, option);
        }
        if (g.stageId === 'deep_opt' && !g.deepOptimizedFactory) {
          return applyDeepOptimization(g, selectedFactory, option);
        }
        return g;
      });
      setHint(formatChoiceHint(option));
      closePanel();
    },
    [selectedFactory, closePanel],
  );

  const handleInsufficientFunds = useCallback(() => {
    setHint('资金不足，无法选择该方案');
  }, []);

  const handleRestart = useCallback(() => {
    setGame(createInitialState());
    setSelectedFactory(null);
    setDeepIntroDismissed(false);
    parkBridge.clearSelection();
    parkBridge.resetFactories();
    setMapKey((k) => k + 1);
    setHint(getDefaultHint(createInitialState()));
    onReturnStart();
  }, [onReturnStart]);

  const eventStage = butlerIntroDone ? getEventForStage(game.stageId) : null;
  const deepChoice = getDeepChoice(game);

  const factoryPanel = selectedFactory ? (() => {
    const factory = getFactory(selectedFactory);
    if (game.stageId === 'retrofit') {
      const done = game.initialRetrofitDone.includes(selectedFactory);
      return (
        <FactoryRetrofitPanel
          factory={factory}
          mode="initial"
          funds={game.funds}
          readonly={done}
          choice={getInitialChoice(game, selectedFactory)}
          onSelect={handleFactoryDecision}
          onInsufficientFunds={handleInsufficientFunds}
          onClose={closePanel}
        />
      );
    }
    if (game.stageId === 'deep_opt') {
      const isDeepTarget = game.deepOptimizedFactory === selectedFactory;
      const deepLocked = Boolean(game.deepOptimizedFactory && !isDeepTarget);
      return (
        <FactoryRetrofitPanel
          factory={factory}
          mode="deep"
          funds={game.funds}
          readonly={Boolean(game.deepOptimizedFactory)}
          choice={isDeepTarget ? deepChoice : getInitialChoice(game, selectedFactory)}
          deepOption={DEEP_OPTIONS[selectedFactory]}
          deepLocked={deepLocked}
          deepTargetName={
            game.deepOptimizedFactory ? getFactory(game.deepOptimizedFactory).title : undefined
          }
          onSelect={handleFactoryDecision}
          onInsufficientFunds={handleInsufficientFunds}
          onClose={closePanel}
        />
      );
    }
    return null;
  })() : null;

  const overlay =
    game.stageId === 'report' ? (
      <ReportPanel state={game} onRestart={handleRestart} />
    ) : eventStage ? (
      <EventOverlay
        kind="decision"
        title={eventStage.title}
        text={eventStage.text}
        options={eventStage.options}
        funds={game.funds}
        onSelect={handleEventDecision}
        onInsufficientFunds={handleInsufficientFunds}
      />
    ) : game.stageId === 'deep_opt' && !deepIntroDismissed && !game.deepOptimizedFactory ? (
      <EventOverlay
        kind="narrative"
        title={DEEP_OPT_INTRO.title}
        text={DEEP_OPT_INTRO.text}
        buttonLabel="选择工厂"
        onContinue={() => setDeepIntroDismissed(true)}
      />
    ) : (
      factoryPanel
    );

  return (
    <div className="story-app">
      <GameHeader state={game} />
      <main className="story-main">
        <StoryMapStage mapKey={mapKey}>{overlay}</StoryMapStage>
      </main>
      <HintBar message={hint} />
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('start');

  const handleStartIntro = useCallback(() => setScreen('intro'), []);
  const handleEnterGame = useCallback(() => setScreen('main'), []);
  const handleReturnStart = useCallback(() => setScreen('start'), []);

  if (screen === 'start') {
    return <StartScene onStart={handleStartIntro} />;
  }

  if (screen === 'intro') {
    return <PhaserIntro onEnterGame={handleEnterGame} />;
  }

  return <StoryGame onReturnStart={handleReturnStart} />;
}

export default App;
