-- Create enum for admin activity types
CREATE TYPE admin_activity_type AS ENUM ('ticket', 'meetup', 'transport', 'attraction', 'series');

-- Create admin activities table
CREATE TABLE admin_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type admin_activity_type NOT NULL,
    description TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger
CREATE TRIGGER update_admin_activities_updated_at
    BEFORE UPDATE ON admin_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
