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

Built once in Phase 5, used by every screen.

| Component | Built on | Job |
|---|---|---|
| `AdminPageHeader` | — | Title, description, primary action slot |
| `DataTable` | shadcn `Table` | Takes `columns` (`key`, `header`, `cell`, `align`) and `rows`; renders empty state when no rows. No sorting logic inside: sort comes from the URL |
| `TableToolbar` | — | Row with search + filters + "Clear filters" |
| `SearchInput` | shadcn `Input` | Debounced (300 ms), writes `?q=` to the URL |
| `FilterSelect` | shadcn `Select` | One filter, writes `?<name>=` to the URL; "All" option clears it |
| `TablePagination` | shadcn `Button` | Prev / next + "21–40 of 132"; writes `?page=` |
| `RowActions` | shadcn `DropdownMenu` | "…" menu per row (Edit, Publish, Delete) |
| `StatusBadge` | shadcn `Badge` | Maps a status to label + colour from `constants/` |
| `EmptyState` | — | Icon, sentence, optional action ("No products yet. Add product") |
| `ConfirmDialog` | shadcn `Dialog` | Shared confirm with pending state |
| `FormField` | shadcn `Label` + input | Label, input, help text, error text in one place |
| `MoneyInput` | shadcn `Input` | `₹` prefix, digits only, no decimals |
| `SaveBar` | — | Sticky bottom bar on editors: "Unsaved changes" + Save; warns before leaving |
| `TableSkeleton`, `FormSkeleton` | shadcn `Skeleton` | `loading.tsx` states |

TanStack Table is **not** added: server-side filters and pagination through the URL keep the table a plain component.

## 4. Feedback rules

- **Toasts**: every mutation goes through `useActionToast` → loading, then success or error. No silent saves, no `alert()`.
- **Confirm first** for: delete (anything), archive product, unpublish product, deactivate quality / brand / colour, change order status to `closed` or `issue`, change a staff role, remove staff access.
- **Buttons** are disabled while pending. Forms keep values on error.
- **Errors in forms** show under the field, plus a toast for the overall failure.
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
- 4 stat cards: Open orders, Orders in range, New leads in range, Published products.
- Two panels: Recent orders (5 rows, link to order) and Hot leads (5 rows, link to lead).
- Quick actions: Add product, New order.
- Fixes today's issue: a 395-line component with mixed fake and real metrics.

### Products `/admin/products`
- Toolbar: search (name or SKU) · Category · Status · Brand or Quality (options depend on category) · Sort (Recently updated, Name, Price).
- Columns: Image, Name (+ category · brand), Status, Variants, Price range, Updated, actions.
- Row click opens the editor. Row menu: Edit, Publish / Unpublish, Archive, Delete (admin, only if never ordered).
- 20 per page.

### Product editor `/admin/products/new`, `/admin/products/[id]`
Same tabs for every category. Each tab is its own form with its own Save.

| Tab | Content |
|---|---|
| Basics | Name, slug (auto from name, editable), category (fixed after create), brand (shown only if the category has brands), description, status, featured, collections |
| Images | List of image URLs with alt text; move up / down; remove; first image is the cover |
| Specs | Label / value rows (e.g. Comfort: Firm, Warranty: 5 years); add / remove |
| Variants & prices | Table: Size, Quality, Thickness, Colour, MRP, Price, Active. Inline edit. "Add variant" row. "Add many" dialog: pick sizes × qualities × colours, creates the missing rows, prices to fill in |
| Add-ons | Sofas only: this product's add-ons and recliners, price per quality, fixed or per seat |

Fixes today's issue: layout changes per category, range-tabbed variant grid, hidden placeholder prices.

### Categories `/admin/categories` → `/admin/categories/[id]`
- List: Name, Products, Active, actions.
- Detail tabs: **Details** (name, slug, active, order) · **Qualities** (table + side sheet form: name, description, warranty years) · **Brands** (table + sheet) · **Add-ons** (category-wide add-ons; price grid: rows = add-ons, columns = qualities, empty cell = not offered).
- Fixes today's issue: brands, ranges, widths and templates mixed in one 936-line screen; brands editable from two places.

### Colours `/admin/colours` and Collections `/admin/collections`
- Table + dialog form. Colour: name, hex picker, active. Collection: name, slug, description, featured, active, product count.

### Orders `/admin/orders`
- Toolbar: search (order number, customer name, phone) · Status · Date (7 / 30 days / all).
- Columns: Order no., Customer, Phone, Items, Total, Advance, Balance, Status, Expected delivery, Created.
- **Order detail** `/admin/orders/[id]`: customer card, items (snapshots), totals, status timeline (from history), "Change status" (select + note), advance paid, expected delivery, delivery photo URL.
- **New order** `/admin/orders/new`: customer (search existing or type name + phone), add items with a product → variant picker, add-ons, custom size; totals computed on the server.

### Leads `/admin/leads`
- Toolbar: search (name, phone) · Intent · Assigned to · Follow-up (done / pending).
- Columns: Name, Phone, Area, Intent, Assigned to, Last seen, Follow-up.
- Row opens a side sheet: details, activity timeline (events), edit intent / assignee / follow-up. Delete: admin only, confirm.

### Media `/admin/media`
- Tabs: Gallery · Reels. Card grid: image, title, Published switch, move up / down, Edit, Delete.
- Dialog form: gallery (image URL, title, area, delivery month, product) / reel (title, cover URL, video URL, Instagram URL, tags).

### Store `/admin/settings`
- One form in three cards: Store (name, address, map link, timings) · Contact (phone, WhatsApp) · Privacy notice. One Save.

### Team `/admin/team`
- Table: Name, Email, Role, Joined. Role select per row (admin only, confirm).
- "Add staff": search a registered customer by email, choose role.
- Blocked with a clear message: changing your own role, removing the last admin.
