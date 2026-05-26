import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from './src/App';
import PendingApproval from './src/pages/PendingApproval';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/components/ui/Toast';
import { NotificationProvider } from './src/context/NotificationContext';

try {
  const html = renderToString(
    <MemoryRouter initialEntries={["/pending-approval"]}>
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <PendingApproval />
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </MemoryRouter>
  );
  console.log("RENDER SUCCESS", html.substring(0, 100));
} catch (e) {
  console.error("RENDER ERROR:", e);
}
