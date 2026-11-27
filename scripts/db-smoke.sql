-- Database smoke test. Run with `bun run db:check`.
-- Each "expect fail" block inserts a bad row and must be rejected with the named
-- error. If the bad row is accepted, the block raises FAIL and the check stops.
-- The last line always raises an error so nothing here is ever saved.

DO $$
-- Variables share names with columns (order_id…): a bare name means the variable.
#variable_conflict use_variable
DECLARE
  checks integer := 0;
  category_id uuid;
  quality_id uuid;
  product_id uuid;
  profile_id uuid;
  colour_id uuid;
  order_id uuid;
  order_number text;
  history_count integer;
  updated timestamptz;
BEGIN
  -- Valid rows the checks build on.
  INSERT INTO categories (name, slug) VALUES ('Smoke', 'smoke-test') RETURNING id INTO category_id;
  INSERT INTO qualities (category_id, name, slug) VALUES (category_id, 'Smoke', 'smoke') RETURNING id INTO quality_id;
  INSERT INTO products (category_id, name, slug) VALUES (category_id, 'Smoke', 'smoke-test') RETURNING id INTO product_id;
  INSERT INTO profiles (auth_user_id, email) VALUES (gen_random_uuid(), 'smoke@test.local') RETURNING id INTO profile_id;
  INSERT INTO product_variants (product_id, sku, size_label, price) VALUES (product_id, 'SMOKE-1', 'King', 100);

  -- Prices
  BEGIN
    INSERT INTO product_variants (product_id, sku, size_label, price) VALUES (product_id, 'SMOKE-2', 'Queen', 0);
    RAISE EXCEPTION 'FAIL: variant with price 0 was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  BEGIN
    INSERT INTO product_variants (product_id, sku, size_label, mrp, price) VALUES (product_id, 'SMOKE-3', 'Queen', 50, 100);
    RAISE EXCEPTION 'FAIL: variant with MRP below price was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  -- Same size with all other columns null must still count as a duplicate.
  BEGIN
    INSERT INTO product_variants (product_id, sku, size_label, price) VALUES (product_id, 'SMOKE-4', 'King', 200);
    RAISE EXCEPTION 'FAIL: duplicate variant was accepted';
  EXCEPTION WHEN unique_violation THEN checks := checks + 1;
  END;

  BEGIN
    INSERT INTO addons (category_id, name) VALUES (category_id, 'Smoke add-on');
    INSERT INTO addon_prices (addon_id, quality_id, price)
      SELECT id, quality_id, -1 FROM addons WHERE name = 'Smoke add-on';
    RAISE EXCEPTION 'FAIL: negative add-on price was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  -- Catalogue values
  BEGIN
    INSERT INTO colours (name, hex) VALUES ('Smoke', 'brown');
    RAISE EXCEPTION 'FAIL: colour with a bad hex was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  BEGIN
    INSERT INTO qualities (category_id, name, slug, warranty_years) VALUES (category_id, 'Bad', 'bad', 0);
    RAISE EXCEPTION 'FAIL: warranty of 0 years was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  BEGIN
    DELETE FROM categories WHERE id = category_id;
    RAISE EXCEPTION 'FAIL: category in use was deleted';
  EXCEPTION WHEN restrict_violation THEN checks := checks + 1;
  END;

  BEGIN
    INSERT INTO store_settings (id, name, address, map_url, timings, phone, whatsapp, privacy_notice)
      VALUES (2, 'x', 'x', 'x', 'x', 'x', 'x', 'x');
    RAISE EXCEPTION 'FAIL: a second store_settings row was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  -- Shop
  BEGIN
    INSERT INTO cart_items (profile_id, variant_id, quantity)
      SELECT profile_id, id, 21 FROM product_variants WHERE sku = 'SMOKE-1';
    RAISE EXCEPTION 'FAIL: cart quantity 21 was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  BEGIN
    INSERT INTO cart_items (profile_id, variant_id, custom_length_in)
      SELECT profile_id, id, 78 FROM product_variants WHERE sku = 'SMOKE-1';
    RAISE EXCEPTION 'FAIL: custom length without width was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  BEGIN
    INSERT INTO shortlist_items (profile_id, product_id) VALUES (profile_id, product_id);
    INSERT INTO shortlist_items (profile_id, product_id) VALUES (profile_id, product_id);
    RAISE EXCEPTION 'FAIL: same product shortlisted twice';
  EXCEPTION WHEN unique_violation THEN checks := checks + 1;
  END;

  -- Orders and media
  BEGIN
    INSERT INTO orders (customer_name, customer_phone, address, subtotal, advance_paid)
      VALUES ('Smoke', '9999999999', 'x', 100, 200);
    RAISE EXCEPTION 'FAIL: advance above subtotal was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  BEGIN
    INSERT INTO media (type, image_url) VALUES ('reel', '/x.jpg');
    RAISE EXCEPTION 'FAIL: reel without a video was accepted';
  EXCEPTION WHEN check_violation THEN checks := checks + 1;
  END;

  -- Trigger: set_updated_at()
  INSERT INTO colours (name, hex, created_at, updated_at)
    VALUES ('Smoke', '#000000', '2000-01-01', '2000-01-01') RETURNING id INTO colour_id;
  UPDATE colours SET name = 'Smoke 2' WHERE id = colour_id RETURNING colours.updated_at INTO updated;
  IF updated <= '2000-01-01' THEN RAISE EXCEPTION 'FAIL: updated_at did not change'; END IF;
  checks := checks + 1;

  -- Trigger: log_order_status() and the order number default
  INSERT INTO orders (customer_name, customer_phone, address, subtotal, updated_by_id)
    VALUES ('Smoke', '9999999999', 'x', 100, profile_id) RETURNING id, orders.order_number INTO order_id, order_number;
  IF order_number !~ '^CC-[0-9]{5,}$' THEN RAISE EXCEPTION 'FAIL: bad order number %', order_number; END IF;
  checks := checks + 1;

  UPDATE orders SET status = 'in_production' WHERE id = order_id;
  UPDATE orders SET notes = 'same status' WHERE id = order_id;
  SELECT count(*) INTO history_count FROM order_status_history h
    WHERE h.order_id = order_id AND h.changed_by_id = profile_id;
  IF history_count <> 2 THEN RAISE EXCEPTION 'FAIL: expected 2 history rows, got %', history_count; END IF;
  checks := checks + 1;

  RAISE EXCEPTION 'DB_CHECK_PASSED: % checks', checks;
END;
$$;
