import { useCallback, useEffect, useState } from 'react';
import { StartScene } from './components/StartScene';
import { PhaserIntro } from './components/PhaserIntro';
import { ComplianceFailurePanel } from './components/story/ComplianceFailurePanel';
import { FactoryRetrofitPanel } from './components/story/FactoryRetrofitPanel';
import { getDefaultHint } from './components/story/GameHeader';
import { ReportPanel } from './components/story/ReportPanel';
import { CONSTRUCTION_ANIMATION_MS } from './components/story/RetrofitMapView';
import { StoryMapStage } from './components/story/StoryMapStage';
import { BottomActionBar, DataPanel, TopHUD } from './components/story/ui';
import { parkBridge } from './game/parkBridge';
import { carbonGapTon, formatWanYuan, getSecondRoundMinCost, shouldFailAfterRoundOne, triggersComplianceFailure, type FailureReason } from './game/story/compliance';
import {
  applyDeepOptimization,
  applyEventDecision,
  applyInitialRetrofit,
  createInitialState,
  getChoiceByPhase,
  getDeepChoice,
  getInitialChoice,
  type GameState,
} from './game/story/gameState';
import {
  DEEP_OPTIONS,
  formatChoiceHint,
  getDefaultEventOption,
  getFactory,
  isMapFactoryStage,
  TARGET_EMISSION,
  type DecisionOption,
  type FactoryId,
  type StageId,
} from './game/story/phase1Script';
import './App.story.css';
import './components/story/ui/game-ui.css';

type AppScreen = 'start' | 'intro' | 'main';

type FailureState = {
  playerMoney: number;
  requiredCost: number;
  carbonGap: number;
  reason: FailureReason;
};

function triggerFailure(
  game: GameState,
  reason: FailureReason,
  requiredCost: number,
  setFailure: (f: FailureState) => void,
  closePanel: () => void,
  setDataPanelOpen: (open: boolean) => void,
) {
  setFailure({
    playerMoney: game.funds,
    requiredCost,
    carbonGap: carbonGapTon(game.emission),
    reason,
  });
  closePanel();
  setDataPanelOpen(false);
}

const AUTO_EVENT_TITLES: Partial<Record<StageId, string>> = {
  diagnosis: '园区诊断',
  inspection: '监管抽查',
  carbon: '碳资产补充',
};

