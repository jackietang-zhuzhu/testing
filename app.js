// ==========================================
// 1. SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://xxjqzsaqbyaskiqvplrb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4anF6c2FxYnlhc2tpcXZwbHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MTY1MTksImV4cCI6MjEwODI5MjUxOX0.2B5IuAVjqCwBWJ_90JFVXKW_BLUv2Nwtiks_oOYYrq0'; 

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const RT_ADMIN_EMAIL = 'testing@gmail.com';
// Company WhatsApp number shown to customers, e.g. '012-345 6789'. Leave '' to hide the WhatsApp buttons.
const RT_WHATSAPP_NUMBER = '';

// ==========================================
// 2. UI ELEMENTS MAPPING
// ==========================================
const views = {
    login: document.getElementById('view-login'),
    register: document.getElementById('view-register'),
    forgotPassword: document.getElementById('view-forgot-password'),
    rtHome: document.getElementById('view-rt-home'),
    rtPostJob: document.getElementById('view-rt-post-job'),
    transporterHome: document.getElementById('view-transporter-home'),
    transporterMyJobs: document.getElementById('view-transporter-my-jobs'),
    customerHome: document.getElementById('view-customer-home'),
    customerNewJob: document.getElementById('view-customer-new-job'),
    rtReviewDraft: document.getElementById('view-rt-review-draft'),
    rtRequests: document.getElementById('view-rt-requests'),
	counterOffer: document.getElementById('view-counter-offer'),
	rtReviewBids: document.getElementById('view-rt-review-bids'),
};

const navs = {
    container: document.getElementById('bottom-nav'),
    rt: document.getElementById('nav-rt'),
    transporter: document.getElementById('nav-transporter')
};

const btnLogout = document.getElementById('logout-btn');
const rtJobsContainer = document.getElementById('rt-jobs-container');
const transporterJobsContainer = document.getElementById('transporter-jobs-container');

