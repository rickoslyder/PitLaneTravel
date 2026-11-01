# Clerk production instance cutover

The application does not change behavior until Production environment
variables change. Leave Preview, current Production, Clerk settings, keys,
and DNS as they are until the switch below. This runbook does not perform
those changes.

## Dates

- Tuesday 10 November 2026 — DNS prep
- Thursday 12 November 2026 — production switch
- Tuesday 17 November 2026 — fallback

## Production environment

On Production only, during the switch on Thursday 12 November 2026, set:

```
CLERK_AUTHORIZED_PARTIES=https://www.pitlanetravel.com,https://pitlanetravel.com
```

Do not set `CLERK_AUTHORIZED_PARTIES` on Preview. If the variable is unset
or empty, middleware does not pass `authorizedParties`, which is how
previews and current production work today.

## Webhook

Point the production Clerk webhook at the www host:

`https://www.pitlanetravel.com/api/webhooks/clerk`

The handler inserts a `profiles` row on `user.created` with `is_admin`
false.

## Admin row

After Richard's first sign-up, set his new Clerk user id on that one row:

```sql
UPDATE profiles
SET is_admin = true
WHERE user_id = '<richard-new-clerk-user-id>';
```

Confirm the statement updates one row. `/admin` reads `profiles.is_admin`.

Undo: set it back to false.

```sql
UPDATE profiles
SET is_admin = false
WHERE user_id = '<richard-new-clerk-user-id>';
```

## Re-key Richard's old test rows

Approved by Richard under his PitLane risk rule.

After Richard's new prod profile exists, run one pre-check `SELECT` for
each table. Each must match exactly 1 row where
`user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P'`. Stop if any result is not
exactly one row.

```sql
SELECT * FROM trips
WHERE user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P';

SELECT * FROM flight_bookings
WHERE user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P';

SELECT * FROM admin_activities
WHERE user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P';
```

Write an audit log entry first. Record the date, the three pre-check
results, and the three updates below. Then run these one-row updates.
`<NEW_PROD_USER_ID>` is Richard's new production Clerk user id. Confirm
each statement updates one row.

```sql
UPDATE trips
SET user_id = '<NEW_PROD_USER_ID>'
WHERE user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P';

UPDATE flight_bookings
SET user_id = '<NEW_PROD_USER_ID>'
WHERE user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P';

UPDATE admin_activities
SET user_id = '<NEW_PROD_USER_ID>'
WHERE user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P';
```

Undo is the same three updates with the ids swapped:

```sql
UPDATE trips
SET user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P'
WHERE user_id = '<NEW_PROD_USER_ID>';

UPDATE flight_bookings
SET user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P'
WHERE user_id = '<NEW_PROD_USER_ID>';

UPDATE admin_activities
SET user_id = 'user_2qf9oR94QeVLf8Wf4T0tPRljN3P'
WHERE user_id = '<NEW_PROD_USER_ID>';
```

Leave the old `profiles` row alone. Leave the seed user `'1'`
`saved_itineraries` rows alone.

## Apple sign-in

Apple sign-in setup is done by Richard himself in Clerk. Keep the `.p8`
key out of the repository and out of chats.

## Smoke checks

- `/`
- `/races`
- `/login`
- Sign in with email
- Sign in with Google
- Sign in with Apple
- `/admin` access
