# Student Portal
- [x] Build authenticated dashboard and My Bookings with owner-only real data, EN/TR, status filters and support.
- [x] Prepare the specific booking-details destination without building the full details page.
- [x] Verify lifecycle filters and independent payment/room/contract/check-in progress; all 77 tests pass. Desktop/mobile signed-out protection and unchanged homepage verified without runtime errors.
- [ ] Verify signed-in portal data, booking navigation and visual layout: no auth users exist, live login remains UI-only, and no test account was created.

# Room booking flow
- [x] Build EN/TR three-step booking form, account prefill integration, room preservation and scroll-gated agreement.
- [x] Add secure student-owned booking storage and booking-status view, with trusted date-specific quotes and no simulated payment/OTP; anonymous read and student direct writes explicitly denied.
- [x] Verify validation and desktop/mobile room-to-review interactions in both languages; all 67 tests pass and fresh browser checks show no runtime errors.
- [ ] Verify signed-in save and status readback: existing login is UI-only and test-account creation was declined.
- [ ] Activate payment and WhatsApp verification: requires configured providers; no payment or OTP was sent.
- [ ] Configure real contract/pricing/deposit quotes: owner confirmed June, but exact day/year and administrator-approved quote remain missing.

# Student authentication UI
- [x] Resolve preview runtime errors: stale dependency URLs require a preview reload; country-selector hydration fixed and fresh loads plus desktop/mobile flow verified without runtime errors.
- [x] Design EN/TR phone-and-password signup/login forms and selected-room modal without redesigning existing pages.
- [x] Prepare private student-profile storage; account creation is not activated.
- [x] Owner chose interfaces only: no live signup, login, password reset, OTP, dashboard or payments in this task.
- [x] Preserve room selection and verify validation, mode switching, cancellation and mobile layout; 54 tests passed.

# Edmovinn homepage
- [x] Add explicitly fictional accommodation preview cards.
- [x] Change step numbers to white on royal blue.
- [x] Blend the opening photo into a compact blue composition matching the new reference.
- [x] Verify the updated desktop/mobile presentation and preview-card interactions.
- [x] Implement the supplied homepage design and original logo.
- [x] Add centralized EN/TR copy and persistent language selection.
- [x] Implement four-field search with honest unavailable-results state.
- [x] Check desktop/mobile layout, search validation, and language persistence.
- [ ] Confirm supplied business claims before public launch (awaiting owner confirmation).

# Accommodation details
- [x] Add room photo controls and a centered details popup without changing existing cards or room records; single-photo records retain disabled arrows.
- [x] Update the existing booking sidebar from the selected room ID, preserve disconnected booking, and verify EN/TR and mobile interactions.
- [x] Add the supplied results page with synchronized URL filters, matching-room prices, sorting, pagination, EN/TR and mobile drawer; unconfirmed Moveinn terms remain a separate reference.
- [x] Verify results navigation and unchanged existing page layouts; university/distance filtering and real map pins await confirmed geographic data.
- [x] Add consistent gender labels, remove duplicate feature strip, frame booking and add WhatsApp contact label.
- [x] Fill clearly identified sample detail information and enable shared session favorites for residences and rooms.
- [x] Connect WhatsApp contact to the supplied +905555555555 and verify its destination without sending a message.
- [x] Add owner-supplied Moveinn gender, description and twelve facilities, and its homepage card.
- [x] Match the uploaded room-card layout and supplied quadruple-room terms; verify EN/TR, selection and mobile.
- [x] Build a reusable EN/TR Moveinn details page matching the uploaded reference without redesigning the homepage.
- [x] Add clearly marked mock residence data, gallery, facilities, location, rooms and selection summary without booking integrations.
- [x] Link existing fictional cards to their matching details and verify selection, languages, gallery, desktop and mobile.