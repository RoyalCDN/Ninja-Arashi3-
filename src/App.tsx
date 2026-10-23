import React, { useEffect, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { CreateAccountModal } from './components/screens/CreateAccountModal';
import { LoginModal } from './components/screens/LoginModal';
import { EmailVerifyModal } from './components/screens/EmailVerifyModal';
import { ForgotPasswordModal } from './components/screens/ForgotPasswordModal';
import { MainMenu } from './components/screens/MainMenu';
import { ProfileModal } from './components/screens/ProfileModal';
import { SettingsModal } from './components/screens/SettingsModal';
import { LogoutModal } from './components/screens/LogoutModal';
import { MapSelectionModal } from './components/screens/MapSelectionModal';
import { MultiplayerLobbyModal } from './components/screens/MultiplayerLobbyModal';
import { CharacterSelectModal } from './components/screens/CharacterSelectModal';
import { InventoryModal } from './components/screens/InventoryModal';
import { PauseModal } from './components/screens/PauseModal';
import { VictoryModal } from './components/screens/VictoryModal';
import { GameOverModal } from './components/screens/GameOverModal';
import { CHARACTERS } from './game/characters';
import { LEVELS } from './game/levels';
import { authService } from './services/auth';
import { soundManager } from './services/audio';
import {
  GameMode,
  GameScreen,
  MapId,
  MultiplayerRoom,
  PlayerCharacter,
  UserProfile,
} from './types/game';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(authService.getProfile());
  const [screen, setScreen] = useState<GameScreen>('WELCOME');
  const [activeModal, setActiveModal] = useState<
    | null
    | 'profile'
    | 'settings'
    | 'logout'
    | 'map_select'
    | 'character_select'
    | 'inventory'
    | 'shop'
    | 'multiplayer'
    | 'pause'
    | 'victory'
    | 'game_over'
  >(null);

  const [selectedMapId, setSelectedMapId] = useState<MapId>('shadow_forest');
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacter>(CHARACTERS[0]);
  const [gameMode, setGameMode] = useState<GameMode>('STORY');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [lastVictoryStats, setLastVictoryStats] = useState<{
    time: number;
    enemiesDefeated: number;
    coinsCollected: number;
    stars: number;
  } | null>(null);

  // Subscribe to auth changes
  useEffect(() => {
    const unsub = authService.subscribe((newProfile) => {
      setProfile(newProfile);
      if (newProfile) {
        const found = CHARACTERS.find((c) => c.id === newProfile.selectedCharacterId);
        if (found) setSelectedCharacter(found);
      }
    });
    return () => unsub();
  }, []);

  // Initialize audio on first user touch / key press
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.init();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Play menu music when not in active gameplay
  useEffect(() => {
    if (screen !== 'PLAYING') {
      soundManager.playMusic('menu');
    }
  }, [screen]);

  // Handlers for Auth navigation
  const handleCreateAccount = () => {
    setScreen('REGISTER');
  };

  const handleLogin = () => {
    setScreen('LOGIN');
  };

  const handlePlayAsGuest = () => {
    authService.playAsGuest();
    setScreen('MAIN_MENU');
  };

  const handleAuthSuccess = () => {
    setScreen('MAIN_MENU');
  };

  const handleRegisterSuccess = (email: string) => {
    setPendingEmail(email);
    setScreen('VERIFY_EMAIL');
  };

  const handleLogout = () => {
    authService.logout();
    setActiveModal(null);
    setScreen('WELCOME');
  };

  // Launch Game
  const startMission = (mapId: MapId) => {
    setSelectedMapId(mapId);
    setActiveModal(null);
    setScreen('PLAYING');
  };

  const startMultiplayerRoom = (room: MultiplayerRoom) => {
    setSelectedMapId(room.mapId);
    setGameMode(room.mode);
    setActiveModal(null);
    setScreen('PLAYING');
  };

  // Victory callback
  const handleVictory = (stats: {
    time: number;
    enemiesDefeated: number;
    coinsCollected: number;
    stars: number;
  }) => {
    setLastVictoryStats(stats);
    authService.addMissionRewards(stats.coinsCollected, 250 + stats.stars * 100, selectedMapId);
    setActiveModal('victory');
  };

  const handleNextLevel = () => {
    setActiveModal(null);
    const mapKeys: MapId[] = ['shadow_forest', 'frozen_temple', 'lava_valley', 'silent_cliffs'];
    const currentIdx = mapKeys.indexOf(selectedMapId);
    const nextIdx = (currentIdx + 1) % mapKeys.length;
    startMission(mapKeys[nextIdx]);
  };

  const handleReplay = () => {
    setActiveModal(null);
    setScreen('PLAYING');
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Screen 1: Welcome Screen (Mockup #1) */}
      {screen === 'WELCOME' && (
        <WelcomeScreen
          onCreateAccount={handleCreateAccount}
          onLogin={handleLogin}
          onPlayAsGuest={handlePlayAsGuest}
        />
      )}

      {/* Screen 2: Create Account Screen (Mockup #2) */}
      {screen === 'REGISTER' && (
        <CreateAccountModal
          onSuccess={handleRegisterSuccess}
          onGoToLogin={() => setScreen('LOGIN')}
          onBack={() => setScreen('WELCOME')}
        />
      )}

      {/* Screen 3: Email Verification Screen (Mockup #3) */}
      {screen === 'VERIFY_EMAIL' && (
        <EmailVerifyModal
          email={pendingEmail}
          onBackToLogin={() => setScreen('LOGIN')}
          onContinue={() => setScreen('MAIN_MENU')}
        />
      )}

      {/* Screen 4: Login Screen (Mockup #4) */}
      {screen === 'LOGIN' && (
        <LoginModal
          onSuccess={handleAuthSuccess}
          onGoToRegister={() => setScreen('REGISTER')}
          onGoToForgotPassword={() => setScreen('FORGOT_PASSWORD')}
          onBack={() => setScreen('WELCOME')}
        />
      )}

      {/* Screen 5: Forgot Password Screen (Mockup #5) */}
      {screen === 'FORGOT_PASSWORD' && (
        <ForgotPasswordModal onBackToLogin={() => setScreen('LOGIN')} />
      )}

      {/* Screen 8: Main Menu (Mockup #8) */}
      {screen === 'MAIN_MENU' && profile && (
        <MainMenu
          profile={profile}
          onPlay={() => setActiveModal('map_select')}
          onMultiplayer={() => setActiveModal('multiplayer')}
          onCharacter={() => setActiveModal('character_select')}
          onMap={() => setActiveModal('map_select')}
          onInventory={() => setActiveModal('inventory')}
          onShop={() => setActiveModal('character_select')}
          onSettings={() => setActiveModal('settings')}
          onOpenProfile={() => setActiveModal('profile')}
        />
      )}

      {/* Active 2D Canvas Gameplay View (HUD #10) */}
      {screen === 'PLAYING' && (
        <GameCanvas
          key={`${selectedMapId}_${selectedCharacter.id}_${Date.now()}`}
          level={LEVELS[selectedMapId]}
          character={selectedCharacter}
          mode={gameMode}
          controlSize={soundManager.getSettings().touchControlSize}
          onPause={() => setActiveModal('pause')}
          onVictory={handleVictory}
          onGameOver={() => setActiveModal('game_over')}
        />
      )}

      {/* MODALS OVERLAY */}

      {/* Modal 6: Player Profile (Mockup #6) */}
      {activeModal === 'profile' && profile && (
        <ProfileModal
          profile={profile}
          onClose={() => setActiveModal(null)}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {/* Modal 7: Settings (Mockup #7) */}
      {activeModal === 'settings' && (
        <SettingsModal
          onClose={() => setActiveModal(null)}
          onLogout={() => setActiveModal('logout')}
        />
      )}

      {/* Modal 9: Logout Confirmation (Mockup #9) */}
      {activeModal === 'logout' && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setActiveModal('settings')}
        />
      )}

      {/* Modal 11: Map Selection (Mockup #11) */}
      {activeModal === 'map_select' && profile && (
        <MapSelectionModal
          profile={profile}
          selectedMap={selectedMapId}
          onSelectMap={(id) => setSelectedMapId(id)}
          onStartMission={startMission}
          onBack={() => setActiveModal(null)}
        />
      )}

      {/* Modal 12: Online Multiplayer Lobby (Mockup #12) */}
      {activeModal === 'multiplayer' && profile && (
        <MultiplayerLobbyModal
          profile={profile}
          onJoinRoomMatch={startMultiplayerRoom}
          onBack={() => setActiveModal(null)}
        />
      )}

      {/* Character Select Modal */}
      {activeModal === 'character_select' && profile && (
        <CharacterSelectModal
          profile={profile}
          onSelectCharacter={(c) => {
            setSelectedCharacter(c);
            setActiveModal(null);
          }}
          onBack={() => setActiveModal(null)}
        />
      )}

      {/* Inventory Modal */}
      {activeModal === 'inventory' && profile && (
        <InventoryModal
          profile={profile}
          onBack={() => setActiveModal(null)}
        />
      )}

      {/* In-Game Pause Modal */}
      {activeModal === 'pause' && (
        <PauseModal
          onResume={() => setActiveModal(null)}
          onRestart={() => {
            setActiveModal(null);
            setScreen('MAIN_MENU');
            setTimeout(() => setScreen('PLAYING'), 50);
          }}
          onSettings={() => setActiveModal('settings')}
          onMainMenu={() => {
            setActiveModal(null);
            setScreen('MAIN_MENU');
          }}
        />
      )}

      {/* In-Game Victory Modal */}
      {activeModal === 'victory' && lastVictoryStats && (
        <VictoryModal
          stats={lastVictoryStats}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onMainMenu={() => {
            setActiveModal(null);
            setScreen('MAIN_MENU');
          }}
        />
      )}

      {/* In-Game Game Over Modal */}
      {activeModal === 'game_over' && (
        <GameOverModal
          onReviveAtCheckpoint={() => {
            setActiveModal(null);
            // Remount with checkpoint respawn
            setScreen('PLAYING');
          }}
          onRestart={() => {
            setActiveModal(null);
            setScreen('MAIN_MENU');
            setTimeout(() => setScreen('PLAYING'), 50);
          }}
          onMainMenu={() => {
            setActiveModal(null);
            setScreen('MAIN_MENU');
          }}
        />
      )}
    </main>
  );
}
