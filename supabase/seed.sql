-- ============================================
-- Seed Data for test account: epark@gogogle.com
-- Run AFTER creating the test user via Supabase Auth
-- Replace USER_ID with the actual UUID from auth.users
-- ============================================

-- To find the user ID after creating the account:
-- SELECT id FROM auth.users WHERE email = 'epark@gogogle.com';

-- Set the user ID variable (replace with actual UUID)
-- Example: DO $$ DECLARE uid UUID := 'your-user-id-here'; BEGIN ... END $$;

DO $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'epark@gogogle.com';

  IF uid IS NULL THEN
    RAISE EXCEPTION 'Test user not found. Create the account first.';
  END IF;

  -- Update profile name
  UPDATE profiles SET name = 'Daniel Kim' WHERE id = uid;

  -- Insert 20 sample errands
  INSERT INTO errands (user_id, name, description, category, interval_type, interval_value, next_due, last_completed, estimated_cost, reminders, notes) VALUES
  (uid, 'Water Heater Flush', NULL, 'home', 'months', 12, '2026-01-20', '2025-01-20', 150.00, true, 'Drain and flush sediment from water heater tank. Check anode rod.'),
  (uid, 'Windshield Wiper Replacement', NULL, 'vehicle', 'months', 6, '2026-01-30', '2025-07-30', 35.00, true, 'Replace front and rear wiper blades.'),
  (uid, 'Eye Exam', NULL, 'health', 'months', 12, '2026-02-05', '2025-02-05', 200.00, true, 'Annual comprehensive eye exam. Update prescription if needed.'),
  (uid, 'Netflix Subscription', NULL, 'subscriptions', 'months', 1, '2026-02-10', '2026-01-10', 15.49, true, 'Standard plan auto-renewal.'),
  (uid, 'Gym Membership Renewal', NULL, 'health', 'months', 12, '2026-02-18', '2025-02-18', 480.00, true, 'Annual gym membership fee.'),
  (uid, 'Lawn Mower Service', NULL, 'home', 'months', 12, '2026-02-20', '2025-02-20', 120.00, true, 'Blade sharpening, oil change, air filter.'),
  (uid, 'Domain Name Renewal', NULL, 'subscriptions', 'months', 12, '2026-02-22', '2025-02-22', 12.00, true, 'Personal domain renewal.'),
  (uid, 'Spotify Premium', NULL, 'subscriptions', 'months', 1, '2026-03-01', '2026-02-01', 10.99, true, 'Individual plan.'),
  (uid, 'Brake Inspection', NULL, 'vehicle', 'miles', 15000, '2026-03-01', '2025-09-01', 50.00, true, 'Check brake pads, rotors, and fluid.'),
  (uid, 'iCloud Storage', NULL, 'subscriptions', 'months', 1, '2026-03-01', '2026-02-01', 2.99, true, '200GB plan.'),
  (uid, 'Pet Vaccination', NULL, 'health', 'months', 12, '2026-03-15', '2025-03-15', 180.00, true, 'Annual shots and checkup for dog.'),
  (uid, 'Gutter Cleaning', NULL, 'home', 'months', 6, '2026-04-01', '2025-10-01', 200.00, true, 'Clean gutters and downspouts. Check for damage.'),
  (uid, 'HVAC Filter Replacement', NULL, 'home', 'months', 3, '2026-04-10', '2026-01-10', 25.00, true, 'Replace air filters in all units.'),
  (uid, 'Oil Change', NULL, 'vehicle', 'miles', 5000, '2026-04-15', '2025-10-15', 75.00, true, 'Full synthetic oil change.'),
  (uid, 'Dryer Vent Cleaning', NULL, 'home', 'months', 12, '2026-04-20', '2025-04-20', 130.00, true, 'Professional dryer vent cleaning to prevent fire hazard.'),
  (uid, 'Dental Checkup', NULL, 'health', 'months', 6, '2026-05-20', '2025-11-20', 250.00, true, 'Routine cleaning and examination.'),
  (uid, 'Smoke Detector Batteries', NULL, 'home', 'months', 6, '2026-06-01', '2025-12-01', 15.00, true, 'Replace batteries in all smoke and CO detectors.'),
  (uid, 'Car Registration Renewal', NULL, 'vehicle', 'months', 12, '2026-06-15', '2025-06-15', 120.00, true, 'Annual vehicle registration renewal.'),
  (uid, 'Tire Rotation', NULL, 'vehicle', 'miles', 7500, '2026-06-20', '2025-12-20', 40.00, true, 'Rotate all four tires. Check tire pressure.'),
  (uid, 'Adobe Creative Cloud', NULL, 'subscriptions', 'months', 12, '2026-08-15', '2025-08-15', 659.88, true, 'All Apps annual subscription.');

  -- Insert ~35 completion history records
  -- Using errand names to find IDs dynamically
  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-01-20'::date, '2025-01-20'::date, 145.00, 'Flushed sediment, anode rod looks good'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Water Heater Flush';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2024-01-15'::date, '2024-01-20'::date, 160.00, 'Replaced anode rod this time'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Water Heater Flush';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-07-30'::date, '2025-07-30'::date, 32.00, 'Bosch ICON blades'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Windshield Wiper Replacement';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-01-28'::date, '2025-01-30'::date, 38.00, 'Rain-X Latitude blades'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Windshield Wiper Replacement';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-02-05'::date, '2025-02-05'::date, 195.00, 'Vision is stable, no prescription change'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Eye Exam';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2026-01-10'::date, '2026-01-10'::date, 15.49, 'Auto-renewed'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Netflix Subscription';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-12-10'::date, '2025-12-10'::date, 15.49, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'Netflix Subscription';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-11-10'::date, '2025-11-10'::date, 15.49, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'Netflix Subscription';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-02-18'::date, '2025-02-18'::date, 480.00, 'Renewed for another year'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Gym Membership Renewal';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-02-20'::date, '2025-02-20'::date, 115.00, 'Blade sharpened, oil changed'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Lawn Mower Service';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-02-22'::date, '2025-02-22'::date, 12.00, 'Renewed via Namecheap'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Domain Name Renewal';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2026-02-01'::date, '2026-02-01'::date, 10.99, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'Spotify Premium';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2026-01-01'::date, '2026-01-01'::date, 10.99, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'Spotify Premium';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-12-01'::date, '2025-12-01'::date, 10.99, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'Spotify Premium';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-09-01'::date, '2025-09-01'::date, 45.00, 'Pads at 60%, good for now'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Brake Inspection';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2026-02-01'::date, '2026-02-01'::date, 2.99, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'iCloud Storage';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2026-01-01'::date, '2026-01-01'::date, 2.99, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'iCloud Storage';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-03-15'::date, '2025-03-15'::date, 175.00, 'All vaccines up to date'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Pet Vaccination';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-10-01'::date, '2025-10-01'::date, 190.00, 'Minor repair on one downspout'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Gutter Cleaning';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-04-01'::date, '2025-04-01'::date, 200.00, 'Full cleaning done'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Gutter Cleaning';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2026-01-10'::date, '2026-01-10'::date, 22.00, 'MERV 13 filters'
  FROM errands e WHERE e.user_id = uid AND e.name = 'HVAC Filter Replacement';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-10-08'::date, '2025-10-10'::date, 25.00, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'HVAC Filter Replacement';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-10-15'::date, '2025-10-15'::date, 72.00, 'Mobil 1 synthetic'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Oil Change';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-04-20'::date, '2025-04-15'::date, 78.00, 'Also topped off coolant'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Oil Change';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-04-20'::date, '2025-04-20'::date, 125.00, 'Vent was fairly clogged'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Dryer Vent Cleaning';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-11-20'::date, '2025-11-20'::date, 245.00, 'No cavities'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Dental Checkup';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-05-22'::date, '2025-05-20'::date, 260.00, 'One small filling needed'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Dental Checkup';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-12-01'::date, '2025-12-01'::date, 14.00, 'Duracell 9V batteries'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Smoke Detector Batteries';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-06-01'::date, '2025-06-01'::date, 15.00, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'Smoke Detector Batteries';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-06-15'::date, '2025-06-15'::date, 118.00, 'Renewed online'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Car Registration Renewal';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-12-20'::date, '2025-12-20'::date, 40.00, 'Pressure adjusted to 35 PSI'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Tire Rotation';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-06-18'::date, '2025-06-20'::date, 40.00, NULL
  FROM errands e WHERE e.user_id = uid AND e.name = 'Tire Rotation';

  INSERT INTO completion_history (errand_id, user_id, completed_date, scheduled_date, cost, notes)
  SELECT e.id, uid, '2025-08-15'::date, '2025-08-15'::date, 659.88, 'All Apps plan renewed'
  FROM errands e WHERE e.user_id = uid AND e.name = 'Adobe Creative Cloud';

END $$;
