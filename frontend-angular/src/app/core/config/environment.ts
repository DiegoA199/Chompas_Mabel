const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const environment = {
  apiUrl: isLocalhost ? 'http://localhost:8000/api' : `${window.location.origin}/api`
};
