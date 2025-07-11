// Styles avec nouvelle charte graphique
export const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3efec',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#383e5c'
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '15px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    color: '#383e5c',
    fontSize: '1.8rem',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    gap: 30, // sera overridé en mobile
    position: 'static',
    top: 'auto',
    left: 'auto',
    width: 'auto',
    height: 'auto',
    background: 'none',
    flexDirection: 'row',
    alignItems: 'unset',
    justifyContent: 'unset',
    zIndex: 'auto',
    boxShadow: 'none',
    paddingTop: 0
  },
  navItem: {
    color: '#383e5c',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.1rem',
    cursor: 'pointer',
    padding: '10px 0',
    borderBottom: 'none', // retiré le border-bottom par défaut
    transition: 'border-color 0.3s ease'
  },
  navItemActive: {
    borderBottom: '2px solid #89be83' // vert uniquement pour l'actif
  },
  walletButton: {
    backgroundColor: '#89be83',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  card: {
    backgroundColor: '#fcf9f8',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid rgba(255,255,255,0.8)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#fcf9f8',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid rgba(255,255,255,0.8)'
  },
  statIcon: {
    fontSize: '2.5rem'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#383e5c',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600'
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  chartWithStatsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 200px',
    gap: '20px',
    marginBottom: '30px',
    alignItems: 'start'
  },
  chartMain: {
    backgroundColor: '#fcf9f8',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  chartStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  chartContainer: {
    backgroundColor: '#fcf9f8',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  chartTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#383e5c',
    marginBottom: '15px'
  },
  smallStatsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginTop: '20px'
  },
  smallStatCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  button: {
    backgroundColor: '#89be83',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    width: '100%'
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: '600',
    marginLeft: '10px'
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: '600',
    width: '100%',
    marginBottom: '10px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '15px',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px'
  },
  maxButton: {
    backgroundColor: '#89be83',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    minWidth: '60px'
  },
  percentageButtons: {
    display: 'flex',
    gap: '5px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  percentageButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500'
  },
  status: {
    padding: '12px 20px',
    borderRadius: '8px',
    margin: '15px 0',
    fontWeight: '600'
  },
  statusSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  statusError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  statusWarning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeaa7'
  },
  userStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '25px'
  },
  userStatCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  userStatTitle: {
    color: '#89be83',
    marginBottom: '8px',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600'
  },
  userStatValue: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#383e5c'
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    marginBottom: '25px'
  },
  co2Section: {
    background: 'linear-gradient(135deg, #89be83, #6fa869)',
    color: 'white',
    padding: '25px',
    borderRadius: '15px',
    marginBottom: '25px'
  },
  co2Grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  co2Stat: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center'
  },
  // Styles spécifiques à l'admin
  adminCard: {
    background: 'linear-gradient(135deg, #89be83, #6fa869)',
    color: 'white',
    marginBottom: '30px'
  },
  adminHistoryContainer: {
    maxHeight: '200px',
    overflow: 'auto'
  },
  adminHistoryItem: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '8px',
    fontSize: '14px'
  },
  adminCalcContainer: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  mobileNav: {
    gap: 10,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#fff',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    boxShadow: '0 0 0 100vw rgba(0,0,0,0.15)',
    display: 'flex',
    paddingTop: 80
  },
  burger: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    cursor: 'pointer',
    zIndex: 1200
  },
  burgerBar: {
    display: 'block',
    width: 24,
    height: 3,
    background: '#383e5c',
    borderRadius: 2,
    margin: '4px 0',
    transition: '0.3s'
  },
  mobileNavWallet: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  }
};