// ==========================================
// 2b. UI HELPERS (presentation only, no business logic)
// Every helper returns HTML that is already escaped.
// ==========================================
const ui = {
    esc(v) { return app.escapeHTML(v); },

    // Non-blocking message that replaces alert()
    toast(message, tone = 'info') {
        const region = document.getElementById('toast-region');
        if (!region) return;
        const icons = { success: 'ri-checkbox-circle-fill', error: 'ri-error-warning-fill', info: 'ri-information-fill' };
        const text = String(message);
        const el = document.createElement('div');
        el.className = `toast toast-${tone}`;
        const icon = document.createElement('i');
        icon.className = icons[tone] || icons.info;
        const span = document.createElement('span');
        span.textContent = text; // textContent: never parsed as HTML
        el.append(icon, span);
        region.appendChild(el);
        const ms = Math.min(9000, 3500 + text.length * 45);
        setTimeout(() => {
            el.classList.add('is-leaving');
            setTimeout(() => el.remove(), 220);
        }, ms);
    },

    // Picks a tone from the wording of the message
    notify(message) {
        const m = String(message);
        let tone = 'info';
        if (/already/i.test(m)) tone = 'info';
        else if (/error|failed|invalid|cannot|could not|too large|suspended|blocked/i.test(m)) tone = 'error';
        else if (/success|sent|posted|published|awarded|accepted|submitted|removed|undone|uploaded|uploading|cancelled|updated/i.test(m)) tone = 'success';
        this.toast(m, tone);
    },

    // ----- formatting -----
    fmtDate(raw) {
        if (!raw) return '';
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw));
        if (!m) return this.esc(raw);
        const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        return this.esc(d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }));
    },
    fmtShort(iso) {
        const d = new Date(iso);
        if (!iso || isNaN(d)) return '';
        return this.esc(d.toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }));
    },
    downloadUrl(url) {
        const clean = String(url || '').split(/[?#]/)[0];
        const ext = (clean.match(/\.(\w+)$/) || [])[1] || 'file';
        return url + (String(url).includes('?') ? '&' : '?') + 'download=' + encodeURIComponent('Delivery-Order.' + ext);
    },
    fmtDateTime(iso) {
        const d = new Date(iso);
        if (!iso || isNaN(d)) return 'Unknown time';
        return this.esc(d.toLocaleString('en-MY', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        }));
    },
    posted(iso) { return iso ? `Posted ${this.fmtDateTime(iso)}` : ''; },
    money(n) {
        const v = Number(n);
        if (!Number.isFinite(v)) return '0.00';
        return v.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    // ----- building blocks -----
    pill(text, tone = 'neutral', icon = '') {
        const t = ['go', 'info', 'warn', 'stop', 'neutral'].includes(tone) ? tone : 'neutral';
        return `<span class="pill pill-${t}">${icon ? `<i class="${icon}"></i>` : ''}${this.esc(text)}</span>`;
    },
    mapLink(url, label) {
        const safe = app.safeUrl(url); // blocks javascript: and other non-http(s) schemes
        if (!safe) return '';
        return `<a href="${this.esc(safe)}" target="_blank" rel="noopener noreferrer" class="icon-link" title="${this.esc(label)}" aria-label="${this.esc(label)}"><i class="ri-map-pin-2-fill"></i></a>`;
    },
    // Display-only tidy-up so free-typed text looks consistent (database is not changed)
    place(text) {
        return String(text || '').trim().replace(/\s+/g, ' ').split(' ').map(w => {
            const letters = w.replace(/[^A-Za-z]/g, '');
            if (letters.length && letters.length <= 3 && letters === letters.toUpperCase()) return w; // keep JHR, LCH, KL
            return w.toLowerCase().replace(/(^|[(\-\/])([a-z])/g, (m, p, c) => p + c.toUpperCase());
        }).join(' ');
    },
    poLabel(raw) {
        const num = String(raw || '').trim().replace(/^PO[\s:\-#]*/i, '').trim();
        if (!num || /^(n\/?a|na|nil|none|-+)$/i.test(num)) return 'No PO number';
        return 'PO ' + this.esc(num);
    },
    route(job) {
        return `
            <ol class="route">
                <li class="route-stop route-from"><span class="route-place">${this.esc(this.place(job.source_loc))}</span>${this.mapLink(job.source_maps_link, 'Open pickup in Maps')}</li>
                <li class="route-stop route-to"><span class="route-place">${this.esc(this.place(job.dest_loc))}</span>${this.mapLink(job.dest_maps_link, 'Open drop-off in Maps')}</li>
            </ol>`;
    },
    facts(job, { po = false, date = '', dateLabel = 'Delivery', delivered = false } = {}) {
        const items = [];
        if (po) items.push(`<li class="fact"><i class="ri-file-list-3-line"></i>${this.poLabel(job.po_number)}</li>`);
        items.push(`<li class="fact"><i class="ri-box-3-line"></i>${this.esc(job.quantity)} ${this.esc(job.item_desc)}</li>`);
        if (date) items.push(`<li class="fact"><i class="ri-calendar-line"></i>${this.esc(dateLabel)} ${this.fmtDate(date)}</li>`);
        if (job.unloading_service) items.push(`<li class="fact fact-warn"><i class="ri-hand-coin-line"></i>Unloading required</li>`);
        if (delivered) items.push(`<li class="fact fact-ok"><i class="ri-check-double-line"></i>Delivered</li>`);
        return `<ul class="facts">${items.join('')}</ul>`;
    },
    photos(job, small = false) {
        const list = [job.photo_1_url, job.photo_2_url]
            .map((u, i) => [app.safeUrl(u), i + 1])
            .filter(([u]) => u);
        if (!list.length) return '';
        const thumbs = list.map(([u, n]) => `
            <a class="photo-thumb" href="${this.esc(u)}" target="_blank" rel="noopener noreferrer">
                <img src="${this.esc(u)}" alt="Job photo ${n}" loading="lazy">
            </a>`).join('');
        return `<div class="photo-strip${small ? ' is-small' : ''}">${thumbs}</div>`;
    },
    // Malaysian numbers: 012-345 6789 -> https://wa.me/60123456789
    waLink(phone) {
        let d = String(phone || '').replace(/\D/g, '');
        if (!d) return '';
        if (d.startsWith('0')) d = '6' + d;
        return 'https://wa.me/' + d;
    },
    isPdf(url) {
        return /\.pdf$/i.test(String(url || '').split(/[?#]/)[0]);
    },
    doSlip(job, { showTime = false, timeLabel = 'Uploaded', download = false } = {}) {
        if (!job || !job.do_url) return '';
        const when = (showTime && job.do_uploaded_at)
            ? `<span style="font-weight:400;font-size:.75rem;color:var(--muted)">${this.esc(timeLabel)} ${this.fmtDateTime(job.do_uploaded_at)}</span>`
            : '';
        const url = this.esc(job.do_url);
        const thumb = this.isPdf(job.do_url)
            ? `<a class="photo-thumb is-file" href="${url}" target="_blank" rel="noopener noreferrer" title="Open DO (PDF)">
                    <i class="ri-file-pdf-2-line"></i><span>PDF</span>
                </a>`
            : `<a class="photo-thumb" href="${url}" target="_blank" rel="noopener noreferrer">
                    <img src="${url}" alt="Delivery Order" loading="lazy">
                </a>`;
        const dl = download
            ? `<a class="btn btn-secondary btn-sm" href="${this.esc(this.downloadUrl(job.do_url))}" download><i class="ri-download-2-line"></i> Download</a>`
            : '';
        // One grey box (same look as Remarks): title + time on top, thumbnail + download below
        return `<div class="remarks do-block">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 12px"><b>Delivery Order (DO)</b>${when}</div>
            <div class="photo-strip is-small" style="align-items:center;gap:12px;margin-top:8px">${thumb}${dl}</div>
        </div>`;
    },
    remarks(text) {
        return text ? `<p class="remarks"><b>Remarks:</b> ${this.esc(text)}</p>` : '';
    },
    price(label, amount) {
        return `<div class="price"><span class="price-label">${this.esc(label)}</span><span class="price-value"><small>RM</small>${this.money(amount)}</span></div>`;
    },
    empty(icon, title, text = '') {
        return `<div class="empty"><i class="${icon}"></i><p class="empty-title">${this.esc(title)}</p>${text ? `<p class="empty-text">${this.esc(text)}</p>` : ''}</div>`;
    },
    errorBlock(message) {
        return this.empty('ri-error-warning-line', "Couldn't load this", message);
    },
    skeleton(n = 3, height = 148) {
        return Array.from({ length: n }, () => `<div class="skeleton" style="height:${height}px"></div>`).join('');
    },
    setTab(name) {
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
    }
};

// ==========================================
// 3. APP LOGIC & AUTHENTICATION
// ==========================================
const app = {
    currentUser: null,
    currentUserRole: null,
	transporterProfile: null,
    banTimer: null,
    currentView: null,
    refreshTimer: null,
    lastSig: {},
    knownRequestIds: null,
    knownJobIds: null,
    knownStages: null,
    currentBidsJobId: null,
    uploading: 0,

    async init() {
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('post-job-form').addEventListener('submit', (e) => this.submitNewJob(e));
        document.getElementById('job-item').addEventListener('change', () => this.toggleOtherItem());
        document.getElementById('customer-job-form').addEventListener('submit', (e) => this.submitCustomerJob(e));
        document.getElementById('cj-item').addEventListener('change', () => this.toggleCustomerOtherItem());
		document.getElementById('forgot-password-form').addEventListener('submit', (e) => this.handleForgotPassword(e));
		document.getElementById('counter-offer-form').addEventListener('submit', (e) => this.submitCounterOffer(e));
		document.getElementById('job-date').min = new Date().toISOString().split('T')[0];
        btnLogout.addEventListener('click', () => this.handleLogout());

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            this.routeUser(session.user);
                } else {
            this.showView('login');
        }

        document.addEventListener('visibilitychange', () => { if (!document.hidden) this.autoRefresh(); });
        this.startAutoRefresh();
    },

    // --- AUTHENTICATION FUNCTIONS ---
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            ui.notify("Login Failed: " + error.message);
        } else {
            this.routeUser(data.user);
        }
    },

    openRegister(role) {
        const isCustomer = role === 'customer';
        document.getElementById('reg-role').value = isCustomer ? 'customer' : 'transporter';
        document.getElementById('reg-title').textContent = isCustomer ? 'Register as customer' : 'Register as transporter';
        document.getElementById('reg-sub').textContent = isCustomer
            ? "Create a customer account to send us your jobs. We'll email you a link to confirm your address."
            : "Create a transporter account to bid on loads. We'll email you a link to confirm your address.";
        this.showView('register');
    },

    async handleRegister(e) {
        e.preventDefault();
        const role = document.getElementById('reg-role').value === 'customer' ? 'customer' : 'transporter';
        const company = document.getElementById('reg-company').value;
        const contact = document.getElementById('reg-contact').value;
        const phone = document.getElementById('reg-phone').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const { data, error } = await supabaseClient.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    company_name: company,
                    contact_person: contact,
                    phone: phone,
                    role: role
                }
            }
        });

        if (error) {
            ui.notify("Registration Failed: " + error.message);
            return;
        }

        ui.notify("Registration successful! Please check your mailbox to confirm your email (make sure to check your spam folder too!).");
        document.getElementById('register-form').reset();
        this.showView('login');
    },

    async handleLogout() {
		if (this.banTimer) clearInterval(this.banTimer);
        await supabaseClient.auth.signOut();
        
        // Wipe local memory
        this.currentUser = null;
        this.currentUserRole = null;
        this.transporterProfile = null; // <-- Added
        this.myBidsByJob = {};
        this.lastSig = {};
        this.knownRequestIds = null;
        this.knownJobIds = null;
        this.knownStages = null;
        this.currentBidsJobId = null;
        
        // Hide UI elements
        btnLogout.classList.add('hidden');
        navs.container.classList.add('hidden');
        navs.rt.classList.replace('flex', 'hidden');
        navs.transporter.classList.replace('flex', 'hidden');
        
        // Wipe DOM containers
        document.getElementById('rt-jobs-container').innerHTML = '';
        document.getElementById('rt-requests-container').innerHTML = '';
        this.updateRequestsBadge(0);
        document.getElementById('transporter-jobs-container').innerHTML = '';
        document.getElementById('my-jobs-container').innerHTML = '';
        document.getElementById('recent-activity-container').innerHTML = '';
        document.getElementById('bids-container').innerHTML = '';
        document.getElementById('customer-jobs-container').innerHTML = '';
        document.getElementById('draft-review-container').innerHTML = '';
        
        document.getElementById('login-form').reset();
        this.showView('login');
    },
	
	async handleForgotPassword(e) {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;

        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password.html` 
        });

        if (error) {
            ui.notify("Error: " + error.message);
        } else {
            ui.notify("Password reset link sent! Please check your email.");
            document.getElementById('forgot-password-form').reset();
            this.showView('login');
        }
    },

    // --- ROUTING & ROLE MANAGEMENT ---
    async routeUser(user) {
        this.currentUser = user;
        btnLogout.classList.remove('hidden');
        navs.container.classList.remove('hidden');

        if (user.email === RT_ADMIN_EMAIL) {
            this.currentUserRole = 'rt';
            ui.setTab('rt');
            this.showView('rtHome');
            navs.rt.classList.replace('hidden', 'flex');
            navs.transporter.classList.replace('flex', 'hidden');
            this.fetchJobsForRT();
            return;
        }

        // Customers live in their own table
        const { data: customer } = await supabaseClient
            .from('customers')
            .select('id, company_name')
            .eq('id', user.id)
            .maybeSingle();

        if (customer) {
            this.currentUserRole = 'customer';
            navs.container.classList.add('hidden'); // no bottom tabs for customers yet
            navs.rt.classList.replace('flex', 'hidden');
            navs.transporter.classList.replace('flex', 'hidden');
            document.getElementById('customer-welcome').textContent = 'Welcome, ' + (customer.company_name || 'customer');
            this.showCustomerHome();
        } else {
            this.currentUserRole = 'transporter';
            
            const { data: profile } = await supabaseClient
                .from('transporters')
                .select('status, banned_until')
                .eq('id', user.id)
                .single();
            this.transporterProfile = profile || {};

            navs.transporter.classList.replace('hidden', 'flex');
            navs.rt.classList.replace('flex', 'hidden');
            this.showTransporterBoard(); 
        }
    },
	
	showTransporterBoard() {
        ui.setTab('board');
        this.showView('transporterHome');
        this.fetchJobsForTransporter();
		this.fetchRecentMarketActivity();
		this.updateActivityStatus();
    },

    showMyJobs() {
        ui.setTab('myjobs');
        this.showView('transporterMyJobs');
        this.fetchMyJobs();
    },
	
	// Re-reads the ban status so a ban (or unban) done in Supabase takes effect without a re-login.
	// If the request fails we keep the last known status instead of guessing.
	async refreshTransporterProfile() {
        if (this.currentUserRole !== 'transporter' || !this.currentUser) return;
        const { data: profile, error } = await supabaseClient
            .from('transporters')
            .select('status, banned_until')
            .eq('id', this.currentUser.id)
            .single();
        if (error) { console.error('Could not refresh transporter profile:', error); return; }
        if (profile) this.transporterProfile = profile;
    },

	isBanned() {
        if (!this.transporterProfile || !this.transporterProfile.banned_until) return false;
        const banEnd = new Date(this.transporterProfile.banned_until).getTime();
        return banEnd > new Date().getTime();
    },

    startBanCountdown() {
        if (this.banTimer) clearInterval(this.banTimer);
        const banEnd = new Date(this.transporterProfile.banned_until).getTime();
        
        this.banTimer = setInterval(() => {
            const now = new Date().getTime();
            const distance = banEnd - now;
            const el = document.getElementById('ban-countdown');
            
            if (!el) return;

            if (distance < 0) {
                clearInterval(this.banTimer);
                el.innerHTML = "Ban has expired! Please refresh the page.";
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            el.innerHTML = `Ban expires in: <b>${days}d ${hours}h ${minutes}m ${seconds}s</b>`;
        }, 1000);
    },
	
	async updateActivityStatus() {
        if (!this.currentUser) return;
        
        await supabaseClient
            .from('transporters')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', this.currentUser.id);
    },

    // --- UTILS & DB FUNCTIONS ---
    escapeHTML(value) {
		if (value === null || value === undefined) return '';
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	},
	
	safeUrl(u) {
		try { return ['https:', 'http:'].includes(new URL(u).protocol) ? u : ''; }
		catch { return ''; }
	},
	
	showView(viewName) {
        this.currentView = viewName;
        Object.values(views).forEach(view => {
            if(view) view.classList.add('hidden');
        });
        if(views[viewName]) {
            views[viewName].classList.remove('hidden');
                        views[viewName].classList.add('flex');
        }
    },

    // ==========================================
    // --- AUTO REFRESH ---
    // Every 20s the open list is re-fetched quietly (no skeleton, no flicker).
    // The screen is only redrawn when the data really changed.
    // ==========================================
    viewIs(...names) { return names.includes(this.currentView); },

    startAutoRefresh() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        this.refreshTimer = setInterval(() => this.autoRefresh(), 20000);
    },

    async autoRefresh() {
        if (!this.currentUser || document.hidden) return;
        if (this.uploading && Date.now() - this.uploading < 120000) return; // don't redraw during a DO upload
        // Pick up bans/unbans done in Supabase before the lists are redrawn
        await this.refreshTransporterProfile();
        if (!this.currentUser) return; // logged out while waiting
        switch (this.currentView) {
            case 'rtHome':
            case 'rtRequests':
                this.fetchJobsForRT(true); break;
            case 'rtReviewBids':
                if (this.currentBidsJobId) this.viewBids(this.currentBidsJobId, true);
                break;
            case 'transporterHome':
                this.fetchJobsForTransporter(true);
                this.fetchRecentMarketActivity(true);
                break;
            case 'transporterMyJobs':
                this.fetchMyJobs(true); break;
            case 'customerHome':
                this.fetchCustomerJobs(true); break;
        }
    },

    async fetchJobsForRT(silent = false) {
        if (!silent) rtJobsContainer.innerHTML = ui.skeleton(3);
        
 const { data: jobs, error } = await supabaseClient
            .from('jobs')
            .select('*, customers(company_name, contact_person, phone)')
            .neq('status', 'archived') 
            .order('created_at', { ascending: false });
            
        if (error) { console.error(error); if (!silent) rtJobsContainer.innerHTML = ui.errorBlock('Check your connection and try again.'); return; }
        if (silent && !this.viewIs('rtHome', 'rtRequests')) return;
        const all = jobs || [];
        const requests = all.filter(j => j.status === 'pending_review');
        const prevIds = this.knownRequestIds;
        this.knownRequestIds = new Set(requests.map(j => j.id));
        const sig = JSON.stringify(jobs);
        if (silent && sig === this.lastSig.rt) return;
        this.lastSig.rt = sig;
        if (silent && prevIds && requests.some(j => !prevIds.has(j.id))) ui.notify('New customer request');
        this.updateRequestsBadge(requests.length);
        this.renderRTJobs(all.filter(j => j.status !== 'pending_review'));
        this.renderRTRequests(requests);
    },

    updateRequestsBadge(n) {
        const badge = document.getElementById('requests-badge');
        if (!badge) return;
        badge.textContent = n > 99 ? '99+' : String(n);
        badge.classList.toggle('hidden', n === 0);
    },

    showRtJobs() {
        ui.setTab('rt');
        this.showView('rtHome');
        this.fetchJobsForRT();
    },

    showRtRequests() {
        ui.setTab('requests');
        this.showView('rtRequests');
        this.fetchJobsForRT();
    },

    renderRTRequests(requests) {
        const container = document.getElementById('rt-requests-container');
        if (!requests || requests.length === 0) {
            container.innerHTML = ui.empty('ri-inbox-line', 'No requests waiting', 'Jobs sent by customers will show up here for review.');
            return;
        }
        container.innerHTML = (requests || []).map(job => {
            const c = job.customers || {};
            const id = ui.esc(job.id);
            return `
                <article class="job-card">
                    <div class="job-head">
                        ${ui.pill('Awaiting review', 'warn', 'ri-time-line')}
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    <p class="remarks"><b>Customer:</b> ${ui.esc(c.company_name || 'Unknown customer')}</p>
                    ${ui.route(job)}
                    ${ui.facts(job, { date: job.delivery_date })}
                    <div class="job-foot">
                        ${ui.price('Customer expected price', job.customer_expected_price)}
                        <div class="actions">
                            <button class="btn btn-go btn-sm" data-id="${id}" onclick="app.openDraftReview(this.dataset.id)">Review &amp; post</button>
                            <button class="btn btn-danger-ghost btn-sm btn-icon" data-id="${id}" onclick="app.deleteJob(this.dataset.id)" aria-label="Remove request" title="Remove request"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </div>
                </article>`;
        }).join('');
    },

    async fetchJobsForTransporter(silent = false) {
        if (!silent) transporterJobsContainer.innerHTML = ui.skeleton(3);
        const { data: jobs, error } = await supabaseClient.from('jobs').select('*').eq('status', 'open').order('created_at', { ascending: false });
        if (error) { console.error(error); if (!silent) transporterJobsContainer.innerHTML = ui.errorBlock('Check your connection and try again.'); return; }
        if (silent && !this.viewIs('transporterHome')) return;

        // This transporter's own bids, so each card can show what they already offered.
        // A failure here must not break the board, so we just fall back to "no bids".
        const { data: myBids, error: bidsError } = await supabaseClient
            .from('bids')
            .select('job_id, proposed_price, proposed_date, created_at')
            .eq('transporter_id', this.currentUser.id);
        if (bidsError) console.error('Could not load own bids:', bidsError);
        this.myBidsByJob = {};
        (myBids || []).forEach(b => {
            const key = String(b.job_id);
            (this.myBidsByJob[key] = this.myBidsByJob[key] || []).push(b);
        });

        const prevIds = this.knownJobIds;
        this.knownJobIds = new Set((jobs || []).map(j => j.id));
        const sig = JSON.stringify([jobs, this.isBanned(), myBids]);
        if (silent && sig === this.lastSig.board) return;
        this.lastSig.board = sig;
        if (silent && prevIds && (jobs || []).some(j => !prevIds.has(j.id))) ui.notify('New job on the board');
        this.renderTransporterJobs(jobs);
    },

    async uploadJobPhoto(fileInputId) {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;

        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { data, error } = await supabaseClient.storage
            .from('job-photos')
            .upload(filePath, file);

        if (error) {
            console.error('Upload error:', error);
            ui.notify('Failed to upload photo: ' + error.message);
            return null;
        }

        const { data: publicUrlData } = supabaseClient.storage
            .from('job-photos')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    },

    toggleOtherItem() {
        const isOther = document.getElementById('job-item').value === 'Others';
        const wrap = document.getElementById('job-item-other-wrap');
        const input = document.getElementById('job-item-other');
        wrap.style.display = isOther ? '' : 'none';
        input.required = isOther;
        if (isOther) input.focus(); else input.value = '';
    },

    async submitNewJob(e) {
        e.preventDefault();

        let itemDesc = document.getElementById('job-item').value;
        if (itemDesc === 'Others') {
            const other = document.getElementById('job-item-other').value.trim();
            if (!other) {
                ui.notify("Please specify the item under Others.");
                return;
            }
            itemDesc = 'Others: ' + other;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Uploading & Publishing...';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75');

        const photo1Url = await this.uploadJobPhoto('job-photo-1');
        const photo2Url = await this.uploadJobPhoto('job-photo-2');

        const newJob = {
            po_number: document.getElementById('job-po-number').value, 
            source_loc: document.getElementById('job-source').value,
            source_maps_link: document.getElementById('job-source-link').value,
			dest_loc: document.getElementById('job-dest').value,
            dest_maps_link: document.getElementById('job-dest-link').value,
            item_desc: itemDesc,
            quantity: parseInt(document.getElementById('job-qty').value),
            delivery_date: document.getElementById('job-date').value,
            offered_price: parseFloat(document.getElementById('job-price').value),
			unloading_service: document.getElementById('job-unloading').checked,
            remarks: document.getElementById('job-remarks').value,
            photo_1_url: photo1Url, 
            photo_2_url: photo2Url  
        };

        const { error } = await supabaseClient.from('jobs').insert([newJob]);
        
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');

        if (error) {
            ui.notify("Failed to post job: " + error.message);
        } else {
            ui.notify("Job published.");
            document.getElementById('post-job-form').reset();
            this.toggleOtherItem();
            this.showView('rtHome');
            this.fetchJobsForRT();
        }
    },
	
	async quickAccept(jobId, offeredPrice) {
		await this.refreshTransporterProfile();
		if (this.isBanned()) {
            ui.notify("Your account is currently suspended. You cannot accept or bid on jobs.");
            return;
        }
        const { data: existingBids, error: fetchError } = await supabaseClient
            .from('bids')
            .select('proposed_price')
            .eq('job_id', jobId)
            .eq('transporter_id', this.currentUser.id);

        if (fetchError) {
            ui.notify("Error validating bid: " + fetchError.message);
            return;
        }

        if (existingBids && existingBids.length > 0) {
            const hasQuickAccepted = existingBids.some(bid => bid.proposed_price === offeredPrice);
            if (hasQuickAccepted) {
                ui.notify("You have already accepted this job, please wait for approval");
                return;
            }
            const lowestPreviousBid = Math.min(...existingBids.map(b => b.proposed_price));
            if (offeredPrice >= lowestPreviousBid) {
                ui.notify("Invalid bid = Counteroffer price cannot be higher than your previous bid");
                return;
            }
        }

        if (!confirm("Are you sure you want to accept this job for RM " + offeredPrice + "?")) return;

        const newBid = {
            job_id: jobId,
            transporter_id: this.currentUser.id,
            proposed_price: offeredPrice,
            status: 'submitted'
        };

        const { error } = await supabaseClient.from('bids').insert([newBid]);

        if (error) {
            ui.notify("Error submitting bid: " + error.message);
        } else {
            ui.notify("Job accepted successfully! Awaiting RT approval.");
            this.fetchJobsForTransporter(); 
            this.sendAdminWhatsAppAlert("Quick Accept", jobId, offeredPrice);
        }
    },
	
	async prepareCounterOffer(jobId, originalDate, originalPrice) {
		await this.refreshTransporterProfile();
		if (this.isBanned()) {
            ui.notify("Your account is currently suspended. You cannot accept or bid on jobs.");
            return;
        }
        const { data: existingBids, error: fetchError } = await supabaseClient
            .from('bids')
            .select('proposed_price')
            .eq('job_id', jobId)
            .eq('transporter_id', this.currentUser.id);

        if (fetchError) {
            ui.notify("Error checking bid status: " + fetchError.message);
            return;
        }

        if (existingBids && existingBids.length > 0) {
            const hasQuickAccepted = existingBids.some(bid => bid.proposed_price === originalPrice);
            if (hasQuickAccepted) {
                ui.notify("You have already accepted this job, please wait for approval");
                return; 
            }
        }

        this.currentCounterJobId = jobId;
        this.currentCounterOriginalPrice = originalPrice; 

        document.getElementById('counter-job-id').value = jobId;
        document.getElementById('counter-price').value = originalPrice; 
        
        const dateInput = document.getElementById('counter-date');
        dateInput.value = originalDate; 

        const baseDate = new Date(originalDate);
        
        const minDate = new Date(baseDate);
        minDate.setDate(baseDate.getDate() - 3);
        
        const maxDate = new Date(baseDate);
        maxDate.setDate(baseDate.getDate() + 3);

        dateInput.min = minDate.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        this.showView('counterOffer');
    },
	
    async submitCounterOffer(e) {
        e.preventDefault();
        await this.refreshTransporterProfile();
        if (this.isBanned()) {
            ui.notify("Your account is currently suspended. You cannot accept or bid on jobs.");
            this.showTransporterBoard();
            return;
        }
        const newPrice = parseFloat(document.getElementById('counter-price').value);
        const newDate = document.getElementById('counter-date').value;

        const { data: existingBids, error: fetchError } = await supabaseClient
            .from('bids')
            .select('proposed_price')
            .eq('job_id', this.currentCounterJobId)
            .eq('transporter_id', this.currentUser.id);

        if (fetchError) {
            ui.notify("Error validating bid: " + fetchError.message);
            return;
        }

        if (existingBids && existingBids.length > 0) {
            const hasQuickAccepted = existingBids.some(bid => bid.proposed_price === this.currentCounterOriginalPrice);
            if (hasQuickAccepted) {
                ui.notify("You have already accepted this job, please wait for approval");
                return;
            }

            const lowestPreviousBid = Math.min(...existingBids.map(b => b.proposed_price));
            if (newPrice >= lowestPreviousBid) {
                ui.notify("Invalid bid = Counteroffer price cannot be higher than your previous bid");
                return;
            }
        }

        const newBid = {
            job_id: this.currentCounterJobId,
            transporter_id: this.currentUser.id,
            proposed_price: newPrice,
            proposed_date: newDate,
            status: 'submitted'
        };

        const { error } = await supabaseClient.from('bids').insert([newBid]);

        if (error) {
            ui.notify("Error submitting counter-offer: " + error.message);
        } else {
            ui.notify("Counter-offer submitted successfully!");
            document.getElementById('counter-offer-form').reset();
            this.showTransporterBoard(); 
            this.sendAdminWhatsAppAlert("Counter-Offer", this.currentCounterJobId, newPrice);
        }
    },
	
    async viewBids(jobId, silent = false) {
        const container = document.getElementById('bids-container');
        if (!silent) {
            this.currentBidsJobId = jobId;
            this.showView('rtReviewBids');
            container.innerHTML = ui.skeleton(2);
        }

        const { data: job, error: jobError } = await supabaseClient
            .from('jobs')
            .select('offered_price, delivery_date, source_loc, dest_loc, quantity, item_desc, po_number, photo_1_url, photo_2_url, source_maps_link, dest_maps_link, remarks, created_at, unloading_service, do_url, do_uploaded_at')
            .eq('id', jobId)
            .single();

        if (jobError) {
            if (!silent) container.innerHTML = ui.errorBlock(jobError.message);
            return;
        }

        const { data: bids, error } = await supabaseClient
            .from('bids')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: false });

        if (error) {
            if (!silent) container.innerHTML = ui.errorBlock(error.message);
            return;
        }
        if (silent && !this.viewIs('rtReviewBids')) return;
        const sig = JSON.stringify([job, bids]);
        if (silent && sig === this.lastSig.bids) return;
        this.lastSig.bids = sig;

        const originalPrice = Number(job.offered_price);
        const bidCount = bids.length;

        let html = `
            <article class="job-card summary">
                <div class="job-head">
                    ${bidCount ? ui.pill(`${bidCount} bid${bidCount === 1 ? '' : 's'}`, 'info') : ui.pill('No bids yet', 'neutral')}
                    <span class="job-time">${ui.posted(job.created_at)}</span>
                </div>
                ${ui.route(job)}
                ${ui.facts(job, { po: true, date: job.delivery_date, dateLabel: 'Original date', delivered: !!job.do_url })}
                ${ui.photos(job, true)}
                ${ui.remarks(job.remarks)}
                ${ui.doSlip(job, { showTime: true })}
                <div class="job-foot">
                    ${ui.price('Original budget', originalPrice)}
                </div>
            </article>
        `;

        if (bidCount === 0) {
            html += ui.empty('ri-hourglass-line', 'No bids yet', 'Transporters can accept or counter-offer while the job is open.');
            container.innerHTML = html;
            return;
        }

        bids.sort((a, b) => {
            if (a.status === 'accepted' && b.status !== 'accepted') return -1;
            if (b.status === 'accepted' && a.status !== 'accepted') return 1;
            return 0;
        });

        const transporterIds = bids.map(bid => bid.transporter_id);
        const { data: transporters } = await supabaseClient
            .from('transporters')
            .select('id, company_name, contact_person, phone')
            .in('id', transporterIds);

        const transporterProfiles = {};
        if (transporters) {
            transporters.forEach(t => { transporterProfiles[t.id] = t; });
        }

        // Flag the cheapest open bid when there is something to compare it with
        const openPrices = bids.filter(b => b.status === 'submitted').map(b => Number(b.proposed_price));
        const lowestOpen = openPrices.length > 1 ? Math.min(...openPrices) : null;

        html += bids.map(bid => {
            const profile = transporterProfiles[bid.transporter_id] || {
                company_name: 'Unknown transporter', contact_person: 'N/A', phone: 'N/A'
            };

            const price = Number(bid.proposed_price);
            const diff = price - originalPrice;
            const diffPill = diff === 0
                ? ui.pill('Matches budget', 'neutral')
                : diff < 0
                    ? ui.pill(`RM ${ui.money(Math.abs(diff))} below budget`, 'go')
                    : ui.pill(`RM ${ui.money(diff)} above budget`, 'warn');

            const isLowest = lowestOpen !== null && bid.status === 'submitted' && price === lowestOpen;

            const tel = String(profile.phone || '').replace(/[^\d+]/g, '');
            const phoneHtml = tel
                ? `<a href="tel:${ui.esc(tel)}"><i class="ri-phone-line"></i>${ui.esc(profile.phone)}</a>`
                : `<span><i class="ri-phone-line"></i>${ui.esc(profile.phone)}</span>`;

            const dateAlert = (bid.proposed_date && bid.proposed_date !== job.delivery_date)
                ? `<div class="notice notice-warn"><i class="ri-calendar-schedule-line"></i><span>New date proposed: <b>${ui.fmtDate(bid.proposed_date)}</b></span></div>`
                : '';

            const action = bid.status === 'submitted'
                ? `<button class="btn btn-go"
                           data-bid-id="${ui.esc(bid.id)}" data-job-id="${ui.esc(jobId)}" data-price="${price}"
                           onclick="app.awardJob(this.dataset.bidId, this.dataset.jobId, Number(this.dataset.price))">Award job</button>`
                : ui.pill(bid.status === 'accepted' ? 'Awarded' : bid.status, bid.status === 'accepted' ? 'go' : 'neutral', bid.status === 'accepted' ? 'ri-check-line' : '');

            return `
                <article class="job-card bid-card">
                    <div class="bid-top">
                        <div>
                            <h3 class="bid-company">${ui.esc(profile.company_name)}</h3>
                            ${isLowest ? `<div style="margin-top:6px">${ui.pill('Lowest bid', 'go', 'ri-arrow-down-line')}</div>` : ''}
                            <div class="bid-contact">
                                <span><i class="ri-user-line"></i>${ui.esc(profile.contact_person)}</span>
                                ${phoneHtml}
                            </div>
                        </div>
                        <div class="bid-price">
                            ${ui.price('Proposed price', price)}
                            ${diffPill}
                        </div>
                    </div>
                    ${dateAlert}
                    <div class="job-foot">
                        <span class="job-time">Submitted ${ui.fmtDateTime(bid.created_at)}</span>
                        ${action}
                    </div>
                </article>
            `;
        }).join('');

        container.innerHTML = html;
    },

    async awardJob(bidId, jobId, acceptedPrice) {
        if (!confirm("Are you sure you want to award the job to this transporter?")) return;

        const { error: bidError } = await supabaseClient
            .from('bids')
            .update({ status: 'accepted' })
            .eq('id', bidId);

        if (bidError) {
            ui.notify("Error awarding job: " + bidError.message);
            return;
        }

        const { error: jobError } = await supabaseClient
            .from('jobs')
            .update({ 
                status: 'assigned',
                accepted_price: acceptedPrice,
                assigned_at: new Date().toISOString()
            })
            .eq('id', jobId);

        if (jobError) {
            ui.notify("Error updating job status: " + jobError.message);
            return;
        }

        ui.notify("Job awarded successfully!");
        this.showView('rtHome');
        this.fetchJobsForRT();
    },
	
	async deleteJob(jobId) {
        if (!confirm("Are you sure you want to remove this job from your view? (It will be safely kept in the database).")) return;

        const { error } = await supabaseClient
            .from('jobs')
            .update({ status: 'archived' })
            .eq('id', jobId);

        if (error) {
            ui.notify("Error removing job: " + error.message);
        } else {
            ui.notify("Job successfully removed from view.");
            this.fetchJobsForRT();
        }
    },

    async unassignJob(jobId) {
        if (!confirm("Are you sure you want to undo this assignment? The job will be returned to the open market.")) return;
        
        const { data: updatedJob, error: jobError } = await supabaseClient
            .from('jobs')
            .update({ 
                status: 'open',
                accepted_price: null,
                assigned_at: null,
                do_url: null,
                do_uploaded_at: null
            })
            .eq('id', jobId)
            .select(); 
        
        if (jobError) {
            ui.notify("Error unassigning job: " + jobError.message);
            return;
        }
        
        if (!updatedJob || updatedJob.length === 0) {
            ui.notify("❌ Undo Failed: The database blocked the update.");
            return;
        }
        
        await supabaseClient
            .from('bids')
            .update({ status: 'submitted' })
            .eq('job_id', jobId)
            .eq('status', 'accepted');
        
        ui.notify("Job assignment undone. It is now open for bids again.");
        this.fetchJobsForRT();
    },

    // ==========================================
    // --- CUSTOMER: draft jobs sent to RT for approval ---
    // ==========================================
    showCustomerHome() {
        this.showView('customerHome');
        this.fetchCustomerJobs();
    },

    openCustomerNewJob() { this.openCustomerForm('new'); },

    openCustomerEdit(jobId) {
        const job = this.customerJobsById(jobId);
        if (job) this.openCustomerForm('edit', job);
    },

    openCustomerCopy(jobId) {
        const job = this.customerJobsById(jobId);
        if (job) this.openCustomerForm('copy', job);
    },

    customerJobsById(jobId) {
        return (this.customerJobs || []).find(j => String(j.id) === String(jobId));
    },

    openCustomerForm(mode, job = null) {
        document.getElementById('customer-job-form').reset();
        this.editingJobId = mode === 'edit' ? job.id : null;
        this.toggleCustomerOtherItem();
        document.getElementById('cj-date').min = new Date().toISOString().split('T')[0];

        document.getElementById('cj-title').textContent =
            mode === 'edit' ? 'Edit request' : (mode === 'copy' ? 'Book again' : 'New job');
        document.getElementById('cj-submit').textContent =
            mode === 'edit' ? 'Save changes' : 'Send to RT LorryLink';
        document.getElementById('cj-photo-hint').style.display = mode === 'edit' ? '' : 'none';

        if (job) this.fillCustomerForm(job, mode === 'edit');
        if (mode === 'copy') ui.notify("Copied from your previous job. Please set the date and price.");
        this.showView('customerNewJob');
    },

    fillCustomerForm(job, withSchedule) {
        const set = (id, v) => { document.getElementById(id).value = v == null ? '' : v; };
        set('cj-source', job.source_loc);
        set('cj-source-link', job.source_maps_link);
        set('cj-dest', job.dest_loc);
        set('cj-dest-link', job.dest_maps_link);

        const sel = document.getElementById('cj-item');
        const known = Array.from(sel.options).map(o => o.value).filter(v => v !== 'Others');
        let other = '';
        if (known.includes(job.item_desc)) {
            sel.value = job.item_desc;
        } else {
            sel.value = 'Others';
            other = String(job.item_desc || '').replace(/^Others:\s*/, '');
        }
        this.toggleCustomerOtherItem();
        if (sel.value === 'Others') document.getElementById('cj-item-other').value = other;

        set('cj-qty', job.quantity);
        document.getElementById('cj-unloading').checked = !!job.unloading_service;
        set('cj-remarks', job.remarks);
        if (withSchedule) {
            set('cj-date', job.delivery_date);
            set('cj-price', job.customer_expected_price);
        }
    },

    async cancelCustomerJob(jobId) {
        if (!confirm("Cancel this request? This cannot be undone.")) return;
        const { error } = await supabaseClient.rpc('cancel_customer_job', { p_job_id: jobId });
        if (error) {
            console.error(error);
            ui.notify("Failed to cancel: " + error.message);
            return;
        }
        ui.notify("Request cancelled.");
        this.fetchCustomerJobs();
    },

    toggleCustomerOtherItem() {
        const isOther = document.getElementById('cj-item').value === 'Others';
        const wrap = document.getElementById('cj-item-other-wrap');
        const input = document.getElementById('cj-item-other');
        wrap.style.display = isOther ? '' : 'none';
        input.required = isOther;
        if (isOther) input.focus(); else input.value = '';
    },

    async submitCustomerJob(e) {
        e.preventDefault();

        let itemDesc = document.getElementById('cj-item').value;
        if (itemDesc === 'Others') {
            const other = document.getElementById('cj-item-other').value.trim();
            if (!other) {
                ui.notify("Please specify the item under Others.");
                return;
            }
            itemDesc = 'Others: ' + other;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Uploading & sending...';
        submitBtn.disabled = true;

        const photo1Url = await this.uploadJobPhoto('cj-photo-1');
        const photo2Url = await this.uploadJobPhoto('cj-photo-2');

        const payload = {
            p_source_loc: document.getElementById('cj-source').value.trim(),
            p_source_maps_link: document.getElementById('cj-source-link').value.trim() || null,
            p_dest_loc: document.getElementById('cj-dest').value.trim(),
            p_dest_maps_link: document.getElementById('cj-dest-link').value.trim() || null,
            p_item_desc: itemDesc,
            p_quantity: parseInt(document.getElementById('cj-qty').value),
            p_delivery_date: document.getElementById('cj-date').value,
            p_expected_price: parseFloat(document.getElementById('cj-price').value),
            p_unloading: document.getElementById('cj-unloading').checked,
            p_remarks: document.getElementById('cj-remarks').value.trim() || null,
            p_photo_1_url: photo1Url,
            p_photo_2_url: photo2Url
        };
        const editing = !!this.editingJobId;
        const { error } = editing
            ? await supabaseClient.rpc('update_customer_job', { p_job_id: this.editingJobId, ...payload })
            : await supabaseClient.rpc('submit_customer_job', payload);

        submitBtn.innerText = originalText;
        submitBtn.disabled = false;

        if (error) {
            console.error(error);
            ui.notify("Failed to send job: " + error.message);
            return;
        }

        ui.notify(editing ? "Changes saved and sent. We will review it shortly." : "Job sent. We will review it shortly.");
        this.editingJobId = null;
        document.getElementById('customer-job-form').reset();
        this.toggleCustomerOtherItem();
        this.showCustomerHome();
    },

    async fetchCustomerJobs(silent = false) {
        const container = document.getElementById('customer-jobs-container');
        if (!silent) container.innerHTML = ui.skeleton(2);

        // customer_jobs is a database view that only returns this customer's own jobs, with no prices or bids
        const { data: jobs, error } = await supabaseClient
            .from('customer_jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            if (!silent) container.innerHTML = ui.errorBlock(error.message);
            return;
        }
        if (silent && !this.viewIs('customerHome')) return;
        // jobs the admin removed (archived) are not shown to customers
        const visible = (jobs || []).filter(j => j.status !== 'archived');
        const prevStages = this.knownStages;
        this.knownStages = {};
        visible.forEach(j => { this.knownStages[j.id] = this.customerStage(j); });
        const sig = JSON.stringify(visible);
        if (silent && sig === this.lastSig.customer) return;
        this.lastSig.customer = sig;
        if (silent && prevStages && visible.some(j => prevStages[j.id] !== undefined && prevStages[j.id] !== this.knownStages[j.id])) {
            ui.notify('A job status was updated');
        }
        this.customerJobs = visible;
        this.renderCustomerJobs();
    },

    // review -> approved -> delivering (a transporter took the job) -> delivered (DO uploaded)
    customerStage(job) {
        if (job.status === 'pending_review') return 'review';
        if (job.status === 'assigned') return job.do_url ? 'delivered' : 'delivering';
        return 'approved';
    },

    customerSteps(stage, job) {
        const order = ['review', 'approved', 'delivering', 'delivered'];
        const labels = ['Submitted', 'Approved', 'Delivering', 'Delivered'];
        const times = [job.created_at, job.approved_at, job.assigned_at, job.do_uploaded_at];
        const reached = order.indexOf(stage);
        return `<ol class="steps" aria-label="Job progress">${labels.map((label, i) => {
            const t = i <= reached ? ui.fmtShort(times[i]) : '';
            return `<li class="step${i <= reached ? ' is-done' : ''}${i === reached ? ' is-current' : ''}"><span class="step-dot">${i <= reached ? '<i class="ri-check-line"></i>' : ''}</span><span class="step-label">${label}</span>${t ? `<span class="step-time">${t}</span>` : ''}</li>`;
        }).join('')}</ol>`;
    },

    setCustomerFilter(key) {
        this.customerFilter = key;
        this.renderCustomerJobs();
    },

    renderCustomerJobs() {
        const container = document.getElementById('customer-jobs-container');
        const all = this.customerJobs || [];
        const waBase = ui.waLink(RT_WHATSAPP_NUMBER);
        const help = waBase
            ? `<p class="page-sub" style="text-align:center">Need help? <a href="${ui.esc(waBase)}" target="_blank" rel="noopener noreferrer"><i class="ri-whatsapp-line"></i> WhatsApp us</a></p>`
            : '';

        if (all.length === 0) {
            container.innerHTML = ui.empty('ri-file-list-3-line', 'No jobs yet', 'Tap New job to send us your first job.') + help;
            return;
        }

        const filters = [['all', 'All'], ['review', 'Awaiting approval'], ['approved', 'Approved'], ['delivering', 'Delivering'], ['delivered', 'Delivered']];
        const counts = { all: all.length };
        filters.slice(1).forEach(([key]) => { counts[key] = all.filter(j => this.customerStage(j) === key).length; });
        const active = (this.customerFilter && counts[this.customerFilter] !== undefined) ? this.customerFilter : 'all';

        const chips = `<div class="chips">${filters
            .filter(([key]) => key === 'all' || key === active || counts[key] > 0)
            .map(([key, label]) => `<button type="button" class="chip${key === active ? ' is-active' : ''}" onclick="app.setCustomerFilter('${key}')">${label} <span class="chip-count">${counts[key]}</span></button>`)
            .join('')}</div>`;

        const shown = active === 'all' ? all : all.filter(j => this.customerStage(j) === active);
        if (shown.length === 0) {
            container.innerHTML = chips + ui.empty('ri-file-list-3-line', 'Nothing here', 'No jobs in this status.') + help;
            return;
        }

        const cards = shown.map(job => {
            const stage = this.customerStage(job);
            const id = ui.esc(job.id);
            const pill = {
                review: ui.pill('Awaiting approval', 'warn', 'ri-time-line'),
                approved: ui.pill('Approved', 'info', 'ri-megaphone-line'),
                delivering: ui.pill('Delivering', 'info', 'ri-truck-line'),
                delivered: ui.pill('Delivered', 'go', 'ri-check-double-line')
            }[stage];

            const actions = [];
            if (stage === 'review') {
                actions.push(`<button class="btn btn-secondary btn-sm" data-id="${id}" onclick="app.openCustomerEdit(this.dataset.id)"><i class="ri-edit-line"></i> Edit</button>`);
                actions.push(`<button class="btn btn-danger-ghost btn-sm" data-id="${id}" onclick="app.cancelCustomerJob(this.dataset.id)">Cancel request</button>`);
            }
            if (stage === 'delivered') {
                actions.push(`<button class="btn btn-secondary btn-sm" data-id="${id}" onclick="app.openCustomerCopy(this.dataset.id)"><i class="ri-repeat-line"></i> Book again</button>`);
            }
            if (waBase) {
                const msg = `Hi, I'd like to ask about my job: ${job.source_loc} to ${job.dest_loc}, delivery ${job.delivery_date}.`;
                actions.push(`<a class="btn btn-secondary btn-sm" href="${ui.esc(waBase + '?text=' + encodeURIComponent(msg))}" target="_blank" rel="noopener noreferrer"><i class="ri-whatsapp-line"></i> WhatsApp us</a>`);
            }
            const price = job.customer_expected_price != null ? ui.price('Your expected price', job.customer_expected_price) : '<span></span>';
            const foot = (job.customer_expected_price != null || actions.length)
                ? `<div class="job-foot">${price}${actions.length ? `<div class="actions" style="flex-wrap:wrap;justify-content:flex-end">${actions.join('')}</div>` : ''}</div>`
                : '';

            return `
                <article class="job-card">
                    <div class="job-head">
                        ${pill}
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    ${this.customerSteps(stage, job)}
                    ${ui.route(job)}
                    ${ui.facts(job, { date: job.delivery_date })}
                    ${ui.photos(job, true)}
                    ${ui.remarks(job.remarks)}
                    ${ui.doSlip(job, { showTime: true, timeLabel: 'Delivered' })}
                    ${foot}
                </article>
            `;
        }).join('');

        container.innerHTML = chips + cards + help;
    },

    // ==========================================
    // --- ADMIN: review a customer draft, add PO, post ---
    // ==========================================
    async openDraftReview(jobId) {
        ui.setTab('requests');
        this.showView('rtReviewDraft');
        const container = document.getElementById('draft-review-container');
        container.innerHTML = ui.skeleton(2);

        const { data: job, error } = await supabaseClient
            .from('jobs')
            .select('*, customers(company_name, contact_person, phone)')
            .eq('id', jobId)
            .single();

        if (error) {
            container.innerHTML = ui.errorBlock(error.message);
            return;
        }
        if (job.status !== 'pending_review') {
            container.innerHTML = ui.empty('ri-checkbox-circle-line', 'Already handled', 'This job is no longer waiting for review.');
            return;
        }

        const c = job.customers || {};
        const wa = ui.waLink(c.phone);
        const expected = Number(job.customer_expected_price) || 0;

        container.innerHTML = `
            <article class="job-card summary">
                <div class="job-head">
                    ${ui.pill('Awaiting review', 'warn', 'ri-time-line')}
                    <span class="job-time">${ui.posted(job.created_at)}</span>
                </div>
                <p class="remarks">
                    <b>${ui.esc(c.company_name || 'Unknown customer')}</b><br>
                    ${ui.esc(c.contact_person || '')}
                    ${wa ? ` &middot; <a href="${ui.esc(wa)}" target="_blank" rel="noopener noreferrer"><i class="ri-whatsapp-line"></i> ${ui.esc(c.phone)}</a>` : ''}
                </p>
                ${ui.route(job)}
                ${ui.facts(job, { date: job.delivery_date })}
                ${ui.photos(job, true)}
                ${ui.remarks(job.remarks)}
                <div class="job-foot">
                    ${ui.price('Customer expected price', expected)}
                </div>
            </article>

            <form id="approve-draft-form" class="panel form-stack" style="gap:16px">
                <div class="field">
                    <label class="label" for="draft-po">PO number (internal)</label>
                    <input type="text" id="draft-po" class="input" placeholder="e.g. PO-45992" required>
                </div>
                <span class="hint">This job will be posted to transporters at RM ${ui.money(expected)}, the price the customer entered.</span>
                <button type="submit" class="btn btn-go btn-block">Approve &amp; post job</button>
            </form>

        `;

        document.getElementById('approve-draft-form').addEventListener('submit', (ev) => this.approveDraft(ev, jobId, expected));
    },

    async approveDraft(e, jobId, price) {
        e.preventDefault();
        const po = document.getElementById('draft-po').value.trim();
        if (!po) {
            ui.notify("Please fill in the PO number.");
            return;
        }
        if (!Number.isFinite(price) || price <= 0) {
            ui.notify("This draft has no valid price. Please contact the customer.");
            return;
        }
        if (!confirm("Post this job to transporters at RM " + ui.money(price) + "?")) return;

        const { data: updated, error } = await supabaseClient
            .from('jobs')
            .update({
                po_number: po,
                offered_price: price,
                status: 'open',
                approved_at: new Date().toISOString()
            })
            .eq('id', jobId)
            .eq('status', 'pending_review')
            .select();

        if (error) {
            ui.notify("Failed to post job: " + error.message);
            return;
        }
        if (!updated || updated.length === 0) {
            ui.notify("Failed to post job: it may already have been handled.");
            return;
        }

        ui.notify("Job published.");
        this.showRtJobs();
    },

    // --- RENDER HTML FUNCTIONS ---
    async uploadDO(input) {
        const file = input.files && input.files[0];
        const jobId = input.dataset.jobId;
        if (!file || !jobId) return;

        const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
        if (!file.type.startsWith('image/') && !isPdf) {
            ui.notify("Please upload the DO as an image (PNG or JPG) or a PDF.");
            input.value = '';
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            ui.notify("File is too large. Maximum size is 10 MB.");
            input.value = '';
            return;
        }

        this.uploading = Date.now();
        ui.notify("Uploading DO...");
        const fileExt = (isPdf ? 'pdf' : file.name.split('.').pop()).toLowerCase();
        const filePath = `public/do-${jobId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabaseClient.storage
            .from('job-photos')
            .upload(filePath, file);

        if (uploadError) {
            console.error('DO upload error:', uploadError);
            this.uploading = 0;
            ui.notify('Failed to upload DO: ' + uploadError.message);
            input.value = '';
            return;
        }

        const { data: publicUrlData } = supabaseClient.storage
            .from('job-photos')
            .getPublicUrl(filePath);

        const { error: saveError } = await supabaseClient.rpc('attach_do', {
            p_job_id: jobId,
            p_url: publicUrlData.publicUrl
        });

        if (saveError) {
            console.error('DO save error:', saveError);
            this.uploading = 0;
            ui.notify("DO uploaded but could not be saved to the job: " + saveError.message);
            input.value = '';
            return;
        }

        this.uploading = 0;
        ui.notify("DO uploaded.");
        this.fetchMyJobs();
    },

	async fetchMyJobs(silent = false) {
        const container = document.getElementById('my-jobs-container');
        if (!silent) container.innerHTML = ui.skeleton(2);

        const { data: bids, error } = await supabaseClient
            .from('bids')
            .select('*, jobs(*)')
            .eq('transporter_id', this.currentUser.id)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            if (!silent) container.innerHTML = ui.errorBlock(error.message);
            return;
        }

        if (silent && !this.viewIs('transporterMyJobs')) return;
        const sig = JSON.stringify(bids);
        if (silent && sig === this.lastSig.myjobs) return;
        this.lastSig.myjobs = sig;
        this.renderMyJobs(bids);
    },

    renderMyJobs(bids) {
        const container = document.getElementById('my-jobs-container');
        if (bids.length === 0) {
            container.innerHTML = ui.empty('ri-truck-line', 'No assigned jobs yet', 'Jobs awarded to your company will show up here.');
            return;
        }

        container.innerHTML = bids.map(bid => {
            const job = bid.jobs;
            if (!job) return '';
            const finalDate = bid.proposed_date || job.delivery_date;

            return `
                <article class="job-card is-mine">
                    <div class="job-head">
                        ${ui.pill('Assigned to you', 'go', 'ri-truck-fill')}
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    ${ui.route(job)}
                    ${ui.facts(job, { date: finalDate, dateLabel: 'Agreed delivery', delivered: !!job.do_url })}
                    ${ui.photos(job)}
                    ${ui.remarks(job.remarks)}
                    ${ui.doSlip(job)}
                    <div class="job-foot">
                        ${ui.price('Your price', bid.proposed_price)}
                        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                        <label class="btn ${job.do_url ? 'btn-secondary' : 'btn-primary'} btn-sm" style="cursor:pointer">
                            <i class="ri-upload-2-line"></i> ${job.do_url ? 'Replace DO' : 'Upload DO'}
                            <input type="file" accept="image/*,application/pdf" hidden data-job-id="${ui.esc(job.id)}" ${job.do_url ? `onclick="if(!confirm('This will replace the DO you already uploaded. Continue?')) event.preventDefault()"` : ''} onchange="app.uploadDO(this)">
                        </label>
                        <span class="hint">Image or PDF, max 10 MB</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    },

    renderRTJobs(jobs) {
        const container = document.getElementById('rt-jobs-container');
        if (jobs.length === 0) {
            container.innerHTML = ui.empty('ri-inbox-line', 'No jobs yet', 'Post a job and transporters can start bidding.');
            return;
        }

        container.innerHTML = jobs.map(job => {
            const isAssigned = job.status === 'assigned';
            const id = ui.esc(job.id);

            return `
                <article class="job-card">
                    <div class="job-head">
                        ${isAssigned ? ui.pill('Assigned', 'go', 'ri-check-line') : ui.pill('Open for bids', 'info')}
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    ${ui.route(job)}
                    ${ui.facts(job, { po: true, date: job.delivery_date, delivered: isAssigned && !!job.do_url })}
                    <div class="job-foot">
                        ${ui.price('Budget', job.offered_price)}
                        <div class="actions">
                            ${isAssigned
                                ? `<button class="btn btn-secondary btn-sm" data-id="${id}" onclick="app.viewBids(this.dataset.id)">Assigned details</button>
                                   <button class="btn btn-warn btn-sm" data-id="${id}" onclick="app.unassignJob(this.dataset.id)">Undo</button>`
                                : `<button class="btn btn-primary btn-sm" data-id="${id}" onclick="app.viewBids(this.dataset.id)">View bids</button>`
                            }
                            <button class="btn btn-danger-ghost btn-sm btn-icon" data-id="${id}" onclick="app.deleteJob(this.dataset.id)" aria-label="Remove job" title="Remove job"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    },

    renderTransporterJobs(jobs) {
        const banned = this.isBanned();
        let bannerHtml = '';

        if (banned) {
            bannerHtml = `
                <div class="banner banner-stop">
                    <div class="banner-title"><i class="ri-error-warning-fill"></i> Account suspended</div>
                    <p>You can't accept or bid on new jobs for now. You can still browse the board.</p>
                    <p class="countdown" id="ban-countdown">Calculating remaining time...</p>
                </div>
            `;
            this.startBanCountdown();
        } else if (this.banTimer) {
            clearInterval(this.banTimer); // unbanned or ban expired: stop the old countdown
            this.banTimer = null;
        }

        if (jobs.length === 0) {
            transporterJobsContainer.innerHTML = bannerHtml + ui.empty('ri-truck-line', 'No open jobs right now', 'New loads appear here as soon as they are posted.');
            return;
        }

        const jobsHtml = jobs.map(job => {
            const id = ui.esc(job.id);
            const price = Number(job.offered_price);

            // What this transporter has already offered on this job (lowest bid wins the label)
            const mine = (this.myBidsByJob || {})[String(job.id)] || [];
            let bidNotice = '';
            if (mine.length) {
                const best = mine.reduce((a, b) => Number(b.proposed_price) < Number(a.proposed_price) ? b : a);
                const bestPrice = Number(best.proposed_price);
                const kind = (bestPrice === price && !best.proposed_date) ? 'You accepted at the posted price' : 'Your bid';
                const dateBit = (best.proposed_date && best.proposed_date !== job.delivery_date)
                    ? `, delivery ${ui.fmtDate(best.proposed_date)}` : '';
                const countBit = mine.length > 1 ? ` (${mine.length} bids, lowest shown)` : '';
                bidNotice = `<div class="notice notice-info"><i class="ri-price-tag-3-line"></i><span>${ui.esc(kind)}: <b>RM ${ui.money(bestPrice)}</b>${dateBit}${countBit}. Waiting for approval.</span></div>`;
            }

            const actions = banned
                ? `<button class="btn btn-secondary" disabled><i class="ri-lock-line"></i> Suspended</button>`
                : `<button class="btn btn-go" data-id="${id}" data-price="${price}"
                           onclick="app.quickAccept(this.dataset.id, Number(this.dataset.price))">Accept job</button>
                   <button class="btn btn-secondary" data-id="${id}" data-date="${ui.esc(job.delivery_date)}" data-price="${price}"
                           onclick="app.prepareCounterOffer(this.dataset.id, this.dataset.date, Number(this.dataset.price))">Counter-offer</button>`;

            return `
                <article class="job-card${banned ? ' is-dim' : ''}">
                    <div class="job-head">
                        <span style="display:inline-flex;gap:6px;flex-wrap:wrap">${ui.pill('Open', 'go')}${mine.length ? ui.pill('Bid sent', 'info', 'ri-check-line') : ''}</span>
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    ${ui.route(job)}
                    ${ui.facts(job, { date: job.delivery_date })}
                    ${ui.photos(job)}
                    ${ui.remarks(job.remarks)}
                    ${bidNotice}
                    <div class="job-foot">
                        ${ui.price('Offered price', price)}
                        <div class="actions-wide">${actions}</div>
                    </div>
                </article>
            `;
        }).join('');

        transporterJobsContainer.innerHTML = bannerHtml + jobsHtml;
    },

	async fetchRecentMarketActivity(silent = false) {
        const container = document.getElementById('recent-activity-container');
        if (!container) return;
        
        if (!silent) container.innerHTML = ui.skeleton(2, 64);
        
        const { data: jobs, error } = await supabaseClient
            .from('jobs')
            .select('*')
            .eq('status', 'assigned')
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (error) {
            console.error("Error fetching market activity:", error);
            if (!silent) container.innerHTML = '';
            return;
        }
        
        if (silent && !this.viewIs('transporterHome')) return;
        const sig = JSON.stringify(jobs);
        if (silent && sig === this.lastSig.recent) return;
        this.lastSig.recent = sig;
        this.renderRecentMarketActivity(jobs);
    },

    renderRecentMarketActivity(jobs) {
        const container = document.getElementById('recent-activity-container');
        if (jobs.length === 0) {
            container.innerHTML = ui.empty('ri-history-line', 'No awards yet', 'Awarded loads will be listed here.');
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="activity-row">
                <div>
                    <p class="activity-route">${ui.esc(job.source_loc)} to ${ui.esc(job.dest_loc)}</p>
                    <p class="activity-meta">${ui.esc(job.quantity)} ${ui.esc(job.item_desc)}, posted ${ui.fmtDate(job.created_at)}</p>
                </div>
                <div class="activity-price">
                    <b>RM ${ui.money(job.accepted_price ?? job.offered_price)}</b>
                    <span>Awarded at</span>
                </div>
            </div>
        `).join('');
    },

    // ==========================================
    // --- WHATSAPP NOTIFICATION ---
    // ==========================================
  async sendAdminWhatsAppAlert(actionType, jobId, price) {
    try {
        const { data, error } = await supabaseClient.functions.invoke('send-whatsapp', {
            body: { 
                actionType: actionType, 
                jobId: jobId, 
                price: price,
                transporterId: this.currentUser.id 
            }
        });

        if (error) {
            console.error("Supabase Edge Function Error:", error);
        } else {
            console.log("WhatsApp alert triggered securely via backend!", data);
        }
    } catch (error) {
        console.error("Failed to trigger WhatsApp alert:", error);
    }
}

}; 

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
