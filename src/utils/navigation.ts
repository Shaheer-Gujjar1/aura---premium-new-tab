import React from 'react';

declare const chrome: any;

/**
 * Safely navigates the browser to the specified URL.
 * In a Chrome Extension context, it updates the current active tab (works for both popups and new tabs).
 * Otherwise, it navigates the current window.
 */
export const handleNavigation = (url: string, e?: React.MouseEvent | React.FormEvent) => {
  if (e) {
    e.preventDefault();
  }

  try {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query && chrome.tabs.update) {
      // Query the active tab in the current window to get its ID explicitly
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        try {
          if (tabs && tabs[0] && typeof tabs[0].id !== 'undefined') {
            // Safe navigation using the explicit tab ID to avoid signature mismatches
            chrome.tabs.update(tabs[0].id, { url }, () => {
              // Close the popup window if this was triggered from the extension popup
              const activeTabUrl = tabs[0].url || '';
              const isNewTab = activeTabUrl.startsWith('chrome://newtab') || activeTabUrl.includes(chrome.runtime.id);
              if (!isNewTab && window.close) {
                window.close();
              }
            });
          } else {
            // Fallback if tab list is empty or ID is missing
            window.location.href = url;
          }
        } catch (innerError) {
          console.error('Error updating tab:', innerError);
          window.location.href = url;
        }
      });
    } else {
      // Standard web fallback
      window.location.href = url;
    }
  } catch (err) {
    console.error('Navigation error, falling back:', err);
    window.location.href = url;
  }
};
