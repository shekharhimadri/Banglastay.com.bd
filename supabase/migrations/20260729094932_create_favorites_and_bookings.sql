/*
# Create favorites and bookings tables

1. New Tables
- `favorites`: stores hotels a user has saved (hearted).
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users)
  - `hotel_id` (text, not null) — matches the hotel's id in the static hotels data
  - `created_at` (timestamp)
  - Unique constraint on (user_id, hotel_id) so a user can favorite a hotel only once.
- `bookings`: stores confirmed hotel reservations.
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users)
  - `hotel_id` (text, not null)
  - `hotel_name` (text, not null)
  - `destination_name` (text, not null)
  - `nights` (integer, not null, default 1)
  - `guests` (integer, not null, default 1)
  - `price_per_night` (integer, not null)
  - `total` (integer, not null) — grand total including taxes
  - `status` (text, not null, default 'confirmed')
  - `created_at` (timestamp)

2. Security
- Enable RLS on both tables.
- Owner-scoped CRUD: each authenticated user can only access their own rows.
- No anon access — these features require sign-in.

3. Important notes
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy the WITH CHECK policy.
- Email/password auth is used; email confirmation stays OFF.
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, hotel_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id text NOT NULL,
  hotel_name text NOT NULL,
  destination_name text NOT NULL,
  nights integer NOT NULL DEFAULT 1,
  guests integer NOT NULL DEFAULT 1,
  price_per_night integer NOT NULL,
  total integer NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookings" ON bookings;
CREATE POLICY "select_own_bookings" ON bookings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bookings" ON bookings;
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bookings" ON bookings;
CREATE POLICY "delete_own_bookings" ON bookings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
