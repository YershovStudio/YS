/* ---------------- SHARED GLOBALS ---------------- */
// 1. Clear the hash (#) from the URL so the browser doesn't jump to it
if (window.location.hash) {
    history.replaceState("", document.title, window.location.pathname + window.location.search);
}

// 2. Force scroll restoration to manual
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// 3. Execute the scroll to top immediately and on load
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));
let hideTimeout = null;
let isNavHovered = false;
let lastScrollY = window.scrollY;
let lastTime = Date.now();
// Force the browser to start at the top on reload


window.scrollTo(0, 0);
document.addEventListener('DOMContentLoaded', () => {
    const navWrapper = document.querySelector('.nav-wrapper');
    const grid = document.querySelector('.poster-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.poster-item');
    const lightbox = document.getElementById('lightbox');

    if (!navWrapper) return;

    /* ---------------- HEADER HEIGHT ---------------- */
    function setNavHeight() {
        document.documentElement.style.setProperty(
            '--header-height',
            `${navWrapper.getBoundingClientRect().height}px`
        );
    }
    window.addEventListener('load', setNavHeight);
    window.addEventListener('resize', setNavHeight);
    setTimeout(setNavHeight, 250);

   /* ---------------- INITIAL PAGE SETUP ---------------- */
    const isPhotoPage = document.body.classList.contains('page-gallery');
    const isDesignPage = document.body.classList.contains('page-design');

 
if (grid) {
    // Only force grid-mode and auto-click filters if the Filter Bar exists
    const hasFilters = document.querySelector('.filter-bar') !== null;

    if ((isPhotoPage || isDesignPage) && hasFilters) {
        grid.classList.add('grid-mode');
        const defaultFilter = isPhotoPage ? 'specific' : 'branding'; 
        const startBtn = document.querySelector(`.filter-btn[data-filter="${defaultFilter}"]`);
        
        if (startBtn) {
            setTimeout(() => startBtn.click(), 50); 
        }
    } else {
        // If there is no filter bar (like on a specific project page),
        // remove grid-mode to allow the CSS masonry to take over.
        grid.classList.remove('grid-mode');
    }
}

    /* ---------------- FILTERING LOGIC ---------------- */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');

            // TOGGLE GRID VS MASONRY
            // If it's Branding or Specific, use the 4:5 Grid. 
            // If it's 'All' or 'Graphic', use Masonry.
            if (filterValue === 'branding' || filterValue === 'specific') {
                grid.classList.add('grid-mode');
            } else {
                grid.classList.remove('grid-mode');
            }

            items.forEach(item => {
                let shouldShow = false;

                if (filterValue === 'all') {
                    // Show raw photos/posters, hide project-cards
                    shouldShow = !item.classList.contains('project-card');
                } else {
                    shouldShow = item.classList.contains(filterValue);
                }

                if (shouldShow) {
                    // Instead of '', use 'inline-block' so Masonry can actually wrap them
                    item.style.display = 'inline-block'; 
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.display = 'none';
                }
            });
        });
    });

    /* ---------------- LIGHTBOX CLICK LOGIC (ADDED) ---------------- */
    if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            // 1. THE CRITICAL CHECK: If it's a project card, stop everything.
            if (item.classList.contains('project-card')) {
                return; // Do nothing. Let the <a> link take the user to the new page.
            }

            // 2. Otherwise, proceed with lightbox logic
            const mainImg = item.querySelector('img');
            const gallery = item.querySelector('.project-gallery');
            
            const oldCol = lightbox.querySelector('.lightbox-column');
            if (oldCol) oldCol.remove();

            if (gallery) {
                lightboxImg.style.display = 'none';
                const columnContainer = document.createElement('div');
                columnContainer.className = 'lightbox-column';
                gallery.querySelectorAll('img').forEach(img => {
                    const newImg = document.createElement('img');
                    newImg.src = img.src;
                    columnContainer.appendChild(newImg);
                });
                lightbox.querySelector('.lightbox-content').insertBefore(columnContainer, lightboxCaption);
            } else {
                lightboxImg.style.display = 'block';
                lightboxImg.src = mainImg.src;
            }
            
            lightboxCaption.textContent = mainImg.dataset.caption || '';
            document.body.classList.add('lightbox-open');
            lightbox.classList.add('active');
        });
    });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.closest('.lightbox-content')) {
                closeLightbox();
            }
        });
    }

    /* ---------------- NAV INTERACTION ---------------- */
    navWrapper.addEventListener('mouseenter', () => { isNavHovered = true; showNav(); });
    navWrapper.addEventListener('mouseleave', () => { 
        isNavHovered = false; 
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (window.scrollY > 50) hideNav();
        }, 800); 
    });

    /* ---------------- SMART SCROLL LOGIC ---------------- */
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        if (currentScrollY <= 50) {
            showNav();
            lastScrollY = currentScrollY;
            return;
        }
        const deltaY = currentScrollY - lastScrollY;
        const deltaTime = currentTime - lastTime;
        const velocity = Math.abs(deltaY / deltaTime);

        if (deltaY > 0 && currentScrollY > 100 && !isNavHovered) {
            hideNav();
        }
        if (deltaY < 0 && velocity > 2.0) {
            showNav();
        }
        lastScrollY = currentScrollY;
        lastTime = currentTime;
    });
});

