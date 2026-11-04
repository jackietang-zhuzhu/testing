// ==========================================================================
// RT LorryLink: English / Bahasa Malaysia
//
// How it works: the app is still written in English. When the language is BM, this file
// translates the text on the screen (and confirm() pop-ups) by looking it up below.
//  - EXACT   : a whole sentence or word -> its Malay version
//  - PREFIX  : messages that start with a fixed label, followed by something we cannot translate (e.g. an error from Supabase)
//  - PATTERNS: sentences that contain numbers, dates or names
// Text that is not listed here simply stays in English, so nothing breaks.
// Left in English on purpose: RT LorryLink, DO, PO, INV, RM, WhatsApp, item names (Jumbo Bags, Drums, Pallets, Pails).
// To fix a translation, just edit the Malay side. To add a new one, add a new line.
// ==========================================================================
(function () {
    'use strict';

    var KEY = 'rtll-lang';
    var lang = 'en';
    try { lang = localStorage.getItem(KEY) === 'ms' ? 'ms' : 'en'; } catch (e) { /* storage blocked: stay English */ }

    // ---------------------------------------------------------------- EXACT
    var EXACT = {
        // ----- header, login, register, forgot password -----
        "Log out": "Log keluar",
        "Sign in": "Log masuk",
        "See today's loads and bids.": "Lihat muatan dan tawaran hari ini.",
        "Email address": "Alamat e-mel",
        "Password": "Kata laluan",
        "Forgot password?": "Lupa kata laluan?",
        "Log in": "Log masuk",
        "Logging in...": "Sedang log masuk...",
        "New transporter?": "Pengangkut baharu?",
        "Register as transporter": "Daftar sebagai pengangkut",
        "Want to place a delivery order?": "Ingin membuat pesanan penghantaran?",
        "Register as customer": "Daftar sebagai pelanggan",
        "Create a transporter account to bid on loads. We'll email you a link to confirm your address.": "Cipta akaun pengangkut untuk membida muatan. Kami akan menghantar pautan ke e-mel anda untuk mengesahkan alamat anda.",
        "Create a customer account to place delivery orders. We'll email you a link to confirm your address.": "Cipta akaun pelanggan untuk membuat pesanan penghantaran. Kami akan menghantar pautan ke e-mel anda untuk mengesahkan alamat anda.",
        "Company name": "Nama syarikat",
        "Contact person": "Orang untuk dihubungi",
        "Phone number": "Nombor telefon",
        "At least 6 characters.": "Sekurang-kurangnya 6 aksara.",
        "Create account": "Cipta akaun",
        "Back to log in": "Kembali ke log masuk",
        "Reset your password": "Tetapkan semula kata laluan",
        "Enter your email and we'll send you a link to set a new one.": "Masukkan e-mel anda dan kami akan menghantar pautan untuk menetapkan kata laluan baharu.",
        "Send reset link": "Hantar pautan tetapan semula",

        // ----- tabs -----
        "Jobs": "Kerja",
        "Requests": "Permintaan",
        "Transporters": "Pengangkut",
        "History": "Sejarah",
        "Job board": "Papan kerja",
        "My jobs": "Kerja saya",
        "Main": "Utama",

        // ----- admin: jobs list, requests, history, transporters -----
        "Active jobs": "Kerja aktif",
        "Review bids and award loads.": "Semak tawaran dan anugerahkan muatan.",
        "Post job": "Hantar kerja",
        "Search customer, location, item...": "Cari pelanggan, lokasi, barang...",
        "Search jobs": "Cari kerja",
        "Filter by delivery month": "Tapis mengikut bulan penghantaran",
        "Choose delivery month": "Pilih bulan penghantaran",
        "Clear filters": "Kosongkan penapis",
        "Customer requests": "Permintaan pelanggan",
        "Check each request and post it.": "Semak setiap permintaan dan siarkannya.",
        "Completed jobs (the latest 200). Pick a delivery month to narrow down.": "Kerja selesai (200 terkini). Pilih bulan penghantaran untuk mengecilkan senarai.",
        "Jobs, timing and pricing for each transporter.": "Kerja, ketepatan masa dan harga bagi setiap pengangkut.",
        "Search transporter...": "Cari pengangkut...",
        "Search transporters": "Cari pengangkut",
        "Delivery month": "Bulan penghantaran",
        "On time means the DO was uploaded on or before the agreed delivery date. Taken back means you pressed Undo on a job that was awarded to them. The star score is the average of the optional ratings customers give after a delivery.": "Tepat masa bermaksud DO dimuat naik pada atau sebelum tarikh penghantaran yang dipersetujui. Ditarik balik bermaksud anda menekan Undo pada kerja yang telah dianugerahkan kepada mereka. Skor bintang ialah purata penilaian pilihan yang diberikan pelanggan selepas penghantaran.",
        "Back to active jobs": "Kembali ke kerja aktif",
        "Back to requests": "Kembali ke permintaan",
        "Back to open jobs": "Kembali ke kerja terbuka",
        "Back to my orders": "Kembali ke pesanan saya",
        "Review job": "Semak kerja",
        "Bids": "Tawaran",
        "All": "Semua",
        "This month": "Bulan ini",
        "No date": "Tiada tarikh",
        "All time": "Sepanjang masa",

        // ----- forms (post job, customer order, admin review) -----
        "Post a job": "Hantar satu kerja",
        "Route": "Laluan",
        "Pickup location": "Lokasi pengambilan",
        "Pickup map link (optional)": "Pautan peta pengambilan (pilihan)",
        "Pickup person in charge (optional)": "Orang bertanggungjawab di lokasi pengambilan (pilihan)",
        "Pickup contact number (optional)": "Nombor telefon lokasi pengambilan (pilihan)",
        "Drop-off location": "Lokasi penghantaran",
        "Drop-off map link (optional)": "Pautan peta penghantaran (pilihan)",
        "Drop-off person in charge (optional)": "Orang bertanggungjawab di lokasi penghantaran (pilihan)",
        "Drop-off contact number (optional)": "Nombor telefon lokasi penghantaran (pilihan)",
        "Add another drop-off": "Tambah lokasi penghantaran lain",
        "Remove": "Buang",
        "Person in charge (optional)": "Orang bertanggungjawab (pilihan)",
        "Contact number (optional)": "Nombor telefon (pilihan)",
        "Map link (optional)": "Pautan peta (pilihan)",
        "Extra drop-off location": "Lokasi penghantaran tambahan",
        "Extra drop-off map link": "Pautan peta penghantaran tambahan",
        "Extra drop-off person in charge": "Orang bertanggungjawab di penghantaran tambahan",
        "Extra drop-off contact number": "Nombor telefon penghantaran tambahan",
        "Load": "Muatan",
        "Item": "Barang",
        "Quantity": "Kuantiti",
        "Others": "Lain-lain",
        "Others (please specify)": "Lain-lain (sila nyatakan)",
        "Unloading service required": "Perkhidmatan menurunkan barang diperlukan",
        "Schedule and price": "Jadual dan harga",
        "Delivery date": "Tarikh penghantaran",
        "Price (RM)": "Harga (RM)",
        "Price guide": "Panduan harga",
        "Photos and notes": "Gambar dan catatan",
        "Notes": "Catatan",
        "Photo 1 (optional)": "Gambar 1 (pilihan)",
        "Photo 2 (optional)": "Gambar 2 (pilihan)",
        "Remarks (optional)": "Catatan (pilihan)",
        "Publish job": "Terbitkan kerja",
        "Uploading & Publishing...": "Memuat naik & menerbitkan...",
        "New order": "Pesanan baharu",
        "Edit order": "Edit pesanan",
        "Edit & resubmit": "Edit & hantar semula",
        "Book again": "Tempah semula",
        "Primary address:": "Alamat utama:",
        "Use my primary address": "Guna alamat utama saya",
        "Save this pickup as my primary address": "Simpan lokasi pengambilan ini sebagai alamat utama saya",
        "Expected price (RM)": "Harga dijangka (RM)",
        "What you are willing to pay for this delivery.": "Jumlah yang sanggup anda bayar untuk penghantaran ini.",
        "Leave the photos empty to keep the current ones.": "Biarkan gambar kosong untuk mengekalkan gambar sedia ada.",
        "Place order": "Buat pesanan",
        "Save changes": "Simpan perubahan",
        "Resubmit order": "Hantar semula pesanan",
        "We will review your order and contact you on WhatsApp if we have any questions.": "Kami akan menyemak pesanan anda dan menghubungi anda melalui WhatsApp jika ada pertanyaan.",
        "You can change any detail below before posting. The customer's own request is not changed.": "Anda boleh mengubah mana-mana butiran di bawah sebelum menyiarkan. Permintaan asal pelanggan tidak akan berubah.",
        "Price to post (RM)": "Harga untuk disiarkan (RM)",
        "Approve & post job": "Lulus & siarkan kerja",
        "Reject": "Tolak",
        "Reason (optional)": "Sebab (pilihan)",
        "The customer will see this. They can then edit the order and resubmit it.": "Pelanggan akan nampak ini. Mereka kemudian boleh mengedit pesanan dan menghantarnya semula.",
        "Confirm reject": "Sahkan penolakan",
        "cth. Mr Lim": "cth. Mr Lim",
        "e.g. Petaling Jaya, SEL": "cth. Petaling Jaya, SEL",
        "e.g. Johor Bahru, JHR": "cth. Johor Bahru, JHR",
        "e.g. Skudai, JHR": "cth. Skudai, JHR",
        "e.g. Mr Lim": "cth. Mr Lim",
        "e.g. Handle with care": "cth. Kendalikan dengan berhati-hati",
        "e.g. IBC Tank, Steel Rolls": "cth. Tangki IBC, Gulungan Keluli",
        "e.g. Please check the pickup address and the delivery date": "cth. Sila semak alamat pengambilan dan tarikh penghantaran",

        // ----- order confirmation dialog -----
        "Check your order": "Semak pesanan anda",
        "Please make sure everything is correct before you confirm.": "Sila pastikan semuanya betul sebelum anda mengesahkan.",
        "Go back": "Kembali",
        "PO replaced. Please make sure it is the correct file.": "PO diganti. Sila pastikan ia fail yang betul.",
        "DO replaced. Please make sure it is the correct file.": "DO diganti. Sila pastikan ia fail yang betul.",
        "Invoice replaced. Please make sure it is the correct file.": "Invois diganti. Sila pastikan ia fail yang betul.",
        "Please confirm": "Sila sahkan",
        "Confirm": "Sahkan",
        "Replace": "Gantikan",
        "Replace file?": "Gantikan fail?",
        "Restore job?": "Pulihkan kerja?",
        "Remove job?": "Keluarkan kerja?",
        "Undo assignment?": "Batalkan tugasan?",
        "Delete order?": "Padam pesanan?",
        "Cancel order?": "Batalkan pesanan?",
        "Complete job?": "Selesaikan kerja?",
        "Confirm order": "Sahkan pesanan",
        "Confirm & resubmit": "Sahkan & hantar semula",
        "Confirm changes": "Sahkan perubahan",
        "Uploading & sending...": "Memuat naik & menghantar...",
        "Pickup": "Pengambilan",
        "Drop-offs": "Penghantaran",
        "Drop-off": "Penghantaran",
        "Unloading": "Menurunkan barang",
        "Required": "Diperlukan",
        "Not needed": "Tidak diperlukan",
        "Expected price": "Harga dijangka",
        "Remarks": "Catatan",
        "Photos": "Gambar",
        "Primary address": "Alamat utama",
        "Pickup will be saved": "Lokasi pengambilan akan disimpan",

        // ----- customer -----
        "Welcome": "Selamat datang",
        "Your orders and delivery status.": "Pesanan dan status penghantaran anda.",
        "Delivery from": "Penghantaran dari",
        "Delivery to": "Penghantaran hingga",
        "Past orders that are no longer in your active list. Pick a delivery month to narrow down.": "Pesanan lepas yang tiada lagi dalam senarai aktif anda. Pilih bulan penghantaran untuk mengecilkan senarai.",
        "Order received": "Pesanan diterima",
        "Looking for driver": "Mencari pemandu",
        "Driver assigned": "Pemandu ditugaskan",
        "Delivered": "Dihantar",
        "Rejected": "Ditolak",
        "Rejected.": "Ditolak.",
        "Edit the order and resubmit it, or delete it.": "Edit pesanan dan hantar semula, atau padamkannya.",
        "Cancel order": "Batal pesanan",
        "Order progress": "Kemajuan pesanan",
        "Expand all": "Kembangkan semua",
        "Collapse all": "Tutup semua",
        "Show more": "Tunjuk lagi",
        "Show less": "Tunjuk kurang",
        "Your expected price": "Harga dijangka anda",
        "Your PO": "PO anda",
        "How was the delivery?": "Bagaimana penghantaran tadi?",
        "Your rating": "Penilaian anda",
        "Tap a star to change": "Ketik bintang untuk menukar",
        "Optional": "Pilihan",
        "Rate the transporter from 1 to 5 stars": "Nilai pengangkut dari 1 hingga 5 bintang",
        "Rating updated": "Penilaian dikemas kini",
        "Thank you! Your rating has been submitted": "Terima kasih! Penilaian anda telah dihantar",

        // ----- transporter -----
        "Open jobs": "Kerja terbuka",
        "Accept at the posted price or send a counter-offer.": "Terima pada harga yang disiarkan atau hantar tawaran balas.",
        "Recently awarded": "Baru dianugerahkan",
        "Loads move fast. Check the board daily.": "Muatan cepat diambil. Semak papan setiap hari.",
        "My assigned jobs": "Kerja yang ditugaskan kepada saya",
        "Loads awarded to your company.": "Muatan yang dianugerahkan kepada syarikat anda.",
        "Past jobs that are no longer in your active list. Pick a delivery month to narrow down.": "Kerja lepas yang tiada lagi dalam senarai aktif anda. Pilih bulan penghantaran untuk mengecilkan senarai.",
        "Counter-offer": "Tawaran balas",
        "Your price (RM)": "Harga anda (RM)",
        "Must be within 3 days of the original date.": "Mesti dalam lingkungan 3 hari daripada tarikh asal.",
        "Submit counter-offer": "Hantar tawaran balas",
        "Accept job": "Terima kerja",
        "Award job": "Anugerahkan kerja",
        "Account suspended": "Akaun digantung",
        "You can't accept or bid on new jobs for now. You can still browse the board.": "Anda tidak boleh menerima atau membida kerja baharu buat masa ini. Anda masih boleh melihat papan kerja.",
        "Calculating remaining time...": "Mengira masa yang tinggal...",
        "Ban expires in:": "Penggantungan tamat dalam:",
        "Ban has expired! Please refresh the page.": "Penggantungan telah tamat! Sila muat semula halaman.",
        "Suspended": "Digantung",
        "Bid sent": "Tawaran dihantar",
        "Your bid:": "Tawaran anda:",
        "You accepted at the posted price:": "Anda menerima pada harga yang disiarkan:",
        "Your bid": "Tawaran anda",
        "You accepted at the posted price": "Anda menerima pada harga yang disiarkan",

        // ----- statuses and pills -----
        "Open": "Terbuka",
        "Open for bids": "Terbuka untuk tawaran",
        "Awaiting review": "Menunggu semakan",
        "Assigned": "Ditugaskan",
        "Assigned to you": "Ditugaskan kepada anda",
        "Pending invoice": "Menunggu invois",
        "Completed": "Selesai",
        "PO missing": "PO tiada",
        "INV to upload": "INV perlu dimuat naik",
        "DO not uploaded": "DO belum dimuat naik",
        "Waiting for PO": "Menunggu PO",
        "Lowest bid": "Tawaran terendah",
        "Matches budget": "Sama dengan bajet",
        "No bids yet": "Belum ada tawaran",
        "Awarded": "Dianugerahkan",
        "submitted": "dihantar",
        "Mostly counter-offers": "Kebanyakannya tawaran balas",
        "Usually accepts our price": "Biasanya terima harga kami",
        "Paid at budget": "Dibayar mengikut bajet",
        "Unloading required": "Perlu menurunkan barang",
        "New date proposed:": "Tarikh baharu dicadangkan:",
        "Unknown customer": "Pelanggan tidak diketahui",
        "Unknown transporter": "Pengangkut tidak diketahui",
        "Unknown time": "Masa tidak diketahui",

        // ----- buttons on cards -----
        "Review": "Semak",
        "Restore": "Pulihkan",
        "Assigned details": "Butiran tugasan",
        "Mark as complete": "Tandakan selesai",
        "Undo": "Undo",
        "View bids": "Lihat tawaran",
        "Edit": "Edit",
        "Delete": "Padam",
        "Download": "Muat turun",
        "Upload DO": "Muat naik DO",
        "Replace DO": "Ganti DO",
        "Upload PO": "Muat naik PO",
        "Replace PO": "Ganti PO",
        "Upload INV": "Muat naik INV",
        "Replace INV": "Ganti INV",
        "Archive job": "Arkibkan kerja",
        "Open pickup in Maps": "Buka lokasi pengambilan di Maps",
        "Open drop-off in Maps": "Buka lokasi penghantaran di Maps",

        // ----- price labels -----
        "Budget": "Bajet",
        "Accepted price": "Harga diterima",
        "Customer expected price": "Harga dijangka pelanggan",
        "Original budget": "Bajet asal",
        "Proposed price": "Harga dicadangkan",
        "Offered price": "Harga ditawarkan",
        "Your price": "Harga anda",
        "Awarded at": "Dianugerahkan pada",

        // ----- documents -----
        "Delivery Order (DO)": "Delivery Order (DO)",
        "Delivery Orders (DO)": "Delivery Order (DO)",
        "Customer PO": "PO pelanggan",
        "Invoice (INV)": "Invois (INV)",
        "Not uploaded yet": "Belum dimuat naik",
        "Upload your PO so we can prepare your invoice.": "Muat naik PO anda supaya kami boleh menyediakan invois anda.",
        "Upload the invoice once it is ready. The customer will see it on their order.": "Muat naik invois apabila siap. Pelanggan akan melihatnya pada pesanan mereka.",
        "No PO yet. The customer can upload it, or you can upload it here.": "Belum ada PO. Pelanggan boleh memuat naiknya, atau anda boleh memuat naik di sini.",
        "Upload one DO for each drop-off": "Muat naik satu DO untuk setiap lokasi penghantaran",
        "Image or PDF, max 10 MB. The job counts as delivered once every drop-off has its DO.": "Imej atau PDF, maksimum 10 MB. Kerja dikira telah dihantar apabila setiap lokasi penghantaran mempunyai DO.",
        "Image or PDF, max 10 MB": "Imej atau PDF, maksimum 10 MB",
        "Please upload the DO once the delivery is done.": "Sila muat naik DO selepas penghantaran selesai.",
        "Customer:": "Pelanggan:",
        "Remarks:": "Catatan:",
        "Customer rating:": "Penilaian pelanggan:",
        "Customer ratings": "Penilaian pelanggan",

        // ----- transporter stats (admin) -----
        "Pricing": "Harga",
        "Common areas": "Kawasan lazim",
        "No awarded jobs yet": "Belum ada kerja dianugerahkan",
        "In progress": "Dalam proses",
        "Taken back": "Ditarik balik",
        "On time": "Tepat masa",
        "Late": "Lewat",
        "Overdue": "Tertunggak",
        "On-time rate": "Kadar tepat masa",
        "No transporter activity": "Tiada aktiviti pengangkut",
        "No transporter matches this search.": "Tiada pengangkut sepadan dengan carian ini.",
        "Nobody bid on jobs for this month.": "Tiada sesiapa membida kerja bagi bulan ini.",
        "Just now": "Baru sebentar tadi",
        "Never": "Tidak pernah",

        // ----- empty states and errors -----
        "No jobs yet": "Belum ada kerja",
        "Post a job and transporters can start bidding.": "Hantar satu kerja dan pengangkut boleh mula membida.",
        "No matching jobs": "Tiada kerja sepadan",
        "Try a different name or date.": "Cuba nama atau tarikh yang lain.",
        "All caught up": "Semuanya sudah selesai",
        "No jobs are waiting on this.": "Tiada kerja menunggu perkara ini.",
        "No requests waiting": "Tiada permintaan menunggu",
        "Jobs sent by customers will show up here for review.": "Kerja yang dihantar pelanggan akan muncul di sini untuk disemak.",
        "No history yet": "Belum ada sejarah",
        "Jobs you remove from the active list will appear here.": "Kerja yang anda keluarkan daripada senarai aktif akan muncul di sini.",
        "Pick another month above to see other jobs.": "Pilih bulan lain di atas untuk melihat kerja lain.",
        "Pick another month above to see other orders.": "Pilih bulan lain di atas untuk melihat pesanan lain.",
        "Orders that have been removed from your list will appear here.": "Pesanan yang telah dikeluarkan daripada senarai anda akan muncul di sini.",
        "Jobs that have been removed from your list will appear here.": "Kerja yang telah dikeluarkan daripada senarai anda akan muncul di sini.",
        "No orders yet": "Belum ada pesanan",
        "Tap New order to place your first delivery order.": "Ketik Pesanan baharu untuk membuat pesanan penghantaran pertama anda.",
        "No orders on these dates": "Tiada pesanan pada tarikh ini",
        "Try a different date range.": "Cuba julat tarikh yang lain.",
        "Nothing here": "Tiada apa-apa di sini",
        "No orders in this status.": "Tiada pesanan dalam status ini.",
        "Already handled": "Sudah diuruskan",
        "This job is no longer waiting for review.": "Kerja ini tidak lagi menunggu semakan.",
        "No assigned jobs yet": "Belum ada kerja ditugaskan",
        "Jobs awarded to your company will show up here.": "Kerja yang dianugerahkan kepada syarikat anda akan muncul di sini.",
        "No jobs on these dates": "Tiada kerja pada tarikh ini",
        "No open jobs right now": "Tiada kerja terbuka buat masa ini",
        "New loads appear here as soon as they are posted.": "Muatan baharu akan muncul di sini sebaik sahaja disiarkan.",
        "No awards yet": "Belum ada anugerah",
        "Awarded loads will be listed here.": "Muatan yang dianugerahkan akan disenaraikan di sini.",
        "Transporters can accept or counter-offer while the job is open.": "Pengangkut boleh menerima atau membuat tawaran balas semasa kerja ini terbuka.",
        "Couldn't load this": "Tidak dapat dimuatkan",
        "Check your connection and try again.": "Semak sambungan anda dan cuba lagi.",

        // ----- toasts, notices and confirm pop-ups -----
        "Registration successful! Please check your mailbox to confirm your email (make sure to check your spam folder too!).": "Pendaftaran berjaya! Sila semak peti mel anda untuk mengesahkan e-mel anda (semak juga folder spam!).",
        "Password reset link sent! Please check your email.": "Pautan tetapan semula kata laluan telah dihantar! Sila semak e-mel anda.",
        "Please specify the item under Others.": "Sila nyatakan barang di bawah Lain-lain.",
        "Job published.": "Kerja diterbitkan.",
        "Your account is currently suspended. You cannot accept or bid on jobs.": "Akaun anda sedang digantung. Anda tidak boleh menerima atau membida kerja.",
        "You have already accepted this job, please wait for approval": "Anda telah menerima kerja ini, sila tunggu kelulusan",
        "Invalid bid = Counteroffer price cannot be higher than your previous bid": "Tawaran tidak sah: harga tawaran balas tidak boleh lebih tinggi daripada tawaran anda sebelum ini",
        "Job accepted successfully! Awaiting RT approval.": "Kerja berjaya diterima! Menunggu kelulusan RT.",
        "Counter-offer submitted successfully!": "Tawaran balas berjaya dihantar!",
        "Job awarded successfully!": "Kerja berjaya dianugerahkan!",
        "Are you sure you want to award the job to this transporter?": "Adakah anda pasti mahu menganugerahkan kerja ini kepada pengangkut ini?",
        "Are you sure you want to remove this job from your view? (It will be safely kept in the database).": "Adakah anda pasti mahu mengeluarkan kerja ini daripada paparan anda? (Ia akan disimpan dengan selamat dalam pangkalan data).",
        "Job successfully removed from view.": "Kerja berjaya dikeluarkan daripada paparan.",
        "Are you sure you want to undo this assignment? The job will be returned to the open market.": "Adakah anda pasti mahu membatalkan tugasan ini? Kerja ini akan dikembalikan ke pasaran terbuka.",
        "Undo failed: the database blocked the update.": "Undo gagal: pangkalan data menyekat kemas kini.",
        "Job assignment undone. It is now open for bids again.": "Tugasan kerja dibatalkan. Kini ia terbuka semula untuk tawaran.",
        "Copied from your previous order. Please set the date and price.": "Disalin daripada pesanan anda sebelum ini. Sila tetapkan tarikh dan harga.",
        "Delete this rejected order? This cannot be undone.": "Padam pesanan yang ditolak ini? Tindakan ini tidak boleh dibatalkan.",
        "Cancel this order? This cannot be undone.": "Batalkan pesanan ini? Tindakan ini tidak boleh dibatalkan.",
        "Order deleted.": "Pesanan dipadam.",
        "Order cancelled.": "Pesanan dibatalkan.",
        "Order resubmitted. We will review it shortly.": "Pesanan dihantar semula. Kami akan menyemaknya sebentar lagi.",
        "Changes saved. We will review your order shortly.": "Perubahan disimpan. Kami akan menyemak pesanan anda sebentar lagi.",
        "Order placed. We will review it shortly.": "Pesanan dibuat. Kami akan menyemaknya sebentar lagi.",
        "Uploading PO...": "Memuat naik PO...",
        "Uploading DO...": "Memuat naik DO...",
        "Uploading invoice...": "Memuat naik invois...",
        "Could not save the PO to the order. Please try again.": "Tidak dapat menyimpan PO pada pesanan. Sila cuba lagi.",
        "PO uploaded. Please wait for the admin to upload the INV. You can view the order in History.": "PO dimuat naik. Sila tunggu admin memuat naik INV. Anda boleh lihat pesanan ini dalam Sejarah.",
        "PO uploaded. Please make sure all documents are correct. Once all documents are uploaded, the job will move to History.": "PO dimuat naik. Sila pastikan semua dokumen betul. Selepas semua dokumen dimuat naik, kerja ini akan dipindahkan ke Sejarah.",
        "Invoice uploaded. Please make sure all documents are correct. Once all documents are uploaded, the job will move to History.": "Invois dimuat naik. Sila pastikan semua dokumen betul. Selepas semua dokumen dimuat naik, kerja ini akan dipindahkan ke Sejarah.",
        "An order status was updated": "Status pesanan telah dikemas kini",
        "An order was moved to History": "Satu pesanan telah dipindahkan ke Sejarah",
        "A job was moved to History": "Satu kerja telah dipindahkan ke Sejarah",
        "New customer request": "Permintaan pelanggan baharu",
        "New job on the board": "Kerja baharu di papan kerja",
        "Request rejected. The customer can edit and resubmit it.": "Permintaan ditolak. Pelanggan boleh mengedit dan menghantarnya semula.",
        "Please enter a valid price.": "Sila masukkan harga yang sah.",
        "Please enter a valid contact number, for example 012-345 6789.": "Sila masukkan nombor telefon yang sah, contohnya 012-345 6789.",
        "Are you sure you want to restore this job back to the active list?": "Adakah anda pasti mahu memulihkan kerja ini ke senarai aktif?",
        "Job successfully restored.": "Kerja berjaya dipulihkan.",
        "Job restored. It stays in Active jobs until you press Mark as complete.": "Kerja dipulihkan. Ia kekal dalam Kerja aktif sehingga anda menekan Tandakan selesai.",
        "Please upload the DO as an image (PNG or JPG) or a PDF.": "Sila muat naik DO sebagai imej (PNG atau JPG) atau PDF.",
        "File is too large. Maximum size is 10 MB.": "Fail terlalu besar. Saiz maksimum ialah 10 MB.",
        "DO uploaded.": "DO dimuat naik.",
        "DO uploaded. Please make sure all documents are correct. Once all documents are uploaded, the job will move to History.": "DO dimuat naik. Sila pastikan semua dokumen betul. Selepas semua dokumen dimuat naik, kerja ini akan dipindahkan ke Sejarah.",
        "DO uploaded. You can view this job in History later.": "DO dimuat naik. Anda boleh lihat kerja ini dalam Sejarah nanti.",
        "This will replace the DO already uploaded for this drop-off. Continue?": "Ini akan menggantikan DO yang telah dimuat naik untuk lokasi penghantaran ini. Teruskan?",
        "This will replace the DO you already uploaded. Continue?": "Ini akan menggantikan DO yang telah anda muat naik. Teruskan?",
        "This will replace the DO already uploaded. Continue?": "Ini akan menggantikan DO yang telah dimuat naik. Teruskan?",
        "There is no PO for this job.": "Tiada PO untuk kerja ini.",
        "Mark it as completed and move it to History anyway?": "Tandakan sebagai selesai dan pindahkan ke Sejarah juga?",
        "Mark this job as completed and move it to History?": "Tandakan kerja ini sebagai selesai dan pindahkan ke Sejarah?",
        "Could not complete the job: it may already have been handled.": "Tidak dapat menyelesaikan kerja: mungkin ia sudah diuruskan.",
        "Job completed and moved to History.": "Kerja selesai dan dipindahkan ke Sejarah.",
        "Failed to post job: it may already have been handled.": "Gagal menyiarkan kerja: mungkin ia sudah diuruskan."
    };

    // -------------------------------------------------------------- PREFIX
    // "<label>: <something we cannot translate, e.g. an error message from the database>"
    var PREFIX = {
        "Login Failed: ": "Log masuk gagal: ",
        "Registration Failed: ": "Pendaftaran gagal: ",
        "Error: ": "Ralat: ",
        "Failed to upload photo: ": "Gagal memuat naik gambar: ",
        "Failed to post job: ": "Gagal menyiarkan kerja: ",
        "Error validating bid: ": "Ralat mengesahkan tawaran: ",
        "Error submitting bid: ": "Ralat menghantar tawaran: ",
        "Error checking bid status: ": "Ralat menyemak status tawaran: ",
        "Error submitting counter-offer: ": "Ralat menghantar tawaran balas: ",
        "Error awarding job: ": "Ralat menganugerahkan kerja: ",
        "Error updating job status: ": "Ralat mengemas kini status kerja: ",
        "Error removing job: ": "Ralat mengeluarkan kerja: ",
        "Error unassigning job: ": "Ralat membatalkan tugasan kerja: ",
        "Error restoring job: ": "Ralat memulihkan kerja: ",
        "Error completing job: ": "Ralat menyelesaikan kerja: ",
        "Failed to delete order: ": "Gagal memadam pesanan: ",
        "Failed to cancel order: ": "Gagal membatalkan pesanan: ",
        "Failed to place order: ": "Gagal membuat pesanan: ",
        "Failed to reject: ": "Gagal menolak: ",
        "Failed to upload PO: ": "Gagal memuat naik PO: ",
        "Failed to upload INV: ": "Gagal memuat naik INV: ",
        "Failed to upload DO: ": "Gagal memuat naik DO: ",
        "Could not save the invoice to the job: ": "Tidak dapat menyimpan invois pada kerja: ",
        "Could not save the PO to the job: ": "Tidak dapat menyimpan PO pada kerja: ",
        "Could not save your rating: ": "Tidak dapat menyimpan penilaian anda: ",
        "DO uploaded but could not be saved to the job: ": "DO dimuat naik tetapi tidak dapat disimpan pada kerja: ",
        "Your order was placed, but your primary address could not be saved: ": "Pesanan anda telah dibuat, tetapi alamat utama anda tidak dapat disimpan: "
    };

    // ------------------------------------------------------------ PATTERNS
    function tr(s) { var r = translate(s); return r === null ? s : r; }
    function rel(s) { return tr(s); }

    var PATTERNS = [
        [/^Welcome, (.+)$/, function (m) { return 'Selamat datang, ' + m[1]; }],
        [/^Showing (\d+) of (\d+)$/, function (m) { return 'Menunjukkan ' + m[1] + ' daripada ' + m[2]; }],
        [/^(\d+) drop-offs$/, function (m) { return m[1] + ' lokasi penghantaran'; }],
        [/^Drop-off (\d+)$/, function (m) { return 'Penghantaran ' + m[1]; }],
        [/^Open drop-off (\d+) in Maps$/, function (m) { return 'Buka penghantaran ' + m[1] + ' di Maps'; }],
        [/^\+(\d+) more$/, function (m) { return '+' + m[1] + ' lagi'; }],
        [/^(\d+) bids?$/, function (m) { return m[1] + ' tawaran'; }],
        [/^(\d+)% on time$/, function (m) { return m[1] + '% tepat masa'; }],
        [/^DO (\d+)\/(\d+) uploaded$/, function (m) { return 'DO ' + m[1] + '/' + m[2] + ' dimuat naik'; }],
        [/^(\d+) of (\d+) uploaded$/, function (m) { return m[1] + ' daripada ' + m[2] + ' dimuat naik'; }],
        [/^(\d+) attached$/, function (m) { return m[1] + ' dilampirkan'; }],
        [/^RM (.+) below budget$/, function (m) { return 'RM ' + m[1] + ' di bawah bajet'; }],
        [/^RM (.+) above budget$/, function (m) { return 'RM ' + m[1] + ' melebihi bajet'; }],
        [/^Avg RM (.+) above budget$/, function (m) { return 'Purata RM ' + m[1] + ' melebihi bajet'; }],
        [/^Avg RM (.+) below budget$/, function (m) { return 'Purata RM ' + m[1] + ' di bawah bajet'; }],
        [/^(Posted|Ordered|Uploaded|Delivered|Submitted) (\d.*)$/, function (m) {
            var w = { Posted: 'Disiarkan', Ordered: 'Dipesan', Uploaded: 'Dimuat naik', Delivered: 'Dihantar', Submitted: 'Dihantar' };
            return w[m[1]] + ' ' + m[2];
        }],
        [/^(Delivery|Original date|Agreed delivery) (\d.*)$/, function (m) {
            var w = { 'Delivery': 'Penghantaran', 'Original date': 'Tarikh asal', 'Agreed delivery': 'Penghantaran dipersetujui' };
            return w[m[1]] + ' ' + m[2];
        }],
        [/^Still need to upload the DO for (\d+) drop-offs?\.$/, function (m) { return 'Masih perlu memuat naik DO untuk ' + m[1] + ' lokasi penghantaran.'; }],
        [/^You can add up to (\d+) extra drop-offs\.$/, function (m) { return 'Anda boleh menambah sehingga ' + m[1] + ' lokasi penghantaran tambahan.'; }],
        [/^\(The customer expected RM (.+)\.\)$/, function (m) { return '(Pelanggan menjangka RM ' + m[1] + '.)'; }],
        [/^Customer expected RM (.+)\.$/, function (m) { return 'Pelanggan menjangka RM ' + m[1] + '.'; }],
        [/^Post this job to transporters at RM (.+)\?$/, function (m) { return 'Siarkan kerja ini kepada pengangkut pada harga RM ' + m[1] + '?'; }],
        [/^Are you sure you want to accept this job for RM (.+)\?$/, function (m) { return 'Adakah anda pasti mahu menerima kerja ini pada harga RM ' + m[1] + '?'; }],
        [/^DO replaced for drop-off (\d+)\. Please make sure it is the correct file\.$/, function (m) { return 'DO diganti untuk penghantaran ' + m[1] + '. Sila pastikan ia fail yang betul.'; }],
        [/^DO uploaded for drop-off (\d+)\.$/, function (m) { return 'DO dimuat naik untuk penghantaran ' + m[1] + '.'; }],
        [/^Please upload the (PO|INV|DO) as an image \(PNG or JPG\) or a PDF\.$/, function (m) { return 'Sila muat naik ' + m[1] + ' sebagai imej (PNG atau JPG) atau PDF.'; }],
        [/^The (PO|INV) file is too large\. Maximum size is 10 MB\.$/, function (m) { return 'Fail ' + m[1] + ' terlalu besar. Saiz maksimum ialah 10 MB.'; }],
        [/^This will replace the (PO|INV) already uploaded\. Continue\?$/, function (m) { return 'Ini akan menggantikan ' + m[1] + ' yang telah dimuat naik. Teruskan?'; }],
        [/^Cannot complete yet: the (.+) must be uploaded first\.$/, function (m) { return 'Belum boleh diselesaikan: ' + m[1].replace(' and ', ' dan ') + ' mesti dimuat naik dahulu.'; }],
        [/^Your order was placed, but (.+) could not be saved\. Please tap Edit on the order and add (them|it) again\.$/, function (m) {
            var what = m[1].replace('the extra drop-offs', 'lokasi penghantaran tambahan').replace('the contact details', 'butiran hubungan').replace(' and ', ' dan ');
            return 'Pesanan anda telah dibuat, tetapi ' + what + ' tidak dapat disimpan. Sila ketik Edit pada pesanan dan tambahkannya semula.';
        }],
        [/^Nothing (in .+ )?matches\. Try a different name(, or pick another month\.|\.)$/, function (m) {
            var inMonth = m[1] ? ' dalam ' + m[1].replace(/^in /, '').trim() : '';
            return 'Tiada apa-apa' + inMonth + ' yang sepadan. Cuba nama lain' + (m[2].length > 1 ? ', atau pilih bulan lain.' : '.');
        }],
        [/^No history in (.+)$/, function (m) { return 'Tiada sejarah dalam ' + m[1]; }],
        [/^Last active: (.+)$/, function (m) { return 'Aktif kali terakhir: ' + rel(m[1]); }],
        [/^(\d+) min ago$/, function (m) { return m[1] + ' min lalu'; }],
        [/^(\d+) hr ago$/, function (m) { return m[1] + ' jam lalu'; }],
        [/^(\d+) days? ago$/, function (m) { return m[1] + ' hari lalu'; }],
        [/^(\d+) transporters?$/, function (m) { return m[1] + ' pengangkut'; }],
        [/^(\d+) awarded$/, function (m) { return m[1] + ' dianugerahkan'; }],
        [/^(\d+) delivered$/, function (m) { return m[1] + ' dihantar'; }],
        [/^(\d+) in progress$/, function (m) { return m[1] + ' dalam proses'; }],
        [/^(\d+) overdue$/, function (m) { return m[1] + ' tertunggak'; }],
        [/^(\d+) taken back$/, function (m) { return m[1] + ' ditarik balik'; }],
        [/^(\d+) bids?: (\d+) at our price, (\d+) counter-offers?$/, function (m) { return m[1] + ' tawaran: ' + m[2] + ' pada harga kami, ' + m[3] + ' tawaran balas'; }],
        [/^Awarded: (\d+) at our price, (\d+) after counter-offer$/, function (m) { return 'Dianugerahkan: ' + m[1] + ' pada harga kami, ' + m[2] + ' selepas tawaran balas'; }],
        [/^([\d.]+) out of 5 from (\d+) ratings?$/, function (m) { return m[1] + ' daripada 5 berdasarkan ' + m[2] + ' penilaian'; }],
        [/^(\d) stars?$/, function (m) { return m[1] + ' bintang'; }],
        [/^(\d) out of 5 stars$/, function (m) { return m[1] + ' daripada 5 bintang'; }],
        [/^(, delivery (.+?))?( \((\d+) bids, lowest shown\))?\. Waiting for approval\.$/, function (m) {
            return (m[2] ? ', penghantaran ' + m[2] : '') + (m[4] ? ' (' + m[4] + ' tawaran, yang terendah ditunjukkan)' : '') + '. Menunggu kelulusan.';
        }]
    ];

    // ----------------------------------------------------------- translate
    var has = Object.prototype.hasOwnProperty;

    function translate(s) {
        if (lang !== 'ms' || !s) return null;
        if (has.call(EXACT, s)) return EXACT[s];

        // multi-line pop-ups: translate line by line
        if (s.indexOf('\n') !== -1) {
            var changed = false;
            var out = s.split('\n').map(function (line) {
                var r = translate(line);
                if (r !== null) { changed = true; return r; }
                return line;
            });
            return changed ? out.join('\n') : null;
        }

        for (var k in PREFIX) {
            if (has.call(PREFIX, k) && s.indexOf(k) === 0) return PREFIX[k] + s.slice(k.length);
        }
        for (var i = 0; i < PATTERNS.length; i++) {
            var m = PATTERNS[i][0].exec(s);
            if (m) return PATTERNS[i][1](m);
        }

        // "5 Drums · Delivery 2 Nov 2026" style lines: translate each part
        if (s.indexOf(' · ') !== -1) {
            var any = false;
            var parts = s.split(' · ').map(function (p) {
                var r = translate(p);
                if (r !== null) { any = true; return r; }
                return p;
            });
            return any ? parts.join(' · ') : null;
        }
        return null;
    }

    // ------------------------------------------------------- apply to page
    var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
    var ATTRS = ['placeholder', 'aria-label', 'title'];

    function doText(node) {
        var v = node.nodeValue;
        if (!v) return;
        var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(v);
        if (!m[2]) return;
        var r = translate(m[2]);
        if (r !== null && r !== m[2]) node.nodeValue = m[1] + r + m[3];
    }

    function doAttrs(el) {
        for (var i = 0; i < ATTRS.length; i++) {
            var a = ATTRS[i];
            if (el.hasAttribute && el.hasAttribute(a)) {
                var v = el.getAttribute(a);
                var r = translate(v);
                if (r !== null && r !== v) el.setAttribute(a, r);
            }
        }
    }

    function walk(node) {
        if (node.nodeType === 3) { doText(node); return; }
        if (node.nodeType !== 1 || SKIP[node.nodeName]) return;
        doAttrs(node);
        for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
    }

    function start() {
        if (lang !== 'ms') return;
        document.documentElement.lang = 'ms';
        walk(document.body);
        new MutationObserver(function (list) {
            list.forEach(function (rec) {
                if (rec.type === 'childList') {
                    rec.addedNodes.forEach(walk);
                } else if (rec.type === 'characterData') {
                    if (rec.target.parentNode && !SKIP[rec.target.parentNode.nodeName]) doText(rec.target);
                } else if (rec.type === 'attributes') {
                    doAttrs(rec.target);
                }
            });
        }).observe(document.body, {
            childList: true, subtree: true, characterData: true,
            attributes: true, attributeFilter: ATTRS
        });
    }

    // confirm() pop-ups are not part of the page, so translate them before they are shown
    var nativeConfirm = window.confirm.bind(window);
    window.confirm = function (message) {
        var r = translate(String(message));
        return nativeConfirm(r !== null ? r : message);
    };

    // ------------------------------------------------------------- public
    window.I18N = {
        lang: function () { return lang; },
        // used for dates, months and numbers so they follow the language too
        locale: function () { return lang === 'ms' ? 'ms-MY' : 'en-MY'; },
        t: function (s) { return tr(s); },
        set: function (l) {
            try { localStorage.setItem(KEY, l === 'ms' ? 'ms' : 'en'); } catch (e) { /* ignore */ }
            location.reload(); // the page redraws everything in the chosen language (the login stays)
        },
        toggle: function () { this.set(lang === 'ms' ? 'en' : 'ms'); }
    };

    function boot() {
        var btn = document.getElementById('lang-btn');
        if (btn) {
            btn.textContent = lang === 'ms' ? 'EN' : 'BM';
            btn.setAttribute('aria-label', lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Malaysia');
            btn.addEventListener('click', function () { window.I18N.toggle(); });
        }
        start();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
