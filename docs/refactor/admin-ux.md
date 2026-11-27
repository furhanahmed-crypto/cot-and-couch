# Admin UI/UX

Every admin screen is rewritten. Colours and fonts stay ([../DESIGN.md](../DESIGN.md)); structure, wording and flows change.

## 1. UX principles

1. **One screen, one job.** A page manages one kind of thing. No page manages four unrelated lists.
2. **Same layout everywhere.** Page header → toolbar → table → pagination. Editors: tabs → form → save. Learn one page, know them all.
3. **Plain words.** The client's terms: Product, Quality, Size, Add-on, Recliner, Brand, Colour, Collection, Order, Lead.
4. **Show real data only.** No placeholder numbers, no fake metrics.
5. **Safe by default.** Every destructive or hard-to-undo action asks first. Every action gives feedback.
6. **Fast to scan.** Key fields left, status as a badge, actions in a row menu on the right.

## 2. Layout and spacing

| Element | Rule |
|---|---|
| Shell | Espresso sidebar (collapsible on mobile via sheet), content on cream |
| Page padding | `p-4` mobile, `p-6` desktop; content `max-w-7xl` |
| Vertical rhythm | `space-y-6` between page sections, `space-y-4` inside a card, `space-y-2` label → input |
| Forms | `max-w-2xl`, one column; two columns only for short pairs (MRP / Price) |
| Page title | `text-2xl font-semibold` (Fraunces) + one-line `text-sm text-muted-foreground` description |
| Section title | `text-lg font-semibold` |
| Body, table, inputs | `text-sm` |
| Meta (SKU, dates) | `text-xs text-muted-foreground` |
| Table rows | `py-3`, numbers right-aligned, money with `formatPrice` |
| Buttons | One primary per view (top right). Destructive buttons only inside confirm dialogs or row menus |

## 3. Shared components (`components/admin/common/`)

Built once in Phase 4, used by every screen. URL changes go through `hooks/use-url-params.ts` (changing a filter resets `?page=`); page maths in `lib/list-params.ts` (`PAGE_SIZE` 20).

| Component | Built on | Job |
|---|---|---|
| `AdminPageHeader` | — | Title, description, primary action slot |
| `DataTable` | shadcn `Table` | Takes `columns` (`key`, `header`, `cell`, `align`) and `rows`; renders empty state when no rows. No sorting logic inside: sort comes from the URL |
| `TableToolbar` | — | Row with search + filters + "Clear filters" |
| `SearchInput` | shadcn `Input` | Debounced (300 ms), writes `?q=` to the URL |
| `FilterSelect` | shadcn `Select` | One filter, writes `?<name>=` to the URL; "All" option clears it |
| `TablePagination` | shadcn `Button` | Prev / next + "21–40 of 132"; writes `?page=` |
| `RowActions` | shadcn `DropdownMenu` | "…" menu per row (Edit, Publish, Delete) |
| `StatusBadge` | shadcn `Badge` | `label` + `tone` (neutral, outline, accent, strong, danger: brand colours only). Labels and tones per status live in `constants/` (`ORDER_STATUS_TONES`, …) |
| `EmptyState` | — | Icon, sentence, optional action ("No products yet. Add product") |
| `FormDialog` | shadcn `Dialog` | Every add / edit form: fields, Cancel, one Save; Enter submits |
| `AddButton`, `OptionSelect`, `ActiveSwitchField`, `UrlTabs` | — | The page's "Add …" button + its dialog; a form select ("" = none); a labelled switch; tabs kept in `?tab=` |
| `ConfirmationModal` | shadcn `Dialog` | Shared confirm with pending state. Lives in `components/ui/confirmation-modal.tsx` because the shop uses it too; there is no second confirm component |
| `FormField` | shadcn `Label` + input | Label, input, help text, error text in one place |
| `SectionCard` | — | Titled card on detail pages (order detail, new order) |
| `MoneyInput` | shadcn `Input` | `₹` prefix, digits only, no decimals |
| `SaveBar` | — | Sticky bottom bar on editors: "Unsaved changes" + Save; the browser warns before closing or reloading the tab. In-app links are not blocked (Next has no route-change guard) |
| `TableSkeleton`, `FormSkeleton` | shadcn `Skeleton` | `loading.tsx` states (`skeletons.tsx`) |

