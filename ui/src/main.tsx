import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import App from "./App.tsx";
import { networkConfig } from "./networkConfig.ts";

const queryClient = new QueryClient();

// Add custom CSS for mobile responsiveness and Suience branding
const style = document.createElement("style");
style.textContent = `
  * {
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overscroll-behavior: none;
    overflow-x: hidden;
  }

  /* Mobile-first responsive design */
  @media (max-width: 768px) {
    .rt-Container {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    .rt-Button {
      -webkit-user-select: none;
      user-select: none;
      touch-action: manipulation;
    }
  }

  /* Custom scrollbar for webkit browsers */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: var(--gray-3);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--gray-8);
    border-radius: 3px;
  }

  /* Suience brand gradients */
  .suience-gradient {
    background: linear-gradient(135deg, #4E9BF1, #00D4FF);
  }

  .suience-text-gradient {
    background: linear-gradient(135deg, #4E9BF1, #00D4FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Safe area handling for mobile */
  @supports (padding: max(0px)) {
    body {
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
  }

  /* Hamburger menu animations */
  .menu-overlay {
    backdrop-filter: blur(4px);
    transition: opacity 0.3s ease-in-out;
  }

  .side-menu {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .side-menu.closed {
    transform: translateX(-100%);
  }

  .side-menu.open {
    transform: translateX(0);
  }

  /* Prevent body scroll when menu is open */
  .menu-open {
    overflow: hidden;
  }

  /* Better mobile touch targets */
  @media (max-width: 768px) {
    .hamburger-button {
      min-width: 44px !important;
      min-height: 44px !important;
    }

    .menu-item {
      min-height: 48px !important;
      font-size: 16px !important;
    }
  }

  /* Smooth focus states */
  .rt-Button:focus-visible {
    outline: 2px solid #4E9BF1;
    outline-offset: 2px;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme
      appearance="dark"
      accentColor="blue"
      grayColor="gray"
      radius="medium"
      scaling="100%"
    >
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect>
            <App />
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>,
);