/* ---------------- HELPER FUNCTIONS ---------------- */
function showNav() {
    const nav = document.querySelector('.nav-wrapper');
    if(nav) nav.classList.remove('nav-hidden');
}

function hideNav() {
    const nav = document.querySelector('.nav-wrapper');
    if(nav && !isNavHovered) nav.classList.add('nav-hidden');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-open');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card[data-images]');

    projectCards.forEach((card, index) => {
        const imagesStr = card.getAttribute('data-images');
        if (!imagesStr) return;

        const images = imagesStr.split(',').map(img => img.trim());
        if (images.length <= 1) return;

        const track = card.querySelector('.cycle-track');
        track.innerHTML = ''; // Clear previous images/clones

        // Build the stack
        const imageElements = images.map((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            // Set first image as visible, others as hidden
            img.style.opacity = (i === 0) ? '1' : '0';
            track.appendChild(img);
            return img;
        });

        let currentIndex = 0;
        const intervalTime = 3000 + (index * 300);

        setInterval(() => {
            // Smoothly swap opacities
            imageElements[currentIndex].style.opacity = '0';
            currentIndex = (currentIndex + 1) % imageElements.length;
            imageElements[currentIndex].style.opacity = '1';
        }, intervalTime);
    });
});

const menuToggle = document.getElementById('mobile-menu');
const navOverlay = document.getElementById('nav-overlay');

if (menuToggle && navOverlay) {

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        const isOpen = navOverlay.classList.toggle('open');

        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    });

    const navLinks = document.querySelectorAll('.overlay-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navOverlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    });

}

document.addEventListener('DOMContentLoaded', () => {
    const flipbook = document.getElementById('myFlipbook');
    if (!flipbook) return;

    const pages = flipbook.querySelectorAll('.flip-page');
    const nextBtn = flipbook.querySelector('.next');
    const prevBtn = flipbook.querySelector('.prev');
    let currentIndex = 0;

    function updatePage(newIndex) {
        pages[currentIndex].classList.remove('active');
        
        // Loop index
        currentIndex = (newIndex + pages.length) % pages.length;
        
        pages[currentIndex].classList.add('active');

       // --- THE UPDATED EXPANSION LOGIC ---
        const isFirstPage = (currentIndex === 0);
        const isLastPage = (currentIndex === pages.length - 1);

        if (isFirstPage || isLastPage) {
            // Shrink to single-page width (550px)
            flipbook.classList.remove('is-spread');
        } else {
            // Expand to double-page width (1100px)
            flipbook.classList.add('is-spread');
        }
    }

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updatePage(currentIndex + 1);
    });

    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updatePage(currentIndex - 1);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('videoWrapper');
    const video = document.getElementById('featureVideo');

    if (!wrapper || !video) return;

    wrapper.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            wrapper.classList.add('is-playing');
            // Optional: Show controls once it starts playing
            video.controls = true; 
        } else {
            video.pause();
            wrapper.classList.remove('is-playing');
            video.controls = false;
        }
    });

    // Handle the case where the video ends
    video.addEventListener('ended', () => {
        wrapper.classList.remove('is-playing');
        video.controls = false;
        video.load(); // Reset to poster image
    });
});


