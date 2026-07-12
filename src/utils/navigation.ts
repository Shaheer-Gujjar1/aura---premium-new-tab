import React from 'react';

declare const chrome: any;

/**
 * Safely navigates the browser to the specified URL.
 * Always uses chrome.tabs.update to ensure Chrome performs a safe browser-level
 * process swap. This is critical for sites with strict COOP/COEP isolation (like DeepSeek)
 * which crash on Linux if navigated directly via window.location.href from an extension origin.
 */
export const handleNavigation = (url: string, e?: React.MouseEvent | React.FormEvent) => {
  if (e) {
    e.preventDefault();
  }

  const isPopup = typeof window !== 'undefined' && window.innerWidth < 800;

  try {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query && chrome.tabs.update) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        try {
          if (tabs && tabs[0] && typeof tabs[0].id !== 'undefined') {
            chrome.tabs.update(tabs[0].id, { url: url }, () => {
              if (chrome.runtime && chrome.runtime.lastError) {
                console.error('Error updating tab:', chrome.runtime.lastError);
                window.location.href = url;
                return;
              }
              // Only close the window if we are definitively in the popup
              if (isPopup && window.close) {
                window.close();
              }
            });
          } else {
            window.location.href = url;
          }
        } catch (innerError) {
          console.error('Error updating tab:', innerError);
          window.location.href = url;
        }
      });
    } else {
      window.location.href = url;
    }
  } catch (err) {
    console.error('Navigation error, falling back:', err);
    window.location.href = url;
  }
};

