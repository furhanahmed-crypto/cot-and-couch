# Edge cases

Each case says what must happen. Tests or browser checks cover every line before its phase is committed.

## Prices and variants
- MRP lower than price, price 0 or negative → rejected (Zod + DB check).
- MRP missing (client sheets give no Single MRP) → allowed; shop shows the price with no strike-through or discount badge.
- Two variants with the same size + thickness + quality + colour → blocked by the unique constraint; admin sees "This variant already exists".
- Quality, brand or colour renamed → nothing breaks (everything joins by id).
- Product with no active variants → cannot be published ("Add at least one active variant first").
- PDP quality switch where the chosen size does not exist in that quality → option shown disabled, not hidden.

## Add-ons
- Add-on with no price for the chosen quality → not offered.
- Add-on limited to a size (King storage) → hidden for other sizes and rejected by the server.
- Per-seat add-on (Luxury High Back recliners) → price × seat count; seat count comes from the variant (5 for 3+1+1 / 3+2).
- Add-on deactivated while in a cart → removed from the cart line with a notice.

## Cart and shortlist
- Variant deactivated or product unpublished while in a cart → line shows "No longer available"; it is not counted in totals.
- Price changed after adding → cart always shows the current price (no stored price).
- Quantity outside 1–20 → rejected.
- Custom size: both length and width, whole inches, 24–96 → else rejected.
- Same product shortlisted twice → ignored (unique constraint), no error toast.
- Logged-out user → shortlist / cart buttons send to `/login` and return afterwards.

## Orders
- Product or variant deleted later → order still shows the snapshot name, SKU, size, quality, colour and prices.
- Advance paid more than subtotal → rejected.
- Order with no items → cannot be created.
- Status change → history row written by trigger with who changed it; changing to the same status does nothing.
- Totals are computed on the server only; client totals are display only.

## Admin data
- Delete category / quality / brand / colour that is in use → blocked with "Used by N products. Deactivate it instead."
- Delete product that appears in an order → blocked; archive instead.
- Slug already taken → auto-suffix `-2`, `-3`, shown to the user before save.
- Two staff editing the same product → last save wins; editor shows "Last updated <time> by <name>".
- Leaving an editor with unsaved changes → browser and in-app warning.
- Double click on Save → second click ignored (button disabled while pending).

## Staff and auth
- Non-staff opening `/admin/*` → redirected to `/` before anything renders.
- Team user calling an admin-only action directly → action returns "Not allowed"; button not shown in the UI either.
- Changing your own role or removing the last admin → blocked.
- Session expired mid-action → action returns "Please sign in again"; toast links to `/login`.

## Lists and URLs
- Unknown or invalid `?status=`, `?page=` etc. → ignored, default used (Zod `catch`).
- Page past the end → last page shown.
- Search with `%` or `_` → escaped before `ilike`.
- Empty results → empty state with "Clear filters".
- Long names → truncated with full text in a tooltip.

## Formatting
- Money: `₹1,23,456` (Indian grouping), whole rupees.
- Dates: shown in IST (`Asia/Kolkata`), stored in UTC.
- Phone: 10-digit Indian mobile, stored digits only, shown as `98765 43210`.
- Missing image → neutral placeholder, never a broken image icon.