/* =========================================================
   YERSHOV STUDIO — BOOKING PAGE
   Calendar UI + booking form submission hook
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('calendarMonth');
    const prevButton = document.getElementById('prevMonth');
    const nextButton = document.getElementById('nextMonth');

    const preferredDate = document.getElementById('preferredDate');
    const preferredDateDisplay = document.getElementById('preferredDateDisplay');
    const summaryDate = document.getElementById('summaryDate');

    const form = document.getElementById('bookingForm');
    const formStatus = document.getElementById('formStatus');

    if (!calendarGrid || !monthLabel || !form) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = null;

    /*
      OPTIONAL AVAILABILITY CONTROL
      -----------------------------
      Put dates you do NOT want users to request here as YYYY-MM-DD.

      Example:
      const blockedDates = new Set([
          '2026-09-12',
          '2026-09-18'
      ]);

      Later, this can be populated from Google Calendar through a secure
      backend/serverless function instead of hard-coding dates.
    */
    const blockedDates = new Set([]);

    function toISODate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatLongDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        monthLabel.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(viewDate);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const blank = document.createElement('span');
            blank.className = 'calendar-day is-empty';
            calendarGrid.appendChild(blank);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);

            const iso = toISODate(date);
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'calendar-day';
            button.textContent = day;
            button.dataset.date = iso;

            const isPast = date < today;
            const isBlocked = blockedDates.has(iso);

            if (isPast || isBlocked) {
                button.disabled = true;
            }

            if (selectedDate && toISODate(selectedDate) === iso) {
                button.classList.add('is-selected');
            }

            button.addEventListener('click', () => {
                selectedDate = date;

                preferredDate.value = iso;
                preferredDateDisplay.value = formatLongDate(date);
                summaryDate.textContent = formatLongDate(date);

                renderCalendar();
            });

            calendarGrid.appendChild(button);
        }

        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        prevButton.disabled = viewDate <= currentMonth;
    }



    prevButton.addEventListener('click', () => {
        const previous = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        if (previous >= currentMonth) {
            viewDate = previous;
            renderCalendar();
        }
    });

    nextButton.addEventListener('click', () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        renderCalendar();
    });


    renderCalendar();

    form.addEventListener('submit', event => {
        if (!selectedDate) {
            event.preventDefault();

            formStatus.textContent =
                'Please select a preferred date from the calendar.';
            formStatus.classList.add('is-error');

            calendarGrid.querySelector('button:not(:disabled)')?.focus();
        } else {
            formStatus.textContent = '';
            formStatus.classList.remove('is-error');
        }
    });

    /*
      REAL SUBMISSION
      ---------------
      This page intentionally does NOT put email, Google Calendar credentials,
      Stripe keys, or any other secret in browser JavaScript.

      When you create your backend/serverless booking endpoint, paste its URL
      below. The form will POST JSON to it.

      Example:
      const BOOKING_ENDPOINT = '/api/book-session';

      Your backend can then:
      1. Re-check Google Calendar availability.
      2. Save/send the inquiry.
      3. Email you and the client.
      4. Return a Stripe Checkout URL for the $50 retainer after approval.
    */
});



 /*-------------- PRICING SELECTION --------------*/

 document.querySelectorAll('.pricing-detail-title').forEach(title => {
    title.addEventListener('click', (event) => {
        if (window.innerWidth > 1024) return;

        event.stopPropagation();

        const detail = title.closest('.pricing-detail');
        detail.classList.toggle('is-open');
    });
});

