import React from 'react';
import { styles } from '../styles/styles';

const PrivacyPolicy = () => {
  return (
    <div style={styles.main}>
      <div style={styles.card}>
        <h1 style={{ color: '#383e5c', marginBottom: '30px', fontSize: '2rem' }}>
          Privacy Policy
        </h1>
        
        <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
          <strong>Last updated: January 2025</strong>
        </p>

        <div style={{ lineHeight: '1.8', color: '#383e5c' }}>
          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            1. Information We Collect
          </h2>
          <p style={{ marginBottom: '15px' }}>
            When you use the ORNE DApp, we may collect the following information:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Wallet addresses when you connect your wallet</li>
            <li>Transaction data related to staking, swapping, and other DeFi activities</li>
            <li>Usage analytics and interaction data with the DApp</li>
            <li>Technical information such as IP address, browser type, and device information</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            2. How We Use Your Information
          </h2>
          <p style={{ marginBottom: '15px' }}>
            We use the collected information to:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Provide and maintain the DApp services</li>
            <li>Process transactions and manage staking operations</li>
            <li>Improve user experience and DApp functionality</li>
            <li>Ensure security and prevent fraudulent activities</li>
            <li>Comply with legal and regulatory requirements</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            3. Information Sharing
          </h2>
          <p style={{ marginBottom: '15px' }}>
            We do not sell, trade, or otherwise transfer your personal information to third parties, except:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>When required by law or regulatory authorities</li>
            <li>To protect our rights, property, or safety</li>
            <li>With your explicit consent</li>
            <li>To service providers who assist in DApp operations (under strict confidentiality agreements)</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            4. Data Security
          </h2>
          <p style={{ marginBottom: '15px' }}>
            We implement appropriate security measures to protect your information:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Encryption of sensitive data</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure blockchain interactions</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            5. Your Rights
          </h2>
          <p style={{ marginBottom: '15px' }}>
            You have the right to:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Access your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (subject to legal requirements)</li>
            <li>Withdraw consent for data processing</li>
            <li>Export your data in a portable format</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            6. Cookies and Tracking
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Our DApp may use cookies and similar technologies to:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Remember your preferences and settings</li>
            <li>Analyze DApp usage and performance</li>
            <li>Provide personalized content and features</li>
            <li>Ensure security and prevent fraud</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            7. Third-Party Services
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Our DApp integrates with third-party services including:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Blockchain networks (Arbitrum)</li>
            <li>DeFi protocols (Uniswap V3)</li>
            <li>Wallet providers (RainbowKit, MetaMask, etc.)</li>
            <li>Analytics and monitoring services</li>
          </ul>
          <p style={{ marginBottom: '15px' }}>
            These services have their own privacy policies, and we encourage you to review them.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            8. Children's Privacy
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Our DApp is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            9. Changes to This Policy
          </h2>
          <p style={{ marginBottom: '15px' }}>
            We may update this Privacy Policy from time to time. We will notify users of any material changes by posting the new policy on our DApp and updating the "Last updated" date.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            10. Contact Us
          </h2>
          <p style={{ marginBottom: '15px' }}>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Email: privacy@orne.io</li>
            <li>Telegram: @orne_io</li>
            <li>Website: https://orne.io</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            11. Governing Law
          </h2>
          <p style={{ marginBottom: '15px' }}>
            This Privacy Policy is governed by and construed in accordance with applicable data protection laws. Any disputes arising from this policy will be resolved in accordance with the laws of the jurisdiction where ORNE operates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 