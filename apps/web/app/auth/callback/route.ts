import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { hasSupabaseConfig } from "../../../lib/supabase/config";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    if (token_hash && (type === "email" || type === "signup")) {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as EmailOtpType });
      if (!error) return NextResponse.redirect(new URL("/app", request.url));
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/app", request.url));
    }
  }
  return NextResponse.redirect(new URL("/login?status=expired", request.url));
}
