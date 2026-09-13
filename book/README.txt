YERSHOV STUDIO — BOOKINGS & INFO

FILES
-----
book/index.html
book/book.css
book/book.js

INSTALL
-------
1. Create a folder named "book" in the root of your site.
2. Put index.html, book.css, and book.js inside it.
3. Your existing styles.css, script.js, SVG folder, fonts, photo folder, etc.
   stay where they already are.

The relative paths are already written for this structure:
    /styles.css
    /script.js
    /SVG/...
    /book/index.html
    /book/book.css
    /book/book.js

PRICING TO EDIT
---------------
The page currently uses:
- On-location: Starting at $200
- Studio: Custom Quote
- High school seniors: $150
- Booking retainer: $50

Search index.html for those values to change them.

IMPORTANT: LIVE SCHEDULING
--------------------------
The calendar and booking form UI are fully coded, but a secure backend is still
required before the form can truly reserve/send dates.

Do NOT put:
- Google Calendar credentials
- Stripe secret keys
- private API keys
inside book.js.

In book.js, BOOKING_ENDPOINT is intentionally blank.

Recommended next step:
Create a serverless endpoint such as /api/book-session that:
1. Re-checks availability against your booking Google Calendar.
2. Receives and stores/emails the inquiry.
3. Returns success.
4. Later creates a Stripe Checkout session for the $50 retainer after approval.

You can also hard-code unavailable dates temporarily in the blockedDates Set in
book.js while the Google Calendar connection is being built.
