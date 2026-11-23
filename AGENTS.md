<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application architecture
- Render platform-localized country names only after hydration, with stable country codes first; server and browser ICU data can differ and otherwise break auth hydration.
- Keep authentication UI in a scoped form/modal and preserve validated, display-only room IDs in session storage; never store credentials or simulate sessions while accounts are not activated.
- Student profiles are private, and clients may update only their own name; phone verification is trusted server-owned state, not editable profile metadata.
- Keep detail-page room galleries and popups limited to room-owned photos, and derive booking summaries from the validated selected room in the source record; selection must not alter the disconnected booking workflow.
- Keep homepage presentation unchanged when extending the app; the approved accommodation detail route reuses its Header and Footer.
- Centralize interface translations in locale JSON through the language provider; load browser language preferences after hydration to keep SSR consistent.
- Keep typed accommodation filter validation and URL preparation separate from presentation; explicitly labeled fictional preview cards are isolated from real inventory and cannot create bookings.
- Disable unavailable destinations rather than creating additional routes or simulating authentication, booking, or other completed actions.
- Keep residence records and booking-selection validation in a browser-safe data module; one dynamic detail route renders mock or supplied records without implying production verification or booking availability.
- Scope detail-page styling to its own class names so the existing homepage remains visually unchanged.
- Store supplied room-card terms separately from live availability and render optional fields without invented defaults; owner content and fictional demo records must not inherit each other's facts.
- Use a separate display model for explicitly labeled sample details; never mutate owner records or claim actual verification from a model badge.
- Share preview favorites through a typed session-only external store keyed by residence and room identifiers; account persistence and dashboard sync require a future authenticated integration.
- Render all housing gender labels through the shared HousingLabel component to keep their meaning and color consistent.
- Keep results filtering and URL validation in a browser-safe module; available room matches exclude unconfirmed owner references and sample detail coordinates, so counts and prices never imply live availability.
- Use an index leaf for accommodation results alongside the existing dynamic detail route, with page-scoped styles, so existing detail URLs and page layouts stay unchanged.
- Pre-optimize homepage UI dependencies alongside React and reject outdated optimizer requests; mixed dependency generations in an open preview can create separate React dispatchers and crash hooks.
