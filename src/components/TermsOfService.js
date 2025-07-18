import React from 'react';
import { styles } from '../styles/styles';

const TermsOfService = () => {
  return (
    <div style={styles.main}>
      <div style={styles.card}>
        <h1 style={{ color: '#383e5c', marginBottom: '30px', fontSize: '2rem' }}>
          Terms of Service
        </h1>
        
        <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
          <strong>Last updated: January 2025</strong>
        </p>

        <div style={{ lineHeight: '1.8', color: '#383e5c' }}>
          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            1. Acceptance of Terms
          </h2>
          <p style={{ marginBottom: '15px' }}>
            By accessing and using the ORNE DApp, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            2. Description of Service
          </h2>
          <p style={{ marginBottom: '15px' }}>
            The ORNE DApp provides decentralized finance (DeFi) services including:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Token staking and reward distribution</li>
            <li>Token swapping via Uniswap V3 integration</li>
            <li>Carbon offset tracking and management</li>
            <li>Portfolio management and analytics</li>
            <li>Administrative tools for token management</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            3. User Responsibilities
          </h2>
          <p style={{ marginBottom: '15px' }}>
            As a user of the ORNE DApp, you agree to:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your wallet and private keys</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not engage in any fraudulent or malicious activities</li>
            <li>Not attempt to manipulate or exploit the DApp</li>
            <li>Report any security vulnerabilities or bugs</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            4. Risk Disclosure
          </h2>
          <p style={{ marginBottom: '15px' }}>
            <strong>IMPORTANT:</strong> DeFi activities involve significant risks including but not limited to:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Volatility of cryptocurrency prices</li>
            <li>Smart contract vulnerabilities and exploits</li>
            <li>Impermanent loss in liquidity pools</li>
            <li>Regulatory changes and legal risks</li>
            <li>Technical failures and network issues</li>
            <li>Loss of funds due to user error or security breaches</li>
          </ul>
          <p style={{ marginBottom: '15px' }}>
            You acknowledge that you understand these risks and that you are solely responsible for any losses incurred.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            5. Intellectual Property
          </h2>
          <p style={{ marginBottom: '15px' }}>
            The ORNE DApp, including its design, code, and content, is protected by intellectual property rights. You may not:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Copy, modify, or distribute the DApp without permission</li>
            <li>Reverse engineer or attempt to extract source code</li>
            <li>Use the DApp for commercial purposes without authorization</li>
            <li>Remove or alter any copyright or proprietary notices</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            6. Privacy and Data Protection
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the DApp, to understand our practices regarding the collection and use of your information.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            7. Disclaimers
          </h2>
          <p style={{ marginBottom: '15px' }}>
            THE ORNE DAPP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Warranties of merchantability and fitness for a particular purpose</li>
            <li>Warranties that the DApp will be uninterrupted or error-free</li>
            <li>Warranties regarding the accuracy or reliability of information</li>
            <li>Warranties that defects will be corrected</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            8. Limitation of Liability
          </h2>
          <p style={{ marginBottom: '15px' }}>
            IN NO EVENT SHALL ORNE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, INCURRED BY YOU OR ANY THIRD PARTY, WHETHER IN AN ACTION IN CONTRACT OR TORT, EVEN IF THE OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            9. Indemnification
          </h2>
          <p style={{ marginBottom: '15px' }}>
            You agree to indemnify, defend, and hold harmless ORNE and its affiliates from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from your use of the DApp or violation of these Terms.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            10. Termination
          </h2>
          <p style={{ marginBottom: '15px' }}>
            We may terminate or suspend your access to the DApp immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the DApp will cease immediately.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            11. Governing Law
          </h2>
          <p style={{ marginBottom: '15px' }}>
            These Terms shall be interpreted and governed by the laws of the jurisdiction where ORNE operates, without regard to its conflict of law provisions. Any disputes arising from these Terms will be resolved through appropriate legal channels.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            12. Changes to Terms
          </h2>
          <p style={{ marginBottom: '15px' }}>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            13. Severability
          </h2>
          <p style={{ marginBottom: '15px' }}>
            If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.
          </p>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            14. Contact Information
          </h2>
          <p style={{ marginBottom: '15px' }}>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Email: legal@orne.io</li>
            <li>Telegram: @orne_io</li>
            <li>Website: https://orne.io</li>
          </ul>

          <h2 style={{ color: '#8ABE84', marginTop: '30px', marginBottom: '15px' }}>
            15. Entire Agreement
          </h2>
          <p style={{ marginBottom: '15px' }}>
            These Terms constitute the entire agreement between you and ORNE regarding the use of the DApp, superseding any prior agreements between you and ORNE relating to your use of the DApp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 