-- Add new columns to races table
ALTER TABLE races
ADD COLUMN description text,
ADD COLUMN weekend_start timestamp with time zone,
ADD COLUMN weekend_end timestamp with time zone;

-- Create transport_info table
CREATE TABLE transport_info (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    circuit_id uuid NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
    type text NOT NULL,
    name text NOT NULL,
    description text,
    options text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index on circuit_id for better query performance
CREATE INDEX idx_transport_info_circuit_id ON transport_info(circuit_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_transport_info_updated_at
    BEFORE UPDATE ON transport_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON TABLE transport_info TO anon, authenticated, service_role;
