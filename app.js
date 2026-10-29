// ==========================================
// 1. SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://xxjqzsaqbyaskiqvplrb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4anF6c2FxYnlhc2tpcXZwbHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MTY1MTksImV4cCI6MjEwODI5MjUxOX0.2B5IuAVjqCwBWJ_90JFVXKW_BLUv2Nwtiks_oOYYrq0'; 

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const RT_ADMIN_EMAIL = 'testing@gmail.com';

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
    rtHistory: document.getElementById('view-rt-history'),
    rtTransporters: document.getElementById('view-rt-transporters'),
	counterOffer: document.getElementById('view-counter-offer'),
	rtReviewBids: document.getElementById('view-rt-review-bids'),
    customerHistory: document.getElementById('view-customer-history'),
    transporterHistory: document.getElementById('view-transporter-history'),
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
        else if (/success|sent|posted|placed|published|awarded|accepted|submitted|removed|undone|uploaded|uploading|cancelled|updated|restored|rejected|deleted|resubmitted/i.test(m)) tone = 'success';
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
    downloadUrl(url, name = 'Delivery-Order') {
        const clean = String(url || '').split(/[?#]/)[0];
        const ext = (clean.match(/\.(\w+)$/) || [])[1] || 'file';
        return url + (String(url).includes('?') ? '&' : '?') + 'download=' + encodeURIComponent(name + '.' + ext);
    },
    fmtDateTime(iso) {
        const d = new Date(iso);
        if (!iso || isNaN(d)) return 'Unknown time';
        return this.esc(d.toLocaleString('en-MY', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        }));
    },
    posted(iso, label = 'Posted') { return iso ? `${label} ${this.fmtDateTime(iso)}` : ''; },
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
    // Extra drop-offs saved on a job (jobs.extra_stops, a JSON list of {loc, link}).
    // Returns [] for ordinary single-drop-off jobs, so nothing extra is ever drawn for them.
    stops(job) {
        let raw = job && job.extra_stops;
        if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = []; } }
        if (!Array.isArray(raw)) return [];
        return raw
            .filter(s => s && typeof s.loc === 'string' && s.loc.trim())
            .map(s => ({ loc: s.loc, link: typeof s.link === 'string' ? s.link : '' }));
    },
    // Person in charge + phone for each stop, saved on jobs.contacts as
    //   { pickup: { pic, phone }, drops: [{ pic, phone }, ...] }   (drops[0] = main drop-off, then the extra ones)
    contactsOf(job) {
        let c = job && job.contacts;
        if (typeof c === 'string') { try { c = JSON.parse(c); } catch { c = null; } }
        if (!c || typeof c !== 'object') c = {};
        const one = (x) => (x && typeof x === 'object')
            ? { pic: String(x.pic || '').trim(), phone: String(x.phone || '').trim() }
            : { pic: '', phone: '' };
        return {
            pickup: one(c.pickup),
            drops: Array.isArray(c.drops) ? c.drops.map(one) : []
        };
    },
    hasContacts(job) {
        const c = this.contactsOf(job);
        return !!(c.pickup.pic || c.pickup.phone || c.drops.some(d => d.pic || d.phone));
    },
    contactLine(p) {
        if (!p || (!p.pic && !p.phone)) return '';
        const digits = String(p.phone || '').replace(/[^\d+]/g, '');
        const who = p.pic ? `<span><i class="ri-user-3-line"></i> ${this.esc(p.pic)}</span>` : '';
        const tel = p.phone
            ? (digits ? `<a href="tel:${this.esc(digits)}"><i class="ri-phone-line"></i> ${this.esc(p.phone)}</a>` : `<span>${this.esc(p.phone)}</span>`)
            : '';
        return `<span class="route-contact">${who}${tel}</span>`;
    },
    // contacts: false hides the phone numbers (used on the open job board; they show once a job is assigned)
    route(job, { contacts = true } = {}) {
        const drops = [{ loc: job.dest_loc, link: job.dest_maps_link }, ...this.stops(job)];
        const multi = drops.length > 1;
        const cs = contacts ? this.contactsOf(job) : null;
        const dropHtml = drops.map((d, i) => {
            const last = i === drops.length - 1;
            const label = multi ? `Open drop-off ${i + 1} in Maps` : 'Open drop-off in Maps';
            const tag = multi ? `<span class="route-tag">Drop-off ${i + 1}</span>` : '';
            const line = cs ? this.contactLine(cs.drops[i]) : '';
            return `<li class="route-stop ${last ? 'route-to' : 'route-via'}${line ? ' has-contact' : ''}"><span class="route-place">${this.esc(this.place(d.loc))}</span>${tag}${this.mapLink(d.link, label)}${line}</li>`;
        }).join('');
        const pickLine = cs ? this.contactLine(cs.pickup) : '';
        return `
            <ol class="route">
                <li class="route-stop route-from${pickLine ? ' has-contact' : ''}"><span class="route-place">${this.esc(this.place(job.source_loc))}</span>${this.mapLink(job.source_maps_link, 'Open pickup in Maps')}${pickLine}</li>
                ${dropHtml}
            </ol>`;
    },
    facts(job, { date = '', dateLabel = 'Delivery', delivered = false } = {}) {
        const items = [];
        items.push(`<li class="fact"><i class="ri-box-3-line"></i>${this.esc(job.quantity)} ${this.esc(job.item_desc)}</li>`);
        const extraDrops = this.stops(job).length;
        if (extraDrops) items.push(`<li class="fact"><i class="ri-route-line"></i>${extraDrops + 1} drop-offs</li>`);
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
    isPdf(url) {
        return /\.pdf$/i.test(String(url || '').split(/[?#]/)[0]);
    },
    // ---- Delivery Orders (DO) ----
    // A job with one drop-off has one DO (jobs.do_url). A job with several drop-offs keeps one DO per drop-off in
    // jobs.dos ([{ stop, url, uploaded_at }], stop 0 = the main drop-off) and only gets do_url (= delivered)
    // once every drop-off has its DO. Older jobs just have do_url.
    parseDos(job) {
        let raw = job && job.dos;
        if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = null; } }
        if (!Array.isArray(raw)) return [];
        return raw
            .map(d => ({ stop: Number(d && d.stop) || 0, url: app.safeUrl(d && d.url), uploaded_at: d && d.uploaded_at }))
            .filter(d => d.url)
            .sort((a, b) => a.stop - b.stop);
    },
    dropLabel(job, i) {
        const drops = [job.dest_loc, ...this.stops(job).map(s => s.loc)];
        return `Drop-off ${i + 1}` + (drops[i] ? ` · ${this.place(drops[i])}` : '');
    },
    dosOf(job) {
        if (!job) return [];
        const list = this.parseDos(job);
        if (list.length) return list.map(d => ({ ...d, label: this.dropLabel(job, d.stop) }));
        return job.do_url ? [{ stop: 0, label: '', url: job.do_url, uploaded_at: job.do_uploaded_at }] : [];
    },
    doSlip(job, { showTime = false, timeLabel = 'Uploaded', download = false } = {}) {
        const items = this.dosOf(job);
        if (!items.length) return '';
        const muted = (text) => `<span style="font-weight:400;font-size:.75rem;color:var(--muted)">${this.esc(text)}</span>`;
        const timeOf = (d) => (showTime && d.uploaded_at) ? muted(`${timeLabel} ${this.fmtDateTime(d.uploaded_at)}`) : '';
        const thumbOf = (rawUrl) => {
            const url = this.esc(rawUrl);
            return this.isPdf(rawUrl)
                ? `<a class="photo-thumb is-file" href="${url}" target="_blank" rel="noopener noreferrer" title="Open DO (PDF)">
                    <i class="ri-file-pdf-2-line"></i><span>PDF</span>
                </a>`
                : `<a class="photo-thumb" href="${url}" target="_blank" rel="noopener noreferrer">
                    <img src="${url}" alt="Delivery Order" loading="lazy">
                </a>`;
        };
        const dlOf = (rawUrl, name) => download
            ? `<a class="btn btn-secondary btn-sm" href="${this.esc(this.downloadUrl(rawUrl, name))}" download><i class="ri-download-2-line"></i> Download</a>`
            : '';

        // One DO: one grey box (same look as Remarks): title + time on top, thumbnail + download below
        if (!items[0].label) {
            const d = items[0];
            return `<div class="remarks do-block">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 12px"><b>Delivery Order (DO)</b>${timeOf(d)}</div>
            <div class="photo-strip is-small" style="align-items:center;gap:12px;margin-top:8px">${thumbOf(d.url)}${dlOf(d.url)}</div>
        </div>`;
        }

        // One DO per drop-off
        const total = this.stops(job).length + 1;
        return `<div class="remarks do-block">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 12px"><b>Delivery Orders (DO)</b>${muted(`${items.length} of ${total} uploaded`)}</div>
            ${items.map(d => `<div class="do-item">
                <div class="do-item-head"><span>${this.esc(d.label)}</span>${timeOf(d)}</div>
                <div class="photo-strip is-small" style="align-items:center;gap:12px;margin-top:6px">${thumbOf(d.url)}${dlOf(d.url, 'Delivery-Order-Drop-off-' + (d.stop + 1))}</div>
            </div>`).join('')}
        </div>`;
    },
    // Transporter: a job with several drop-offs gets one upload button per drop-off
    doStopMode(job) {
        return this.stops(job).length > 0 && (this.parseDos(job).length > 0 || !job.do_url);
    },
    doStopUploads(job) {
        if (!this.doStopMode(job)) return '';
        const have = new Set(this.parseDos(job).map(d => d.stop));
        const total = this.stops(job).length + 1;
        const rows = Array.from({ length: total }, (_, i) => {
            const done = have.has(i);
            return `<div class="do-upload-row">
                <span class="do-upload-label">${this.esc(this.dropLabel(job, i))}</span>
                <label class="btn ${done ? 'btn-secondary' : 'btn-primary'} btn-sm" style="cursor:pointer">
                    <i class="ri-upload-2-line"></i> ${done ? 'Replace DO' : 'Upload DO'}
                    <input type="file" accept="image/*,application/pdf" hidden data-job-id="${this.esc(job.id)}" data-stop="${i}" ${done ? `onclick="if(!confirm('This will replace the DO already uploaded for this drop-off. Continue?')) event.preventDefault()"` : ''} onchange="app.uploadDO(this)">
                </label>
            </div>`;
        }).join('');
        return `<div class="remarks do-uploads"><b>Upload one DO for each drop-off</b>${rows}<span class="hint">Image or PDF, max 10 MB. The job counts as delivered once every drop-off has its DO.</span></div>`;
    },
    // What the admin still has to chase on a customer's delivered job:
    // 'po' = the customer's PO is not in yet, 'inv' = the PO is in but our invoice is not. Jobs the admin posted himself have no customer, so nothing is flagged.
    todoOf(job) {
        if (!job || job.status !== 'assigned' || !job.do_url || !job.customers) return '';
        if (!job.customer_po) return 'po';
        if (!job.invoice_file) return 'inv';
        return '';
    },
    // A document attached to a job but stored apart from it, so transporters never receive it:
    //   job.customer_po   = { url, uploaded_at }  the customer's own PO (uploaded after delivery)
    //   job.invoice_file  = { url, uploaded_at }  our invoice (INV), uploaded by the admin, downloadable by the customer
    docSlip(doc, job, { title, noun, handler, dlName, emptyText = '', download = false, upload = false, cls = '' } = {}) {
        const blockCls = 'remarks do-block' + (cls ? ' ' + this.esc(cls) : '');
        const sm = cls ? '' : ' btn-sm'; // a highlighted block gets full-size buttons
        const url = doc ? app.safeUrl(doc.url) : '';
        if (!url && !upload) return '';
        const uploadBtn = upload
            ? `<label class="btn ${url ? 'btn-secondary' : 'btn-primary'}${sm}" style="cursor:pointer">
                    <i class="ri-upload-2-line"></i> ${url ? 'Replace' : 'Upload'} ${this.esc(noun)}
                    <input type="file" accept="image/*,application/pdf" hidden data-job-id="${this.esc(job.id)}" ${url ? `onclick="if(!confirm('This will replace the ${this.esc(noun)} already uploaded. Continue?')) event.preventDefault()"` : ''} onchange="app.${handler}(this)">
                </label>`
            : '';
        if (!url) {
            return `<div class="${blockCls}">
                <b>${this.esc(title)}</b>
                ${emptyText ? `<p style="margin:4px 0 8px;font-size:.8125rem;color:var(--muted)">${this.esc(emptyText)}</p>` : ''}
                ${uploadBtn}
            </div>`;
        }
        const when = doc.uploaded_at
            ? `<span style="font-weight:400;font-size:.75rem;color:var(--muted)">Uploaded ${this.fmtDateTime(doc.uploaded_at)}</span>`
            : '';
        const safe = this.esc(url);
        const thumb = this.isPdf(url)
            ? `<a class="photo-thumb is-file" href="${safe}" target="_blank" rel="noopener noreferrer" title="Open ${this.esc(noun)} (PDF)">
                    <i class="ri-file-pdf-2-line"></i><span>PDF</span>
                </a>`
            : `<a class="photo-thumb" href="${safe}" target="_blank" rel="noopener noreferrer">
                    <img src="${safe}" alt="${this.esc(title)}" loading="lazy">
                </a>`;
        const dl = download
            ? `<a class="btn btn-secondary${sm}" href="${this.esc(this.downloadUrl(url, dlName))}" download><i class="ri-download-2-line"></i> Download</a>`
            : '';
        return `<div class="${blockCls}">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 12px"><b>${this.esc(title)}</b>${when}</div>
            <div class="photo-strip is-small" style="align-items:center;gap:12px;margin-top:8px">${thumb}${dl}${uploadBtn}</div>
        </div>`;
    },
    poSlip(job, opts = {}) {
        return this.docSlip(job && job.customer_po, job, {
            title: 'Customer PO', noun: 'PO', handler: 'uploadCustomerPO', dlName: 'Customer-PO',
            emptyText: 'Upload your PO so we can prepare your invoice.', ...opts
        });
    },
    invSlip(job, opts = {}) {
        return this.docSlip(job && job.invoice_file, job, {
            title: 'Invoice (INV)', noun: 'INV', handler: 'uploadInvoice', dlName: 'Invoice',
            emptyText: 'Upload the invoice once it is ready. The customer will see it on their order.', ...opts
        });
    },
    fileThumb(rawUrl, title = 'Open file') {
        const url = this.esc(rawUrl);
        return this.isPdf(rawUrl)
            ? `<a class="photo-thumb is-file" href="${url}" target="_blank" rel="noopener noreferrer" title="${this.esc(title)}"><i class="ri-file-pdf-2-line"></i><span>PDF</span></a>`
            : `<a class="photo-thumb" href="${url}" target="_blank" rel="noopener noreferrer"><img src="${url}" alt="${this.esc(title)}" loading="lazy"></a>`;
    },
    // Admin version of the DO box: shows each DO and lets the admin upload or replace it (one per drop-off when there are several)
    doSlipAdmin(job) {
        const items = this.dosOf(job);
        const total = this.stops(job).length + 1;
        const head = 'display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 12px';
        const note = (html) => `<span style="font-weight:400;font-size:.75rem;color:var(--muted)">${html}</span>`;
        const when = (d) => (d && d.uploaded_at) ? note('Uploaded ' + this.fmtDateTime(d.uploaded_at)) : '';
        const upBtn = (stop, done) => `<label class="btn ${done ? 'btn-secondary' : 'btn-primary'} btn-sm" style="cursor:pointer">
                <i class="ri-upload-2-line"></i> ${done ? 'Replace DO' : 'Upload DO'}
                <input type="file" accept="image/*,application/pdf" hidden data-job-id="${this.esc(job.id)}"${stop === null ? '' : ` data-stop="${stop}"`} ${done ? `onclick="if(!confirm('This will replace the DO already uploaded. Continue?')) event.preventDefault()"` : ''} onchange="app.uploadDO(this)">
            </label>`;
        const strip = (d, stop, name) => `<div class="photo-strip is-small" style="align-items:center;gap:12px;margin-top:8px">${d ? this.fileThumb(d.url, 'Delivery Order') + `<a class="btn btn-secondary btn-sm" href="${this.esc(this.downloadUrl(d.url, name))}" download><i class="ri-download-2-line"></i> Download</a>` : ''}${upBtn(stop, !!d)}</div>`;
        if (total === 1) {
            const d = items[0] || null;
            return `<div class="remarks do-block">
                <div style="${head}"><b>Delivery Order (DO)</b>${d ? when(d) : note('Not uploaded yet')}</div>
                ${strip(d, null, 'Delivery-Order')}
            </div>`;
        }
        const rows = Array.from({ length: total }, (_, i) => {
            const d = items.find(x => x.stop === i) || null;
            return `<div class="do-item">
                <div class="do-item-head"><span>${this.esc(this.dropLabel(job, i))}</span>${when(d)}</div>
                ${strip(d, i, 'Delivery-Order-Drop-off-' + (i + 1))}
            </div>`;
        }).join('');
        return `<div class="remarks do-block">
            <div style="${head}"><b>Delivery Orders (DO)</b>${note(`${items.length} of ${total} uploaded`)}</div>
            ${rows}
        </div>`;
    },
    remarks(text) {
        return text ? `<p class="remarks"><b>Remarks:</b> ${this.esc(text)}</p>` : '';
    },
    // ----- customer rating of the transporter (optional) -----
    // Five stars, read-only. n is rounded to a whole star.
    stars(n) {
        const v = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
        return `<span class="stars" role="img" aria-label="${v} out of 5 stars">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= v ? 'ri-star-fill' : 'ri-star-line'}"></i>`).join('')}</span>`;
    },
    // Admin: one read-only line on a delivered job. Nothing is drawn for jobs nobody rated.
    ratingLine(job) {
        const r = job && job.customer_rating;
        if (!r) return '';
        return `<p class="remarks"><b>Customer rating:</b> ${this.stars(r.rating)}</p>`;
    },
    // Customer: the box on a delivered order. Tap a star and it is saved straight away; tap another star to change it.
    ratingBox(job) {
        if (app.noRatings) return ''; // the rating columns are not set up in Supabase yet: show nothing rather than a broken box
        const id = this.esc(job.id);
        const picked = job.customer_rating ? job.customer_rating.rating : 0;
        const busy = app.ratingBusy === String(job.id);
        const star = (n) => `<button type="button" role="radio" class="rate-star${n <= picked ? ' is-on' : ''}" aria-checked="${n === picked}" aria-label="${n} star${n === 1 ? '' : 's'}"${busy ? ' disabled' : ''} data-id="${id}" data-n="${n}" onclick="app.rate(this.dataset.id, Number(this.dataset.n))"><i class="${n <= picked ? 'ri-star-fill' : 'ri-star-line'}"></i></button>`;
        return `
            <div class="rate-box" data-job="${id}">
                <div class="rate-head"><b>${picked ? 'Your rating' : 'How was the delivery?'}</b><span class="hint">${picked ? 'Tap a star to change' : 'Optional'}</span></div>
                <div class="rate-stars" role="radiogroup" aria-label="Rate the transporter from 1 to 5 stars">${[1, 2, 3, 4, 5].map(star).join('')}</div>
            </div>`;
    },
    // Only jobs that came from a customer have one; jobs the admin posted directly show nothing
    customerLine(job) {
        const c = job && job.customers;
        return (c && c.company_name) ? `<p class="remarks"><b>Customer:</b> ${this.esc(c.company_name)}</p>` : '';
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
    factory: null,           // customer's saved pickup {loc, link}, or null
    editingHadStops: false,
    editingWasRejected: false, // the order being edited was rejected, so saving it resubmits it
    submittingOrder: false,
    confirmReturnFocus: null,
    MAX_EXTRA_STOPS: 4,      // so a job can have up to 5 drop-offs in total
    rtMonth: '',             // Jobs page: chosen delivery month ('' = all), e.g. '2026-10'
    histMonth: { admin: '', customer: '', transporter: '' },  // History pages: chosen month ('' = this month)
    histCounts: { admin: {} },  // admin History: archived jobs per delivery month
    histReq: 0,              // newest admin History request (drops answers that arrive late)
    myHistoryBids: [],
    tpData: null,            // Transporters tab: loaded bids, transporters, cancellations and ratings
    ratingBusy: null,        // customer: id of the order whose rating is being saved (blocks a second tap meanwhile)
    noRatings: false,        // set when the rating columns are not in job_docs yet (the rating box is then hidden)
    tpMonth: '',             // Transporters tab: chosen month ('' = not chosen yet, 'all' = all time)
    cardOpen: {},            // customer Orders list: job id -> true (expanded) / false (collapsed). Survives auto-refresh.
    cardTouched: {},         // job ids the customer opened/closed themselves: only these are saved on the device
    cardLoadedFor: null,     // user id whose saved choices are loaded into cardOpen

    async init() {
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('post-job-form').addEventListener('submit', (e) => this.submitNewJob(e));
        document.getElementById('job-item').addEventListener('change', () => this.toggleOtherItem());
        // Step 1 of ordering: show the summary. Nothing is uploaded or sent until it is confirmed.
        document.getElementById('customer-job-form').addEventListener('submit', (e) => this.reviewCustomerOrder(e));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('confirm-modal').classList.contains('hidden')) this.closeConfirm();
        });
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
            ? "Create a customer account to place delivery orders. We'll email you a link to confirm your address."
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
        this.factory = null;
        this.myBidsByJob = {};
        this.lastSig = {};
        this.knownRequestIds = null;
        this.knownJobIds = null;
        this.knownStages = null;
        this.currentBidsJobId = null;
        this.rtMonth = '';
        this.histMonth = { admin: '', customer: '', transporter: '' };
        this.histCounts = { admin: {} };
        this.myHistoryBids = [];
        this.tpData = null;
        this.tpMonth = '';
        this.rtJobsList = [];
        this.historyList = [];
        this.boardJobs = [];
        this.myJobsBids = [];
        this.customerHistory = [];
        this.cardOpen = {};
        this.cardTouched = {};
        this.cardLoadedFor = null;
        ['rt', 'hist', 'cust', 'board', 'mine'].forEach(p => ['search', 'from', 'to'].forEach(id => {
            const el = document.getElementById(p + '-' + id);
            if (el) el.value = '';
        }));
        
        // Hide UI elements
        btnLogout.classList.add('hidden');
        navs.container.classList.add('hidden');
        navs.rt.classList.replace('flex', 'hidden');
        navs.transporter.classList.replace('flex', 'hidden');
        
        // Wipe DOM containers
        document.getElementById('rt-jobs-container').innerHTML = '';
        document.getElementById('rt-requests-container').innerHTML = '';
        document.getElementById('rt-history-container').innerHTML = '';
        document.getElementById('rt-transporters-container').innerHTML = '';
        document.getElementById('rt-months').innerHTML = '';
        ['hist-months', 'customer-hist-months', 'transporter-hist-months'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
        this.updateRequestsBadge(0);
        document.getElementById('transporter-jobs-container').innerHTML = '';
        document.getElementById('my-jobs-container').innerHTML = '';
        document.getElementById('recent-activity-container').innerHTML = '';
        document.getElementById('bids-container').innerHTML = '';
        document.getElementById('customer-jobs-container').innerHTML = '';
        document.getElementById('customer-history-container').innerHTML = '';
        document.getElementById('transporter-history-container').innerHTML = '';
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
            this.loadFactory().catch(() => {}); // fetch the saved primary address now, so New order can fill it in at once
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
    // ==========================================
    // --- EXTRA DROP-OFFS (shared by the RT form 'job' and the customer form 'cj') ---
    // Nothing is shown until someone taps "Add another drop-off".
    // ==========================================
    addStop(prefix, stop = {}) {
        const box = document.getElementById(prefix + '-extra-stops');
        if (!box) return;
        if (box.children.length >= this.MAX_EXTRA_STOPS) {
            ui.notify(`You can add up to ${this.MAX_EXTRA_STOPS} extra drop-offs.`);
            return;
        }
        const row = document.createElement('div');
        row.className = 'stop-row';
        row.innerHTML = `
            <div class="stop-head">
                <span class="label stop-title"></span>
                <button type="button" class="btn btn-danger-ghost btn-sm" onclick="app.removeStop(this)"><i class="ri-close-line"></i> Remove</button>
            </div>
            <input type="text" class="input stop-loc" placeholder="e.g. Skudai, JHR" aria-label="Extra drop-off location" maxlength="200" required>
            <input type="url" class="input stop-link" placeholder="Map link (optional)" aria-label="Extra drop-off map link">
            <div class="field-row">
                <div class="field"><input type="text" class="input stop-pic" placeholder="Person in charge (optional)" aria-label="Extra drop-off person in charge" maxlength="80" autocomplete="off"></div>
                <div class="field"><input type="tel" class="input stop-phone" placeholder="Contact number (optional)" aria-label="Extra drop-off contact number" inputmode="tel" minlength="7" maxlength="20" autocomplete="off"></div>
            </div>`;
        // values are set through the DOM, never pasted into HTML
        row.querySelector('.stop-loc').value = stop.loc || '';
        row.querySelector('.stop-link').value = stop.link || '';
        row.querySelector('.stop-pic').value = stop.pic || '';
        row.querySelector('.stop-phone').value = stop.phone || '';
        box.appendChild(row);
        this.renumberStops(prefix);
        if (!stop.loc) row.querySelector('.stop-loc').focus();
    },

    removeStop(btn) {
        const row = btn.closest('.stop-row');
        if (!row) return;
        const box = row.parentElement;
        row.remove();
        this.renumberStops(box.id.replace('-extra-stops', ''));
    },

    renumberStops(prefix) {
        const box = document.getElementById(prefix + '-extra-stops');
        if (!box) return;
        const rows = Array.from(box.querySelectorAll('.stop-row'));
        rows.forEach((r, i) => { r.querySelector('.stop-title').textContent = `Drop-off ${i + 2}`; });
        const addBtn = document.getElementById(prefix + '-add-stop');
        if (addBtn) addBtn.disabled = rows.length >= this.MAX_EXTRA_STOPS;
    },

    resetStops(prefix) {
        const box = document.getElementById(prefix + '-extra-stops');
        if (box) box.innerHTML = '';
        this.renumberStops(prefix);
    },

    fillStops(prefix, stops) {
        this.resetStops(prefix);
        (stops || []).forEach(s => this.addStop(prefix, s));
    },

    collectStops(prefix) {
        const box = document.getElementById(prefix + '-extra-stops');
        if (!box) return [];
        return Array.from(box.querySelectorAll('.stop-row'))
            .map(r => ({
                loc: r.querySelector('.stop-loc').value.trim(),
                link: r.querySelector('.stop-link').value.trim()
            }))
            .filter(s => s.loc)
            .map(s => s.link ? s : { loc: s.loc });
    },

    // Person in charge + contact number for the pickup and every drop-off.
    // Same row filter as collectStops, so drops[i] always lines up with the stops. Returns null when nothing was entered.
    collectContacts(prefix) {
        const val = (id) => { const el = document.getElementById(prefix + '-' + id); return el ? el.value.trim() : ''; };
        const box = document.getElementById(prefix + '-extra-stops');
        const rows = box ? Array.from(box.querySelectorAll('.stop-row')).filter(r => r.querySelector('.stop-loc').value.trim()) : [];
        const out = {
            pickup: { pic: val('source-pic'), phone: val('source-phone') },
            drops: [
                { pic: val('dest-pic'), phone: val('dest-phone') },
                ...rows.map(r => ({ pic: r.querySelector('.stop-pic').value.trim(), phone: r.querySelector('.stop-phone').value.trim() }))
            ]
        };
        const any = out.pickup.pic || out.pickup.phone || out.drops.some(d => d.pic || d.phone);
        return any ? out : null;
    },

    contactsError(prefix) {
        const c = this.collectContacts(prefix);
        if (!c) return '';
        const bad = (p) => p && p.phone && !(/^[0-9+\-\s()]{7,20}$/.test(p.phone) && (p.phone.match(/\d/g) || []).length >= 7);
        if (bad(c.pickup) || c.drops.some(bad)) return 'Please enter a valid contact number, for example 012-345 6789.';
        return '';
    },

    // ==========================================
    // --- CUSTOMER: saved primary address (used as the pickup) ---
    // ==========================================
    async loadFactory() {
        if (this.currentUserRole !== 'customer' || !this.currentUser) return null;
        const { data, error } = await supabaseClient
            .from('customers')
            .select('default_pickup_loc, default_pickup_link')
            .eq('id', this.currentUser.id)
            .maybeSingle();
        if (error) {
            // e.g. the database columns have not been added yet: just behave as "no saved address"
            console.warn('Primary address not available:', error.message);
            this.factory = null;
            return null;
        }
        this.factory = (data && data.default_pickup_loc)
            ? { loc: data.default_pickup_loc, link: data.default_pickup_link || '' }
            : null;
        return this.factory;
    },

    updateFactoryButton() {
        const btn = document.getElementById('cj-use-factory');
        if (btn) btn.style.display = this.factory ? '' : 'none';
        // Show the saved primary address itself (textContent: never parsed as HTML)
        const box = document.getElementById('cj-primary-display');
        const text = document.getElementById('cj-primary-text');
        if (box && text) {
            text.textContent = this.factory ? ui.place(this.factory.loc) : '';
            box.style.display = this.factory ? '' : 'none';
        }
    },

    useFactory() {
        if (!this.factory) return;
        document.getElementById('cj-source').value = this.factory.loc;
        document.getElementById('cj-source-link').value = this.factory.link || '';
    },

    async saveFactory(loc, link) {
        if (this.factory && this.factory.loc === loc && (this.factory.link || '') === (link || '')) return; // unchanged
        const { error } = await supabaseClient.rpc('save_my_factory', { p_loc: loc, p_link: link || '' });
        if (error) {
            console.error(error);
            ui.notify("Your order was placed, but your primary address could not be saved: " + error.message);
            return;
        }
        this.factory = { loc, link: link || '' };
    },

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
        // Heartbeat: keep "last active" fresh while a transporter keeps the app open (at most every 5 min)
        if (this.currentUserRole === 'transporter' && Date.now() - (this.lastPing || 0) > 5 * 60 * 1000) {
            this.lastPing = Date.now();
            this.updateActivityStatus();
        }
        switch (this.currentView) {
            case 'rtHome':
            case 'rtRequests':
                this.fetchJobsForRT(true); break;
            case 'rtHistory':
                this.fetchHistoryForRT(true); break;
            case 'rtTransporters':
                this.fetchTransporterStats(true); break;
            case 'rtReviewBids':
                if (this.currentBidsJobId) this.viewBids(this.currentBidsJobId, true);
                break;
            case 'transporterHome':
                this.fetchJobsForTransporter(true);
                this.fetchRecentMarketActivity(true);
                break;
            case 'transporterMyJobs':
            case 'transporterHistory':
                this.fetchMyJobs(true); break;
            case 'customerHome':
            case 'customerHistory':
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
        await this.attachJobDocs(jobs);
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
        this.renderRTJobs(all.filter(j => j.status !== 'pending_review' && j.status !== 'rejected'));
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

    showRtHistory() {
        ui.setTab('history');
        this.showView('rtHistory');
        this.fetchHistoryForRT();
    },

    async fetchHistoryForRT(silent = false) {
        const container = document.getElementById('rt-history-container');
        if (!silent) container.innerHTML = ui.skeleton(3);

        // Only the chosen month is loaded (plus a light list of dates for the month buttons),
        // so History stays fast and never hits the 1000-row limit however many jobs pile up.
        const req = this.histReq = (this.histReq || 0) + 1;
        const month = this.histMonthOf('admin');
        const [jobsRes, datesRes] = await Promise.all([
            this.fetchAllRows(() => supabaseClient
                .from('jobs')
                .select('*, customers(company_name, contact_person, phone)')
                .eq('status', 'archived')
                .gte('delivery_date', month + '-01')
                .lt('delivery_date', this.nextMonthKey(month) + '-01')
                .order('created_at', { ascending: false })
                .order('id')),
            this.fetchAllRows(() => supabaseClient
                .from('jobs')
                .select('delivery_date')
                .eq('status', 'archived')
                .order('delivery_date')
                .order('id'))
        ]);
        if (req !== this.histReq) return;   // a newer request (another month) is already on its way

        if (jobsRes.error) {
            console.error(jobsRes.error);
            if (!silent) container.innerHTML = ui.errorBlock('Check your connection and try again.');
            return;
        }
        if (datesRes.error) console.error('Could not load history months:', datesRes.error);

        const jobs = jobsRes.data || [];
        await this.attachJobDocs(jobs);
        if (req !== this.histReq) return;

        if (silent && !this.viewIs('rtHistory')) return;
        const counts = datesRes.error ? { [month]: jobs.length } : this.countByMonth(datesRes.data || [], r => r.delivery_date);
        const sig = JSON.stringify({ month, jobs, counts });
        if (silent && sig === this.lastSig.history) return;
        this.lastSig.history = sig;

        this.histCounts.admin = counts;
        this.renderRTHistory(jobs);
    },

    renderRTHistory(allJobs) {
        this.historyList = allJobs;
        const month = this.histMonthOf('admin');
        const counts = this.histCounts.admin || {};
        this.renderHistChips('hist-months', counts, month, 'admin');
        const container = document.getElementById('rt-history-container');
        if (allJobs.length === 0) {
            this.updateFilterUi('hist', 0, 0);
            const older = Object.keys(counts).some(k => k !== month && counts[k] > 0);
            container.innerHTML = ui.empty('ri-history-line', 'No history in ' + this.monthLabel(month),
                older ? 'Pick an earlier month above to see older jobs.' : 'Jobs you remove from the active list will appear here.');
            return;
        }
        const jobs = this.filterJobs(allJobs, 'hist');
        this.updateFilterUi('hist', jobs.length, allJobs.length);
        if (jobs.length === 0) {
            container.innerHTML = ui.empty('ri-search-line', 'No matching jobs', 'Nothing in ' + this.monthLabel(month) + ' matches. Try a different name, or pick another month.');
            return;
        }

        container.innerHTML = jobs.map(job => {
            const id = ui.esc(job.id);
            const isAssigned = !!job.assigned_at;
            const priceLabel = isAssigned ? 'Accepted price' : (job.offered_price ? 'Budget' : 'Expected price');
            const price = job.accepted_price ?? job.offered_price ?? job.customer_expected_price;
            if (!(job.id in this.cardOpen)) this.cardOpen[job.id] = false;
            const open = this.cardOpen[job.id];

            return `
                <article class="job-card${open ? '' : ' is-collapsed'}" data-job="${id}">
                    <div class="job-head">
                        ${ui.pill('Completed', 'go', 'ri-check-double-line')}
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    ${this.adminSummary(job)}
                    <div class="job-body" id="jb-${id}">
                        ${ui.customerLine(job)}
                        ${ui.route(job)}
                        ${ui.facts(job, { date: job.delivery_date, delivered: !!job.do_url })}
                        ${this.adminDocs(job)}
                        ${ui.ratingLine(job)}
                    </div>
                    ${this.adminToggle(id, open)}
                    <div class="job-foot">
                        ${ui.price(priceLabel, price)}
                        <div class="actions">
                            <button class="btn btn-secondary btn-sm" data-id="${id}" onclick="app.restoreJob(this.dataset.id)"><i class="ri-refresh-line"></i> Restore</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    },

    // ==========================================
    // --- SEARCH & DATE FILTER (Jobs and History) ---
    // prefix: 'rt' = Jobs page, 'hist' = History page.
    // Works on the list already loaded, so the 20s auto-refresh keeps the filter in place.
    // ==========================================
    getJobFilter(prefix) {
        const val = (id) => { const el = document.getElementById(prefix + '-' + id); return el ? el.value.trim() : ''; };
        const q = val('search').toLowerCase();
        const from = val('from');
        const to = val('to');
        const month = prefix === 'rt' ? (this.rtMonth || '') : '';
        return { q, from, to, month, active: !!(q || from || to || month) };
    },

    // true when the date is inside the chosen from/to range (or no range is chosen)
    dateInRange(f, raw) {
        if (!f.from && !f.to) return true;
        const day = String(raw || '').slice(0, 10); // YYYY-MM-DD, so plain text comparison works
        if (!day) return false;
        if (f.from && day < f.from) return false;
        if (f.to && day > f.to) return false;
        return true;
    },

    filterJobs(jobs, prefix, opts = {}) {
        const f = this.getJobFilter(prefix);
        if (opts.ignoreMonth) { f.month = ''; f.active = !!(f.q || f.from || f.to); }
        if (!f.active) return jobs;
        const words = f.q.split(/\s+/).filter(Boolean);
        return jobs.filter(j => {
            if (!this.dateInRange(f, j.delivery_date)) return false;
            if (f.month && this.monthKey(j.delivery_date) !== f.month) return false;
            if (!words.length) return true;
            const c = j.customers || {};
            const cs = ui.contactsOf(j);
            const hay = [
                c.company_name, c.contact_person,
                j.source_loc, j.dest_loc, ...ui.stops(j).map(s => s.loc),
                j.item_desc, j.remarks,
                cs.pickup.pic, cs.pickup.phone, ...cs.drops.flatMap(d => [d.pic, d.phone])
            ].filter(Boolean).join(' ').toLowerCase();
            return words.every(w => hay.includes(w)); // every word must match somewhere
        });
    },

    updateFilterUi(prefix, shown, total) {
        const f = this.getJobFilter(prefix);
        const count = document.getElementById(prefix + '-count');
        const clear = document.getElementById(prefix + '-clear');
        if (count) count.textContent = (f.active && total) ? `Showing ${shown} of ${total}` : '';
        if (clear) clear.style.display = f.active ? '' : 'none';
        const meta = (count || clear) && (count || clear).closest('.filter-meta');
        if (meta && meta.hasAttribute('data-idle-hide')) meta.classList.toggle('is-on', f.active);
    },

    applyJobFilter(prefix) {
        if (prefix === 'hist') this.renderRTHistory(this.historyList || []);
        else if (prefix === 'cust') this.renderCustomerJobs();
        else if (prefix === 'board') this.renderTransporterJobs(this.boardJobs || []);
        else if (prefix === 'mine') this.renderMyJobs(this.myJobsBids || []);
        else this.renderRTJobs(this.rtJobsList || []);
    },

    clearJobFilter(prefix) {
        if (prefix === 'rt') this.rtMonth = '';
        ['search', 'from', 'to'].forEach(id => {
            const el = document.getElementById(prefix + '-' + id);
            if (el) el.value = '';
        });
        this.applyJobFilter(prefix);
    },

    async restoreJob(jobId) {
        if (!confirm("Are you sure you want to restore this job back to the active list?")) return;

        // Automatically determine if it should go back to "assigned" or "open" based on its history
        // A job goes back to "assigned" if any sign of an award is left: assignment time, a DO,
        // an accepted bid, or a PO / invoice. Only a job with none of these goes back to "open".
        const { data: job } = await supabaseClient.from('jobs').select('assigned_at, do_url').eq('id', jobId).single();
        let awarded = !!(job && (job.assigned_at || job.do_url));
        if (!awarded) {
            const [bidRes, docRes] = await Promise.all([
                supabaseClient.from('bids').select('id').eq('job_id', jobId).eq('status', 'accepted').limit(1),
                supabaseClient.from('job_docs').select('po_url, invoice_url').eq('job_id', jobId).limit(1)
            ]);
            const doc = docRes.data && docRes.data[0];
            awarded = !!((bidRes.data && bidRes.data.length) || (doc && (doc.po_url || doc.invoice_url)));
        }
        const newStatus = awarded ? 'assigned' : 'open';

        const { error } = await supabaseClient
            .from('jobs')
            .update({ status: newStatus })
            .eq('id', jobId);

        if (error) {
            ui.notify("Error restoring job: " + error.message);
        } else {
            ui.notify("Job successfully restored.");
            this.fetchHistoryForRT();
        }
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
                    ${ui.poSlip(job, { download: true })}
                    <div class="job-foot">
                        ${ui.price('Customer expected price', job.customer_expected_price)}
                        <div class="actions">
                            <button class="btn btn-primary btn-sm" data-id="${id}" onclick="app.openDraftReview(this.dataset.id)">Review</button>
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
        
        const contactProblem = this.contactsError('job');
        if (contactProblem) { ui.notify(contactProblem); return; }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Uploading & Publishing...';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75');

        const photo1Url = await this.uploadJobPhoto('job-photo-1');
        const photo2Url = await this.uploadJobPhoto('job-photo-2');

        const newJob = {
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

        // Only sent when used, so ordinary single drop-off jobs behave exactly as before
        const extraStops = this.collectStops('job');
        if (extraStops.length) newJob.extra_stops = extraStops;
        // Same idea for the contacts: only sent when filled in
        const contacts = this.collectContacts('job');
        if (contacts) newJob.contacts = contacts;

        const { error } = await supabaseClient.from('jobs').insert([newJob]);
        
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');

        if (error) {
            ui.notify("Failed to post job: " + error.message);
        } else {
            ui.notify("Job published.");
            document.getElementById('post-job-form').reset();
            this.resetStops('job');
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
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError) {
            if (!silent) container.innerHTML = ui.errorBlock(jobError.message);
            return;
        }
        await this.attachJobDocs([job]);

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
                ${ui.facts(job, { date: job.delivery_date, dateLabel: 'Original date', delivered: !!job.do_url })}
                ${ui.photos(job, true)}
                ${ui.remarks(job.remarks)}
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

        // Remember who had the job (the bid is reset below) so the Transporters tab can count the cancellation
        const { data: heldBids } = await supabaseClient
            .from('bids')
            .select('transporter_id, proposed_date')
            .eq('job_id', jobId)
            .eq('status', 'accepted');
        
        const reset = {
            status: 'open',
            accepted_price: null,
            assigned_at: null,
            do_url: null,
            do_uploaded_at: null
        };
        const known = (this.rtJobsList || []).find(j => String(j.id) === String(jobId));
        if (known && known.dos != null) reset.dos = null;
        const { data: updatedJob, error: jobError } = await supabaseClient
            .from('jobs')
            .update(reset)
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
        
        if (heldBids && heldBids.length) {
            const agreed = heldBids[0].proposed_date || (known && known.delivery_date) || null;
            const { error: cancelError } = await supabaseClient.from('job_cancellations').insert(
                heldBids.map(b => ({ job_id: String(jobId), transporter_id: b.transporter_id, delivery_date: agreed }))
            );
            if (cancelError) console.warn('Cancellation not recorded (is the job_cancellations table created?):', cancelError.message);
        }

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
        return [...(this.customerJobs || []), ...(this.customerHistory || [])].find(j => String(j.id) === String(jobId));
    },

    openCustomerForm(mode, job = null) {
        document.getElementById('customer-job-form').reset();
        this.resetStops('cj'); // form.reset() does not remove rows added with "Add another drop-off"
        this.editingJobId = mode === 'edit' ? job.id : null;
        this.editingWasRejected = mode === 'edit' && job.status === 'rejected';
        this.editingHadStops = mode === 'edit' && ui.stops(job).length > 0;
        this.editingHadContacts = mode === 'edit' && ui.hasContacts(job);
        this.toggleCustomerOtherItem();
        document.getElementById('cj-date').min = new Date().toISOString().split('T')[0];

        document.getElementById('cj-title').textContent =
            mode === 'edit' ? (this.editingWasRejected ? 'Edit & resubmit' : 'Edit order') : (mode === 'copy' ? 'Book again' : 'New order');
        document.getElementById('cj-submit').textContent =
            mode === 'edit' ? (this.editingWasRejected ? 'Resubmit order' : 'Save changes') : 'Place order';
        document.getElementById('cj-photo-hint').style.display = mode === 'edit' ? '' : 'none';

        if (job) this.fillCustomerForm(job, mode === 'edit');
        if (mode === 'copy') ui.notify("Copied from your previous order. Please set the date and price.");
        this.showView('customerNewJob');

        // Saved primary address: only show the shortcut button and the saved address.
        // The pickup is NOT filled in automatically; it is only filled when the customer taps "Use my primary address".
        this.updateFactoryButton();
        // Check again quietly, in case the address was not loaded yet or was changed on another device.
        this.loadFactory().then(() => this.updateFactoryButton());
    },

    fillCustomerForm(job, withSchedule) {
        const set = (id, v) => { document.getElementById(id).value = v == null ? '' : v; };
        set('cj-source', job.source_loc);
        set('cj-source-link', job.source_maps_link);
        set('cj-dest', job.dest_loc);
        set('cj-dest-link', job.dest_maps_link);
        const cs = ui.contactsOf(job);
        set('cj-source-pic', cs.pickup.pic);
        set('cj-source-phone', cs.pickup.phone);
        set('cj-dest-pic', (cs.drops[0] || {}).pic);
        set('cj-dest-phone', (cs.drops[0] || {}).phone);
        this.fillStops('cj', ui.stops(job).map((s, i) => ({ ...s, ...(cs.drops[i + 1] || {}) })));

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

    // Cancel an order that is waiting for approval, or delete one that was rejected.
    async cancelCustomerJob(jobId) {
        const job = this.customerJobsById(jobId);
        const rejected = !!job && job.status === 'rejected';
        if (!confirm(rejected ? "Delete this rejected order? This cannot be undone." : "Cancel this order? This cannot be undone.")) return;
        const { error } = await supabaseClient.rpc('cancel_customer_job', { p_job_id: jobId });
        if (error) {
            console.error(error);
            ui.notify((rejected ? "Failed to delete order: " : "Failed to cancel order: ") + error.message);
            return;
        }
        ui.notify(rejected ? "Order deleted." : "Order cancelled.");
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

    // The item chosen in the order form ("Others" becomes "Others: <what they typed>"), or null if it is incomplete
    customerItemDesc() {
        let itemDesc = document.getElementById('cj-item').value;
        if (itemDesc === 'Others') {
            const other = document.getElementById('cj-item-other').value.trim();
            if (!other) {
                ui.notify("Please specify the item under Others.");
                return null;
            }
            itemDesc = 'Others: ' + other;
        }
        return itemDesc;
    },

    // Step 1: the form passed the browser's checks. Show a summary; nothing is uploaded or sent yet.
    reviewCustomerOrder(e) {
        e.preventDefault();
        const itemDesc = this.customerItemDesc();
        if (!itemDesc) return;
        const contactProblem = this.contactsError('cj');
        if (contactProblem) { ui.notify(contactProblem); return; }

        const v = (id) => document.getElementById(id).value.trim();
        const stops = this.collectStops('cj');
        const drops = [v('cj-dest'), ...stops.map(s => s.loc)];
        const photoCount = ['cj-photo-1', 'cj-photo-2']
            .filter(id => { const f = document.getElementById(id).files; return f && f.length; }).length;
        const remarks = v('cj-remarks');
        const rows = [];
        const row = (label, valueHtml, cls = '') =>
            rows.push(`<div class="confirm-row ${cls}"><dt>${label}</dt><dd>${valueHtml}</dd></div>`);

        const cs = this.collectContacts('cj') || { pickup: {}, drops: [] };
        const who = (p) => (p && (p.pic || p.phone)) ? `<br><small>${[p.pic, p.phone].filter(Boolean).map(x => ui.esc(x)).join(' &middot; ')}</small>` : '';
        row('Pickup', ui.esc(v('cj-source')) + who(cs.pickup));
        row(drops.length > 1 ? 'Drop-offs' : 'Drop-off',
            drops.map((d, i) => (drops.length > 1 ? `${i + 1}. ` : '') + ui.esc(d) + who(cs.drops[i])).join('<br>'));
        row('Load', `${ui.esc(v('cj-qty'))} &times; ${ui.esc(itemDesc.replace(/^Others:\s*/, ''))}`);
        row('Unloading', document.getElementById('cj-unloading').checked ? 'Required' : 'Not needed');
        row('Delivery date', ui.fmtDate(v('cj-date')));
        row('Expected price', `RM ${ui.money(parseFloat(v('cj-price')))}`, 'is-price');
        if (remarks) row('Remarks', ui.esc(remarks));
        if (photoCount) row('Photos', `${photoCount} attached`);
        if (document.getElementById('cj-save-factory').checked) row('Primary address', 'Pickup will be saved');

        const editing = !!this.editingJobId;
        document.getElementById('confirm-body').innerHTML = rows.join('');
        document.getElementById('cj-confirm-btn').textContent = editing ? (this.editingWasRejected ? 'Confirm & resubmit' : 'Confirm changes') : 'Confirm order';
        this.confirmReturnFocus = document.activeElement;
        document.getElementById('confirm-modal').classList.remove('hidden');
        document.getElementById('cj-confirm-btn').focus();
    },

    closeConfirm() {
        if (this.submittingOrder) return; // do not let it be dismissed halfway through sending
        document.getElementById('confirm-modal').classList.add('hidden');
        if (this.confirmReturnFocus && this.confirmReturnFocus.focus) this.confirmReturnFocus.focus();
        this.confirmReturnFocus = null;
    },

    // Step 2: the customer confirmed. Upload the photos and send the order.
    async submitCustomerJob() {
        if (this.submittingOrder) return;
        const itemDesc = this.customerItemDesc();
        if (!itemDesc) { this.closeConfirm(); return; }

        this.submittingOrder = true;
        const confirmBtn = document.getElementById('cj-confirm-btn');
        const backBtn = document.getElementById('confirm-back');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Uploading & sending...';
        confirmBtn.disabled = true;
        backBtn.disabled = true;
        const restore = () => {
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
            backBtn.disabled = false;
            this.submittingOrder = false;
        };

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
        const extraStops = this.collectStops('cj');
        const editing = !!this.editingJobId;
        const editedJobId = this.editingJobId;
        const { data: rpcData, error } = editing
            ? await supabaseClient.rpc('update_customer_job', { p_job_id: editedJobId, ...payload })
            : await supabaseClient.rpc('submit_customer_job', payload);

        if (error) {
            restore(); // the summary stays open so they can try again or go back and fix something
            console.error(error);
            ui.notify("Failed to place order: " + error.message);
            return;
        }

        // Extra drop-offs are saved in a second step, so the existing submit/update functions stay untouched.
        // It is skipped entirely when not used. (For an edited order that used to have them,
        // an empty list is sent so they get cleared.)
        const jobId = editing ? editedJobId : this.extractJobId(rpcData); // null = "my newest request"
        const failed = [];
        if (extraStops.length || this.editingHadStops) {
            const { error: stopsError } = await supabaseClient.rpc('set_my_job_stops', { p_stops: extraStops, p_job_id: jobId });
            if (stopsError) { console.error(stopsError); failed.push('the extra drop-offs'); }
        }

        // Same for the contacts (person in charge + phone): their own step, and skipped when there is nothing to save or clear
        const contacts = this.collectContacts('cj');
        if (contacts || this.editingHadContacts) {
            const { error: contactsError } = await supabaseClient.rpc('set_my_job_contacts', { p_contacts: contacts, p_job_id: jobId });
            if (contactsError) { console.error(contactsError); failed.push('the contact details'); }
        }

        restore();
        document.getElementById('confirm-modal').classList.add('hidden');
        this.confirmReturnFocus = null;

        if (document.getElementById('cj-save-factory').checked) {
            await this.saveFactory(payload.p_source_loc, payload.p_source_maps_link);
        }
        if (failed.length) {
            ui.notify(`Your order was placed, but ${failed.join(' and ')} could not be saved. Please tap Edit on the order and add ${failed.length > 1 ? 'them' : 'it'} again.`);
        } else {
            ui.notify(editing ? (this.editingWasRejected ? "Order resubmitted. We will review it shortly." : "Changes saved. We will review your order shortly.") : "Order placed. We will review it shortly.");
        }
        this.editingJobId = null;
        this.editingWasRejected = false;
        this.editingHadStops = false;
        this.editingHadContacts = false;
        this.resetStops('cj');
        document.getElementById('customer-job-form').reset();
        this.toggleCustomerOtherItem();
        this.showCustomerHome();
    },

    // submit_customer_job may return the new job's id (as text, or inside a row), or nothing at all
    // ---- Customer PO and our invoice (INV) ----
    // Both are files kept apart from the job (table job_docs) so transporters never get them.
    // The customer uploads the PO once the job is delivered; we then upload the INV, which the customer can download.
    checkDocFile(file, noun) {
        const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
        if (!file.type.startsWith('image/') && !isPdf) return `Please upload the ${noun} as an image (PNG or JPG) or a PDF.`;
        if (file.size > 10 * 1024 * 1024) return `The ${noun} file is too large. Maximum size is 10 MB.`;
        return '';
    },

    // Uploads to storage and returns the public link, or null (the person is told why).
    async uploadDocFile(file, prefix, noun) {
        const err = this.checkDocFile(file, noun);
        if (err) { ui.notify(err); return null; }
        const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
        const ext = (isPdf ? 'pdf' : (file.name.split('.').pop() || 'jpg')).toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const filePath = `public/${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
        const { error } = await supabaseClient.storage.from('job-photos').upload(filePath, file);
        if (error) {
            console.error(noun + ' upload error:', error);
            ui.notify(`Failed to upload ${noun}: ` + error.message);
            return null;
        }
        return supabaseClient.storage.from('job-photos').getPublicUrl(filePath).data.publicUrl;
    },

    async saveCustomerPo(jobId, url) {
        const { error } = await supabaseClient.rpc('attach_customer_po', { p_job_id: jobId, p_url: url });
        if (error) { console.error('PO save error:', error); return false; }
        return true;
    },

    // Customer: Upload / Replace PO button on a delivered order
    async uploadCustomerPO(input) {
        const file = input.files && input.files[0];
        const jobId = input.dataset.jobId;
        if (!file || !jobId) return;
        this.uploading = Date.now(); // pauses the auto-refresh while uploading
        ui.notify('Uploading PO...');
        const url = await this.uploadDocFile(file, 'po', 'PO');
        const saved = url ? await this.saveCustomerPo(jobId, url) : false;
        this.uploading = 0;
        input.value = '';
        if (url && !saved) { ui.notify('Could not save the PO to the order. Please try again.'); return; }
        if (!saved) return;
        ui.notify('PO uploaded.');
        this.fetchCustomerJobs();
    },

    // Admin: Upload / Replace INV button on a delivered job
    async uploadInvoice(input) {
        const file = input.files && input.files[0];
        const jobId = input.dataset.jobId;
        if (!file || !jobId) return;
        this.uploading = Date.now();
        ui.notify('Uploading invoice...');
        const url = await this.uploadDocFile(file, 'inv', 'INV');
        let saved = false;
        if (url) {
            const { error } = await supabaseClient.rpc('attach_invoice', { p_job_id: jobId, p_url: url });
            if (error) { console.error('Invoice save error:', error); ui.notify('Could not save the invoice to the job: ' + error.message); }
            else saved = true;
        }
        this.uploading = 0;
        input.value = '';
        if (!saved) return;
        ui.notify('Invoice uploaded.');
        this.refreshAdminJobViews();
    },

    // Redraw whichever admin screen the INV was uploaded from
    refreshAdminJobViews() {
        if (this.viewIs('rtReviewBids') && this.currentBidsJobId) this.viewBids(this.currentBidsJobId);
        else if (this.viewIs('rtHistory')) this.fetchHistoryForRT();
        else this.fetchJobsForRT();
    },

    // Adds job.customer_po and job.invoice_file ({ url, uploaded_at } or null) to each job, from the job_docs table
    // (one row per job). These are extras: if they cannot be loaded the jobs still show. Row-level security decides
    // what comes back: a customer only gets their own, the admin gets all, transporters get none.
    async attachJobDocs(jobs) {
        if (!jobs || !jobs.length) return jobs;
        const docCols = 'job_id, po_url, po_uploaded_at, invoice_url, invoice_uploaded_at';
        const load = (cols) => {
            let query = supabaseClient.from('job_docs').select(cols);
            if (jobs.length === 1) query = query.eq('job_id', jobs[0].id);
            return query;
        };
        let { data, error } = await load(this.noRatings ? docCols : docCols + ', rating, rated_at');
        if (error && !this.noRatings && /rating|rated_at/i.test(error.message || '')) {
            // the rating columns are not added in Supabase yet: carry on without ratings (and hide the rating box)
            this.noRatings = true;
            ({ data, error } = await load(docCols));
        }
        if (error) { console.error('Documents load error:', error); return jobs; }
        const byJob = new Map((data || []).map(r => [String(r.job_id), r]));
        const pack = (url, at) => url ? { url, uploaded_at: at } : null;
        jobs.forEach(x => {
            const r = byJob.get(String(x.id));
            x.customer_po = r ? pack(r.po_url, r.po_uploaded_at) : null;
            x.invoice_file = r ? pack(r.invoice_url, r.invoice_uploaded_at) : null;
            // the customer's star rating of the transporter (customers get their own, the admin gets all)
            x.customer_rating = (r && r.rating) ? { rating: Number(r.rating), created_at: r.rated_at } : null;
        });
        return jobs;
    },

    // Adds job.contacts and job.dos to the customer's own jobs. They come from the view customer_job_extras
    // (the customer_jobs view itself is left alone). If it is not there yet the orders still show without them.
    async attachJobExtras(jobs) {
        if (!jobs || !jobs.length || this.noJobExtras) return jobs;
        const { data, error } = await supabaseClient.from('customer_job_extras').select('job_id, contacts, dos');
        if (error) {
            console.error('Job extras load error:', error);
            if (/does not exist|schema cache|relation/i.test(error.message || '')) this.noJobExtras = true; // stop asking until the page is reloaded
            return jobs;
        }
        const byJob = new Map((data || []).map(r => [String(r.job_id), r]));
        jobs.forEach(x => {
            const r = byJob.get(String(x.id));
            if (r) { x.contacts = r.contacts; x.dos = r.dos; }
        });
        return jobs;
    },

    // ==========================================
    // --- CUSTOMER: rate the transporter (optional, after delivery) ---
    // One tap on a star saves the rating. The customer never sees who the transporter is:
    // the database works that out from the awarded bid.
    // ==========================================
    // Redraws just the rating box of one order (not the whole list), so scrolling is not disturbed
    redrawRating(jobId) {
        const id = String(jobId);
        const job = this.customerJobsById(id);
        if (!job) return;
        [...document.querySelectorAll('.rate-box')].filter(el => el.dataset.job === id).forEach(el => {
            const tpl = document.createElement('template');
            tpl.innerHTML = ui.ratingBox(job).trim();
            el.replaceWith(tpl.content.firstElementChild);
        });
    },

    async rate(jobId, n) {
        const id = String(jobId);
        const job = this.customerJobsById(id);
        const stars = Math.max(1, Math.min(5, Number(n) || 0));
        if (!job || this.ratingBusy) return;
        const before = job.customer_rating;
        if (before && before.rating === stars) return; // same star again: nothing to save
        this.ratingBusy = id;
        job.customer_rating = { rating: stars, created_at: new Date().toISOString() }; // show it at once
        this.redrawRating(id);
        const { error } = await supabaseClient.rpc('rate_transporter', { p_job_id: id, p_rating: stars });
        this.ratingBusy = null;
        if (error) {
            console.error(error);
            job.customer_rating = before; // put the old rating back
            this.redrawRating(id);
            ui.notify('Could not save your rating: ' + error.message);
            return;
        }
        this.redrawRating(id);
        ui.notify(before ? 'Rating updated' : 'Thank you! Your rating has been submitted');
        this.fetchCustomerJobs(true); // quietly sync with the database
    },

    extractJobId(data) {
        if (typeof data === 'string') return data;
        if (Array.isArray(data)) data = data[0];
        if (data && typeof data === 'object') return data.id || data.job_id || null;
        return null;
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
        await this.attachJobDocs(jobs);
        if (silent && !this.viewIs('customerHome', 'customerHistory')) return;
        // jobs the admin removed (archived) are not shown to customers
        const visible = (jobs || []).filter(j => j.status !== 'archived');
        const removed = (jobs || []).filter(j => j.status === 'archived'); // shown on the History page
        const prevStages = this.knownStages;
        this.knownStages = {};
        visible.forEach(j => { this.knownStages[j.id] = this.customerStage(j); });
        const sig = JSON.stringify([visible, removed]);
        if (silent && sig === this.lastSig.customer) return;
        this.lastSig.customer = sig;
        if (silent && prevStages && visible.some(j => prevStages[j.id] !== undefined && prevStages[j.id] !== this.knownStages[j.id])) {
            ui.notify('An order status was updated');
        }
        this.customerJobs = visible;
        this.customerHistory = removed;
        this.renderCustomerJobs();
        this.renderCustomerHistory();
    },

    // review -> approved -> delivering (a transporter took the job) -> delivered (DO uploaded)
    // rejected: the admin sent it back; the customer can edit and resubmit it, or delete it
    customerStage(job) {
        if (job.status === 'rejected') return 'rejected';
        if (job.status === 'pending_review') return 'review';
        if (job.status === 'assigned') return job.do_url ? 'delivered' : 'delivering';
        return 'approved';
    },

    customerSteps(stage, job) {
        const order = ['review', 'approved', 'delivering', 'delivered'];
        const labels = ['Order received', 'Looking for driver', 'Driver assigned', 'Delivered'];
        const times = [job.created_at, job.approved_at, job.assigned_at, job.do_uploaded_at];
        const reached = order.indexOf(stage);
        return `<ol class="steps" aria-label="Order progress">${labels.map((label, i) => {
            const t = i <= reached ? ui.fmtShort(times[i]) : '';
            return `<li class="step${i <= reached ? ' is-done' : ''}${i === reached ? ' is-current' : ''}"><span class="step-dot">${i <= reached ? '<i class="ri-check-line"></i>' : ''}</span><span class="step-label">${label}</span>${t ? `<span class="step-time">${t}</span>` : ''}</li>`;
        }).join('')}</ol>`;
    },

    // Shown on a rejected order: why it was sent back, and what the customer can do next
    rejectNotice(job) {
        const reason = job.reject_reason ? ' ' + ui.esc(job.reject_reason) : '';
        return `<div class="notice notice-stop" role="alert"><i class="ri-close-circle-line"></i><span><b>Rejected.</b>${reason}<br><span class="hint">Edit the order and resubmit it, or delete it.</span></span></div>`;
    },

    setCustomerFilter(key) {
        this.customerFilter = key;
        this.renderCustomerJobs();
    },

    renderCustomerJobs() {
        const container = document.getElementById('customer-jobs-container');
        this.loadCardPrefs();
        const base = this.customerJobs || [];
        const all = this.filterJobs(base, 'cust'); // delivery-date filter
        this.updateFilterUi('cust', all.length, base.length);

        if (base.length === 0) {
            container.innerHTML = ui.empty('ri-file-list-3-line', 'No orders yet', 'Tap New order to place your first delivery order.');
            return;
        }
        if (all.length === 0) {
            container.innerHTML = ui.empty('ri-search-line', 'No orders on these dates', 'Try a different date range.');
            return;
        }

        const filters = [['all', 'All'], ['review', 'Awaiting approval'], ['rejected', 'Rejected'], ['approved', 'Approved'], ['delivering', 'Delivering'], ['delivered', 'Delivered']];
        const counts = { all: all.length };
        filters.slice(1).forEach(([key]) => { counts[key] = all.filter(j => this.customerStage(j) === key).length; });
        const active = (this.customerFilter && counts[this.customerFilter] !== undefined) ? this.customerFilter : 'all';

        const chips = `<div class="chips">${filters
            .filter(([key]) => key === 'all' || key === active || counts[key] > 0)
            .map(([key, label]) => `<button type="button" class="chip${key === active ? ' is-active' : ''}" onclick="app.setCustomerFilter('${key}')">${label} <span class="chip-count">${counts[key]}</span></button>`)
            .join('')}</div>`;

        const shown = active === 'all' ? all : all.filter(j => this.customerStage(j) === active);
        if (shown.length === 0) {
            container.innerHTML = chips + ui.empty('ri-file-list-3-line', 'Nothing here', 'No orders in this status.');
            return;
        }

        const cards = shown.map(job => {
            const stage = this.customerStage(job);
            const id = ui.esc(job.id);
            const pill = {
                review: ui.pill('Awaiting approval', 'warn', 'ri-time-line'),
                rejected: ui.pill('Rejected', 'stop', 'ri-close-circle-line'),
                approved: ui.pill('Approved', 'info', 'ri-megaphone-line'),
                delivering: ui.pill('Delivering', 'info', 'ri-truck-line'),
                delivered: ui.pill('Delivered', 'go', 'ri-check-double-line')
            }[stage];

            const actions = [];
            if (stage === 'review') {
                actions.push(`<button class="btn btn-secondary btn-sm" data-id="${id}" onclick="app.openCustomerEdit(this.dataset.id)"><i class="ri-edit-line"></i> Edit</button>`);
                actions.push(`<button class="btn btn-danger-ghost btn-sm" data-id="${id}" onclick="app.cancelCustomerJob(this.dataset.id)">Cancel order</button>`);
            }
            if (stage === 'rejected') {
                actions.push(`<button class="btn btn-primary btn-sm" data-id="${id}" onclick="app.openCustomerEdit(this.dataset.id)"><i class="ri-edit-line"></i> Edit &amp; resubmit</button>`);
                actions.push(`<button class="btn btn-danger-ghost btn-sm" data-id="${id}" onclick="app.cancelCustomerJob(this.dataset.id)">Delete</button>`);
            }
            if (stage === 'delivered') {
                actions.push(`<button class="btn btn-secondary btn-sm" data-id="${id}" onclick="app.openCustomerCopy(this.dataset.id)"><i class="ri-repeat-line"></i> Book again</button>`);
            }
            const price = job.customer_expected_price != null ? ui.price('Your expected price', job.customer_expected_price) : '<span></span>';
            const foot = (job.customer_expected_price != null || actions.length)
                ? `<div class="job-foot">${price}${actions.length ? `<div class="actions" style="flex-wrap:wrap;justify-content:flex-end">${actions.join('')}</div>` : ''}</div>`
                : '';

            // Collapsed / expanded. Every order starts collapsed ("Show more" to open).
            // After that we keep whatever the customer chose.
            if (!(job.id in this.cardOpen)) this.cardOpen[job.id] = (stage === 'rejected'); // a rejected order starts open so the reason is seen
            const open = this.cardOpen[job.id];

            // One-line summary shown only while the card is collapsed
            const dropCount = ui.stops(job).length + 1;
            const sumRoute = `${ui.esc(ui.place(job.source_loc))} <span class="sum-arrow" aria-hidden="true">→</span> ${ui.esc(ui.place(job.dest_loc))}${dropCount > 1 ? ` <span class="sum-more">+${dropCount - 1} more</span>` : ''}`;
            const sumMeta = [
                `${ui.esc(job.quantity)} ${ui.esc(job.item_desc)}`,
                job.delivery_date ? `Delivery ${ui.fmtDate(job.delivery_date)}` : ''
            ].filter(Boolean).join(' · ');

            return `
                <article class="job-card${open ? '' : ' is-collapsed'}" data-job="${id}">
                    <div class="job-head">
                        ${pill}
                        <span class="job-time">${ui.posted(job.created_at, 'Ordered')}</span>
                    </div>
                    <div class="job-summary">
                        <div class="sum-route">${sumRoute}</div>
                        <div class="sum-meta">${sumMeta}</div>
                    </div>
                    <div class="job-body" id="jb-${id}">
                        ${stage === 'rejected' ? this.rejectNotice(job) : this.customerSteps(stage, job)}
                        ${ui.route(job)}
                        ${ui.facts(job, { date: job.delivery_date })}
                        ${ui.photos(job, true)}
                        ${ui.remarks(job.remarks)}
                        ${ui.poSlip(job, { title: 'Your PO', upload: stage === 'delivered', cls: 'is-prominent' })}
                        ${ui.doSlip(job, { showTime: true, timeLabel: 'Delivered', download: true })}
                        ${ui.invSlip(job, { download: true })}
                        ${stage === 'delivered' ? ui.ratingBox(job) : ''}
                        ${foot}
                    </div>
                    <button type="button" class="card-more" data-id="${id}" aria-expanded="${open}" aria-controls="jb-${id}" onclick="app.toggleCard(this.dataset.id)">
                        <span class="more-label">${open ? 'Show less' : 'Show more'}</span><i class="ri-arrow-down-s-line chev" aria-hidden="true"></i>
                    </button>
                </article>
            `;
        }).join('');

        const toolbar = `<div class="list-bar">${chips}<button type="button" class="link-btn list-toggle-all" id="cust-toggle-all" onclick="app.toggleAllCards()"></button></div>`;
        container.innerHTML = toolbar + cards;
        this.syncToggleAll();
    },

    // Open or close one order card. Only that card is touched (the list is not redrawn), so the scroll position stays put.
    toggleCard(jobId) {
        const id = String(jobId);
        const card = [...document.querySelectorAll('#customer-jobs-container .job-card')].find(el => el.dataset.job === id);
        if (!card) return;
        this.setCardOpen(card, card.classList.contains('is-collapsed')); // collapsed now -> open it, and vice versa
        this.saveCardPrefs();
        this.syncToggleAll();
    },

    setCardOpen(card, open) {
        card.classList.toggle('is-collapsed', !open);
        const btn = card.querySelector('.card-more');
        if (btn) {
            btn.setAttribute('aria-expanded', String(open));
            const label = btn.querySelector('.more-label');
            if (label) label.textContent = open ? 'Show less' : 'Show more';
        }
        this.cardOpen[card.dataset.job] = open;
        this.cardTouched[card.dataset.job] = true; // the customer chose this, so remember it
    },

    // "Collapse all" when every card shown is open, otherwise "Expand all". Only the cards currently shown are affected.
    toggleAllCards() {
        const cards = [...document.querySelectorAll('#customer-jobs-container .job-card')];
        const allOpen = cards.every(c => !c.classList.contains('is-collapsed'));
        cards.forEach(c => this.setCardOpen(c, !allOpen));
        this.saveCardPrefs();
        this.syncToggleAll();
    },

    // Remember each customer's Show more / Show less choices on this device, so a full page refresh keeps them.
    // Only the customer's own clicks are saved (not the automatic defaults). Stored per user: order ids and true/false only.
    cardStoreKey() {
        return this.currentUser ? 'rtll-card-open-' + this.currentUser.id : null;
    },
    loadCardPrefs() {
        const uid = this.currentUser && this.currentUser.id;
        if (!uid || this.cardLoadedFor === uid) return; // nobody signed in yet, or already loaded
        this.cardLoadedFor = uid;
        this.cardOpen = {};
        this.cardTouched = {};
        // Choices are no longer remembered across page refreshes: every order starts collapsed.
        // Clear anything saved by the older version, otherwise those old choices would keep cards open.
        try { localStorage.removeItem(this.cardStoreKey()); } catch (e) { /* storage blocked: nothing to clear */ }
    },
    saveCardPrefs() {
        // Intentionally empty: open/closed state lives only in memory (cardOpen) until the page is refreshed.
    },

    syncToggleAll() {
        const btn = document.getElementById('cust-toggle-all');
        if (!btn) return;
        const cards = [...document.querySelectorAll('#customer-jobs-container .job-card')];
        const allOpen = cards.length > 0 && cards.every(c => !c.classList.contains('is-collapsed'));
        btn.textContent = allOpen ? 'Collapse all' : 'Expand all';
        btn.style.display = cards.length > 1 ? '' : 'none'; // pointless with a single order
    },

    // ==========================================
    // --- ADMIN: review a customer draft, add PO, post ---
    // ==========================================
    showCustomerHistory() {
        this.showView('customerHistory');
        this.renderCustomerHistory();   // draw what we already have straight away
        this.fetchCustomerJobs(true);   // then refresh quietly in the background
    },

    renderCustomerHistory() {
        const container = document.getElementById('customer-history-container');
        const all = this.customerHistory || [];
        const month = this.histMonthOf('customer');
        const counts = this.countByMonth(all, j => j.delivery_date);
        this.renderHistChips('customer-hist-months', counts, month, 'customer');
        const jobs = all.filter(j => this.monthKey(j.delivery_date) === month);
        if (jobs.length === 0) {
            const older = all.length > 0;
            container.innerHTML = ui.empty('ri-history-line', older ? 'No history in ' + this.monthLabel(month) : 'No history yet',
                older ? 'Pick an earlier month above to see older orders.' : 'Orders that have been removed from your list will appear here.');
            return;
        }
        container.innerHTML = jobs.map(job => {
            const id = ui.esc(job.id);
            const delivered = !!job.do_url;
            // Everything on the History page counts as completed
            const pill = ui.pill('Completed', 'go', 'ri-check-double-line');
            const again = `<button class="btn btn-secondary btn-sm" data-id="${id}" onclick="app.openCustomerCopy(this.dataset.id)"><i class="ri-repeat-line"></i> Book again</button>`;
            const price = job.customer_expected_price != null ? ui.price('Your expected price', job.customer_expected_price) : '<span></span>';
            if (!(job.id in this.cardOpen)) this.cardOpen[job.id] = false;
            const open = this.cardOpen[job.id];
            return `
                <article class="job-card is-dim${open ? '' : ' is-collapsed'}" data-job="${id}">
                    <div class="job-head">
                        ${pill}
                        <span class="job-time">${ui.posted(job.created_at, 'Ordered')}</span>
                    </div>
                    ${this.adminSummary(job)}
                    <div class="job-body" id="jb-${id}">
                        ${ui.route(job)}
                        ${ui.facts(job, { date: job.delivery_date })}
                        ${ui.photos(job, true)}
                        ${ui.remarks(job.remarks)}
                        ${ui.doSlip(job, { showTime: true, timeLabel: 'Delivered', download: true })}
                        ${ui.poSlip(job, { title: 'Your PO', upload: true, cls: 'is-prominent' })}
                        ${ui.invSlip(job, { download: true })}
                        ${delivered ? ui.ratingBox(job) : ''}
                    </div>
                    ${this.adminToggle(id, open)}
                    <div class="job-foot">
                        ${price}
                        ${again ? `<div class="actions">${again}</div>` : ''}
                    </div>
                </article>
            `;
        }).join('');
    },

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

        await this.attachJobDocs([job]);
        const c = job.customers || {};
        const tel = String(c.phone || '').replace(/[^\d+]/g, '');
        const expected = Number(job.customer_expected_price) || 0;

        // Everything below is editable: the admin does not always follow what the customer entered (especially the price).
        // Field ids use the prefix "rv" so the shared drop-off helpers (addStop, collectStops, collectContacts) work here too.
        container.innerHTML = `
            <article class="job-card summary">
                <div class="job-head">
                    ${ui.pill('Awaiting review', 'warn', 'ri-time-line')}
                    <span class="job-time">${ui.posted(job.created_at)}</span>
                </div>
                <p class="remarks">
                    <b>${ui.esc(c.company_name || 'Unknown customer')}</b><br>
                    ${ui.esc(c.contact_person || '')}
                    ${c.phone ? ` &middot; ${tel ? `<a href="tel:${ui.esc(tel)}"><i class="ri-phone-line"></i> ${ui.esc(c.phone)}</a>` : ui.esc(c.phone)}` : ''}
                </p>
                ${ui.photos(job, true)}
                ${ui.poSlip(job, { download: true })}
                <div class="job-foot">
                    ${ui.price('Customer expected price', expected)}
                </div>
            </article>

            <form id="approve-draft-form" class="panel form-stack" style="gap:20px">
                <span class="hint">You can change any detail below before posting. The customer's own request is not changed.</span>

                <fieldset class="fieldset">
                    <legend class="fieldset-title">Route</legend>
                    <div class="field">
                        <label class="label" for="rv-source">Pickup location</label>
                        <input type="text" id="rv-source" class="input" required>
                    </div>
                    <div class="field">
                        <label class="label" for="rv-source-link">Pickup map link (optional)</label>
                        <input type="url" id="rv-source-link" placeholder="https://maps.app.goo.gl/..." class="input">
                    </div>
                    <div class="field-row">
                        <div class="field">
                            <label class="label" for="rv-source-pic">Pickup person in charge (optional)</label>
                            <input type="text" id="rv-source-pic" class="input" maxlength="80" autocomplete="off">
                        </div>
                        <div class="field">
                            <label class="label" for="rv-source-phone">Pickup contact number (optional)</label>
                            <input type="tel" id="rv-source-phone" class="input" inputmode="tel" minlength="7" maxlength="20" autocomplete="off">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="rv-dest">Drop-off location</label>
                        <input type="text" id="rv-dest" class="input" required>
                    </div>
                    <div class="field">
                        <label class="label" for="rv-dest-link">Drop-off map link (optional)</label>
                        <input type="url" id="rv-dest-link" placeholder="https://maps.app.goo.gl/..." class="input">
                    </div>
                    <div class="field-row">
                        <div class="field">
                            <label class="label" for="rv-dest-pic">Drop-off person in charge (optional)</label>
                            <input type="text" id="rv-dest-pic" class="input" maxlength="80" autocomplete="off">
                        </div>
                        <div class="field">
                            <label class="label" for="rv-dest-phone">Drop-off contact number (optional)</label>
                            <input type="tel" id="rv-dest-phone" class="input" inputmode="tel" minlength="7" maxlength="20" autocomplete="off">
                        </div>
                    </div>
                    <div id="rv-extra-stops" class="stack" style="gap:12px"></div>
                    <button type="button" id="rv-add-stop" class="btn btn-secondary btn-sm" style="align-self:flex-start" onclick="app.addStop('rv')"><i class="ri-add-line"></i> Add another drop-off</button>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-title">Load</legend>
                    <div class="field-row">
                        <div class="field" style="flex:2">
                            <label class="label" for="rv-item">Item</label>
                            <select id="rv-item" class="input" required onchange="app.toggleReviewOtherItem()">
                                <option value="Jumbo Bags">Jumbo Bags</option>
                                <option value="Drums">Drums</option>
                                <option value="Pallets">Pallets</option>
                                <option value="Pails (25kg)">Pails (25kg)</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <div class="field" style="flex:1">
                            <label class="label" for="rv-qty">Quantity</label>
                            <input type="number" id="rv-qty" class="input" min="1" step="1" inputmode="numeric" required>
                        </div>
                    </div>
                    <div class="field" id="rv-item-other-wrap" style="display:none">
                        <label class="label" for="rv-item-other">Others (please specify)</label>
                        <input type="text" id="rv-item-other" class="input" maxlength="100" placeholder="e.g. IBC Tank, Steel Rolls">
                    </div>
                    <label class="check" for="rv-unloading">
                        <input type="checkbox" id="rv-unloading">
                        <span>Unloading service required</span>
                    </label>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-title">Schedule and price</legend>
                    <div class="field-row">
                        <div class="field">
                            <label class="label" for="rv-date">Delivery date</label>
                            <input type="date" id="rv-date" class="input" required>
                        </div>
                        <div class="field">
                            <label class="label" for="rv-price">Price to post (RM)</label>
                            <input type="number" id="rv-price" class="input" min="1" step="any" inputmode="decimal" required>
                            <span class="hint">Customer expected RM ${ui.money(expected)}.</span>
                            <a href="https://funny-klepon-69696a.netlify.app/" target="_blank" rel="noopener noreferrer" class="hint" style="color:var(--info);font-weight:600;text-decoration:none">
                                <i class="ri-links-line"></i> Price guide
                            </a>
                        </div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-title">Notes</legend>
                    <div class="field">
                        <label class="label" for="rv-remarks">Remarks (optional)</label>
                        <input type="text" id="rv-remarks" class="input">
                    </div>
                </fieldset>

                <div class="actions-wide">
                    <button type="submit" class="btn btn-go">Approve &amp; post job</button>
                    <button type="button" id="rv-reject-toggle" class="btn btn-danger-outline" aria-expanded="false" aria-controls="rv-reject-panel" onclick="app.toggleRejectPanel()"><i class="ri-close-circle-line"></i> Reject</button>
                </div>

                <!-- Opens when Reject is pressed. The reason is optional; the customer sees it on the rejected order. -->
                <div id="rv-reject-panel" class="reject-panel hidden">
                    <div class="field">
                        <label class="label" for="rv-reject-reason">Reason (optional)</label>
                        <textarea id="rv-reject-reason" class="input" rows="3" maxlength="500" placeholder="e.g. Please check the pickup address and the delivery date"></textarea>
                        <span class="hint">The customer will see this. They can then edit the order and resubmit it.</span>
                    </div>
                    <button type="button" id="rv-reject-confirm" class="btn btn-danger btn-block" data-id="${ui.esc(jobId)}" onclick="app.rejectRequest(this.dataset.id)">Confirm reject</button>
                </div>
            </form>
        `;

        // Fill the form through the DOM (never pasted into HTML)
        const set = (id, v) => { document.getElementById(id).value = v == null ? '' : v; };
        set('rv-source', job.source_loc);
        set('rv-source-link', job.source_maps_link);
        set('rv-dest', job.dest_loc);
        set('rv-dest-link', job.dest_maps_link);
        const cs = ui.contactsOf(job);
        set('rv-source-pic', cs.pickup.pic);
        set('rv-source-phone', cs.pickup.phone);
        set('rv-dest-pic', (cs.drops[0] || {}).pic);
        set('rv-dest-phone', (cs.drops[0] || {}).phone);
        this.fillStops('rv', ui.stops(job).map((s, i) => ({ ...s, ...(cs.drops[i + 1] || {}) })));

        const sel = document.getElementById('rv-item');
        const known = Array.from(sel.options).map(o => o.value).filter(v => v !== 'Others');
        if (known.includes(job.item_desc)) {
            sel.value = job.item_desc;
        } else {
            sel.value = 'Others';
            set('rv-item-other', String(job.item_desc || '').replace(/^Others:\s*/, ''));
        }
        document.getElementById('rv-item-other-wrap').style.display = sel.value === 'Others' ? '' : 'none';
        document.getElementById('rv-item-other').required = sel.value === 'Others';

        set('rv-qty', job.quantity);
        document.getElementById('rv-unloading').checked = !!job.unloading_service;
        set('rv-date', job.delivery_date);
        set('rv-price', expected || '');
        set('rv-remarks', job.remarks);

        document.getElementById('approve-draft-form').addEventListener('submit', (ev) => this.approveDraft(ev, jobId, expected));
    },

    // Admin (review page): show or hide the reject box. Pressing Reject again closes it.
    toggleRejectPanel() {
        const panel = document.getElementById('rv-reject-panel');
        const btn = document.getElementById('rv-reject-toggle');
        if (!panel || !btn) return;
        const opening = panel.classList.contains('hidden');
        panel.classList.toggle('hidden', !opening);
        btn.setAttribute('aria-expanded', String(opening));
        if (opening) document.getElementById('rv-reject-reason').focus();
    },

    // Admin: send a waiting request back to the customer. The reason is optional.
    // The customer then sees the order as Rejected and can edit and resubmit it, or delete it.
    // Needs the admin_reject_job function in the database.
    async rejectRequest(jobId) {
        const reasonEl = document.getElementById('rv-reject-reason');
        const reason = reasonEl ? reasonEl.value.trim() : '';
        const btn = document.getElementById('rv-reject-confirm');
        if (btn) btn.disabled = true; // no double clicks while it is sending

        const { error } = await supabaseClient.rpc('admin_reject_job', { p_job_id: String(jobId), p_reason: reason || null });
        if (error) {
            console.error(error);
            if (btn) btn.disabled = false;
            ui.notify("Failed to reject: " + error.message);
            return;
        }
        ui.notify("Request rejected. The customer can edit and resubmit it.");
        this.resetStops('rv');
        this.showRtRequests();
    },

    toggleReviewOtherItem() {
        const isOther = document.getElementById('rv-item').value === 'Others';
        const wrap = document.getElementById('rv-item-other-wrap');
        const input = document.getElementById('rv-item-other');
        wrap.style.display = isOther ? '' : 'none';
        input.required = isOther;
        if (isOther) input.focus(); else input.value = '';
    },

    async approveDraft(e, jobId, customerPrice) {
        e.preventDefault();
        const v = (id) => document.getElementById(id).value.trim();

        const price = parseFloat(v('rv-price'));
        if (!Number.isFinite(price) || price <= 0) {
            ui.notify("Please enter a valid price.");
            return;
        }
        let itemDesc = document.getElementById('rv-item').value;
        if (itemDesc === 'Others') {
            const other = v('rv-item-other');
            if (!other) { ui.notify("Please specify the item under Others."); return; }
            itemDesc = 'Others: ' + other;
        }
        const contactProblem = this.contactsError('rv');
        if (contactProblem) { ui.notify(contactProblem); return; }

        const changes = {
            source_loc: v('rv-source'),
            source_maps_link: v('rv-source-link') || null,
            dest_loc: v('rv-dest'),
            dest_maps_link: v('rv-dest-link') || null,
            item_desc: itemDesc,
            quantity: parseInt(v('rv-qty')),
            delivery_date: v('rv-date'),
            unloading_service: document.getElementById('rv-unloading').checked,
            remarks: v('rv-remarks') || null,
            extra_stops: this.collectStops('rv'),
            contacts: this.collectContacts('rv')
        };

        const note = (price !== Number(customerPrice))
            ? "\n(The customer expected RM " + ui.money(customerPrice) + ".)" : "";
        if (!confirm("Post this job to transporters at RM " + ui.money(price) + "?" + note)) return;

        const { data: updated, error } = await supabaseClient
            .from('jobs')
            .update({
                ...changes,
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

        this.resetStops('rv');
        ui.notify("Job published.");
        this.showRtJobs();
    },

    // --- RENDER HTML FUNCTIONS ---
    async uploadDO(input) {
        const file = input.files && input.files[0];
        const jobId = input.dataset.jobId;
        if (!file || !jobId) return;
        // data-stop is only set on the per-drop-off buttons of a job with several drop-offs
        const stop = (input.dataset.stop === undefined || input.dataset.stop === '') ? null : parseInt(input.dataset.stop, 10);

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
        const filePath = `public/do-${jobId}${stop === null ? '' : '-s' + stop}-${Date.now()}.${fileExt}`;

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

        const isAdmin = this.currentUserRole === 'rt';
        const { error: saveError } = isAdmin
            ? await supabaseClient.rpc('admin_set_do', { p_job_id: String(jobId), p_stop: stop, p_url: publicUrlData.publicUrl })
            : (stop === null
                ? await supabaseClient.rpc('attach_do', { p_job_id: jobId, p_url: publicUrlData.publicUrl })
                : await supabaseClient.rpc('attach_do_stop', { p_job_id: jobId, p_stop: stop, p_url: publicUrlData.publicUrl }));

        if (saveError) {
            console.error('DO save error:', saveError);
            this.uploading = 0;
            ui.notify("DO uploaded but could not be saved to the job: " + saveError.message);
            input.value = '';
            return;
        }

        this.uploading = 0;
        ui.notify(stop === null ? "DO uploaded." : `DO uploaded for drop-off ${stop + 1}.`);
        input.value = '';
        if (isAdmin) this.refreshAdminJobViews(); else this.fetchMyJobs();
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
            if (this.viewIs('transporterHistory')) document.getElementById('transporter-history-container').innerHTML = ui.errorBlock(error.message);
            else if (!silent) container.innerHTML = ui.errorBlock(error.message);
            return;
        }

        if (silent && !this.viewIs('transporterMyJobs', 'transporterHistory')) return;
        const sig = JSON.stringify(bids);
        if (silent && sig === this.lastSig.myjobs) return;
        this.lastSig.myjobs = sig;
        // A job the admin archived leaves My jobs and moves to History
        const withJob = (bids || []).filter(b => b.jobs);
        this.renderMyJobs(withJob.filter(b => b.jobs.status !== 'archived'));
        this.renderTransporterHistory(withJob.filter(b => b.jobs.status === 'archived'));
    },

    showTransporterHistory() {
        ui.setTab('myhistory');
        this.showView('transporterHistory');
        document.getElementById('transporter-history-container').innerHTML = ui.skeleton(2);
        this.lastSig.myjobs = null; // make sure fresh data is drawn
        this.fetchMyJobs(true);
    },

    renderTransporterHistory(allBids) {
        this.myHistoryBids = allBids;
        const container = document.getElementById('transporter-history-container');
        const month = this.histMonthOf('transporter');
        const dateOf = (b) => b.proposed_date || b.jobs.delivery_date;   // the agreed date, like the Transporters tab
        const counts = this.countByMonth(allBids, dateOf);
        this.renderHistChips('transporter-hist-months', counts, month, 'transporter');
        const bids = allBids.filter(b => this.monthKey(dateOf(b)) === month);
        if (!bids.length) {
            const older = allBids.length > 0;
            container.innerHTML = ui.empty('ri-history-line', older ? 'No history in ' + this.monthLabel(month) : 'No history yet',
                older ? 'Pick an earlier month above to see older jobs.' : 'Jobs that have been removed from your list will appear here.');
            return;
        }
        container.innerHTML = bids.map(bid => {
            const job = bid.jobs;
            const id = ui.esc(job.id);
            const finalDate = bid.proposed_date || job.delivery_date;
            if (!(job.id in this.cardOpen)) this.cardOpen[job.id] = false;
            const open = this.cardOpen[job.id];
            return `
                <article class="job-card is-dim${open ? '' : ' is-collapsed'}" data-job="${id}">
                    <div class="job-head">
                        ${ui.pill('Completed', 'go', 'ri-check-double-line')}
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    ${this.adminSummary(job, finalDate)}
                    <div class="job-body" id="jb-${id}">
                        ${ui.route(job)}
                        ${ui.facts(job, { date: finalDate, dateLabel: 'Agreed delivery', delivered: !!job.do_url })}
                        ${ui.photos(job, true)}
                        ${ui.remarks(job.remarks)}
                        ${ui.doSlip(job, { showTime: true, download: true })}
                    </div>
                    ${this.adminToggle(id, open)}
                    <div class="job-foot">
                        ${ui.price('Your price', bid.proposed_price)}
                    </div>
                </article>
            `;
        }).join('');
    },

    renderMyJobs(allBids) {
        this.myJobsBids = allBids;
        const container = document.getElementById('my-jobs-container');
        if (allBids.length === 0) {
            this.updateFilterUi('mine', 0, 0);
            container.innerHTML = ui.empty('ri-truck-line', 'No assigned jobs yet', 'Jobs awarded to your company will show up here.');
            return;
        }
        const f = this.getJobFilter('mine');
        const bids = allBids.filter(b => b.jobs && this.dateInRange(f, b.proposed_date || b.jobs.delivery_date));
        this.updateFilterUi('mine', bids.length, allBids.length);
        if (bids.length === 0) {
            container.innerHTML = ui.empty('ri-search-line', 'No jobs on these dates', 'Try a different date range.');
            return;
        }

        container.innerHTML = bids.map(bid => {
            const job = bid.jobs;
            if (!job) return '';
            const id = ui.esc(job.id);
            const finalDate = bid.proposed_date || job.delivery_date;
            const stopMode = ui.doStopMode(job); // several drop-offs: one upload button per drop-off instead of the single one
            if (!(job.id in this.cardOpen)) this.cardOpen[job.id] = false;
            const open = this.cardOpen[job.id];

            // Reminder while the DO is still missing (stays visible when the card is collapsed)
            const doTotal = ui.stops(job).length + 1;
            const doHave = ui.dosOf(job).length;
            const doMissing = !job.do_url;
            const doPill = !doMissing ? '' : ui.pill(doHave ? `DO ${doHave}/${doTotal} uploaded` : 'DO not uploaded', 'warn', 'ri-file-warning-line');
            const doNotice = !doMissing ? '' : `<div class="notice notice-warn"><i class="ri-upload-2-line"></i><span>${doHave ? `Still need to upload the DO for ${doTotal - doHave} drop-off${doTotal - doHave === 1 ? '' : 's'}.` : 'Please upload the DO once the delivery is done.'}</span></div>`;

            return `
                <article class="job-card is-mine${open ? '' : ' is-collapsed'}" data-job="${id}">
                    <div class="job-head">
                        <span style="display:inline-flex;gap:6px;flex-wrap:wrap">${ui.pill('Assigned to you', 'go', 'ri-truck-fill')}${doPill}</span>
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    ${this.adminSummary(job, finalDate)}
                    <div class="job-body" id="jb-${id}">
                        ${ui.route(job)}
                        ${ui.facts(job, { date: finalDate, dateLabel: 'Agreed delivery', delivered: !!job.do_url })}
                        ${ui.photos(job)}
                        ${ui.remarks(job.remarks)}
                        ${ui.doSlip(job)}
                        ${ui.doStopUploads(job)}
                    </div>
                    ${doNotice}
                    ${this.adminToggle(id, open)}
                    <div class="job-foot">
                        ${ui.price('Your price', bid.proposed_price)}
                        ${stopMode ? '' : `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                        <label class="btn ${job.do_url ? 'btn-secondary' : 'btn-primary'} btn-sm" style="cursor:pointer">
                            <i class="ri-upload-2-line"></i> ${job.do_url ? 'Replace DO' : 'Upload DO'}
                            <input type="file" accept="image/*,application/pdf" hidden data-job-id="${ui.esc(job.id)}" ${job.do_url ? `onclick="if(!confirm('This will replace the DO you already uploaded. Continue?')) event.preventDefault()"` : ''} onchange="app.uploadDO(this)">
                        </label>
                        <span class="hint">Image or PDF, max 10 MB</span>
                        </div>`}
                    </div>
                </article>
            `;
        }).join('');
    },

    // ==========================================
    // --- ADMIN: documents (PO / DO / INV), completing jobs ---
    // The admin can upload or replace every document on any assigned job.
    // A job that has the accepted price, PO, DO and INV is completed (moved to History) by the database itself,
    // whoever uploaded the last document and whether or not anyone has the app open.
    // The admin can also complete a job by hand (for example a verbal booking that never gets a PO).
    // History is the 'archived' status, so customers and transporters see it there as before.
    // ==========================================
    adminDocs(job) {
        return ui.poSlip(job, { download: true, upload: true, handler: 'adminUploadPO', emptyText: 'No PO yet. The customer can upload it, or you can upload it here.' })
            + ui.doSlipAdmin(job)
            + ui.invSlip(job, { download: true, upload: true });
    },

    // Admin: Upload / Replace PO on behalf of the customer
    async adminUploadPO(input) {
        const file = input.files && input.files[0];
        const jobId = input.dataset.jobId;
        if (!file || !jobId) return;
        this.uploading = Date.now();
        ui.notify('Uploading PO...');
        const url = await this.uploadDocFile(file, 'po', 'PO');
        let saved = false;
        if (url) {
            const { error } = await supabaseClient.rpc('admin_set_po', { p_job_id: String(jobId), p_url: url });
            if (error) { console.error('PO save error:', error); ui.notify('Could not save the PO to the job: ' + error.message); }
            else saved = true;
        }
        this.uploading = 0;
        input.value = '';
        if (!saved) return;
        ui.notify('PO uploaded.');
        this.refreshAdminJobViews();
    },

    // Everything a job needs before it is finished
    isComplete(job) {
        return !!(job && job.accepted_price != null && job.do_url && job.customer_po && job.invoice_file);
    },

    // Admin: mark one delivered job as completed by hand (even if a document is still missing)
    async completeJob(jobId) {
        const job = (this.rtJobsList || []).find(j => String(j.id) === String(jobId));
        const missing = [];
        if (job) {
            if (!job.do_url) missing.push('DO');
            if (!job.customer_po) missing.push('PO');
            if (!job.invoice_file) missing.push('INV');
        }
        const msg = missing.length
            ? `This job is still missing: ${missing.join(', ')}.\nMark it as completed anyway and move it to History?`
            : 'Mark this job as completed and move it to History?';
        if (!confirm(msg)) return;
        const { data, error } = await supabaseClient
            .from('jobs')
            .update({ status: 'archived' })
            .eq('id', jobId)
            .eq('status', 'assigned')
            .select('id');
        if (error) { ui.notify('Error completing job: ' + error.message); return; }
        if (!data || !data.length) { ui.notify('Could not complete the job: it may already have been handled.'); return; }
        ui.toast('Job completed and moved to History.', 'success');
        this.fetchJobsForRT();
    },

    // One-line summary shown while an admin card is collapsed
    adminSummary(job, date = job.delivery_date) {
        const dropCount = ui.stops(job).length + 1;
        const route = `${ui.esc(ui.place(job.source_loc))} <span class="sum-arrow" aria-hidden="true">→</span> ${ui.esc(ui.place(job.dest_loc))}${dropCount > 1 ? ` <span class="sum-more">+${dropCount - 1} more</span>` : ''}`;
        const c = job.customers && job.customers.company_name;
        const meta = [
            c ? ui.esc(c) : '',
            `${ui.esc(job.quantity)} ${ui.esc(job.item_desc)}`,
            date ? `Delivery ${ui.fmtDate(date)}` : ''
        ].filter(Boolean).join(' · ');
        return `<div class="job-summary"><div class="sum-route">${route}</div><div class="sum-meta">${meta}</div></div>`;
    },

    adminToggle(id, open) {
        return `<button type="button" class="card-more" data-id="${id}" aria-expanded="${open}" aria-controls="jb-${id}" onclick="app.toggleRtCard(this.dataset.id)">
                        <span class="more-label">${open ? 'Show less' : 'Show more'}</span><i class="ri-arrow-down-s-line chev" aria-hidden="true"></i>
                    </button>`;
    },

    // Open or close one admin card without redrawing the list (the scroll position stays put)
    toggleRtCard(jobId) {
        const id = String(jobId);
        const card = [...document.querySelectorAll('.job-card')].find(el => el.dataset.job === id);
        if (!card) return;
        this.setCardOpen(card, card.classList.contains('is-collapsed'));
    },

    setRtTodo(key) {
        this.rtTodo = key;
        this.renderRTJobs(this.rtJobsList || []);
    },

    // 'YYYY-MM' of a date string, or '' when there is none
    monthKey(raw) {
        const m = /^(\d{4}-\d{2})/.exec(String(raw || ''));
        return m ? m[1] : '';
    },

    monthLabel(key, short = false) {
        const m = /^(\d{4})-(\d{2})$/.exec(String(key || ''));
        if (!m) return 'No date';
        return new Date(Number(m[1]), Number(m[2]) - 1, 1)
            .toLocaleDateString('en-MY', { month: short ? 'short' : 'long', year: 'numeric' });
    },

    // ---------- History: one delivery month at a time (admin, customer and transporter) ----------
    thisMonthKey() { return this.myDay(new Date()).slice(0, 7); },

    nextMonthKey(key) {
        const [y, m] = key.split('-').map(Number);
        return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    },

    // The month a History page is showing: the one picked, otherwise this month
    histMonthOf(role) { return this.histMonth[role] || this.thisMonthKey(); },

    // Month buttons: this month always first, then older months (latest first). counts = { 'YYYY-MM': n }
    renderHistChips(boxId, counts, active, role) {
        const box = document.getElementById(boxId);
        if (!box) return;
        const cur = this.thisMonthKey();
        const keys = new Set([cur, active, ...Object.keys(counts).filter(k => counts[k] > 0)]);
        const sorted = [...keys].sort().reverse();
        box.innerHTML = sorted.map(k => {
            const label = k === cur ? 'This month' : this.monthLabel(k, true);
            return `<button type="button" class="chip${k === active ? ' is-active' : ''}" data-role="${role}" data-month="${ui.esc(k)}" onclick="app.setHistMonth(this.dataset.role, this.dataset.month)">${ui.esc(label)} <span class="chip-count">${counts[k] || 0}</span></button>`;
        }).join('');
    },

    countByMonth(items, dateOf) {
        const counts = {};
        items.forEach(it => { const k = this.monthKey(dateOf(it)); if (k) counts[k] = (counts[k] || 0) + 1; });
        return counts;
    },

    setHistMonth(role, key) {
        this.histMonth[role] = key || '';
        if (role === 'admin') this.fetchHistoryForRT();
        else if (role === 'customer') this.renderCustomerHistory();
        else this.renderTransporterHistory(this.myHistoryBids || []);
    },

    setRtMonth(key) {
        this.rtMonth = key || '';
        this.renderRTJobs(this.rtJobsList || []);
    },

    // Month chips on the Jobs page. Counts follow the search box, so you see how many match in each month.
    renderRtMonths(allJobs) {
        const box = document.getElementById('rt-months');
        if (!box) return;
        const base = this.filterJobs(allJobs, 'rt', { ignoreMonth: true });
        const counts = {};
        base.forEach(j => { const k = this.monthKey(j.delivery_date); if (k) counts[k] = (counts[k] || 0) + 1; });
        const active = this.rtMonth || '';
        const keys = Object.keys(counts);
        if (active && !keys.includes(active)) keys.push(active);
        keys.sort().reverse();
        if (!keys.length) { box.innerHTML = ''; return; }
        const chip = (key, label, n) =>
            `<button type="button" class="chip${key === active ? ' is-active' : ''}" data-month="${ui.esc(key)}" onclick="app.setRtMonth(this.dataset.month)">${ui.esc(label)} <span class="chip-count">${n}</span></button>`;
        box.innerHTML = chip('', 'All', base.length) + keys.map(k => chip(k, this.monthLabel(k, true), counts[k] || 0)).join('');
    },

    renderRTJobs(allJobs) {
        this.rtJobsList = allJobs;
        this.renderRtMonths(allJobs);
        const container = document.getElementById('rt-jobs-container');
        if (allJobs.length === 0) {
            this.updateFilterUi('rt', 0, 0);
            container.innerHTML = ui.empty('ri-inbox-line', 'No jobs yet', 'Post a job and transporters can start bidding.');
            return;
        }
        const jobs = this.filterJobs(allJobs, 'rt');
        this.updateFilterUi('rt', jobs.length, allJobs.length);
        if (jobs.length === 0) {
            container.innerHTML = ui.empty('ri-search-line', 'No matching jobs', 'Try a different name or date.');
            return;
        }

        // Delivered customer jobs that still need something from us: waiting for the customer's PO, or our INV still to upload
        const counts = {
            all: jobs.length,
            po: jobs.filter(j => ui.todoOf(j) === 'po').length,
            inv: jobs.filter(j => ui.todoOf(j) === 'inv').length
        };
        const active = (this.rtTodo && counts[this.rtTodo] !== undefined) ? this.rtTodo : 'all';
        const todoChips = (counts.po + counts.inv > 0 || active !== 'all')
            ? `<div class="chips">${[['all', 'All'], ['po', 'Waiting for PO'], ['inv', 'INV to upload']]
                .filter(([key]) => key === 'all' || key === active || counts[key] > 0)
                .map(([key, label]) => `<button type="button" class="chip${key === active ? ' is-active' : ''}" onclick="app.setRtTodo('${key}')">${label} <span class="chip-count">${counts[key]}</span></button>`)
                .join('')}</div>`
            : '';
        const shown = active === 'all' ? jobs : jobs.filter(j => ui.todoOf(j) === active);
        if (shown.length === 0) {
            container.innerHTML = todoChips + ui.empty('ri-checkbox-circle-line', 'All caught up', 'No jobs are waiting on this.');
            return;
        }

        const cardOf = (job) => {
            const isAssigned = job.status === 'assigned';
            const id = ui.esc(job.id);
            const todo = ui.todoOf(job);
            const todoPill = todo === 'po' ? ui.pill('PO missing', 'warn', 'ri-file-warning-line')
                : (todo === 'inv' ? ui.pill('INV to upload', 'info', 'ri-file-upload-line') : '');
            const delivered = isAssigned && !!job.do_url;
            if (!(job.id in this.cardOpen)) this.cardOpen[job.id] = false;
            const open = this.cardOpen[job.id];

            return `
                <article class="job-card${open ? '' : ' is-collapsed'}" data-job="${id}">
                    <div class="job-head">
                        <span style="display:inline-flex;gap:6px;flex-wrap:wrap">${isAssigned ? ui.pill('Assigned', 'go', 'ri-check-line') : ui.pill('Open for bids', 'info')}${todoPill}</span>
                        <span class="job-time">${ui.posted(job.created_at)}</span>
                    </div>
                    ${this.adminSummary(job)}
                    <div class="job-body" id="jb-${id}">
                        ${ui.customerLine(job)}
                        ${ui.route(job)}
                        ${ui.facts(job, { date: job.delivery_date, delivered })}
                        ${isAssigned ? this.adminDocs(job) : ''}
                        ${ui.ratingLine(job)}
                    </div>
                    ${this.adminToggle(id, open)}
                    <div class="job-foot">
                        ${ui.price('Budget', job.offered_price)}
                        <div class="actions">
                            ${isAssigned
                                ? `<button class="btn btn-secondary btn-sm" data-id="${id}" onclick="app.viewBids(this.dataset.id)">Assigned details</button>
                                   ${delivered ? `<button class="btn btn-go btn-sm" data-id="${id}" onclick="app.completeJob(this.dataset.id)"><i class="ri-check-double-line"></i> Complete</button>` : ''}
                                   <button class="btn btn-warn btn-sm" data-id="${id}" onclick="app.unassignJob(this.dataset.id)">Undo</button>`
                                : `<button class="btn btn-primary btn-sm" data-id="${id}" onclick="app.viewBids(this.dataset.id)">View bids</button>`
                            }
                            <button class="btn btn-danger-ghost btn-sm btn-icon" data-id="${id}" onclick="app.deleteJob(this.dataset.id)" aria-label="Archive job" title="Archive job"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </div>
                </article>
            `;
        };

        // Group by delivery month, latest month first
        const byMonth = new Map();
        shown.forEach(j => {
            const k = this.monthKey(j.delivery_date);
            if (!byMonth.has(k)) byMonth.set(k, []);
            byMonth.get(k).push(j);
        });
        const monthKeys = [...byMonth.keys()].sort((x, y) => x === '' ? 1 : (y === '' ? -1 : y.localeCompare(x)));
        container.innerHTML = todoChips + monthKeys.map(k =>
            `<h3 class="month-head">${ui.esc(this.monthLabel(k))}</h3>` +
            byMonth.get(k).map(cardOf).join('')
        ).join('');
    },

    renderTransporterJobs(allJobs) {
        allJobs = allJobs || [];
        this.boardJobs = allJobs;
        const jobs = this.filterJobs(allJobs, 'board'); // delivery-date filter
        this.updateFilterUi('board', jobs.length, allJobs.length);
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
            const filtered = allJobs.length > 0;
            transporterJobsContainer.innerHTML = bannerHtml + (filtered
                ? ui.empty('ri-search-line', 'No jobs on these dates', 'Try a different date range.')
                : ui.empty('ri-truck-line', 'No open jobs right now', 'New loads appear here as soon as they are posted.'));
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
                    ${ui.route(job, { contacts: false })}
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
    // --- ADMIN: TRANSPORTERS TAB ---
    // Per transporter, for one delivery month: jobs awarded, delivered, on time / late / overdue,
    // jobs the admin took back (Undo), how they price (our price vs counter-offers) and where they usually go.
    // ==========================================
    showRtTransporters() {
        ui.setTab('transporters');
        this.showView('rtTransporters');
        this.fetchTransporterStats();
    },

    // Reads every row, 1000 at a time (the API returns at most 1000 per request)
    async fetchAllRows(build) {
        const out = [];
        const size = 1000;
        for (let from = 0; ; from += size) {
            const { data, error } = await build().range(from, from + size - 1);
            if (error) return { data: null, error };
            out.push(...(data || []));
            if (!data || data.length < size) break;
        }
        return { data: out, error: null };
    },

    async fetchTransporterStats(silent = false) {
        const container = document.getElementById('rt-transporters-container');
        if (!silent) container.innerHTML = ui.skeleton(3, 220);

        const [bidsRes, tpRes, cancelRes, ratingsRes] = await Promise.all([
            this.fetchAllRows(() => supabaseClient.from('bids').select('*, jobs(*)').order('created_at', { ascending: false })),
            supabaseClient.from('transporters').select('id, company_name, contact_person, phone, banned_until, last_active_at'),
            supabaseClient.from('job_cancellations').select('job_id, transporter_id, delivery_date, cancelled_at'),
            this.fetchAllRows(() => supabaseClient.from('job_docs').select('job_id, rating, rated_at, rated_transporter_id').not('rating', 'is', null).order('job_id'))
        ]);

        if (bidsRes.error) {
            console.error(bidsRes.error);
            if (!silent) container.innerHTML = ui.errorBlock(bidsRes.error.message);
            return;
        }
        if (tpRes.error) console.error('Could not load transporters:', tpRes.error);
        if (cancelRes.error) console.warn('Cancellations not available:', cancelRes.error.message);
        if (ratingsRes.error) console.warn('Ratings not available:', ratingsRes.error.message);

        if (silent && !this.viewIs('rtTransporters')) return;
        const data = {
            bids: (bidsRes.data || []).filter(b => b.jobs),
            transporters: tpRes.data || [],
            cancels: cancelRes.error ? [] : (cancelRes.data || []),
            cancelOk: !cancelRes.error,
            ratings: ratingsRes.error ? [] : (ratingsRes.data || []).map(r => ({ job_id: r.job_id, transporter_id: r.rated_transporter_id, rating: r.rating, created_at: r.rated_at })),
            ratingsOk: !ratingsRes.error
        };
        const sig = JSON.stringify(data);
        if (silent && sig === this.lastSig.transporters) return;
        this.lastSig.transporters = sig;
        this.tpData = data;
        this.renderTransporterStats();
    },

    setTpMonth(key) {
        this.tpMonth = key || 'all';
        this.renderTransporterStats();
    },

    // "Just now", "5 min ago", "3 hr ago", "2 days ago"
    relativeTime(iso) {
        const d = new Date(iso);
        if (!iso || isNaN(d)) return 'Never';
        const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} min ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hr ago`;
        const days = Math.floor(hrs / 24);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    },

    // Malaysia calendar day (YYYY-MM-DD) of a timestamp
    myDay(ts) {
        const d = new Date(ts);
        if (!ts || isNaN(d)) return '';
        return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
    },

    // "Johor Bahru, JHR" -> JHR. Text without a comma is used as it is.
    regionOf(text) {
        const t = String(text || '').trim().replace(/\s+/g, ' ');
        if (!t) return null;
        const parts = t.split(',');
        const r = parts[parts.length - 1].trim();
        if (!r) return null;
        return { key: r.toLowerCase(), label: /^[A-Za-z]{2,3}$/.test(r) ? r.toUpperCase() : ui.place(r) };
    },

    renderTransporterStats() {
        const d = this.tpData;
        const container = document.getElementById('rt-transporters-container');
        if (!d || !container) return;

        // Which delivery month a bid belongs to: the date it proposed, otherwise the job's own date
        const agreedOf = (b) => b.proposed_date || b.jobs.delivery_date || '';
        const monthOfBid = (b) => this.monthKey(agreedOf(b));

        // Month picker: every month with activity, plus this month
        const thisMonth = this.myDay(new Date()).slice(0, 7);
        const monthSet = new Set([thisMonth]);
        d.bids.forEach(b => { const k = monthOfBid(b); if (k) monthSet.add(k); });
        d.cancels.forEach(c => { const k = this.monthKey(c.delivery_date); if (k) monthSet.add(k); });
        const months = [...monthSet].sort().reverse();
        if (!this.tpMonth) this.tpMonth = thisMonth;
        const month = (this.tpMonth === 'all' || monthSet.has(this.tpMonth)) ? this.tpMonth : thisMonth;
        const sel = document.getElementById('tp-month');
        if (sel) {
            sel.innerHTML = months.map(k => `<option value="${ui.esc(k)}">${ui.esc(this.monthLabel(k))}</option>`).join('') + '<option value="all">All time</option>';
            sel.value = month;
        }
        const inMonth = (k) => month === 'all' || k === month;

        const today = this.myDay(new Date());
        const stats = {};
        const get = (id) => stats[id] || (stats[id] = {
            bids: 0, quick: 0, counter: 0,
            awarded: 0, delivered: 0, onTime: 0, late: 0, overdue: 0, inProgress: 0, cancelled: 0,
            atBudget: 0, viaCounter: 0, diffSum: 0, places: {},
            ratingSum: 0, ratingCount: 0
        });

        d.bids.forEach(b => {
            if (!inMonth(monthOfBid(b))) return;
            const j = b.jobs;
            const s = get(b.transporter_id);
            const priceSame = Number(b.proposed_price) === Number(j.offered_price);
            const dateSame = !b.proposed_date || b.proposed_date === j.delivery_date;
            const quick = priceSame && dateSame;
            s.bids++;
            if (quick) s.quick++; else s.counter++;

            if (b.status !== 'accepted') return;
            s.awarded++;
            if (quick) s.atBudget++; else s.viaCounter++;
            s.diffSum += Number(j.accepted_price ?? b.proposed_price) - Number(j.offered_price);

            const agreed = agreedOf(b);
            if (j.do_url) {
                s.delivered++;
                let ts = j.do_uploaded_at;
                if (!ts) {
                    const times = ui.parseDos(j).map(x => x.uploaded_at).filter(Boolean).sort();
                    ts = times[times.length - 1];
                }
                const day = this.myDay(ts);
                if (day && agreed) { if (day <= agreed) s.onTime++; else s.late++; }
            } else if (j.status === 'assigned') {
                if (agreed && agreed < today) s.overdue++; else s.inProgress++;
            }

            // Where they go: pickup and every drop-off, each area counted once per job
            const seen = new Set();
            [j.source_loc, j.dest_loc, ...ui.stops(j).map(x => x.loc)].forEach(t => {
                const r = this.regionOf(t);
                if (!r || seen.has(r.key)) return;
                seen.add(r.key);
                const p = s.places[r.key] || (s.places[r.key] = { label: r.label, n: 0 });
                p.n++;
            });
        });

        d.cancels.forEach(c => {
            if (inMonth(this.monthKey(c.delivery_date))) get(c.transporter_id).cancelled++;
        });

        // Customer ratings count in the delivery month of the job they belong to
        const bidFor = new Map(d.bids.map(b => [`${b.job_id}|${b.transporter_id}`, b]));
        d.ratings.forEach(r => {
            const b = bidFor.get(`${r.job_id}|${r.transporter_id}`);
            const k = b ? monthOfBid(b) : this.monthKey(this.myDay(r.created_at));
            if (!inMonth(k)) return;
            const s = get(r.transporter_id);
            s.ratingSum += Number(r.rating);
            s.ratingCount++;
        });

        const profiles = new Map(d.transporters.map(t => [String(t.id), t]));
        const q = (document.getElementById('tp-search')?.value || '').trim().toLowerCase();
        const rows = Object.keys(stats)
            .map(id => ({ id, s: stats[id], p: profiles.get(String(id)) || {} }))
            .filter(r => r.s.bids || r.s.cancelled)
            .filter(r => !q || [r.p.company_name, r.p.contact_person].filter(Boolean).join(' ').toLowerCase().includes(q))
            .sort((x, y) => (y.s.awarded - x.s.awarded) || (y.s.bids - x.s.bids) ||
                String(x.p.company_name || '').localeCompare(String(y.p.company_name || '')));

        const count = document.getElementById('tp-count');
        if (count) count.textContent = rows.length ? `${rows.length} transporter${rows.length === 1 ? '' : 's'}` : '';

        const note = (d.cancelOk ? '' :
            `<div class="notice notice-warn"><i class="ri-information-line"></i><span>"Taken back" is not being recorded yet. The job_cancellations table is missing in Supabase.</span></div>`) +
            (d.ratingsOk ? '' :
            `<div class="notice notice-warn"><i class="ri-information-line"></i><span>Customer ratings could not be loaded. Has the rating SQL been run in Supabase?</span></div>`);

        if (!rows.length) {
            container.innerHTML = note + ui.empty('ri-truck-line', 'No transporter activity',
                q ? 'No transporter matches this search.' : 'Nobody bid on jobs for this month.');
            return;
        }

        const box = (value, label, tone = '') => `<div class="tp-stat${tone ? ' is-' + tone : ''}"><b>${value}</b><span>${label}</span></div>`;
        const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

        container.innerHTML = note + rows.map(({ id, s, p }) => {
            const tel = String(p.phone || '').replace(/[^\d+]/g, '');
            const phoneHtml = p.phone
                ? (tel ? `<a href="tel:${ui.esc(tel)}"><i class="ri-phone-line"></i>${ui.esc(p.phone)}</a>` : `<span><i class="ri-phone-line"></i>${ui.esc(p.phone)}</span>`)
                : '';
            const banned = p.banned_until && new Date(p.banned_until).getTime() > Date.now();

            const timed = s.onTime + s.late;
            const rate = timed ? Math.round(s.onTime / timed * 100) : null;
            const avgRating = s.ratingCount ? s.ratingSum / s.ratingCount : 0;
            const pills = [];
            if (banned) pills.push(ui.pill('Suspended', 'stop', 'ri-lock-line'));
            if (rate !== null) pills.push(ui.pill(`${rate}% on time`, rate >= 90 ? 'go' : (rate >= 70 ? 'warn' : 'stop')));
            if (s.ratingCount) pills.push(ui.pill(`${avgRating.toFixed(1)} (${s.ratingCount})`, avgRating >= 4.5 ? 'go' : (avgRating >= 3.5 ? 'warn' : 'stop'), 'ri-star-fill'));
            if (s.bids >= 3 && s.counter / s.bids >= 0.6) pills.push(ui.pill('Mostly counter-offers', 'warn'));
            else if (s.bids >= 3 && s.quick / s.bids >= 0.8) pills.push(ui.pill('Usually accepts our price', 'go'));

            const avg = s.awarded ? s.diffSum / s.awarded : 0;
            const avgPill = !s.awarded ? ''
                : Math.abs(avg) < 0.005 ? ui.pill('Paid at budget', 'neutral')
                : avg > 0 ? ui.pill(`Avg RM ${ui.money(avg)} above budget`, 'warn')
                : ui.pill(`Avg RM ${ui.money(Math.abs(avg))} below budget`, 'go');

            // Customer ratings: the average, shown as stars
            const ratingHtml = s.ratingCount
                ? `<div class="remarks"><b>Customer ratings</b>
                        <div class="tp-line">${ui.stars(avgRating)}<span>${avgRating.toFixed(1)} out of 5 from ${plural(s.ratingCount, 'rating')}</span></div></div>`
                : '';

            const places = Object.values(s.places).sort((x, y) => y.n - x.n || x.label.localeCompare(y.label)).slice(0, 4);
            const placesHtml = places.length
                ? places.map(x => `${ui.esc(x.label)} <span class="hint">&times;${x.n}</span>`).join(' &middot; ')
                : '<span class="hint">No awarded jobs yet</span>';

            // Collapsed by default: name, status pills and a one-line summary. "Show more" opens everything else.
            const key = 'tp-' + id;
            if (!(key in this.cardOpen)) this.cardOpen[key] = false;
            const open = this.cardOpen[key];
            const summary = [
                `${s.awarded} awarded`,
                `${s.delivered} delivered`,
                s.inProgress ? `${s.inProgress} in progress` : '',
                s.overdue ? `${s.overdue} overdue` : '',
                s.cancelled ? `${s.cancelled} taken back` : ''
            ].filter(Boolean).join(' · ');

            return `
                <article class="job-card${open ? '' : ' is-collapsed'}" data-job="${ui.esc(key)}">
                    <div class="bid-top">
                        <div>
                            <h3 class="bid-company">${ui.esc(p.company_name || 'Unknown transporter')}</h3>
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">${pills.join('')}</div>
                    </div>
                    <div class="job-summary"><div class="sum-meta">${summary}</div></div>
                    <div class="job-body" id="jb-${ui.esc(key)}">
                            <div class="bid-contact" style="margin-top:0">
                                ${p.contact_person ? `<span><i class="ri-user-line"></i>${ui.esc(p.contact_person)}</span>` : ''}
                                ${phoneHtml}
                                <span title="${ui.esc(p.last_active_at ? ui.fmtDateTime(p.last_active_at) : 'Has not opened the job board yet')}"><i class="ri-time-line"></i>Last active: ${ui.esc(this.relativeTime(p.last_active_at))}${p.last_active_at ? ` <span class="hint">(${ui.fmtDateTime(p.last_active_at)})</span>` : ''}</span>
                            </div>
                    <div class="tp-stats">
                        ${box(s.awarded, 'Awarded')}
                        ${box(s.delivered, 'Delivered', s.delivered ? 'ok' : '')}
                        ${box(s.inProgress, 'In progress')}
                        ${d.cancelOk ? box(s.cancelled, 'Taken back', s.cancelled ? 'stop' : '') : box('&ndash;', 'Taken back')}
                        ${box(s.onTime, 'On time', s.onTime ? 'ok' : '')}
                        ${box(s.late, 'Late', s.late ? 'warn' : '')}
                        ${box(s.overdue, 'Overdue', s.overdue ? 'stop' : '')}
                        ${box(rate === null ? '&ndash;' : rate + '%', 'On-time rate')}
                    </div>
                    <div class="remarks">
                        <b>Pricing</b>
                        <div class="tp-line">
                            <span>${plural(s.bids, 'bid')}: ${s.quick} at our price, ${s.counter} counter-offer${s.counter === 1 ? '' : 's'}</span>
                        </div>
                        ${s.awarded ? `<div class="tp-line"><span>Awarded: ${s.atBudget} at our price, ${s.viaCounter} after counter-offer</span>${avgPill}</div>` : ''}
                    </div>
                    <div class="remarks">
                        <b>Common areas</b>
                        <div class="tp-line">${placesHtml}</div>
                    </div>
                    ${ratingHtml}
                    </div>
                    ${this.adminToggle(ui.esc(key), open)}
                </article>
            `;
        }).join('');
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
