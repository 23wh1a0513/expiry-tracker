self.addEventListener('push', event => {
    const payload = event.data ? event.data.json() : { title: 'Expiry Tracker', body: 'You have an upcoming expiry reminder.' };

    const options = {
        body: payload.body,
        icon: 'icon.png',
        badge: 'icon.png',
        data: payload.data || {},
        actions: [
            { action: 'open', title: 'Open App' }
        ]
    };

    event.waitUntil(self.registration.showNotification(payload.title || 'Expiry Tracker', options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(self.clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
            if ('focus' in client) {
                return client.focus();
            }
        }
        if (self.clients.openWindow) {
            return self.clients.openWindow('/index.html');
        }
    }));
});