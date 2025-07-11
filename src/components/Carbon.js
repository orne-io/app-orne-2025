import React, { useState, useEffect } from 'react';
import InfoTooltip from './InfoTooltip';
import totalOrneStakedIcon from '../images/total-orne-staked.png';
import totalCo2Icon from '../images/total-co2.png';
import co2PerOrneIcon from '../images/co2-per-orne.png';

const Carbon = ({ userStats, globalStats, styles, dashboardData }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [calculatorData, setCalculatorData] = useState({
    transportation: {
      car: 0,
      publicTransport: 0,
      flights: 0,
      motorcycle: 0,
      bicycle: 0
    },
    energy: {
      electricity: 0,
      heating: 0,
      renewable: 0
    },
    diet: 'mixed',
    lifestyle: {
      shopping: 'moderate',
      waste: 'moderate',
      clothing: 'moderate',
      electronics: 'moderate'
    },
    housing: {
      size: 'medium',
      insulation: 'moderate',
      appliances: 'moderate'
    }
  });
  const [footprintResult, setFootprintResult] = useState(null);
  const [savedCalculations, setSavedCalculations] = useState([]);

  // Charger les calculs sauvegardés au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('carbonCalculations');
    if (saved) {
      try {
        setSavedCalculations(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved calculations:', e);
      }
    }
  }, []);

  // Sauvegarder un calcul
  const saveCalculation = (data, result) => {
    const newCalculation = {
      id: Date.now(),
      date: new Date().toISOString(),
      data,
      result,
      orneOffset: calculateOrneOffset()
    };
    const updated = [newCalculation, ...savedCalculations.slice(0, 4)]; // Garder les 5 derniers
    setSavedCalculations(updated);
    localStorage.setItem('carbonCalculations', JSON.stringify(updated));
  };

  // Calculer l'offset ORNE
  const calculateOrneOffset = () => {
    const stakedBalance = parseFloat(userStats.stakedBalance) || 0;
    const co2PerOrne = parseFloat(String(globalStats.co2PerOrne).replace(/,/g, '')) || 0;
    return stakedBalance > 0 && co2PerOrne > 0 ? (stakedBalance * co2PerOrne) / 1000 : 0;
  };

  // Fonction pour partager sur X (Twitter)
  const shareOnX = () => {
    const co2Offset = (() => {
      if (userStats.userCO2Offset && userStats.userCO2Offset !== '0' && userStats.userCO2Offset !== '0.000') {
        return userStats.userCO2Offset;
      }
      const co2PerOrne = parseFloat(globalStats.co2PerOrne.replace(/,/g, '')) || 0;
      const myStaked = parseFloat(userStats.stakedBalance) || 0;
      if (co2PerOrne > 0 && myStaked > 0) {
        return ((co2PerOrne * myStaked) / 1000).toFixed(3);
      }
      return '0.000';
    })();

    const text = `🌱 I've offset ${co2Offset} kg of CO2 by staking $ORNE tokens!\n\n💚 Contributing to a greener future with @orne_io_\n🌍 Total staked: ${parseFloat(userStats.stakedBalance).toFixed(2)} $ORNE\n📊 CO2 per $ORNE: ${globalStats.co2PerOrne} g\n\nJoin the carbon offset revolution! 🚀\n#CarbonOffset #Blockchain #Sustainability #ORNE`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://orne.io')}`;
    window.open(url, '_blank');
  };

  // Calcul du footprint carbone amélioré
  const calculateFootprint = () => {
    let dailyCO2 = 0;
    let breakdown = {};
    
    // Transport (kg CO2 par jour)
    const transportCO2 = calculatorData.transportation.car * 0.2 + 
                        calculatorData.transportation.publicTransport * 0.05 + 
                        (calculatorData.transportation.flights / 30) * 0.1 +
                        calculatorData.transportation.motorcycle * 0.12 +
                        calculatorData.transportation.bicycle * 0.001;
    dailyCO2 += transportCO2;
    breakdown.transport = transportCO2;
    
    // Énergie (kg CO2 par jour)
    const energyCO2 = (calculatorData.energy.electricity / 30) * 0.4 + 
                     (calculatorData.energy.heating / 30) * 0.2 -
                     (calculatorData.energy.renewable / 30) * 0.1;
    dailyCO2 += Math.max(energyCO2, 0);
    breakdown.energy = Math.max(energyCO2, 0);
    
    // Régime alimentaire (kg CO2 par jour)
    const dietMultipliers = {
      vegan: 1.0,
      vegetarian: 2.0,
      mixed: 3.0,
      meatHeavy: 4.5
    };
    const dietCO2 = dietMultipliers[calculatorData.diet];
    dailyCO2 += dietCO2;
    breakdown.diet = dietCO2;
    
    // Mode de vie (kg CO2 par jour)
    const shoppingMultipliers = { minimal: 0.5, moderate: 1.0, heavy: 2.0 };
    const wasteMultipliers = { zero: 0.2, moderate: 0.5, high: 1.0 };
    const clothingMultipliers = { minimal: 0.3, moderate: 0.6, heavy: 1.2 };
    const electronicsMultipliers = { minimal: 0.2, moderate: 0.4, heavy: 0.8 };
    
    const lifestyleCO2 = shoppingMultipliers[calculatorData.lifestyle.shopping] +
                        wasteMultipliers[calculatorData.lifestyle.waste] +
                        clothingMultipliers[calculatorData.lifestyle.clothing] +
                        electronicsMultipliers[calculatorData.lifestyle.electronics];
    dailyCO2 += lifestyleCO2;
    breakdown.lifestyle = lifestyleCO2;
    
    // Logement (kg CO2 par jour)
    const housingMultipliers = {
      size: { small: 0.5, medium: 1.0, large: 1.5 },
      insulation: { good: 0.3, moderate: 0.6, poor: 1.0 },
      appliances: { efficient: 0.4, moderate: 0.7, old: 1.1 }
    };
    
    const housingCO2 = housingMultipliers.size[calculatorData.housing.size] +
                      housingMultipliers.insulation[calculatorData.housing.insulation] +
                      housingMultipliers.appliances[calculatorData.housing.appliances];
    dailyCO2 += housingCO2;
    breakdown.housing = housingCO2;
    
    // Valeur minimale réaliste
    dailyCO2 = Math.max(dailyCO2, 2.0);
    
    const result = {
      daily: dailyCO2,
      annual: dailyCO2 * 365,
      breakdown
    };
    
    setFootprintResult(result);
    saveCalculation(calculatorData, result);
  };

  // Mise à jour des données du calculateur
  const updateCalculatorData = (category, field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Étapes du calculateur
  const steps = [
    { id: 'transportation', title: '🚗 Transportation', icon: '🚗' },
    { id: 'energy', title: '⚡ Energy', icon: '⚡' },
    { id: 'diet', title: '🥗 Diet', icon: '🥗' },
    { id: 'lifestyle', title: '🛍️ Lifestyle', icon: '🛍️' },
    { id: 'housing', title: '🏠 Housing', icon: '🏠' },
    { id: 'results', title: '📊 Results', icon: '📊' }
  ];

  // Fonction pour faire défiler vers l'étape active sur mobile
  const scrollToActiveStep = (stepIndex) => {
    if (window.innerWidth <= 700) {
      const stepNav = document.querySelector('.step-nav');
      const activeStep = stepNav?.children[stepIndex];
      if (stepNav && activeStep) {
        const stepNavRect = stepNav.getBoundingClientRect();
        const activeStepRect = activeStep.getBoundingClientRect();
        const scrollLeft = stepNav.scrollLeft + activeStepRect.left - stepNavRect.left - (stepNavRect.width / 2) + (activeStepRect.width / 2);
        stepNav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  };

  // Effet pour faire défiler vers l'étape active quand elle change
  useEffect(() => {
    // Petit délai pour laisser le DOM se mettre à jour
    const timer = setTimeout(() => {
      scrollToActiveStep(currentStep);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Rendu du contenu de l'étape
  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'transportation':
        return (
          <div className="step-content">
            <h3 className="step-title">🚗 Transportation</h3>
            <p className="step-description">How do you get around? Enter your daily distances.</p>
            
            <div className="input-grid">
              <div className="input-group">
                <label>Car (km/day)</label>
                <input
                  type="number"
                  value={calculatorData.transportation.car}
                  onChange={(e) => updateCalculatorData('transportation', 'car', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="form-input"
                />
                <small>~0.2 kg CO2/km</small>
              </div>
              
              <div className="input-group">
                <label>Public Transport (km/day)</label>
                <input
                  type="number"
                  value={calculatorData.transportation.publicTransport}
                  onChange={(e) => updateCalculatorData('transportation', 'publicTransport', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="form-input"
                />
                <small>~0.05 kg CO2/km</small>
              </div>
              
              <div className="input-group">
                <label>Flights (km/month)</label>
                <input
                  type="number"
                  value={calculatorData.transportation.flights}
                  onChange={(e) => updateCalculatorData('transportation', 'flights', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="form-input"
                />
                <small>~0.1 kg CO2/km</small>
              </div>
              
              <div className="input-group">
                <label>Motorcycle (km/day)</label>
                <input
                  type="number"
                  value={calculatorData.transportation.motorcycle}
                  onChange={(e) => updateCalculatorData('transportation', 'motorcycle', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="form-input"
                />
                <small>~0.12 kg CO2/km</small>
              </div>
              
              <div className="input-group">
                <label>Bicycle (km/day)</label>
                <input
                  type="number"
                  value={calculatorData.transportation.bicycle}
                  onChange={(e) => updateCalculatorData('transportation', 'bicycle', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="form-input"
                />
                <small>~0.001 kg CO2/km</small>
              </div>
            </div>
          </div>
        );

      case 'energy':
        return (
          <div className="step-content">
            <h3 className="step-title">⚡ Energy Consumption</h3>
            <p className="step-description">Your monthly energy usage and renewable sources.</p>
            
            <div className="input-grid">
              <div className="input-group">
                <label>Electricity (kWh/month)</label>
                <input
                  type="number"
                  value={calculatorData.energy.electricity}
                  onChange={(e) => updateCalculatorData('energy', 'electricity', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="form-input"
                />
                <small>~0.4 kg CO2/kWh</small>
              </div>
              
              <div className="input-group">
                <label>Heating (kWh/month)</label>
                <input
                  type="number"
                  value={calculatorData.energy.heating}
                  onChange={(e) => updateCalculatorData('energy', 'heating', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="form-input"
                />
                <small>~0.2 kg CO2/kWh</small>
              </div>
              
              <div className="input-group">
                <label>Renewable Energy (kWh/month)</label>
                <input
                  type="number"
                  value={calculatorData.energy.renewable}
                  onChange={(e) => updateCalculatorData('energy', 'renewable', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="form-input"
                />
                <small>Reduces CO2 by ~0.1 kg/kWh</small>
              </div>
            </div>
          </div>
        );

      case 'diet':
        return (
          <div className="step-content">
            <h3 className="step-title">🥗 Diet & Food</h3>
            <p className="step-description">Your dietary choices significantly impact your carbon footprint.</p>
            
            <div className="diet-options">
              <div className="diet-option">
                <input
                  type="radio"
                  id="vegan"
                  name="diet"
                  value="vegan"
                  checked={calculatorData.diet === 'vegan'}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, diet: e.target.value }))}
                />
                <label htmlFor="vegan" className="diet-label">
                  <span className="diet-icon">🌱</span>
                  <div>
                    <strong>Vegan</strong>
                    <small>1.0 kg CO2/day</small>
                  </div>
                </label>
              </div>
              
              <div className="diet-option">
                <input
                  type="radio"
                  id="vegetarian"
                  name="diet"
                  value="vegetarian"
                  checked={calculatorData.diet === 'vegetarian'}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, diet: e.target.value }))}
                />
                <label htmlFor="vegetarian" className="diet-label">
                  <span className="diet-icon">🥬</span>
                  <div>
                    <strong>Vegetarian</strong>
                    <small>2.0 kg CO2/day</small>
                  </div>
                </label>
              </div>
              
              <div className="diet-option">
                <input
                  type="radio"
                  id="mixed"
                  name="diet"
                  value="mixed"
                  checked={calculatorData.diet === 'mixed'}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, diet: e.target.value }))}
                />
                <label htmlFor="mixed" className="diet-label">
                  <span className="diet-icon">🍖</span>
                  <div>
                    <strong>Mixed (occasional meat)</strong>
                    <small>3.0 kg CO2/day</small>
                  </div>
                </label>
              </div>
              
              <div className="diet-option">
                <input
                  type="radio"
                  id="meatHeavy"
                  name="diet"
                  value="meatHeavy"
                  checked={calculatorData.diet === 'meatHeavy'}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, diet: e.target.value }))}
                />
                <label htmlFor="meatHeavy" className="diet-label">
                  <span className="diet-icon">🥩</span>
                  <div>
                    <strong>Heavy meat consumption</strong>
                    <small>4.5 kg CO2/day</small>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'lifestyle':
        return (
          <div className="step-content">
            <h3 className="step-title">🛍️ Lifestyle & Consumption</h3>
            <p className="step-description">Your shopping habits and waste management.</p>
            
            <div className="lifestyle-grid">
              <div className="lifestyle-group">
                <label>Shopping Habits</label>
                <select
                  value={calculatorData.lifestyle.shopping}
                  onChange={(e) => updateCalculatorData('lifestyle', 'shopping', e.target.value)}
                  className="form-input"
                >
                  <option value="minimal">Minimal consumer</option>
                  <option value="moderate">Moderate consumer</option>
                  <option value="heavy">Heavy consumer</option>
                </select>
              </div>
              
              <div className="lifestyle-group">
                <label>Waste Management</label>
                <select
                  value={calculatorData.lifestyle.waste}
                  onChange={(e) => updateCalculatorData('lifestyle', 'waste', e.target.value)}
                  className="form-input"
                >
                  <option value="zero">Zero waste</option>
                  <option value="moderate">Moderate waste</option>
                  <option value="high">High waste</option>
                </select>
              </div>
              
              <div className="lifestyle-group">
                <label>Clothing Consumption</label>
                <select
                  value={calculatorData.lifestyle.clothing}
                  onChange={(e) => updateCalculatorData('lifestyle', 'clothing', e.target.value)}
                  className="form-input"
                >
                  <option value="minimal">Minimal (few items/year)</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy (many items/year)</option>
                </select>
              </div>
              
              <div className="lifestyle-group">
                <label>Electronics Usage</label>
                <select
                  value={calculatorData.lifestyle.electronics}
                  onChange={(e) => updateCalculatorData('lifestyle', 'electronics', e.target.value)}
                  className="form-input"
                >
                  <option value="minimal">Minimal (basic devices)</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy (many devices)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'housing':
        return (
          <div className="step-content">
            <h3 className="step-title">🏠 Housing</h3>
            <p className="step-description">Your living space characteristics.</p>
            
            <div className="housing-grid">
              <div className="housing-group">
                <label>Home Size</label>
                <select
                  value={calculatorData.housing.size}
                  onChange={(e) => updateCalculatorData('housing', 'size', e.target.value)}
                  className="form-input"
                >
                                   <option value="small">Small (less than 50m²)</option>
                 <option value="medium">Medium (50-100m²)</option>
                 <option value="large">Large (more than 100m²)</option>
                </select>
              </div>
              
              <div className="housing-group">
                <label>Insulation Quality</label>
                <select
                  value={calculatorData.housing.insulation}
                  onChange={(e) => updateCalculatorData('housing', 'insulation', e.target.value)}
                  className="form-input"
                >
                  <option value="good">Good insulation</option>
                  <option value="moderate">Moderate insulation</option>
                  <option value="poor">Poor insulation</option>
                </select>
              </div>
              
              <div className="housing-group">
                <label>Appliance Efficiency</label>
                <select
                  value={calculatorData.housing.appliances}
                  onChange={(e) => updateCalculatorData('housing', 'appliances', e.target.value)}
                  className="form-input"
                >
                  <option value="efficient">Energy efficient</option>
                  <option value="moderate">Moderate efficiency</option>
                  <option value="old">Old appliances</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="step-content">
            <h3 className="step-title">📊 Your Carbon Footprint Results</h3>
            
            {!footprintResult ? (
              <div className="calculate-prompt">
                <p>Ready to calculate your carbon footprint?</p>
                <button onClick={calculateFootprint} className="btn btn-primary btn-large">
                  🧮 Calculate My Footprint
                </button>
              </div>
            ) : (
              <div className="results-container">
                <div className="results-summary">
                  <div className="result-card daily">
                    <h4>Daily CO2</h4>
                    <div className="result-value">{footprintResult.daily.toFixed(1)} kg</div>
                  </div>
                  <div className="result-card annual">
                    <h4>Annual CO2</h4>
                    <div className="result-value">{footprintResult.annual.toFixed(0)} kg</div>
                  </div>
                </div>
                
                <div className="breakdown-chart">
                  <h4>Emissions Breakdown</h4>
                  <div className="breakdown-bars">
                    {Object.entries(footprintResult.breakdown).map(([category, value]) => (
                      <div key={category} className="breakdown-bar">
                        <div className="bar-label">{category}</div>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ 
                              width: `${(value / footprintResult.daily) * 100}%`,
                              backgroundColor: getCategoryColor(category)
                            }}
                          />
                        </div>
                        <div className="bar-value">{value.toFixed(1)} kg</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="orne-comparison">
                  <h4>🌱 $ORNE Staking Offset</h4>
                  {(() => {
                    const orneOffset = calculateOrneOffset();
                    const percentage = orneOffset > 0 ? ((orneOffset / footprintResult.annual) * 100).toFixed(1) : 0;
                    
                    return (
                      <div className="comparison-content">
                        <div className="offset-info">
                          <p>Your $ORNE staking offsets: <strong>{orneOffset.toFixed(3)} kg CO2</strong></p>
                          <p className={percentage > 0 ? 'positive' : 'negative'}>
                            This covers <strong>{percentage}%</strong> of your annual footprint
                          </p>
                        </div>
                        
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        {orneOffset > 0 && (
                          <div className="offset-details">
                            <p>📊 Details:</p>
                            <ul>
                              <li>Staked: {parseFloat(userStats.stakedBalance).toFixed(2)} $ORNE</li>
                              <li>CO2 per $ORNE: {parseFloat(String(globalStats.co2PerOrne).replace(/,/g, '')).toLocaleString()} g</li>
                              <li>Total offset: {orneOffset.toFixed(3)} kg</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Couleurs pour les catégories
  const getCategoryColor = (category) => {
    const colors = {
      transport: '#ff6b6b',
      energy: '#4ecdc4',
      diet: '#45b7d1',
      lifestyle: '#96ceb4',
      housing: '#feca57'
    };
    return colors[category] || '#95a5a6';
  };

  return (
    <div>
      <div className="stats-grid">
        {/* Bloc Total CO2 (toujours dashboardData) */}
        <div className="stat-card">
          <div className="stat-icon">
            <img src={totalCo2Icon} alt="Total CO2" style={{ width: 50, height: 50 }} />
          </div>
          <div className="stat-label">Total CO2
            <InfoTooltip title="Total CO2" content="Total kilograms of CO2 offset by all staked $ORNE tokens.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{dashboardData?.totalCO2Offset || 0} kg</div>
        </div>
        {/* Bloc Total $ORNE staked */}
        <div className="stat-card">
          <div className="stat-icon">
            <img src={totalOrneStakedIcon} alt="Total $ORNE staked" style={{ width: 50, height: 50 }} />
          </div>
          <div className="stat-label">Total $ORNE staked
            <InfoTooltip title="Total $ORNE staked" content="Total amount of $ORNE tokens currently staked by all users.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{parseFloat(globalStats.totalStaked).toLocaleString()} $ORNE</div>
        </div>
        {/* Bloc CO2 per $ORNE */}
        <div className="stat-card">
          <div className="stat-icon">
            <img src={co2PerOrneIcon} alt="CO2 per $ORNE" style={{ width: 50, height: 50 }} />
          </div>
          <div className="stat-label">CO2 per $ORNE
            <InfoTooltip title="CO2 per $ORNE" content="Current amount of CO2 (in grams) offset per staked $ORNE token.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{globalStats.co2PerOrne} g</div>
        </div>
        {/* Bloc Your CO2 offset (fond vert clair, pas d'icône, styles personnalisés) */}
        <div className="stat-card stat-card-highlight">
          <div className="stat-label">Your CO2 offset
            <InfoTooltip title="Your CO2 offset" content="Your personal CO2 offset based on your staked $ORNE.">
              <span className="tooltip-icon text-white">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{(() => {
            if (userStats.userCO2Offset && userStats.userCO2Offset !== '0' && userStats.userCO2Offset !== '0.000') {
              return userStats.userCO2Offset + ' kg';
            }
            const co2PerOrne = parseFloat(globalStats.co2PerOrne?.toString().replace(/,/g, '')) || 0;
            const myStaked = parseFloat(userStats.stakedBalance) || 0;
            if (co2PerOrne > 0 && myStaked > 0) {
              const myCO2Kg = ((co2PerOrne * myStaked) / 1000).toFixed(3);
              return myCO2Kg + ' kg';
            }
            return '0.000 kg';
          })()}</div>
          <button onClick={shareOnX} className="btn btn-white btn-full">
            <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
            Share on X
          </button>
        </div>
      </div>

      {/* Carbon Footprint Calculator */}
      <div className="card">
        <h3 className="title title-primary flex items-center" style={{ gap: 6 }}>
          🧮 Carbon Footprint Calculator
          <InfoTooltip title="Carbon Footprint Calculator" content="Calculate your personal carbon footprint using scientifically-based emission factors. Results are estimates based on average data from IPCC, EPA, IEA, and FAO. Minimum daily footprint: 2.0 kg CO2 for basic needs.">
            <span className="tooltip-icon text-primary">
              <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
            </span>
          </InfoTooltip>
        </h3>

        {!showCalculator ? (
          <div className="calculator-intro">
            <p>Calculate your personal carbon footprint and see how your ORNE staking helps offset it!</p>
            <button onClick={() => setShowCalculator(true)} className="btn btn-primary btn-large">
              🧮 Start Calculator
            </button>
          </div>
        ) : (
          <div className="calculator-container">
            {/* Menu latéral */}
            <div className="calculator-sidebar">
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <span className="progress-text">Step {currentStep + 1} of {steps.length}</span>
              </div>
              
              <nav className="step-nav">
                <div className="step-nav-container">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(index)}
                      className={`step-nav-item ${currentStep === index ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                    >
                      <span className="step-icon">{step.icon}</span>
                      <span className="step-title">{step.title.replace(/^[^\s]+\s/, '')}</span>
                      {index < currentStep && <span className="step-check">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="scroll-indicator">
                  <span className="scroll-hint">← Swipe to navigate →</span>
                </div>
              </nav>
              
              <div className="sidebar-actions">
                <div className="action-buttons">
                  {currentStep > 0 && (
                    <button 
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="btn btn-secondary"
                    >
                      ← Previous
                    </button>
                  )}
                  {currentStep < steps.length - 1 && (
                    <button 
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="btn btn-primary"
                    >
                      Next →
                    </button>
                  )}
                  {currentStep === steps.length - 1 && footprintResult && (
                    <button 
                      onClick={() => {
                        setShowCalculator(false);
                        setCurrentStep(0);
                        setFootprintResult(null);
                      }}
                      className="btn btn-success"
                    >
                      🎉 Done
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contenu principal */}
            <div className="calculator-main">
              {renderStepContent()}
            </div>
          </div>
        )}
      </div>

      {/* Historique des calculs */}
      {savedCalculations.length > 0 && (
        <div className="card">
          <h3 className="title">📈 Calculation History</h3>
          <div className="history-grid">
            {savedCalculations.map((calc, index) => (
              <div key={calc.id} className="history-item">
                <div className="history-date">{new Date(calc.date).toLocaleDateString()}</div>
                <div className="history-results">
                  <div className="history-result">
                    <span>Daily: {calc.result.daily.toFixed(1)} kg</span>
                    <span>Annual: {calc.result.annual.toFixed(0)} kg</span>
                  </div>
                  <div className="history-offset">
                    <span>ORNE Offset: {calc.orneOffset.toFixed(3)} kg</span>
                    <span className="percentage">
                      {((calc.orneOffset / calc.result.annual) * 100).toFixed(1)}% covered
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Carbon Features */}
      <div className="card">
        <h3 className="title title-primary">
          🌱 Carbon Features (Coming Soon)
        </h3>
        <div className="features-grid">
          <div className="feature-item">
            <h4>🛒 Carbon Offset Marketplace</h4>
            <p>Buy and sell carbon credits directly on the platform</p>
          </div>
          <div className="feature-item">
            <h4>🏆 Carbon Certificates</h4>
            <p>Get certified for your carbon offset contributions</p>
          </div>
          <div className="feature-item">
            <h4>📊 Advanced Analytics</h4>
            <p>Detailed breakdowns and personalized recommendations</p>
          </div>
          <div className="feature-item">
            <h4>🌍 Community Impact</h4>
            <p>See the collective impact of the ORNE community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carbon; 