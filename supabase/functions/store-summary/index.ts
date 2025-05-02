
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using auth from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    // Parse request body
    const { storeId } = await req.json();
    if (!storeId) {
      return new Response(
        JSON.stringify({ error: 'Missing storeId parameter' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has required role (Consultant or Boss)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has required role
    if (profile.role !== 'consultant' && profile.role !== 'boss') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only Consultants and Bosses can access this report.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get store details
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      console.error('Error fetching store:', storeError);
      return new Response(
        JSON.stringify({ error: 'Store not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all pictures for this store
    const { data: pictures, error: picturesError } = await supabase
      .from('pictures')
      .select('*')
      .eq('store_id', storeId);

    if (picturesError) {
      console.error('Error fetching pictures:', picturesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch store pictures' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process all analysis data from pictures
    const allAnalysisData = [];
    let totalSKUCount = 0;
    let brandCounts = {};
    let positionData = { Top: 0, Middle: 0, Bottom: 0 };
    let totalEmptySpace = 0;
    let emptySpaceCount = 0;
    let totalPictures = pictures.length;
    let picturesWithAnalysis = 0;
    
    for (const picture of pictures) {
      if (picture.analysis_data && Array.isArray(picture.analysis_data)) {
        picturesWithAnalysis++;
        const analysisData = picture.analysis_data;
        
        // Add all analysis data items to consolidated list
        allAnalysisData.push(...analysisData);
        
        // Process each item in the analysis data
        for (const item of analysisData) {
          // Skip summary items
          if (item.total_sku_facings || item.quality_picture) continue;
          
          // Count SKUs
          if (item.sku_count && !item.empty_space_estimate) {
            totalSKUCount += item.sku_count;
          }
          
          // Count brands
          if (item.brand && !item.empty_space_estimate) {
            brandCounts[item.brand] = (brandCounts[item.brand] || 0) + (item.sku_count || 1);
          }
          
          // Count by position
          if (item.sku_position && !item.empty_space_estimate) {
            const position = item.sku_position;
            if (position === 'Top' || position === 'Middle' || position === 'Bottom') {
              positionData[position] += (item.sku_count || 1);
            }
          }
          
          // Track empty space
          if (item.empty_space_estimate) {
            totalEmptySpace += item.empty_space_estimate;
            emptySpaceCount++;
          }
        }
      }
    }
    
    // Calculate averages and prepare summary
    const averageEmptySpace = emptySpaceCount > 0 ? Math.round(totalEmptySpace / emptySpaceCount) : 0;
    
    // Get top brands (sorted by count)
    const topBrands = Object.entries(brandCounts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5);
    
    // Create summary report
    const storeSummary = {
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
        country: store.country,
        type: store.type,
      },
      summary: {
        totalPictures,
        picturesWithAnalysis,
        totalSKUCount,
        averageEmptySpace: `${averageEmptySpace}%`,
        positionDistribution: positionData,
        topBrands,
      },
      rawAnalysisData: allAnalysisData,
    };

    return new Response(
      JSON.stringify(storeSummary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in store-summary function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