document.addEventListener('DOMContentLoaded', () => {

    const serviceNames = {
        "on-location": "On-Location Portraits",
        "studio": "Studio Portraits",
        "custom": "Custom Request"
    };

    const pricingRows = document.querySelectorAll('.pricing-select');
    const sessionSelect = document.querySelector(
        'select[name="session_type"]'
    );
    const booking = document.querySelector('#booking');

    if (!pricingRows.length || !sessionSelect || !booking) return;

    pricingRows.forEach(row => {

        function chooseService() {

            const serviceName = serviceNames[row.dataset.service];

            if (!serviceName) return;

            sessionSelect.value = serviceName;

            sessionSelect.dispatchEvent(
                new Event('change', { bubbles: true })
            );

            booking.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        row.addEventListener('click', chooseService);

        row.addEventListener('keydown', event => {
            if (event.target !== row) return;

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                chooseService();
            }
        });

    });

});






/* --------------- CAROUSEL SPEED UP ON CLICK -------------- */

document.querySelectorAll('.pricing-carousel').forEach(carousel => {

    const windowEl = carousel.querySelector('.pricing-carousel-window');
    const track = carousel.querySelector('.pricing-carousel-track');

    const leftArrow =
        carousel.querySelector('.pricing-carousel-arrow-left');

    const rightArrow =
        carousel.querySelector('.pricing-carousel-arrow-right');

    if (!windowEl || !track || !leftArrow || !rightArrow) return;


    const originalSet = track.querySelector('.pricing-carousel-set');

    if (!originalSet) return;


    let position = 0;
    let direction = -1;

    const normalSpeed = 0.35;
    const boostSpeed = 2.5;

    let speed = normalSpeed;
    let boostTimer;


    function buildInfiniteTrack() {

        /*
        First make ONE image set wider than the visible
        carousel.

        This prevents the blank gap you were seeing.
        */
        const originalImages =
            Array.from(originalSet.children);

        let imageIndex = 0;

        while (
            originalSet.scrollWidth <
            windowEl.clientWidth * 1.25
        ) {

            const clone =
                originalImages[
                    imageIndex % originalImages.length
                ].cloneNode(true);

            clone.setAttribute('aria-hidden', 'true');

            originalSet.appendChild(clone);

            imageIndex++;
        }


        /*
        Remove any old duplicate sets.
        */
        track
            .querySelectorAll('.pricing-carousel-set')
            .forEach((set, index) => {
                if (index !== 0) set.remove();
            });


        /*
        Make three identical copies.
        */
        const middleSet = originalSet.cloneNode(true);
        const rightSet = originalSet.cloneNode(true);

        middleSet.setAttribute('aria-hidden', 'true');
        rightSet.setAttribute('aria-hidden', 'true');

        track.appendChild(middleSet);
        track.appendChild(rightSet);


        const setWidth = originalSet.offsetWidth;

        /*
        Start on middle copy.
        */
        position = -setWidth;

        track.style.transform =
            `translate3d(${position}px, 0, 0)`;
    }


    function animateCarousel() {

        const setWidth = originalSet.offsetWidth;

        position += speed * direction;


        /*
        Moving toward the right-hand copy.
        */
        if (position <= -(setWidth * 2)) {
            position += setWidth;
        }


        /*
        Moving toward the left-hand copy.
        */
        if (position >= 0) {
            position -= setWidth;
        }


        track.style.transform =
            `translate3d(${position}px, 0, 0)`;

        requestAnimationFrame(animateCarousel);
    }


    function boostCarousel(newDirection) {

        direction = newDirection;
        speed = boostSpeed;

        clearTimeout(boostTimer);

        boostTimer = setTimeout(() => {
            speed = normalSpeed;
        }, 900);
    }


    leftArrow.addEventListener('click', event => {
        event.stopPropagation();
        boostCarousel(1);
    });


    rightArrow.addEventListener('click', event => {
        event.stopPropagation();
        boostCarousel(-1);
    });


    /*
    Wait until the images have dimensions,
    then build the seamless track.
    */
    const images = originalSet.querySelectorAll('img');

    Promise.all(
        Array.from(images).map(img => {

            if (img.complete) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                img.addEventListener(
                    'load',
                    resolve,
                    { once: true }
                );

                img.addEventListener(
                    'error',
                    resolve,
                    { once: true }
                );
            });

        })
    ).then(() => {

        buildInfiniteTrack();
        animateCarousel();

    });

});



