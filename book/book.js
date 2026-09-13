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
    const BOOKING_ENDPOINT = '';

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        formStatus.className = 'form-status';

        if (!selectedDate) {
            formStatus.textContent = 'Please select a preferred date from the calendar.';
            formStatus.classList.add('is-error');
            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());

        if (!BOOKING_ENDPOINT) {
            formStatus.textContent =
                'The booking page is ready, but the secure booking endpoint still needs to be connected before requests can be sent.';
            formStatus.classList.add('is-error');
            console.table(data);
            return;
        }

        const submitButton = form.querySelector('.booking-submit');
        const originalText = submitButton.innerHTML;

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        formStatus.textContent = '';

        try {
            const response = await fetch(BOOKING_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || 'Unable to submit the request.');
            }

            formStatus.textContent =
                result.message || 'Request sent. I’ll follow up with availability and next steps.';
            formStatus.classList.add('is-success');

            form.reset();
            selectedDate = null;
            preferredDate.value = '';
            preferredDateDisplay.value = '';
            summaryDate.textContent = 'No date selected';
            renderCalendar();

            // Optional future flow:
            // if (result.checkoutUrl) window.location.href = result.checkoutUrl;

        } catch (error) {
            formStatus.textContent =
                error.message || 'Something went wrong. Please try again.';
            formStatus.classList.add('is-error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
});