Shell: `components/admin/admin-shell.tsx` + `admin-sidebar.tsx`, nav from `constants/admin-nav.ts`. `app/admin/error.tsx` is the error boundary with a retry button.
The temporary "Being rebuilt" catch-all (`app/admin/[...rest]`) was deleted in Phase 7: every admin screen is real now.

TanStack Table is **not** added: server-side filters and pagination through the URL keep the table a plain component.

## 4. Feedback rules

- **Toasts**: every mutation goes through `useActionToast` → loading, then success or error. No silent saves, no `alert()`.
- **Confirm first** for: delete (anything), archive product, unpublish product, deactivate quality / brand / colour, change order status to `closed` or `issue`, change a staff role, remove staff access.
- **Buttons** are disabled while pending. Forms keep values on error.
- **Errors in forms** show under the field, plus a toast for the overall failure. Zod issues come back as `fieldErrors` (`validationError` in `lib/action-result.ts`); `useActionToast().run(action, messages, onSuccess, onError)` hands them to the form.
- **Duplicates** (unique violations) become a clear message through `withUniqueMessage` in `lib/db-errors.ts`; **in use** deletes through `assertNotInUse` in `lib/in-use.ts` ("Used by N products. Deactivate it instead.").
- **Every page** has `loading.tsx` (skeleton), an empty state, and an error boundary with a retry button.

## 5. Navigation

```
Overview      Dashboard
Catalogue     Products · Categories · Colours · Collections        (Categories, Colours, Collections: admin only)
Sales         Orders · Leads
Content       Media
Settings      Store · Team                                         (admin only)
```

Team role: Dashboard, Products (no delete), Orders, Leads, Media. Admin: everything.

## 6. Screens

### Dashboard `/admin`
- Range switch: Last 7 days / Last 30 days (`?range=`).
- 4 stat cards: Open orders, Orders in range, New leads in range, Published products. Each links to its list.
- Two panels: Recent orders (5 rows, link to order) and Hot leads not yet followed up (5 rows, link to lead).
- Quick actions: Add product, New order.
- Fixes today's issue: a 395-line component with mixed fake and real metrics.

### Products `/admin/products`
- Toolbar: search (name or SKU) · Category · Status · Brand or Quality (options depend on category) · Sort (Shop order = default, Recently updated, Name, Price).
- Shop order is `products.sort_order` (1 = first in its category); the shop's "Recommended" sort uses the same number. The seed numbers each category cheapest first; staff change it with "Order in the shop" on the Basics tab. A new product with no number goes last.
- Columns: Image, Name (+ category · brand), Status, Variants, Price range, Updated, actions.
- The name links to the editor. Row menu: Edit, View in shop, Publish / Unpublish (confirm), Archive (confirm), Delete (admin, only if never ordered).
- Choosing a category clears the brand and quality filters. The price column is the product's whole range.
- 20 per page.

### Product editor `/admin/products/new`, `/admin/products/[id]`
Same tabs for every category. Each tab is its own form with its own Save.

| Tab | Content |
|---|---|
| Basics | Name, slug (auto from name, editable), category (fixed after create), brand (shown only if the category has brands), description, status, order in the shop, featured, collections |
| Images | List of image URLs with alt text; move up / down; remove; first image is the cover |
| Specs | Label / value rows (e.g. Comfort: Firm, Warranty: 5 years); add / remove |
| Variants & prices | Table: Size, Quality, Thickness, Seats, Colour, MRP, Price, Active. Columns follow the category (`getVariantFields`). Active is an inline switch; Edit opens a dialog. Filter by quality and size inside the tab. "Add many" dialog: sizes × qualities × colours × thicknesses with one price for all, skips existing rows. SKUs are made automatically. Delete: admin only, never for ordered variants |
| Add-ons | Sofas only: this product's add-ons and recliners, price per quality, fixed or per seat |

