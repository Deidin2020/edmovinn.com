import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, User, Mail, LockKeyhole } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingCopy } from "@/content/booking-copy";
import { useCart } from "@/hooks/useCart";
import { api, API_BASE } from "@/lib/api";

export function LegacyAuth() {
  const { t, isRTL } = useLanguage(),
    c = useBookingCopy();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "signup" ? "signup" : "signin";
  const register = tab === "signup";
  const mode = params.get("mode");
  const recovery = mode === "forgot" || mode === "reset";
  const options = useQuery({ queryKey: ["auth-options"], queryFn: () => api<{google:boolean;password_reset:boolean}>("/tenant/auth-options") });
  const [notice, setNotice] = useState("");
  const { items } = useCart();
  const navigate = useNavigate(),
    client = useQueryClient();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  function change(value: string) {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    next.delete("mode"); next.delete("token"); next.delete("error");
    setParams(next, { replace: true });
    setError("");
    setNotice("");
    setShow(false);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setError("");
    if (recovery) {
      setBusy(true); setNotice("");
      try {
        await api("/tenant/" + (mode === "reset" ? "reset-password" : "forgot-password"), "POST", {...data, token: params.get("token"), next: params.get("next") === "checkout" || items.length ? "checkout" : "dashboard"});
        if (mode === "reset") { change("signin"); setNotice(c("Password updated. Sign in to continue your booking.")); }
        else setNotice(c("If an account exists, a reset link will be emailed to you."));
      } catch (e) { setError(c(e instanceof Error ? e.message : String(e))); }
      finally { setBusy(false); }
      return;
    }
    if (register && data.password !== data.password_confirmation) {
      setError(c("Passwords do not match."));
      return;
    }
    setBusy(true);
    try {
      await api("/tenant/" + (register ? "register" : "login"), "POST", data);
      client.clear();
      navigate(params.get("next") === "checkout" || items.length > 0 ? "/checkout" : "/dashboard", {
        replace: true,
      });
    } catch (e) {
      setError(c(e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }
  const input =
    "h-12 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  function password(name: string, label: string) {
    return (
      <label className="block space-y-2 text-sm font-medium">
        {label}
        <div className="relative">
          <LockKeyhole className="absolute start-3 top-4 w-4 h-4 text-muted-foreground" />
          <input
            name={name}
            aria-label={label}
            type={show ? "text" : "password"}
            autoComplete={register || recovery ? "new-password" : "current-password"}
            required
            minLength={register || recovery ? 12 : 1}
            maxLength={72}
            className={input + " ps-10 pe-12"}
          />
          <button
            type="button"
            className="absolute end-3 top-4 text-muted-foreground"
            aria-label={c(show ? "Hide password" : "Show password")}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </label>
    );
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <section className="rounded-lg border bg-card shadow-sm w-full max-w-md">
        <div className="p-6 text-center space-y-1.5">
          <h1 className="tracking-tight text-2xl font-bold">{t("auth.welcome")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>
        <div className="p-6 pt-0">
          {notice && <p role="status" className="mb-4 rounded-md bg-primary/10 p-3 text-sm">{notice}</p>}
          {params.get("error") === "google" && <p role="alert" className="mb-4 text-sm text-destructive">{c("Google sign-in could not be completed. Try again or use your password.")}</p>}
          {recovery ? <form onSubmit={submit} className="space-y-4">
            <h2 className="font-semibold">{c(mode === "reset" ? "Choose a new password" : "Reset your password")}</h2>
            {mode === "forgot" ? <label className="block space-y-2 text-sm">{t("inputs.email")}<input className={input} name="email" type="email" required autoComplete="email" maxLength={254}/></label> : <>
              {password("password",t("inputs.password"))}
              {password("password_confirmation",t("inputs.password_confirmation"))}
              <p className="text-xs text-muted-foreground">{c("Use at least 12 characters for your password.")}</p>
            </>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button disabled={busy} className="w-full">{c(busy ? "Please wait…" : mode === "reset" ? "Save password" : "Send reset link")}</Button>
            <button type="button" className="text-sm underline" onClick={()=>change("signin")}>{c("Back to sign in")}</button>
          </form> : <>
          <Tabs value={tab} onValueChange={change} dir={isRTL ? "rtl" : "ltr"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger disabled={busy} value="signin">
                {t("auth.sign_in")}
              </TabsTrigger>
              <TabsTrigger disabled={busy} value="signup">
                {t("auth.sign_up")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              <form key={tab} onSubmit={submit} className="space-y-4">
                {register && (
                  <label className="block space-y-2 text-sm font-medium">
                    {t("inputs.full_name")}
                    <div className="relative">
                      <User className="absolute start-3 top-4 w-4 h-4 text-muted-foreground" />
                      <input
                        name="name"
                        autoComplete="name"
                        required
                        maxLength={150}
                        className={input + " ps-10"}
                      />
                    </div>
                  </label>
                )}
                <label className="block space-y-2 text-sm font-medium">
                  {register ? t("inputs.phone") : c("Phone number or email")}
                  <input
                    name={register ? "phone" : "identifier"}
                    autoComplete={register ? "tel" : "username"}
                    type={register ? "tel" : "text"}
                    dir="ltr"
                    placeholder={
                      register ? "+90 555 123 4567" : "+90 555 123 4567 / Email@mail.com"
                    }
                    required
                    maxLength={register ? 50 : 200}
                    className={input}
                  />
                </label>
                {register && (
                  <label className="block space-y-2 text-sm font-medium">
                    {t("inputs.email")}
                    <div className="relative">
                      <Mail className="absolute start-3 top-4 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        maxLength={200}
                        placeholder="Email@mail.com"
                        className={input + " ps-10"}
                      />
                    </div>
                  </label>
                )}
                {password("password", t("inputs.password"))}
                {!register && <button type="button" disabled={!options.data?.password_reset} className="text-sm text-primary underline disabled:opacity-50" onClick={()=>{ const next=new URLSearchParams(params); next.set("mode","forgot"); next.delete("error"); setParams(next); setError(""); setNotice(""); }}>{c("Forgot password?")}</button>}
                {register && (
                  <>
                    {password("password_confirmation", t("inputs.password_confirmation"))}
                    <p className="text-xs text-muted-foreground">
                      {c("Use at least 12 characters for your password.")}
                    </p>
                  </>
                )}
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={busy} className="w-full h-10">
                  {busy ? c("Please wait…") : t(register ? "actions.sign_up" : "actions.login")}
                </Button>
                <p className="text-sm text-center">
                  {t(register ? "auth.do_have_account" : "auth.have_account")}{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    disabled={busy}
                    onClick={() => change(register ? "signin" : "signup")}
                  >
                    {t(register ? "auth.sign_in" : "auth.sign_up")}
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-4 border-t pt-4">
            <Button type="button" variant="outline" className="w-full" disabled={busy || !options.data?.google} onClick={()=>{ window.location.href=API_BASE+"/api/v1/tenant/google/start?next="+(params.get("next")==="checkout" || items.length ? "checkout" : "dashboard"); }}>{c("Continue with Google")}</Button>
            {options.data && !options.data.google && <p className="mt-2 text-xs text-muted-foreground text-center">{c("Google sign-in is temporarily unavailable. Please use your email or phone number.")}</p>}
          </div>
          </>}
        </div>
      </section>
    </div>
  );
}
