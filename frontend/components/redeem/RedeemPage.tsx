"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  KeyRound,
  Shield,
  Zap,
} from "lucide-react";
import {
  assembleCredential,
  checkCode,
  envelopeRequestId,
  followExisting,
  formatElapsed,
  getRequest,
  hasPublicReceipt,
  isCompleted,
  isFailed,
  isProcessing,
  isReady,
  isTransient,
  mergeEnvelope,
  progressStepIndex,
  PROGRESS_STEPS,
  receiptView,
  shouldKeepPolling,
  statusDetail,
  statusLabel,
  statusTitle,
  submitRecharge,
  type BeibeiCredentialOption,
  type BeibeiEnvelope,
} from "@/lib/beibei";
import { parseChatGptSession } from "@/lib/session-json";
import { cn } from "@/lib/utils";

const fieldCls =
  "w-full rounded-2xl border border-hairline bg-page px-4 py-3 text-[16px] outline-none transition-shadow placeholder:text-faint focus:border-hairline-strong focus:shadow-[0_0_0_4px_rgba(13,116,206,0.08)] sm:text-[15px]";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function PresetCode({ onCode }: { onCode: (code: string) => void }) {
  const searchParams = useSearchParams();
  const applied = useRef(false);
  useEffect(() => {
    const preset = searchParams.get("code")?.trim();
    if (!preset || applied.current) return;
    applied.current = true;
    onCode(preset);
  }, [searchParams, onCode]);
  return null;
}

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"check" | "submit">("check");
  const [checking, setChecking] = useState(false);
  const [checkEnv, setCheckEnv] = useState<BeibeiEnvelope | null>(null);
  const [error, setError] = useState("");

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<BeibeiEnvelope | null>(null);
  const [nextPollAt, setNextPollAt] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const idemKeyRef = useRef<string | undefined>(undefined);
  const pollRef = useRef<number | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const jobRef = useRef<BeibeiEnvelope | null>(null);
  const accountHintRef = useRef("");
  const fillAttemptsRef = useRef(0);

  function updateJob(next: BeibeiEnvelope | null) {
    jobRef.current = next;
    setJob(next);
  }

  function absorbJob(next: BeibeiEnvelope) {
    const merged = mergeEnvelope(jobRef.current, next);
    updateJob(merged);
    return merged;
  }



  const option: BeibeiCredentialOption | undefined =
    checkEnv?.data?.credential_options?.[0];

  const needsChatGptSession = useMemo(() => {
    const type = checkEnv?.data?.product_type;
    const keys = option?.fields.map((f) => f.key) ?? [];
    return type === "chatgpt" || keys.includes("session_json");
  }, [checkEnv, option]);

  function stopPoll() {
    if (pollRef.current) {
      window.clearTimeout(pollRef.current);
      pollRef.current = null;
    }
    setNextPollAt(null);
  }

  function rememberRequestId(id?: string | null) {
    const next = id?.trim();
    if (next) requestIdRef.current = next;
  }

  function startPoll(requestId: string, seconds: number | null, first = false) {
    stopPoll();
    rememberRequestId(requestId);
    const waitSec = first ? Math.min(3, Math.max(1, seconds ?? 3)) : Math.max(3, seconds ?? 15);
    const wait = waitSec * 1000;
    setNextPollAt(Date.now() + wait);
    setStartedAt((prev) => prev ?? Date.now());
    pollRef.current = window.setTimeout(async () => {
      try {
        const env = await getRequest(requestId);
        if (isTransient(env)) {
          startPoll(requestId, env.retry_after ?? 5);
          return;
        }
        rememberRequestId(envelopeRequestId(env));
        const merged = absorbJob(env);
        if (isCompleted(merged) && !isProcessing(merged)) {
          if (!hasPublicReceipt(merged) && fillAttemptsRef.current < 8) {
            fillAttemptsRef.current += 1;
            startPoll(envelopeRequestId(merged) || requestId, merged.retry_after ?? 3);
            return;
          }
          stopPoll();
          setValues({});
          return;
        }
        if (isFailed(merged) && !shouldKeepPolling(merged)) {
          stopPoll();
          return;
        }
        startPoll(envelopeRequestId(merged) || requestId, merged.retry_after);
      } catch {
        startPoll(requestId, 5);
      }
    }, wait);
  }

  useEffect(() => () => stopPoll(), []);

  async function applyResolved(env: BeibeiEnvelope) {
    rememberRequestId(envelopeRequestId(env));
    setCheckEnv(env);
    const id = envelopeRequestId(env) || requestIdRef.current;
    if (shouldKeepPolling(env) && id) {
      absorbJob(env);
      setPhase("submit");
      startPoll(id, env.retry_after, true);
      return true;
    }
    if (isCompleted(env)) {
      const merged = absorbJob(env);
      setPhase("submit");
      if (id && !hasPublicReceipt(merged)) {
        fillAttemptsRef.current = 0;
        startPoll(id, 3, true);
        return true;
      }
      stopPoll();
      return true;
    }
    return false;
  }

  async function runCheck(raw?: string) {
    const next = (raw ?? code).trim();
    if (!next) return;
    setCode(next);
    setChecking(true);
    setError("");
    setCheckEnv(null);
    updateJob(null);
    setStartedAt(null);
    idemKeyRef.current = undefined;
    requestIdRef.current = null;
    fillAttemptsRef.current = 0;
    accountHintRef.current = "";
    try {
      let env = await checkCode(next);
      env = await followExisting(env);
      if (await applyResolved(env)) return;
      setCheckEnv(env);
      if (!isReady(env)) {
        setError(env.message || "卡密当前不可用");
      }
    } catch {
      setError("识别失败，请稍后再试");
    } finally {
      setChecking(false);
    }
  }

  async function onCheck(e?: React.FormEvent) {
    e?.preventDefault();
    await runCheck();
  }

  function enterSubmit() {
    setPhase("submit");
    setValues({});
    updateJob(null);
    setError("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = code.trim();
    if (!next || submitting) return;
    const missing = (option?.fields ?? []).filter(
      (f) => f.required && !values[f.key]?.trim()
    );
    if (missing.length) {
      setError(`请填写${missing[0].label}`);
      return;
    }
    const sessionField = (option?.fields ?? []).find((f) => f.key === "session_json");
    if (sessionField) {
      const parsed = parseChatGptSession(values.session_json ?? "");
      if (!parsed?.ok) {
        setError(parsed?.error || "Session JSON 无效，请重新复制完整内容");
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      const env = await submitRecharge({
        code: next,
        credential: assembleCredential(option, values),
        idempotency_key: idemKeyRef.current,
      });
      if (env.idempotency_key) idemKeyRef.current = env.idempotency_key;
      rememberRequestId(envelopeRequestId(env));
      if (env.code === "SUBMIT_RETRYABLE") {
        idemKeyRef.current = undefined;
        setError(env.message || "请稍后再提交");
        return;
      }
      const parsed = parseChatGptSession(values.session_json ?? "");
      if (parsed?.ok) accountHintRef.current = parsed.email;
      fillAttemptsRef.current = 0;
      setStartedAt((prev) => prev ?? Date.now());
      absorbJob(env);
      if (isCompleted(env) && !isProcessing(env)) {
        const resolved = envelopeRequestId(env) ? await followExisting(env) : env;
        absorbJob(resolved);
        setValues({});
        stopPoll();
        return;
      }
      const id = envelopeRequestId(env) || requestIdRef.current;
      if (shouldKeepPolling(env) && id) {
        startPoll(id, env.retry_after, true);
        return;
      }
      if (isProcessing(env)) return;
      if (!env.success) {
        if (env.code === "SERVICE_UNAVAILABLE") {
          setError(env.message || "服务暂时不可用，将使用同一请求重试");
        } else {
          setError(env.message || "提交失败");
        }
      }
    } catch {
      setError("提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  async function refreshStatus() {
    const id = envelopeRequestId(job) || requestIdRef.current;
    if (id) {
      const env = await getRequest(id);
      if (!isTransient(env)) {
        rememberRequestId(envelopeRequestId(env));
        absorbJob(env);
      }
      if (shouldKeepPolling(env) && (envelopeRequestId(env) || id)) {
        startPoll(envelopeRequestId(env) || id, env.retry_after, true);
      } else {
        stopPoll();
      }
      return;
    }
    await onCheck();
  }

  const busy = checking || submitting || isProcessing(job) || isTransient(job);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 sm:pt-32">
      <Suspense fallback={null}>
        <PresetCode onCode={(preset) => void runCheck(preset)} />
      </Suspense>
      <div className="text-center">
        <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
          AI Recharge
        </p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight sm:text-4xl">
          自助会员充值
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          输入卡密，系统会自动识别套餐并进入对应提交页。
        </p>
      </div>

      {phase === "check" ? (
        <section className="mt-8 rounded-3xl bg-surface p-5 shadow-[0_8px_40px_rgba(0,0,0,0.04)] sm:p-8">
          <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.22em] text-faint">
            System.recharge.init
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            输入卡密，自动进入对应充值
          </h2>
          <p className="mt-2 text-sm text-muted">
            卡密在服务端识别，凭证不会写入地址栏或本地存储。
          </p>

          <form onSubmit={onCheck} className="mt-6">
            <label className="mb-1.5 block text-[13px] font-medium text-subtle">
              CDKEY 卡密
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-2xl border border-hairline bg-page focus-within:border-hairline-strong focus-within:shadow-[0_0_0_4px_rgba(13,116,206,0.08)]">
                <span className="flex items-center border-r border-hairline px-3 text-muted">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入收到的卡密"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 min-w-0 flex-1 bg-transparent px-4 text-[16px] outline-none placeholder:text-faint sm:text-[15px]"
                />
              </div>
              <button
                type="submit"
                disabled={checking || !code.trim()}
                className="btn-graphite h-12 w-full shrink-0 rounded-full px-7 text-[15px] font-medium disabled:opacity-60 sm:w-auto"
              >
                {checking ? "识别中…" : "识别卡密"}
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-5 rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          {checkEnv && isReady(checkEnv) && (
            <div className="mt-5 rounded-2xl bg-ok-fill px-4 py-4 sm:px-5">
              <p className="text-[15px] font-semibold text-ok">
                已识别：{checkEnv.data?.plan || "可提交套餐"}
              </p>
              <p className="mt-1 text-sm text-subtle">
                查询状态：{statusLabel(checkEnv)}
                {checkEnv.data?.plan ? ` · ${checkEnv.data.plan}` : ""}
              </p>
              <button
                type="button"
                onClick={enterSubmit}
                className="mt-3 text-sm font-semibold text-accent hover:underline"
              >
                立即进入
              </button>
            </div>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {[
              { icon: Zap, label: "极速处理" },
              { icon: Shield, label: "安全提交" },
              { icon: Clock, label: "7x24 服务" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-2xl border border-hairline-soft px-4 py-3 text-sm text-subtle"
              >
                <item.icon className="h-4 w-4 text-accent" />
                {item.label}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <SubmitPanel
          code={code}
          checkEnv={checkEnv}
          job={job}
          values={values}
          setValues={setValues}
          option={option}
          needsChatGptSession={needsChatGptSession}
          error={error}
          busy={busy}
          submitting={submitting}
          onSubmit={onSubmit}
          onRefresh={refreshStatus}
          nextPollAt={nextPollAt}
          startedAt={startedAt}
          accountHint={accountHintRef.current}
          onBack={() => {
            stopPoll();
            setPhase("check");
            updateJob(null);
            setStartedAt(null);
            setError("");
          }}
        />
      )}

      <BatchQuery />
    </main>
  );
}

function SubmitPanel({
  code,
  checkEnv,
  job,
  values,
  setValues,
  option,
  needsChatGptSession,
  error,
  busy,
  submitting,
  onSubmit,
  onRefresh,
  onBack,
  nextPollAt,
  startedAt,
  accountHint,
}: {
  code: string;
  checkEnv: BeibeiEnvelope | null;
  job: BeibeiEnvelope | null;
  values: Record<string, string>;
  setValues: (next: Record<string, string>) => void;
  option: BeibeiCredentialOption | undefined;
  needsChatGptSession: boolean;
  error: string;
  busy: boolean;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onRefresh: () => void;
  onBack: () => void;
  nextPollAt: number | null;
  startedAt: number | null;
  accountHint: string;
}) {
  const plan = job?.data?.plan || checkEnv?.data?.plan || "会员充值";
  const processing = isProcessing(job) || isTransient(job);
  const completed = Boolean(!processing && isCompleted(job));
  const failed = isFailed(job);
  const showFields = !completed && !processing && !failed;
  const sessionPreview = parseChatGptSession(values.session_json ?? "");
  const sessionBlocksSubmit =
    Boolean((option?.fields ?? []).some((f) => f.key === "session_json")) &&
    sessionPreview?.ok !== true;

  return (
    <section className="mt-8 space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-3xl bg-surface px-5 py-4 sm:px-8">
        <div>
          <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.22em] text-faint">
            Automated recharge
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            {plan}
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            completed
              ? "bg-ok-fill text-ok"
              : failed
                ? "bg-danger-fill text-danger"
                : processing
                  ? "bg-accent-fill text-accent"
                  : "bg-ok-fill text-ok"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              completed ? "bg-ok" : failed ? "bg-danger" : processing ? "bg-accent" : "bg-ok"
            )}
          />
          {completed ? "充值成功" : failed ? "充值失败" : processing ? "处理中" : "服务正常"}
        </span>
      </div>

      {needsChatGptSession && showFields && (
        <div className="rounded-3xl bg-surface p-5 sm:p-8">
          <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.22em] text-faint">
            Tutorial
          </p>
          <h3 className="mt-1 text-lg font-semibold">3 步完成充值</h3>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <StepCard
              n="1"
              title="登录 ChatGPT"
              desc="登录需要充值的账号"
              href="https://chatgpt.com/"
              action="打开登录页"
            />
            <StepCard
              n="2"
              title="复制 Session JSON"
              desc="打开后复制全部 JSON"
              href="https://chatgpt.com/api/auth/session"
              action="打开 Session"
            />
            <StepCard n="3" title="粘贴并核对" desc="填写卡密与 Session，核对账号后提交" done />
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="rounded-3xl bg-surface p-5 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-on-ink">
            1
          </span>
          <h3 className="text-[15px] font-semibold">CDK 卡密</h3>
        </div>
        <div className="mt-3 rounded-2xl bg-page px-4 py-3 font-mono text-[13px] break-all text-ink">
          {code}
        </div>
        <p className="mt-2 text-xs text-muted">
          当前套餐依据卡密识别，提交时会继续核验卡密与套餐。
        </p>

        {showFields &&
          (option?.fields ?? []).map((field, i) => {
          const large =
            field.key.includes("json") ||
            field.label.toLowerCase().includes("json") ||
            field.key.includes("session");
          return (
            <div key={field.key} className="mt-6">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-on-ink">
                  {i + 2}
                </span>
                <h3 className="text-[15px] font-semibold">
                  {field.label}
                  {field.required ? "" : "（选填）"}
                </h3>
              </div>
              {large ? (
                <>
                  <textarea
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [field.key]: e.target.value })
                    }
                    placeholder={`将 ${field.label} 粘贴到这里`}
                    spellCheck={false}
                    rows={8}
                    className={cn(fieldCls, "mt-3 resize-y font-mono text-[13px]")}
                  />
                  {field.key === "session_json" && sessionPreview && (
                    <SessionAccountCard preview={sessionPreview} />
                  )}
                </>
              ) : (
                <input
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [field.key]: e.target.value })
                  }
                  placeholder={`请输入${field.label}`}
                  className={cn(fieldCls, "mt-3 h-12")}
                />
              )}
            </div>
          );
        })}

        {job && (
          <JobStatus
            env={job}
            code={code}
            nextPollAt={nextPollAt}
            startedAt={startedAt}
            accountHint={accountHint}
          />
        )}

        {error && (
          <p className="mt-4 rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          {showFields && (
            <button
              type="submit"
              disabled={busy || completed || sessionBlocksSubmit}
              className="btn-graphite h-12 flex-1 rounded-full px-7 text-[15px] font-medium disabled:opacity-60"
            >
              {submitting ? "提交中…" : "提交并充值"}
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            className="h-12 flex-1 rounded-full border border-hairline px-7 text-[15px] font-medium text-ink transition-colors hover:bg-fill"
          >
            {processing ? "立即刷新状态" : completed ? "立即刷新状态" : "查询卡密状态"}
          </button>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-sm text-muted hover:text-ink"
        >
          返回识别
        </button>
      </form>
    </section>
  );
}

