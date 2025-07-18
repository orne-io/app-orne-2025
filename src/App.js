import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Staking from './components/Staking';
import Carbon from './components/Carbon';
import AdminPanel from './components/AdminPanel';
import Swap from './components/Swap';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import NotificationContainer from './components/NotificationContainer';
import Footer from './components/Footer';
import { styles } from './styles/styles';
import { useAdmin } from './hooks/useAdmin';
import { useStatus } from './hooks/useStatus';
import { useGlobalStats } from './hooks/useGlobalStats';
import { useUserData } from './hooks/useUserData';
import { useDashboardData } from './hooks/useDashboardData';
import { useUniswapV3PoolData } from './hooks/useUniswapV3PoolData';
import { NotificationProvider, useNotificationContext } from './contexts/NotificationContext';
import Logo from './logo.svg';
import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';
import './styles/styles.css';
import { useMediaQuery } from 'react-responsive';
import Holders from './components/Holders';

// Configuration RainbowKit + wagmi (simplifiée)
const config = getDefaultConfig({
  appName: 'ORNE DApp',
  chains: [arbitrum],
  projectId: 'c05710e12c1b77ed55cb8f9c66f52851',
  ssr: false,
});

// Custom ConnectButton to force English label
function CustomConnectButton(props) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {!connected ? (
              <button onClick={openConnectModal} type="button" style={{ ...props.style, minWidth: 180, padding: '12px 24px', borderRadius: 25, background: '#89be83', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button onClick={openChainModal} type="button" style={{ ...props.style, minWidth: 180, padding: '12px 24px', borderRadius: 25, background: '#dc3545', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
                Wrong network
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={openChainModal} style={{ display: 'flex', alignItems: 'center', background: '#f3efec', border: 'none', borderRadius: 25, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }} type="button">
                  {chain.hasIcon && (
                    <div style={{ background: chain.iconBackground, width: 12, height: 12, borderRadius: 999, overflow: 'hidden', marginRight: 4 }}>
                      {chain.iconUrl && (
                        <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 12, height: 12 }} />
                      )}
                    </div>
                  )}
                  {chain.name}
                </button>
                <button onClick={openAccountModal} type="button" style={{ background: '#f3efec', border: 'none', borderRadius: 25, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                  {account.displayName}
                  {account.displayBalance ? ` (${account.displayBalance})` : ''}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function ORNEStakingDApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Utilise les hooks custom
  const { status, showStatus } = useStatus();
  const { globalStats, globalUnstakingStats, loadGlobalStats } = useGlobalStats();
  // Le wallet sera géré par wagmi/appkit, on ne gère plus l'état local
  const wallet = {};
  const { userStats, loadUserData } = useUserData(globalStats);
  const uniswapData = useUniswapV3PoolData();
  const dashboardData = useDashboardData(globalStats, uniswapData);

  // Hook admin
  const {
    showAdminPanel,
    adminData,
    setAdminData,
    checkAdminAccess,
    addCO2,
    distributeRewards,
    setUnstakingDelay
  } = useAdmin(loadGlobalStats, loadUserData, showStatus, setLoading);

  // Effects (inchangés)
  useEffect(() => {
    if (wallet.connected) {
      loadUserData();
      const interval = setInterval(loadUserData, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet.connected, loadUserData]);

  useEffect(() => {
    const handleHashChange = () => {
      checkAdminAccess();
      
      // Handle privacy and terms pages
      const hash = window.location.hash;
      if (hash === '#privacy') {
        setActiveTab('privacy');
      } else if (hash === '#terms') {
        setActiveTab('terms');
      }
    };

    checkAdminAccess();
    
    // Check initial hash
    const hash = window.location.hash;
    if (hash === '#privacy') {
      setActiveTab('privacy');
    } else if (hash === '#terms') {
      setActiveTab('terms');
    }
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [checkAdminAccess, setActiveTab]);

  useEffect(() => {
    loadGlobalStats();
    const interval = setInterval(loadGlobalStats, 60000);
    return () => clearInterval(interval);
  }, [loadGlobalStats]);

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider>
        <NotificationProvider>
          <AppContent 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loading}
            setLoading={setLoading}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
            isMobile={isMobile}
            status={status}
            showStatus={showStatus}
            globalStats={globalStats}
            globalUnstakingStats={globalUnstakingStats}
            loadGlobalStats={loadGlobalStats}
            wallet={wallet}
            userStats={userStats}
            loadUserData={loadUserData}
            uniswapData={uniswapData}
            dashboardData={dashboardData}
            showAdminPanel={showAdminPanel}
            adminData={adminData}
            setAdminData={setAdminData}
            addCO2={addCO2}
            distributeRewards={distributeRewards}
            setUnstakingDelay={setUnstakingDelay}
            styles={styles}
          />
        </NotificationProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

function AppContent({
  activeTab,
  setActiveTab,
  loading,
  setLoading,
  showMobileMenu,
  setShowMobileMenu,
  isMobile,
  status,
  showStatus,
  globalStats,
  globalUnstakingStats,
  loadGlobalStats,
  wallet,
  userStats,
  loadUserData,
  uniswapData,
  dashboardData,
  showAdminPanel,
  adminData,
  setAdminData,
  addCO2,
  distributeRewards,
  setUnstakingDelay,
  styles
}) {
  const { notifications, removeNotification } = useNotificationContext();

  // Fermer le menu mobile au clic en dehors
  useEffect(() => {
    if (!showMobileMenu) return;
    const handleClick = (e) => {
      if (!e.target.closest('.nav') && !e.target.closest('.burger')) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMobileMenu, setShowMobileMenu]);

  // Rendu du contenu principal (inchangé)
  const renderMainContent = () => {
    if (showAdminPanel && activeTab === 'admin') {
      return (
        <AdminPanel
          adminData={adminData}
          setAdminData={setAdminData}
          globalStats={globalStats}
          dashboardData={dashboardData}
          addCO2={addCO2}
          distributeRewards={distributeRewards}
          setUnstakingDelay={setUnstakingDelay}
          loading={loading}
          status={status}
          styles={styles}
        />
      );
    }
    
    if (activeTab === 'dashboard') {
      return (
        <Dashboard
          dashboardData={dashboardData}
          globalStats={globalStats}
          globalUnstakingStats={globalUnstakingStats}
          styles={styles}
          wallet={wallet}
        />
      );
    }
    
    if (activeTab === 'carbon') {
      return (
        <Carbon
          userStats={userStats}
          globalStats={globalStats}
          styles={styles}
          dashboardData={dashboardData}
        />
      );
    }
    
    if (activeTab === 'swap') {
      return <Swap />;
    }
    
    if (activeTab === 'privacy') {
      return <PrivacyPolicy />;
    }
    
    if (activeTab === 'terms') {
      return <TermsOfService />;
    }
    
    if (activeTab === 'holders') {
      return <Holders />;
    }
    
    return (
      <Staking
        wallet={wallet}
        userStats={userStats}
        globalStats={globalStats}
        loadUserData={loadUserData}
        loadGlobalStats={loadGlobalStats}
        connectWallet={null}
        loading={loading}
        setLoading={setLoading}
        status={status}
        showStatus={showStatus}
        styles={styles}
      />
    );
  };

  return (
    <>
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      <div style={{ ...styles.container, minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%' }}>
            {/* Header */}
            <div style={styles.header}>
              <div className="headerContent" style={styles.headerContent}>
                  {isMobile ? (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <div style={styles.logo} onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }} role="button" tabIndex={0} aria-label="Go to dashboard" onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') { setActiveTab('dashboard'); setShowMobileMenu(false); } }}>
                        <img src={Logo} alt="ORNE Logo" style={{ height: 40, verticalAlign: 'middle', cursor: 'pointer' }} />
                      </div>
                      <div
                        className="burger"
                        style={{ ...styles.burger, display: 'flex' }}
                        onClick={() => setShowMobileMenu((v) => !v)}
                      >
                        <span style={{
                          ...styles.burgerBar,
                          transform: showMobileMenu ? 'rotate(45deg) translateY(15px)' : 'none',
                        }}></span>
                        <span style={{
                          ...styles.burgerBar,
                          opacity: showMobileMenu ? 0 : 1,
                        }}></span>
                        <span style={{
                          ...styles.burgerBar,
                          transform: showMobileMenu ? 'rotate(-45deg) translateY(-15px)' : 'none',
                        }}></span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={styles.logo} onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }} role="button" tabIndex={0} aria-label="Go to dashboard" onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') { setActiveTab('dashboard'); setShowMobileMenu(false); } }}>
                        <img src={Logo} alt="ORNE Logo" style={{ height: 40, verticalAlign: 'middle', cursor: 'pointer' }} />
                      </div>
                      {/* Desktop navigation + bouton wallet */}
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: 32 }}>
                        <div className="nav" style={styles.nav}>
                          <div
                            style={{
                              ...styles.navItem,
                              ...(activeTab === 'dashboard' ? styles.navItemActive : {})
                            }}
                            className="navItem"
                            onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }}
                          >
                            Dashboard
                          </div>
                          <div
                            style={{
                              ...styles.navItem,
                              ...(activeTab === 'stake' ? styles.navItemActive : {})
                            }}
                            className="navItem"
                            onClick={() => { setActiveTab('stake'); setShowMobileMenu(false); }}
                          >
                            Stake
                          </div>
                          <div
                            style={{
                              ...styles.navItem,
                              ...(activeTab === 'carbon' ? styles.navItemActive : {})
                            }}
                            className="navItem"
                            onClick={() => { setActiveTab('carbon'); setShowMobileMenu(false); }}
                          >
                            Carbon
                          </div>
                          <div
                            style={{
                              ...styles.navItem,
                              ...(activeTab === 'swap' ? styles.navItemActive : {})
                            }}
                            className="navItem"
                            onClick={() => { setActiveTab('swap'); setShowMobileMenu(false); }}
                          >
                            Swap
                          </div>
                          <div
                            style={{
                              ...styles.navItem,
                              ...(activeTab === 'holders' ? styles.navItemActive : {})
                            }}
                            className="navItem"
                            onClick={() => { setActiveTab('holders'); setShowMobileMenu(false); }}
                          >
                            Holders
                          </div>
                          {showAdminPanel && (
                            <div
                              style={{
                                ...styles.navItem,
                                ...(activeTab === 'admin' ? styles.navItemActive : {}),
                                color: '#dc3545'
                              }}
                              className="navItem"
                              onClick={() => { setActiveTab('admin'); setShowMobileMenu(false); }}
                            >
                              🔧 Admin
                            </div>
                          )}
                        </div>
                        <div style={{ marginLeft: 32, minWidth: 180, display: 'flex', alignItems: 'center' }}>
                          <CustomConnectButton style={{ minWidth: 180 }} />
                        </div>
                      </div>
                    </div>
                  )}
                {/* Navigation mobile */}
                {isMobile && (
                  <div>
                    <div
                      className={`nav${showMobileMenu ? ' mobile-open' : ''}`}
                      style={showMobileMenu ? styles.mobileNav : { display: 'none' }}
                    >
                      <div
                        style={{
                          ...styles.navItem,
                          ...(activeTab === 'dashboard' ? styles.navItemActive : {})
                        }}
                        className="navItem"
                        onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }}
                      >
                        Dashboard
                      </div>
                      <div
                        style={{
                          ...styles.navItem,
                          ...(activeTab === 'stake' ? styles.navItemActive : {})
                        }}
                        className="navItem"
                        onClick={() => { setActiveTab('stake'); setShowMobileMenu(false); }}
                      >
                        Stake
                      </div>
                      <div
                        style={{
                          ...styles.navItem,
                          ...(activeTab === 'carbon' ? styles.navItemActive : {})
                        }}
                        className="navItem"
                        onClick={() => { setActiveTab('carbon'); setShowMobileMenu(false); }}
                      >
                        Carbon
                      </div>
                      <div
                        style={{
                          ...styles.navItem,
                          ...(activeTab === 'swap' ? styles.navItemActive : {})
                        }}
                        className="navItem"
                        onClick={() => { setActiveTab('swap'); setShowMobileMenu(false); }}
                      >
                        Swap
                      </div>
                      <div
                        style={{
                          ...styles.navItem,
                          ...(activeTab === 'holders' ? styles.navItemActive : {})
                        }}
                        className="navItem"
                        onClick={() => { setActiveTab('holders'); setShowMobileMenu(false); }}
                      >
                        Holders
                      </div>
                      {showAdminPanel && (
                        <div
                          style={{
                            ...styles.navItem,
                            ...(activeTab === 'admin' ? styles.navItemActive : {}),
                            color: '#dc3545'
                          }}
                          className="navItem"
                          onClick={() => { setActiveTab('admin'); setShowMobileMenu(false); }}
                        >
                          🔧 Admin
                        </div>
                      )}
                      {/* Bouton wallet RainbowKit dans le menu mobile */}
                      <div style={styles.mobileNavWallet}>
                        <CustomConnectButton style={{ minWidth: 180 }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Main Content */}
            <div style={{ ...styles.main, flex: 1, marginBottom: 0 }}>
              {renderMainContent()}
            </div>
            
            {/* Footer */}
            <Footer />
          </div>
        </>
      );
    }

export default ORNEStakingDApp;