function StoryGame({ onReturnStart }: { onReturnStart: () => void }) {
  const [game, setGame] = useState<GameState>(createInitialState);
  const [selectedFactory, setSelectedFactory] = useState<FactoryId | null>(null);
  const [constructingFactory, setConstructingFactory] = useState<FactoryId | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [hint, setHint] = useState(() => getDefaultHint(createInitialState()));
  const [failure, setFailure] = useState<FailureState | null>(null);
  const [dataPanelOpen, setDataPanelOpen] = useState(false);

  useEffect(() => {
    setHint(getDefaultHint(game));
  }, [game]);

  useEffect(() => {
    if (failure) {
      parkBridge.showButlerNotice(
        '改造资金不足，本轮低碳改造与碳履约无法继续。请重新规划方案，或返回首页调整策略。',
      );
    }
  }, [failure]);

  const closePanel = useCallback(() => {
    setSelectedFactory(null);
  }, []);

  const handleFactorySelect = useCallback((factoryId: FactoryId | null) => {
    if (!isMapFactoryStage(game.stageId)) return;
    setSelectedFactory(factoryId);
  }, [game.stageId]);

  const handleInsufficientFunds = useCallback(
    (option: DecisionOption) => {
      if (shouldFailAfterRoundOne(game) || (game.stageId === 'deep_opt' && game.funds < option.cost)) {
        triggerFailure(
          game,
          'second_round_funds',
          getSecondRoundMinCost(),
          setFailure,
          closePanel,
          setDataPanelOpen,
        );
        return;
      }
      if (triggersComplianceFailure(option, game.stageId)) {
        triggerFailure(
          game,
          'compliance',
          option.cost,
          setFailure,
          closePanel,
          setDataPanelOpen,
        );
        return;
      }
      if (game.stageId === 'retrofit') {
        setHint(`资金不足（需 ${formatWanYuan(option.cost)}，当前 ${formatWanYuan(game.funds)}），可返回地图选择其他方案`);
        return;
      }
      setHint('资金不足，无法执行改造');
    },
    [game, closePanel],
  );

  const applyOptionToState = useCallback(
    (option: DecisionOption) => {
      setGame((g) => {
        if (g.stageId === 'diagnosis') {
          return applyEventDecision(g, 'diagnosis', AUTO_EVENT_TITLES.diagnosis!, option);
        }
        if (g.stageId === 'inspection') {
          return applyEventDecision(g, 'inspection', AUTO_EVENT_TITLES.inspection!, option);
        }
        if (g.stageId === 'carbon') {
          return applyEventDecision(g, 'carbon', AUTO_EVENT_TITLES.carbon!, option);
        }
        if (g.stageId === 'retrofit' && selectedFactory) {
          return applyInitialRetrofit(g, selectedFactory, option);
        }
        if (g.stageId === 'deep_opt' && selectedFactory && !g.deepOptimizedFactory) {
          return applyDeepOptimization(g, selectedFactory, option);
        }
        return g;
      });
      setHint(formatChoiceHint(option));
    },
    [selectedFactory],
  );

  useEffect(() => {
    if (failure) return;

    if (shouldFailAfterRoundOne(game)) {
      triggerFailure(
        game,
        'second_round_funds',
        getSecondRoundMinCost(),
        setFailure,
        closePanel,
        setDataPanelOpen,
      );
      return;
    }

    const autoStages: StageId[] = ['diagnosis', 'inspection', 'carbon'];
    if (!autoStages.includes(game.stageId)) return;

    const phase =
      game.stageId === 'diagnosis'
        ? 'diagnosis'
        : game.stageId === 'inspection'
          ? 'inspection'
          : 'carbon';
    if (getChoiceByPhase(game, phase)) return;

    const option = getDefaultEventOption(game.stageId);
    if (!option) return;

    if (game.funds < option.cost) {
      handleInsufficientFunds(option);
      return;
    }

    setGame((g) =>
      applyEventDecision(g, phase, AUTO_EVENT_TITLES[game.stageId]!, option),
    );
    setHint(formatChoiceHint(option));
  }, [failure, game, handleInsufficientFunds, closePanel]);

  const handleFactoryDecision = useCallback(
    (option: DecisionOption) => {
      if (!selectedFactory) return;
      if (game.funds < option.cost) {
        handleInsufficientFunds(option);
        return;
      }

      const factoryId = selectedFactory;
      closePanel();
      setConstructingFactory(factoryId);

      window.setTimeout(() => {
        applyOptionToState(option);
        setConstructingFactory(null);
      }, CONSTRUCTION_ANIMATION_MS);
    },
    [selectedFactory, game.funds, handleInsufficientFunds, applyOptionToState, closePanel],
  );

  const handleReplan = useCallback(() => {
    setFailure(null);
    setGame(createInitialState());
    setSelectedFactory(null);
    setConstructingFactory(null);
    setMapKey((k) => k + 1);
    setHint(getDefaultHint(createInitialState()));
  }, []);

  const handleReturnHomeFromFailure = useCallback(() => {
    setFailure(null);
    setGame(createInitialState());
    setSelectedFactory(null);
    setConstructingFactory(null);
    onReturnStart();
  }, [onReturnStart]);

  const handleRestart = useCallback(() => {
    setGame(createInitialState());
    setSelectedFactory(null);
    setConstructingFactory(null);
    setMapKey((k) => k + 1);
    setHint(getDefaultHint(createInitialState()));
    onReturnStart();
  }, [onReturnStart]);

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
          currentEmission={game.emission}
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
          currentEmission={game.emission}
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

  const factoryPanelOpen = Boolean(selectedFactory && isMapFactoryStage(game.stageId));

  const showReport = game.stageId === 'report' && !failure;
  const showBottomBar = !failure && !showReport;
  const modalOverlayOpen = failure || showReport;
  const defaultHint = getDefaultHint(game);
  const showHintToast = !modalOverlayOpen && hint !== defaultHint;

  const handleUpgrade = useCallback(() => {
    if (isMapFactoryStage(game.stageId)) {
      setHint('点击地图上的工厂，选择升级方案');
    } else {
      setHint('完成当前阶段后，即可升级工厂设备');
    }
  }, [game.stageId]);

  const handleInspect = useCallback(() => {
    setHint(`当前排放 ${game.emission} tCO₂e，请保持巡检并关注合规状态`);
  }, [game.emission]);

  const handleCarbonPlan = useCallback(() => {
    if (game.stageId === 'carbon') {
      setHint('碳资产补充阶段：系统将自动选择合规方案');
    } else {
      setHint(`碳规划目标：排放降至 ${TARGET_EMISSION} 以下（当前 ${game.emission}）`);
    }
  }, [game.stageId, game.emission]);

  const handleParkOverview = useCallback(() => {
    setSelectedFactory(null);
    setDataPanelOpen(true);
  }, []);

  const closeDataPanel = useCallback(() => {
    setDataPanelOpen(false);
  }, []);

  return (
    <div className={`game-screen${modalOverlayOpen ? ' game-screen--modal-open' : ''}`}>
      <main className="game-screen__main">
        <StoryMapStage
          mapKey={mapKey}
          stageId={game.stageId}
          initialRetrofitDone={game.initialRetrofitDone}
          deepOptimizedFactory={game.deepOptimizedFactory}
          selectedFactory={selectedFactory}
          constructingFactory={constructingFactory}
          onFactorySelect={handleFactorySelect}
        />
        <div className="ui-overlay">
          <TopHUD state={game} />
          {showHintToast ? (
            <div className="story-hint-toast" role="status">
              {hint}
            </div>
          ) : null}
          {!failure && factoryPanelOpen && !dataPanelOpen ? factoryPanel : null}
          <DataPanel open={dataPanelOpen} onClose={closeDataPanel} state={game} />
          {showBottomBar ? (
            <BottomActionBar
              onUpgrade={handleUpgrade}
              onInspect={handleInspect}
              onCarbonPlan={handleCarbonPlan}
              onParkOverview={handleParkOverview}
              showCarbonBadge={game.emission > TARGET_EMISSION || game.stageId === 'carbon'}
            />
          ) : null}
          {showReport ? <ReportPanel state={game} onRestart={handleRestart} /> : null}
          {failure ? (
            <ComplianceFailurePanel
              playerMoney={failure.playerMoney}
              requiredCost={failure.requiredCost}
              carbonGap={failure.carbonGap}
              reason={failure.reason}
              onReplan={handleReplan}
              onReturnHome={handleReturnHomeFromFailure}
            />
          ) : null}
        </div>
      </main>
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
