-- ============================================================================
-- Community Stats View - Item-Based Aggregation
-- ============================================================================

DROP VIEW IF EXISTS community_stats CASCADE;

CREATE OR REPLACE VIEW community_stats AS
WITH flattened_items AS (
    -- Explode the items array from farm_records
    -- Using COALESCE to handle different naming conventions across contents
    SELECT 
        id as record_id,
        content_id,
        level_id,
        COALESCE(
            (data->>'farm_time_minutes')::numeric, 
            (data->>'time_minutes')::numeric,
            0
        ) as farm_time,
        COALESCE(
            (data->>'num_kills')::numeric, 
            (data->>'mobs_killed')::numeric,
            0
        ) as total_mobs,
        (data->>'florzinha')::numeric as florzinha,
        (data->>'multiplier')::numeric as multiplier,
        (item->>'item_id') as item_id,
        (item->>'quantity')::numeric as item_quantity
    FROM farm_records,
    jsonb_array_elements(data->'items') as item
)
SELECT 
    content_id,
    level_id,
    item_id,
    
    -- Total samples (number of unique records containing this item)
    COUNT(DISTINCT record_id) as total_runs,
    
    -- Sum of total mobs across all relevant records
    SUM(total_mobs) as total_samples,
    
    -- Sum of items dropped
    SUM(item_quantity) as total_drops,
    
    -- Total time in minutes
    SUM(farm_time) as total_time,
    
    -- Averages
    AVG(florzinha) as avg_florzinha,
    AVG(multiplier) as avg_multiplier,
    
    -- Drop Rates
    CASE 
        WHEN SUM(total_mobs) > 0 THEN SUM(item_quantity) / SUM(total_mobs)
        ELSE 0 
    END as drop_rate_real,
    
    -- Items per hour
    CASE 
        WHEN SUM(farm_time) > 0 THEN (SUM(item_quantity) / (SUM(farm_time) / 60.0))
        ELSE 0 
    END as drops_per_hour

FROM flattened_items
GROUP BY content_id, level_id, item_id;