function SessionAccountCard({
  preview,
}: {
  preview: NonNullable<ReturnType<typeof parseChatGptSession>>;
}) {
  if (!preview.ok) {
    return (
      <div className="mt-3 rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">
        {preview.error}
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-2xl bg-ok-fill px-4 py-4">
      <p className="flex items-center gap-2 text-[15px] font-semibold text-ok">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ok text-white">
          <Check className="h-3 w-3" />
        </span>
        已识别充值账号
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            邮箱
          </p>
          <p className="mt-1 break-all text-sm font-medium text-ink">{preview.email}</p>
        </div>
        <div className="rounded-xl bg-surface px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Account ID
          </p>
          <p className="mt-1 break-all font-mono text-[13px] text-ink">
            {preview.accountId}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  n,
  title,
  desc,
  href,
  action,
  done,
}: {
  n: string;
  title: string;
  desc: string;
  href?: string;
  action?: string;
  done?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-hairline-soft p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fill text-[11px] font-semibold">
          {n}
        </span>
        <p className="text-[15px] font-semibold">{title}</p>
      </div>
      <p className="mt-1 text-xs text-muted">{desc}</p>
      {done ? (
        <div className="mt-4 flex h-10 items-center justify-center rounded-full bg-ok-fill text-ok">
          <Check className="h-4 w-4" />
        </div>
      ) : href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="btn-graphite mt-4 flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {action}
        </a>
      ) : null}
    </div>
  );
}

