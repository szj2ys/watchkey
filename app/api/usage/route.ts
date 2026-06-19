import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ loggedIn: false, count: 0, limit: 1 }, { status: 200 });
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('analysis_count, analysis_limit, updated_at')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    let count = profile.analysis_count;
    const limit = profile.analysis_limit;

    // Check UTC day reset
    const profileDateStr = new Date(profile.updated_at).toISOString().split('T')[0];
    const currentDateStr = new Date().toISOString().split('T')[0];

    if (profileDateStr !== currentDateStr) {
      // Reset count for a new UTC day
      count = 0;
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ analysis_count: 0, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
    }

    return NextResponse.json({ loggedIn: true, count, limit }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in GET /api/usage:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
