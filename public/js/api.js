const API = {
    base: '/api/v1',

    async request(path, options = {}) {
        const res = await fetch(`${this.base}${path}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });

        let data;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            data = await res.text();
        }

        if (!res.ok) {
            const err = new Error(typeof data === 'string' ? data : data.message || 'Request failed');
            err.status = res.status;
            err.data = data;
            throw err;
        }

        return data;
    },

    get(path) { return this.request(path); },

    post(path, body) {
        return this.request(path, { method: 'POST', body: JSON.stringify(body) });
    },

    put(path, body) {
        return this.request(path, { method: 'PUT', body: JSON.stringify(body) });
    },

    delete(path) {
        return this.request(path, { method: 'DELETE' });
    },

    health() { return fetch('/api/health').then(r => r.json()); },

    auth: {
        register: (body) => API.post('/auth/register', body),
        login: (body) => API.post('/auth/login', body),
        logout: () => API.post('/auth/logout'),
        profile: () => API.get('/auth/profile')
    },

    users: {
        getAll: () => API.get('/users'),
        getOne: (id) => API.get(`/users/${id}`),
        add: (body) => API.post('/users', body),
        update: (id, body) => API.put(`/users/${id}`, body),
        remove: (id) => API.delete(`/users/${id}`)
    },

    resturants: {
        getAll: () => API.get('/resturants'),
        getOne: (id) => API.get(`/resturants/${id}`),
        add: (body) => API.post('/resturants', body),
        update: (id, body) => API.put(`/resturants/${id}`, body),
        remove: (id) => API.delete(`/resturants/${id}`)
    },

    sections: {
        getAll: (resturantId) => API.get(`/sections${resturantId ? `?resturantId=${resturantId}` : ''}`),
        getOne: (id) => API.get(`/sections/${id}`),
        add: (body) => API.post('/sections', body),
        update: (id, body) => API.put(`/sections/${id}`, body),
        remove: (id) => API.delete(`/sections/${id}`)
    },

    dishs: {
        getAll: (sectionId) => API.get(`/dishs${sectionId ? `?sectionId=${sectionId}` : ''}`),
        getOne: (id) => API.get(`/dishs/${id}`),
        add: (body) => API.post('/dishs', body),
        update: (id, body) => API.put(`/dishs/${id}`, body),
        remove: (id) => API.delete(`/dishs/${id}`)
    },

    orders: {
        getAll: (params = {}) => {
            const qs = new URLSearchParams(params).toString();
            return API.get(`/orders${qs ? `?${qs}` : ''}`);
        },
        getOne: (id) => API.get(`/orders/${id}`),
        add: (body) => API.post('/orders', body),
        update: (id, body) => API.put(`/orders/${id}`, body),
        cancel: (id) => API.delete(`/orders/${id}`)
    },

    rates: {
        getAll: (resturantId) => API.get(`/rates${resturantId ? `?resturantId=${resturantId}` : ''}`),
        getOne: (id) => API.get(`/rates/${id}`),
        add: (body) => API.post('/rates', body),
        remove: (id) => API.delete(`/rates/${id}`)
    }
};
