'use client';
import { supabase } from "@/lib/supabaseClient";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Sparkles,
    Eye,
    EyeOff,
    Mail,
    Lock,
    AlertCircle,
    Loader2,
    ArrowRight,
    Users,
    TrendingUp,
    DollarSign,
    BarChart2,
    CheckCircle2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginData {
    email: string;
    password: string;
}

interface LoginFormProps {
    onSubmit?: (data: LoginData) => void | Promise<void>;
    loading?: boolean;
    error?: string;
}

// ─── Left panel: Stat pill ────────────────────────────────────────────────────
function StatPill({
    icon: Icon,
    label,
    value,
    iconBg,
    iconColor,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '12px',
                padding: '12px 16px',
                backdropFilter: 'blur(8px)',
            }}
        >
            <div
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Icon style={{ width: '16px', height: '16px', color: iconColor }} />
            </div>
            <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: '2px' }}>
                    {label}
                </p>
                <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>{value}</p>
            </div>
        </div>
    );
}

// ─── Left panel: Feature bullet ───────────────────────────────────────────────
function Feature({ text }: { text: string }) {
    return (
        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            <CheckCircle2 style={{ width: '16px', height: '16px', color: '#34d399', flexShrink: 0 }} />
            {text}
        </li>
    );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export function LoginForm({ onSubmit, loading = false, error = '' }: LoginFormProps) {
    const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const baseurl= process.env.NEXT_PUBLIC_BASE_URL

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
    };

    

const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        "http://localhost:3000/auth/login-callback",
    },
  });
};

    return (
        <div
            style={{
                width: '100vw',
                minHeight: '100vh',
                marginLeft: 'calc(-50vw + 50%)',
                display: 'flex',
                backgroundColor: '#f8fafc',
                fontFamily: 'inherit',
                overflowX: 'hidden',
            }}
        >
            {/* ── Left panel ── */}
            <div
                style={{
                    width: '440px',
                    minHeight: '100vh',
                    flexShrink: 0,
                    backgroundColor: '#2563eb',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '40px 36px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background blobs */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.25)', filter: 'blur(60px)' }} />
                    <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.2)', filter: 'blur(60px)' }} />
                </div>

                {/* Logo */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
                    </div>
                    <span style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                        LeadFlow CRM
                    </span>
                </div>

                {/* Headline */}
                <div style={{ position: 'relative', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '12px' }}>
                        Welcome back,<br />
                        <span style={{ color: '#bfdbfe' }}>let's close deals.</span>
                    </h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: '300px' }}>
                        Your pipeline is waiting. Log back in and pick up right where you left off.
                    </p>
                </div>

                {/* Stats grid */}
                <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '36px' }}>
                    <StatPill icon={Users}      label="Active Leads"     value="12,400+" iconBg="rgba(255,255,255,0.18)"  iconColor="#ffffff"  />
                    <StatPill icon={DollarSign} label="Pipeline Value"   value="$4.2M"   iconBg="rgba(52,211,153,0.25)"  iconColor="#34d399"  />
                    <StatPill icon={TrendingUp} label="Conversion Rate"  value="24.8%"   iconBg="rgba(167,139,250,0.25)" iconColor="#c4b5fd"  />
                    <StatPill icon={BarChart2}  label="Win Rate"         value="62%"     iconBg="rgba(251,191,36,0.25)"  iconColor="#fbbf24"  />
                </div>

                {/* Feature list */}
                <ul style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                    <Feature text="AI-powered email outreach per lead" />
                    <Feature text="Real-time pipeline & conversion analytics" />
                    <Feature text="Team collaboration with role-based access" />
                    <Feature text="CSV export & third-party integrations" />
                </ul>
            </div>

            {/* ── Right panel ── */}
            <div
                style={{
                    flex: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 32px',
                    backgroundColor: '#f8fafc',
                }}
            >
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    {/* Heading */}
                    <div style={{ marginBottom: '28px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#2563eb',
                                fontSize: '12px',
                                fontWeight: 600,
                                padding: '4px 12px',
                                borderRadius: '999px',
                                marginBottom: '16px',
                            }}
                        >
                            <Sparkles style={{ width: '11px', height: '11px' }} />
                            LeadFlow CRM
                        </div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                            Welcome back
                        </h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>
                            Sign in to continue to your dashboard.
                        </p>
                    </div>

                    {/* Form card */}
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '28px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        }}
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                            {/* Email */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <Label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                    Email address
                                </Label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94a3b8', pointerEvents: 'none' }} />
                                    <Input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        autoComplete="email"
                                        style={{
                                            height: '40px',
                                            paddingLeft: '36px',
                                            fontSize: '14px',
                                            borderRadius: '8px',
                                            borderColor: '#e2e8f0',
                                            backgroundColor: '#f8fafc',
                                            color: '#1e293b',
                                            width: '100%',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                        Password
                                    </Label>
                                    <a
                                        href="#"
                                        style={{ fontSize: '12px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94a3b8', pointerEvents: 'none', zIndex: 1 }} />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        autoComplete="current-password"
                                        style={{
                                            height: '40px',
                                            paddingLeft: '36px',
                                            paddingRight: '40px',
                                            fontSize: '14px',
                                            borderRadius: '8px',
                                            borderColor: '#e2e8f0',
                                            backgroundColor: '#f8fafc',
                                            color: '#1e293b',
                                            width: '100%',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#94a3b8',
                                            padding: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword
                                            ? <EyeOff style={{ width: '15px', height: '15px' }} />
                                            : <Eye style={{ width: '15px', height: '15px' }} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        backgroundColor: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                    }}
                                >
                                    <AlertCircle style={{ width: '15px', height: '15px', color: '#ef4444', flexShrink: 0 }} />
                                    <p style={{ fontSize: '13px', color: '#dc2626', lineHeight: 1.4 }}>{error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    backgroundColor: loading ? '#93c5fd' : '#2563eb',
                                    color: '#ffffff',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.15s',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                            <Separator style={{ flex: 1 }} />
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                or continue with
                            </span>
                            <Separator style={{ flex: 1 }} />
                        </div>

                        {/* OAuth buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={handleGoogleLogin}                                 
                                style={{
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#334155',
                                    cursor: 'pointer',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            
                        </div>
                    </div>

                    {/* Sign up link */}
                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '20px' }}>
                        Don't have an account?{' '}
                        <a href="/signup" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                            Sign up free
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;