/* =========================================
   MOBILE SECTION INDICATOR
   ========================================= */

const indicator =
    document.querySelector('.section-indicator');

const indicatorButtons =
    document.querySelectorAll('.section-indicator button');

const indicatorSections = [
    'top',
    'services',
    'pricing',
    'booking',
    'policies'
];

let labelHideTimer;
let isIndicatorJumping = false;
let jumpTimer;


/* Show label, then hide after 1 second */
function showIndicatorLabel() {

    if (!indicator) return;

    indicator.classList.remove('labels-hidden');

    clearTimeout(labelHideTimer);

    labelHideTimer = setTimeout(() => {
        indicator.classList.add('labels-hidden');
    }, 1000);
}


/* Set active section */
function setActiveIndicator(sectionId) {

    indicatorButtons.forEach(button => {

        button.classList.toggle(
            'active',
            button.dataset.section === sectionId
        );

    });

}


/* Detect section while scrolling */
const sectionObserver = new IntersectionObserver(
    entries => {

        /* Ignore observer during timeline click */
        if (isIndicatorJumping) return;

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            setActiveIndicator(entry.target.id);
            showIndicatorLabel();

        });

    },
    {
        rootMargin: '-35% 0px -35% 0px'
    }
);


/* Observe sections */
indicatorSections.forEach(id => {

    const section = document.getElementById(id);

    if (section) {
        sectionObserver.observe(section);
    }

});


/* Timeline clicks */
indicatorButtons.forEach(button => {

    button.addEventListener('click', () => {

        const sectionId = button.dataset.section;

        const section =
            document.getElementById(sectionId);

        if (!section) return;


        /* Lock observer */
        isIndicatorJumping = true;

        clearTimeout(jumpTimer);


        /* Immediately activate clicked section */
        setActiveIndicator(sectionId);

        showIndicatorLabel();


        /* Smooth scroll */
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });


        /* Give smooth scroll time to finish */
        jumpTimer = setTimeout(() => {
            isIndicatorJumping = false;
        }, 800);

    });

});




/* Re-show active label during normal scrolling */
window.addEventListener(
    'scroll',
    () => {

        if (!isIndicatorJumping) {
            showIndicatorLabel();
        }

    },
    { passive: true }
);

/* =========================================
   HERO BIO EXPAND / COLLAPSE
   ========================================= */

const heroBioWrap =
    document.querySelector('.hero-bio-wrap');

const heroBioToggle =
    document.querySelector('.hero-bio-toggle');

if (heroBioWrap && heroBioToggle) {

    heroBioToggle.addEventListener('click', () => {

        const isOpen =
            heroBioWrap.classList.toggle('is-open');

        heroBioToggle.setAttribute(
            'aria-expanded',
            isOpen
        );

    });

}

document.querySelectorAll('.service-heading').forEach(heading => {
    heading.addEventListener('click', event => {
        if (window.innerWidth > 1024) return;

        event.stopPropagation();

        const serviceItem = heading.closest('.service-item');
        serviceItem.classList.toggle('is-open');
    });
});