function JobStatus({
  env,
  code,
  nextPollAt,
  startedAt,
  accountHint,
}: {
  env: BeibeiEnvelope;
  code: string;
  nextPollAt: number | null;
  startedAt: number | null;
  accountHint: string;
}) {
  const processing = isProcessing(env) || isTransient(env);
  const completed = !processing && isCompleted(env);
  const failed = isFailed(env);

  if (completed) {
    return (
      <ReceiptCard
        env={env}
        code={code}
        accountHint={accountHint}
        submittedHint={startedAt}
      />
    );
  }
  if (processing) {
    return (
      <ProgressCard
        env={env}
        nextPollAt={nextPollAt}
        startedAt={startedAt}
      />
    );
  }
  if (failed) {
    return (
      <div className="mt-6 rounded-2xl bg-danger-fill px-4 py-4">
        <p className="text-[15px] font-semibold text-danger">充值失败</p>
        <p className="mt-1 text-sm text-danger">{env.message}</p>
      </div>
    );
  }
  return null;
}

function ProgressCard({
  env,
  nextPollAt,
  startedAt,
}: {
  env: BeibeiEnvelope;
  nextPollAt: number | null;
  startedAt: number | null;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);
  const current = progressStepIndex(env);
  const remain = nextPollAt ? Math.max(0, Math.ceil((nextPollAt - now) / 1000)) : 0;
  const elapsed = startedAt ? formatElapsed(now - startedAt) : "";

  return (
    <div className="mt-6 rounded-2xl bg-accent-fill px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <p className="text-[15px] font-semibold text-accent">{statusTitle(env)}</p>
      </div>
      <p className="mt-1 text-sm text-subtle">{statusDetail(env)}</p>

      <ol className="mt-4 grid grid-cols-4 gap-2">
        {PROGRESS_STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="min-w-0 text-center">
              <span
                className={cn(
                  "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold",
                  done
                    ? "bg-ok text-white"
                    : active
                      ? "bg-accent text-white"
                      : "bg-surface text-muted"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <p
                className={cn(
                  "mt-1.5 truncate text-[11px]",
                  done ? "text-ok" : active ? "font-medium text-accent" : "text-muted"
                )}
              >
                {label}
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-xs text-muted">
        {elapsed ? `已等待 ${elapsed}` : "正在查询进度"}
        {remain > 0 ? ` · ${remain} 秒后自动刷新` : " · 正在刷新"}
      </p>
    </div>
  );
}

function ReceiptCard({
  env,
  code,
  accountHint,
  submittedHint,
}: {
  env: BeibeiEnvelope;
  code: string;
  accountHint: string;
  submittedHint: number | null;
}) {
  const [copied, setCopied] = useState(false);
  const view = receiptView(env, code, {
    account: accountHint,
    submittedAt: submittedHint,
  });
  const rows = [
    { label: "卡密", value: view.code },
    { label: "充值账号", value: view.account },
    { label: "充值套餐", value: view.plan },
    { label: "金额", value: view.amount },
    { label: "充值时间", value: view.submittedAt },
    { label: "完成时间", value: view.completedAt },
  ];

  async function copyCode() {
    const text = view.code !== "-" ? view.code : code;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl bg-ok-fill px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-ok" />
        <p className="text-[15px] font-semibold text-ok">充值成功</p>
      </div>
      <p className="mt-1 text-sm text-subtle">{statusDetail(env)}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl bg-surface px-4 py-3">
            <p className="text-[11px] font-medium text-muted">{row.label}</p>
            <p className="mt-1 break-all text-sm font-medium text-ink">{row.value}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void copyCode()}
        className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-hairline bg-surface text-sm font-medium text-ink transition-colors hover:bg-fill"
      >
        {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
        {copied ? "已复制" : "复制卡密"}
      </button>
      <p className="mt-3 text-xs text-muted">
        请退出 ChatGPT 后重新登录核对。网页版看不到对应模型时，用无痕窗口再登一次。
      </p>
    </div>
  );
}

function BatchQuery() {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<{ code: string; text: string; ok: boolean }[]>([]);

  async function run() {
    const list = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (!list.length) return;
    setRunning(true);
    const next: { code: string; text: string; ok: boolean }[] = [];
    for (const item of list) {
      try {
        const env = await followExisting(await checkCode(item));
        next.push({
          code: item,
          ok: isReady(env) || isCompleted(env) || isProcessing(env),
          text: `${statusLabel(env)}${env.data?.plan || env.data?.receipt?.plan ? ` · ${env.data?.plan || env.data?.receipt?.plan}` : ""}`,
        });
      } catch {
        next.push({ code: item, ok: false, text: "查询失败" });
      }
      setRows([...next]);
      await sleep(250);
    }
    setRunning(false);
  }

  return (
    <section className="mt-4 rounded-3xl bg-surface p-5 sm:p-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.22em] text-faint">
            Batch status query
          </p>
          <h3 className="mt-1 text-lg font-semibold">批量查询卡密</h3>
          <p className="mt-1 text-sm text-muted">
            每行一张卡密，单次最多 50 张。
          </p>
        </div>
        <span className="rounded-full border border-hairline px-2.5 py-1 text-xs text-muted">
          {raw.split(/\r?\n/).filter((s) => s.trim()).length}/50
        </span>
      </button>
      {open && (
        <div className="mt-4">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={5}
            placeholder="每行一张卡密"
            spellCheck={false}
            className={cn(fieldCls, "resize-y font-mono text-[13px]")}
          />
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="btn-graphite mt-3 h-11 rounded-full px-6 text-sm font-medium disabled:opacity-60"
          >
            {running ? "查询中…" : "开始查询"}
          </button>
          {rows.length > 0 && (
            <ul className="mt-4 space-y-2">
              {rows.map((row) => (
                <li
                  key={row.code}
                  className="rounded-2xl bg-page px-4 py-3 text-sm"
                >
                  <p className="font-mono text-[12px] break-all text-subtle">
                    {row.code}
                  </p>
                  <p className={row.ok ? "mt-1 text-ok" : "mt-1 text-danger"}>
                    {row.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
