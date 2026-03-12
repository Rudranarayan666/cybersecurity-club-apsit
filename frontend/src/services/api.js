/**
 * Cybersecurity Club API Service
 * Covers: Auth, Events, Registrations, Resources, Hackathon Teams
 */

class APIService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || '/api';
        this.timeout = 30000;
        this.debug = import.meta.env.DEV;
        // Hydrate tokens from storage
        this.token = localStorage.getItem('authToken') || null;
        this.refreshTokenStr = localStorage.getItem('refreshToken') || null;
    }

    // ── Token management ────────────────────────────────────────────────────

    setToken(accessToken, refreshToken = null) {
        this.token = accessToken;
        localStorage.setItem('authToken', accessToken);
        if (refreshToken) {
            this.refreshTokenStr = refreshToken;
            localStorage.setItem('refreshToken', refreshToken);
        }
    }

    getToken() { return this.token; }

    clearToken() {
        this.token = null;
        this.refreshTokenStr = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }

    isAuthenticated() { return !!this.token; }

    // ── Core request helper ─────────────────────────────────────────────────

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json', ...options.headers };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        if (this.debug) {
            console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
        }

        try {
            const response = await fetch(url, { ...options, headers, signal: controller.signal });
            clearTimeout(timeoutId);

            let data = {};
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else if (contentType.includes('text/csv') || contentType.includes('application/pdf')) {
                // Binary/text — handled by caller, return blob
                const blob = await response.blob();
                const disposition = response.headers.get('Content-Disposition') || '';
                const match = disposition.match(/filename="?([^";\n]+)"?/);
                const filename = match ? match[1] : 'download';
                return { success: true, blob, filename, status: response.status };
            } else {
                data = { detail: `HTTP ${response.status}` };
            }

            if (!response.ok) {
                // 401 and we have a refresh token → try one auto-refresh
                if (response.status === 401 && this.refreshTokenStr && !options._isRetry) {
                    const refreshed = await this._autoRefresh();
                    if (refreshed) {
                        return this.request(endpoint, { ...options, _isRetry: true });
                    }
                }
                const errorMessage = data?.error?.message || data?.detail || data?.message || 'API Error';
                throw { status: response.status, message: errorMessage, data };
            }

            return { success: true, data, status: response.status };
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                return { success: false, error: 'Request timeout', status: 0, data: {} };
            }
            return {
                success: false,
                error: error.message || 'Network error',
                status: error.status || 0,
                data: error.data || {}
            };
        }
    }

    // ── Internal token refresh ───────────────────────────────────────────────

    async _autoRefresh() {
        if (!this.refreshTokenStr) return false;
        try {
            const response = await fetch(`${this.baseURL}/auth/token/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Refresh-Token': this.refreshTokenStr
                }
            });
            if (!response.ok) { this.clearToken(); return false; }
            const data = await response.json();
            this.setToken(data.access_token, data.refresh_token);
            return true;
        } catch {
            this.clearToken();
            return false;
        }
    }

    // ── AUTH ─────────────────────────────────────────────────────────────────

    async login(username, password) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (result.success) {
            this.setToken(result.data.access_token, result.data.refresh_token);
        }
        return result;
    }

    async logout() {
        const headers = {};
        if (this.refreshTokenStr) headers['X-Refresh-Token'] = this.refreshTokenStr;
        await this.request('/auth/logout', { method: 'POST', headers });
        this.clearToken();
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async refreshToken() {
        return this._autoRefresh();
    }

    // ── EVENTS ───────────────────────────────────────────────────────────────

    async getEvents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(queryString ? `/events?${queryString}` : '/events');
    }

    async getEvent(eventId) {
        return this.request(`/events/${eventId}`);
    }

    async createEvent(eventData) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async updateEvent(eventId, eventData) {
        return this.request(`/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }

    async deleteEvent(eventId) {
        return this.request(`/events/${eventId}`, { method: 'DELETE' });
    }

    // ── REGISTRATIONS ────────────────────────────────────────────────────────

    async registerForEvent(eventId, operativeName, moodleId) {
        return this.request('/registrations', {
            method: 'POST',
            body: JSON.stringify({
                event_id: eventId,
                operative_name: operativeName,
                moodle_id: moodleId
            })
        });
    }

    async getRegistrations(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(queryString ? `/registrations?${queryString}` : '/registrations');
    }

    // ── RESOURCES ────────────────────────────────────────────────────────────

    async getResources(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(queryString ? `/resources?${queryString}` : '/resources');
    }

    async getResource(resourceId) {
        return this.request(`/resources/${resourceId}`);
    }

    async downloadResource(resourceId, filename = 'resource.pdf') {
        const url = `${this.baseURL}/resources/${resourceId}/download`;
        try {
            const headers = {};
            if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const disposition = response.headers.get('Content-Disposition') || '';
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            const resolvedName = match ? match[1].replace(/['"]/g, '') : filename;

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = resolvedName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(link.href);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ── HACKATHON TEAMS ──────────────────────────────────────────────────────

    async registerHackathonTeam(teamData) {
        return this.request('/hackathon-teams', {
            method: 'POST',
            body: JSON.stringify(teamData)
        });
    }

    async getHackathonTeams(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(queryString ? `/hackathon-teams?${queryString}` : '/hackathon-teams');
    }

    async exportHackathonTeamsCSV(eventName = null) {
        const url = `${this.baseURL}/hackathon-teams/export/csv${eventName ? `?event_name=${encodeURIComponent(eventName)}` : ''}`;
        try {
            const headers = {};
            if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error('Export failed');
            const blob = await response.blob();
            const disposition = response.headers.get('Content-Disposition') || '';
            const match = disposition.match(/filename="?([^";]+)"?/);
            const filename = match ? match[1] : 'hackathon_teams.csv';
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(link.href);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    // ── FEEDBACK ─────────────────────────────────────────────────────────────

    async submitFeedback(data) {
        return this.request('/feedback', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getFeedback(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(queryString ? `/feedback?${queryString}` : '/feedback');
    }
}

export const apiService = new APIService();