/* Homepage shoot reels: matching HTML image positions land together. */
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery-marquee');
    if (!gallery) return;

    const reels = Array.from(gallery.querySelectorAll('.gallery-column'), column => ({
        column,
        track: column.querySelector('.gallery-column-track'),
        set: column.querySelector('.gallery-column-set'),
        direction: column.classList.contains('scroll-down') ? -1 : 1,
        position: 0
    }));
    const count = Math.min(...reels.map(reel => reel.set.children.length));
    if (!reels.length || !count) return;

    const duration = (name, fallback) => {
        const value = Number(gallery.dataset[name]);
        return Number.isFinite(value) && value > 0 ? value : fallback;
    };
    const ramp = duration('rampMs', 600);
    const fast = duration('spinMs', 800);
    const slow = duration('slowdownMs', 1500);
    const hold = duration('holdMs', 150);
    const drift = duration('driftPxPerSecond', 8) / 1000;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const modulo = (value, size) => ((value % size) + size) % size;
    let target = 0;
    let elapsed = 0;
    let previousTime;
    let phase = 'spin';

    function paint(reel) {
        // Identical copies make wrapping invisible in either direction.
        const offset = reel.column.clientHeight / 2 - reel.length
            - modulo(reel.position, reel.length);
        reel.track.style.transform = `translate3d(0, ${offset}px, 0)`;
    }

    function planSpin() {
        reels.forEach(reel => {
            reel.start = reel.position;
            const image = reel.set.children[target];
            const center = image.offsetTop - reel.set.offsetTop + image.offsetHeight / 2;
            const remaining = modulo(reel.direction * (center - reel.start), reel.length);
            // Take the next matching image without adding extra full-speed laps.
            reel.distance = reel.direction * remaining;
        });
    }

    function measure() {
        reels.forEach(reel => {
            reel.track.querySelectorAll('[data-reel-copy]').forEach(copy => copy.remove());
            reel.length = reel.set.getBoundingClientRect().height;
            if (!reel.length) return;
            const copies = Math.ceil(reel.column.clientHeight / reel.length) + 3;
            for (let i = 0; i < copies; i++) {
                const copy = reel.set.cloneNode(true);
                copy.dataset.reelCopy = '';
                copy.setAttribute('aria-hidden', 'true');
                reel.track.appendChild(copy);
            }
            const image = reel.set.children[target];
            reel.position = image.offsetTop - reel.set.offsetTop + image.offsetHeight / 2;
            if (phase === 'spin' && !reducedMotion.matches) {
                reel.position -= reel.direction * reel.length * 0.5;
            }
            paint(reel);
        });
        elapsed = 0;
        if (phase === 'spin') planSpin();
    }

    // Reverse the visual stack on upward reels, retaining the original DOM order
    // for shoot selection. Every reel now travels count - 1 image slots to the
    // next shoot, matching the downward reel's speed without changing HTML.
    reels.forEach(reel => {
        reel.track.style.position = 'relative';
        reel.set.style.flexDirection = reel.direction === 1 ? 'column-reverse' : 'column';
    });
    measure();
    new ResizeObserver(measure).observe(gallery);
    reels.forEach(reel => {
        Array.from(reel.set.querySelectorAll('img')).forEach(img => {
            img.addEventListener('load', measure, { once: true });
        });
    });

    function animate(time) {
        const delta = previousTime === undefined ? 0 : time - previousTime;
        previousTime = time;
        if (!document.hidden && !reducedMotion.matches && reels.every(reel => reel.length > 0)) {
            elapsed += delta;
            if (phase === 'spin') {
                // Integrate smoothstep velocity ramps: gentle acceleration and
                // braking, with no speed jumps where either ramp meets the drift.
                const total = ramp + fast + slow;
                const time = Math.min(elapsed, total);
                const accelerating = Math.min(time, ramp);
                const cruise = Math.min(fast, Math.max(0, time - ramp));
                const braking = Math.min(slow, Math.max(0, time - ramp - fast));
                const integratedEase = value => value ** 3 - value ** 4 / 2;
                const speedArea = ramp * integratedEase(accelerating / ramp) + cruise
                    + braking - slow * integratedEase(braking / slow);
                reels.forEach(reel => {
                    const driftSpeed = reel.direction * drift;
                    const peakSpeed = (reel.distance - driftSpeed * total)
                        / (fast + (ramp + slow) / 2) + driftSpeed;
                    reel.position = reel.start + driftSpeed * time
                        + (peakSpeed - driftSpeed) * speedArea;
                    paint(reel);
                });
                if (elapsed >= total) {
                    reels.forEach(reel => { reel.position = modulo(reel.position, reel.length); });
                    phase = 'hold';
                    elapsed = 0;
                }
            } else {
                reels.forEach(reel => {
                    reel.position += reel.direction * drift * delta;
                    paint(reel);
                });
                if (elapsed >= hold) {
                    target = (target + 1) % count;
                    phase = 'spin';
                    elapsed = 0;
                    planSpin();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    document.addEventListener('visibilitychange', () => { previousTime = undefined; });
    reducedMotion.addEventListener('change', () => {
        phase = 'hold';
        measure();
    });
    requestAnimationFrame(animate);
});
