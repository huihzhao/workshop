import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Wallet = () => {

  return (
    <section className="wallet-section">
    <div className="wallet-content">
      {/* Your logo or other content */}
      <h2 className="section-title">Connect Your Wallet</h2>
      <p className="section-description">
        Seamlessly connect your wallet to experience the full benefits of
        Greenfield.
      </p>
      <div className="connect-button-container">
        <ConnectButton accountStatus="address" className="connect-button" />
      </div>
    </div>
  </section>

  );
};
