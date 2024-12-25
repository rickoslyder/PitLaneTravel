-- Create notification_type enum
DO $$ BEGIN
    CREATE TYPE public.notification_type AS ENUM ('email', 'sms', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create waitlist_status enum
DO $$ BEGIN
    CREATE TYPE public.waitlist_status AS ENUM ('pending', 'notified', 'expired', 'converted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id text NOT NULL,
    race_id uuid NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
    ticket_category_id text NOT NULL,
    email text NOT NULL,
    phone text,
    notification_type public.notification_type NOT NULL,
    status public.waitlist_status NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.waitlist USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_race_id ON public.waitlist USING btree (race_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist USING btree (status);
CREATE INDEX IF NOT EXISTS idx_waitlist_ticket_category ON public.waitlist USING btree (ticket_category_id);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_waitlist_updated_at ON public.waitlist;
CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON TABLE public.waitlist TO postgres;
GRANT ALL ON TABLE public.waitlist TO anon;
GRANT ALL ON TABLE public.waitlist TO authenticated;
GRANT ALL ON TABLE public.waitlist TO service_role; 