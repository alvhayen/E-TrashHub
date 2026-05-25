import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './src/App';
import PendingApproval from './src/pages/PendingApproval';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/components/ui/Toast';
import { NotificationProvider } from './src/context/NotificationContext';

try {
  const html = renderToString(
    <StaticRouter location="/pending-approval">
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <PendingApproval />
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </StaticRouter>
  );
  console.log("RENDER SUCCESS", html.substring(0, 100));
} catch (e) {
  console.error("RENDER ERROR:", e);
}
