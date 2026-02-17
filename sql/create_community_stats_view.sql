-- ============================================================================
-- Community Stats View - SQL Aggregation for Farm Records
-- ============================================================================
-- 
-- Purpose: Aggregate farm statistics from JSONB data in farm_records table
-- Grouping: By content_id and level_id
-- RLS: Inherits from farm_records table automatically
--
-- Usage in Supabase:
-- 1. Go to SQL Editor in Supabase Dashboard
-- 2. Paste this entire script
-- 3. Run it
-- 4. Query the view: SELECT * FROM community_stats WHERE content_id = 'fenda_maior';
--
-- ============================================================================

CREATE OR REPLACE VIEW community_stats AS
SELECT 
    content_id,
    level_id,
    
    -- Total number of farm submissions
    COUNT(*) as total_samples,
    
    -- Total time aggregation
    -- Handles both farm_time_minutes (Villa/Fenda/Trial/Glast/Domínio)
    -- and first_fatigue_minutes (Moedas)
    SUM(
        COALESCE(
            (data->>'farm_time_minutes')::integer,
            (data->>'first_fatigue_minutes')::integer,
            0
        )
    ) as total_time_minutes,
    
    -- Average time per farm
    AVG(
        COALESCE(
            (data->>'farm_time_minutes')::numeric,
            (data->>'first_fatigue_minutes')::numeric,
            0
        )
    ) as avg_time_minutes,
    
    -- Total runs completed (Villa, Fenda, Trial)
    -- Returns 0 for content types that don't have runs_completed
    SUM(
        COALESCE(
            (data->>'runs_completed')::integer,
            0
        )
    ) as total_runs_completed,
    
    -- Total bags dropped (Villa only)
    SUM(
        COALESCE(
            (data->>'bags_dropped')::integer,
            0
        )
    ) as total_bags_dropped,
    
    -- Total items dropped (all content types with items array)
    -- Sums all quantities from the items JSONB array
    SUM(
        COALESCE(
            (
                SELECT SUM((item->>'quantity')::integer)
                FROM jsonb_array_elements(data->'items') as item
            ),
            0
        )
    ) as total_items_dropped,
    
    -- Average florzinha percentage across all farms
    AVG(
        COALESCE(
            (data->>'florzinha')::numeric,
            0
        )
    ) as avg_florzinha,
    
    -- Timestamp of the most recent farm submission
    MAX((data->>'timestamp')::timestamptz) as last_farm_timestamp,
    
    -- Timestamp of the first farm submission
    MIN((data->>'timestamp')::timestamptz) as first_farm_timestamp,
    
    -- Count of farms by mode (for Moedas content)
    -- Returns 0 for content types without mode field
    COUNT(*) FILTER (WHERE data->>'mode' = 'normal') as count_mode_normal,
    COUNT(*) FILTER (WHERE data->>'mode' = 'hard') as count_mode_hard,
    COUNT(*) FILTER (WHERE data->>'mode' = 'extreme') as count_mode_extreme,
    COUNT(*) FILTER (WHERE data->>'mode' = 'savage') as count_mode_savage

FROM farm_records
GROUP BY content_id, level_id;

-- ============================================================================
-- Grant permissions (Supabase handles this automatically via RLS)
-- ============================================================================
-- The view inherits RLS policies from the farm_records table
-- No additional permissions needed

-- ============================================================================
-- Example Queries
-- ============================================================================

-- Get stats for a specific content and level
-- SELECT * FROM community_stats 
-- WHERE content_id = 'fenda_maior' AND level_id = '18';

-- Get all content stats ordered by total samples
-- SELECT * FROM community_stats 
-- ORDER BY total_samples DESC;

-- Calculate drop rate per hour for a specific content
-- SELECT 
--     content_id,
--     level_id,
--     total_items_dropped,
--     total_time_minutes,
--     ROUND(
--         (total_items_dropped::numeric / NULLIF(total_time_minutes / 60.0, 0))::numeric,
--         2
--     ) as items_per_hour
-- FROM community_stats
-- WHERE content_id = 'fenda_maior';
