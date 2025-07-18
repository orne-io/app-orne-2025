import React from 'react';
import orneLogoFooter from '../images/orne-logo-footer.png';
import telegramIcon from '../images/telegram.svg';
import twitterIcon from '../images/twitter-icon.png';
import githubIcon from '../images/github.svg';
import mediumIcon from '../images/medium.svg';
import gitbookIcon from '../images/gitbook.svg';

const Footer = () => {
  const socialLinks = [
    {
      name: 'Website',
      url: 'https://orne.io',
      icon: orneLogoFooter,
      isImage: true
    },
    {
      name: 'Telegram',
      url: 'https://t.me/orne_io',
      icon: telegramIcon,
      isImage: false
    },
    {
      name: 'Twitter',
      url: 'https://x.com/orne_io_',
      icon: twitterIcon,
      isImage: true
    },
    {
      name: 'GitHub',
      url: 'https://github.com/orne-io',
      icon: githubIcon,
      isImage: false
    },
    {
      name: 'Medium',
      url: 'https://medium.com/@orne',
      icon: mediumIcon,
      isImage: false
    },
    {
      name: 'Documentation',
      url: 'https://docs.orne.io/',
      icon: gitbookIcon,
      isImage: false
    }
  ];

  return (
    <footer style={{
      background: '#f8f9fa',
      borderTop: '1px solid #e9ecef',
      padding: '40px 0 20px',
      marginTop: 'auto',
      width: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        boxSizing: 'border-box'
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Logo and Description */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <img 
                src={orneLogoFooter} 
                alt="ORNE Logo" 
                style={{ height: '40px', marginRight: '15px' }}
              />
              <h3 style={{ 
                margin: 0, 
                color: '#383e5c', 
                fontSize: '24px',
                fontWeight: '600'
              }}>
                ORNE DApp
              </h3>
            </div>
            <p style={{
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0,
              maxWidth: '400px'
            }}>
              The official decentralized application for ORNE token staking, swapping, and carbon offset tracking.
            </p>
          </div>

          {/* Social Links */}
          <div style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  e.target.style.borderColor = '#8ABE84';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = '#e9ecef';
                }}
                title={link.name}
              >
                {link.isImage ? (
                  <img 
                    src={link.icon} 
                    alt={link.name}
                    style={{ 
                      width: '20px', 
                      height: '20px',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                  />
                ) : (
                  <img 
                    src={link.icon} 
                    alt={link.name}
                    style={{ 
                      width: '36px', 
                      height: '36px',
                      filter: 'brightness(0) saturate(100%) invert(85%) sepia(15%) saturate(638%) hue-rotate(67deg) brightness(95%) contrast(87%)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid #e9ecef',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            © 2025 ORNE. All rights reserved.
          </div>
          
          <div style={{
            display: 'flex',
            gap: '20px',
            fontSize: '14px'
          }}>
            <button 
              onClick={() => window.location.hash = '#privacy'}
              style={{ 
                color: '#666', 
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.target.style.color = '#8ABE84'}
              onMouseOut={(e) => e.target.style.color = '#666'}
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => window.location.hash = '#terms'}
              style={{ 
                color: '#666', 
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.target.style.color = '#8ABE84'}
              onMouseOut={(e) => e.target.style.color = '#666'}
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 