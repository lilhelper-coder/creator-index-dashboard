-- creators_cepi.sql
-- Run this in Supabase SQL Editor

-- Core creators table with JSONB dimensions
CREATE TABLE creators_cepi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Basic identifier fields
  handle TEXT UNIQUE NOT NULL,
  full_name TEXT,
  verified_status TEXT DEFAULT 'unverified',
  
  -- 8 JSONB dimension columns for 1,247 data points
  dimension_identifiers JSONB DEFAULT '{}'::jsonb,  -- Platform IDs, URLs, etc.
  dimension_demographics JSONB DEFAULT '{}'::jsonb,  -- Age, location, language
  dimension_platforms JSONB DEFAULT '{}'::jsonb,  -- Platform-specific data
  dimension_content JSONB DEFAULT '{}'::jsonb,  -- Content type, topics, style
  dimension_monetization JSONB DEFAULT '{}'::jsonb,  -- Revenue streams, partnerships
  dimension_audience JSONB DEFAULT '{}'::jsonb,  -- Follower stats, engagement
  dimension_credibility JSONB DEFAULT '{}'::jsonb,  -- Source credibility scores
  dimension_metadata JSONB DEFAULT '{}'::jsonb,  -- Internal metadata, timestamps
  
  -- Indexes for performance
  CONSTRAINT creators_handle_length CHECK (char_length(handle) >= 2),
  CONSTRAINT creators_handle_format CHECK (handle ~ '^[a-zA-Z0-9_.-]+$')
);

-- Indexes for JSONB querying
CREATE INDEX idx_creators_handle ON creators_cepi(handle);
CREATE INDEX idx_creators_verified ON creators_cepi(verified_status);
CREATE INDEX idx_creators_updated ON creators_cepi(updated_at DESC);
CREATE INDEX idx_creators_dimension_identifiers ON creators_cepi USING gin(dimension_identifiers);
CREATE INDEX idx_creators_dimension_monetization ON creators_cepi USING gin(dimension_monetization);

-- Metadata table for tracking data sources
CREATE TABLE data_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,  -- 'google_sheet', 'api', 'scrape', 'manual'
  last_synced TIMESTAMP WITH TIME ZONE,
  row_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(source_name, source_type)
);

-- Log table for sync operations
CREATE TABLE sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  operation TEXT NOT NULL,  -- 'google_sheet_sync', 'api_pull'
  status TEXT NOT NULL,  -- 'success', 'partial', 'failed'
  rows_processed INTEGER DEFAULT 0,
  rows_succeeded INTEGER DEFAULT 0,
  rows_failed INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Function to update timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_creators_cepi_updated_at BEFORE UPDATE ON creators_cepi
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE creators_cepi ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed)
CREATE POLICY "Enable read access for all users" ON creators_cepi
FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON creators_cepi
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role" ON creators_cepi
FOR UPDATE USING (auth.role() = 'service_role');