Rules: publishing needs an active variant; the last active variant of a published product cannot be switched off; slug gets `-2` if taken (the saved slug is shown after save); "Last updated" shows the date only (there is no `updated_by` column).
Fixes today's issue: layout changes per category, range-tabbed variant grid, hidden placeholder prices.

### Categories `/admin/categories` → `/admin/categories/[id]`
- List: Name, Products, Active, actions.
- Detail tabs: **Details** (name, active, order; the slug is fixed because code depends on it; categories are not created or deleted in the admin) · **Qualities** (table + dialog: name, body / construction, warranty years) · **Brands** (table + dialog) · **Add-ons** (category-wide add-ons, optionally for one size; price grid: rows = add-ons, columns = qualities, empty cell = not offered; one Save for the grid).
- Admin only. Sofa add-ons live on the product (Add-ons tab), and the team may edit those; who may change an add-on is checked from the database.
- Fixes today's issue: brands, ranges, widths and templates mixed in one 936-line screen; brands editable from two places.

### Colours `/admin/colours` and Collections `/admin/collections`
- Table + dialog form. Colour: name, hex picker, active. Collection: name, slug, description, featured, active, product count.

### Orders `/admin/orders`
- Toolbar: search (order number, customer name, phone) · Status · Date (7 / 30 days / all).
- Columns: Order no., Customer, Phone, Items, Total, Advance, Balance, Status, Expected delivery, Created.
- **Order detail** `/admin/orders/[id]`: customer card, items (snapshots), totals, status timeline (from history), "Change status" (select + note), advance paid, expected delivery, delivery photo URL.
- **New order** `/admin/orders/new`: customer (search existing or type name + phone), add items with a product → variant picker, add-ons, custom size; totals computed on the server.
- Done as: the address is required (the `orders` table needs it). Picking a customer from the search links the order to their account, so it shows in their My orders. The person creating the order is saved as the salesperson. Only active variants of published products can be sold; a custom size does not change the price ("the showroom will confirm"). "Change status" confirms `closed` and `issue`; the note is stored on that history row; choosing the current status does nothing. Payment and delivery (advance, expected delivery, delivery photo link, notes) is one card with its own Save. Orders are not deleted from the admin.

### Leads `/admin/leads`
- Toolbar: search (name, phone) · Intent · Assigned to · Follow-up (done / pending).
- Columns: Name, Phone, Area, Intent, Assigned to, Last seen, Follow-up.
- Row opens a side sheet: details, activity timeline (events), edit intent / assignee / follow-up. Delete: admin only, confirm.
- Done as: the sheet is opened by `?lead=<id>` and keeps the filters and page. "Assigned to" lists admin and team members (checked on the server); `?assigned=none` shows leads nobody has. Deleting a lead removes its activity; the customer's account and orders stay.

### Media `/admin/media`
- Tabs: Gallery · Reels. Card grid: image, title, Published switch, move up / down, Edit, Delete.
- Dialog form: gallery (image URL, title, area, delivery month, product) / reel (title, cover URL, video URL, Instagram URL, tags).
- Done as: new items go last and start unpublished unless switched on in the form. Move up / down swaps with the neighbour and renumbers the list. Reel tags are comma separated: `home` shows a reel on the home page; a category, product or collection slug shows it on that page. Team users may manage media.

### Store `/admin/settings`
- One form in three cards: Store (name, address, map link, timings) · Contact (phone, WhatsApp) · Privacy notice. One Save.
- Done as: the Save bar appears with unsaved changes. Phone is kept as typed (10–12 digits); WhatsApp is stored as digits with 91 (what `wa.me` needs). The shop shows the new details straight away.

### Team `/admin/team`
- Table: Name, Email, Role, Joined. Role select per row (admin only, confirm).
- "Add staff": search a registered customer by email, choose role.
- Blocked with a clear message: changing your own role, removing the last admin.
- Done as: "Remove access" (row menu) sets the person back to customer; they keep their shop account. Your own row shows your role read-only. "Add staff" uses the same customer search as New order (name, email or phone).
