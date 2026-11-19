import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { Alert, CircularProgress, Dialog, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format, formatDistanceToNow, isBefore, startOfDay } from "date-fns";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { errorMessage } from "../../lib/api";
import type { PortalField, PublicPortal, PublicPortalCard } from "../../types";
import { FileGrid } from "../cards/CardFiles";
import { DEMO_TOKEN, demoPortal, demoRequest, demoRespond } from "./demoPortal";
import "./portal.css";

// The portal is the agency's page, not Danto's: its own typeface, loaded only
// when a client opens a portal.
if (
  typeof document !== "undefined" &&
  !document.getElementById("portal-font")
) {
  const link = document.createElement("link");
  link.id = "portal-font";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(link);
}

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

const NAME_KEY = "danto-portal-name";
function storedName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}
function rememberName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* private mode: name just won't be remembered */
  }
}

/**
 * Who is answering. Pre-filled (from this browser, or the client name set on
 * the board) and shown as a line; the field only opens to change it.
 */
function NameField({
  name,
  onChange,
}: {
  name: string;
  onChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(!name.trim());
  if (!editing && name.trim())
    return (
      <p className="pp-as">
        Answering as <strong>{name}</strong>
        <button
          type="button"
          className="pp-link"
          onClick={() => {
            onChange("");
            setEditing(true);
          }}
        >
          Not you?
        </button>
      </p>
    );
  return (
    <TextField
      label="Your name"
      size="small"
      value={name}
      autoFocus={editing}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ htmlInput: { maxLength: 80 } }}
    />
  );
}

/** Dark or light text, whichever reads better on the brand colour. */
function textOn(hex: string) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return "#fff";
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#16181d" : "#fff";
}

const statusText = {
  pending: "Needs your OK",
  approved: "Approved",
  changes_requested: "Changes requested",
  none: null,
} as const;

export function PortalPage({ demo = false }: { demo?: boolean }) {
  const params = useParams();
  const token = demo ? DEMO_TOKEN : params.token || "";
  const [searchParams] = useSearchParams();
  const [openCardId, setOpenCardId] = useState<string | null>(
    searchParams.get("card"),
  );
  const [requestOpen, setRequestOpen] = useState(false);
  const portal = useQuery({
    queryKey: ["portal", token],
    queryFn: async () =>
      demo
        ? demoPortal()
        : (await publicApi.get<PublicPortal>(`/portal/${token}`)).data,
    refetchInterval: demo ? false : 60_000,
    staleTime: demo ? Infinity : 0,
    retry: false,
  });

  const data = portal.data;
  const accent = data?.brand.color || "#1d1f24";
  const allCards = useMemo(
    () => data?.lists.flatMap((list) => list.cards) || [],
    [data],
  );
  const stageOf = useMemo(() => {
    const map = new Map<string, string>();
    data?.lists.forEach((list) =>
      list.cards.forEach((card) => map.set(card.id, list.name)),
    );
    return map;
  }, [data]);
  const stages = useMemo(() => {
    const rows = (data?.lists || []).map((list) => ({
      id: list.id,
      name: list.name,
      total: list.cards.length,
      done: list.cards.filter((card) => card.isCompleted).length,
    }));
    const current = rows.findIndex(
      (row) => row.total > 0 && row.done < row.total,
    );
    return { rows, current };
  }, [data]);
  const openCard = allCards.find((card) => card.id === openCardId) || null;
  const pending = allCards.filter((card) => card.approvalStatus === "pending");
  const needed = allCards.filter(
    (card) => card.waitingOnClient && card.approvalStatus !== "pending",
  );
  const forYou = pending.length + needed.length;

  useEffect(() => {
    if (data)
      document.title = demo
        ? "Client portal demo · Danto"
        : `${data.board.name} · ${data.brand.name}`;
  }, [data, demo]);

  if (portal.isLoading)
    return (
      <div className="pp pp-center">
        <CircularProgress size={28} sx={{ color: "#6b6f78" }} />
      </div>
    );
  if (portal.isError || !data)
    return (
      <div className="pp pp-center">
        <div className="pp-empty">
          <h1>This portal isn’t available</h1>
          <p>
            The link may have been turned off or replaced. Ask your project
            contact for a new link.
          </p>
        </div>
      </div>
    );

  const style = {
    "--accent": accent,
    "--on-accent": textOn(accent),
  } as CSSProperties;
  const { rows, current } = stages;
  const allDone =
    data.stats.total > 0 && data.stats.completed === data.stats.total;

  return (
    <div className="pp" style={style}>
      {demo && (
        <div className="pp-demo" role="note">
          <span>
            <strong>Demo:</strong> this is what your client sees. Try
            approving something. Nothing is saved.
          </span>
          <Link to="/login?mode=register&ref=demo" className="pp-demo-cta">
            Make one for your client, free
          </Link>
        </div>
      )}
      <header className="pp-header">
        <div className="pp-wrap pp-header-row">
          <div className="pp-brand">
            {data.brand.logoUrl ? (
              <img src={data.brand.logoUrl} alt="" className="pp-logo" />
            ) : (
              <span className="pp-mark" aria-hidden>
                {data.brand.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="pp-brand-name">{data.brand.name}</span>
          </div>
          <span className="pp-updated">
            <span className="pp-live" aria-hidden />
            Updated {formatDistanceToNow(new Date(data.board.updatedAt))} ago
          </span>
        </div>
      </header>

      <main className="pp-wrap">
        <section className="pp-intro">
          {data.board.clientName && (
            <p className="pp-for">For {data.board.clientName}</p>
          )}
          <h1 className="pp-title">{data.board.name}</h1>
          {data.board.welcome && (
            <p className="pp-welcome">{data.board.welcome}</p>
          )}
        </section>

        {rows.length > 0 && (
          <section className="pp-track" aria-label="Project progress">
            <ol
              className="pp-stages"
              style={{ "--stages": rows.length } as CSSProperties}
            >
              {rows.map((row, index) => {
                const state =
                  row.total === 0
                    ? "empty"
                    : row.done === row.total
                      ? "done"
                      : index === current
                        ? "current"
                        : "next";
                return (
                  <li key={row.id} className={`pp-stage is-${state}`}>
                    <span className="pp-stage-name">{row.name}</span>
                    <span className="pp-bar" aria-hidden>
                      <span
                        className="pp-bar-fill"
                        style={{
                          width: `${row.total ? (row.done / row.total) * 100 : 0}%`,
                        }}
                      />
                    </span>
                    <span className="pp-stage-note">
                      {state === "empty"
                        ? "Nothing here yet"
                        : state === "done"
                          ? "Done"
                          : state === "current"
                            ? `In progress, ${row.done} of ${row.total}`
                            : `${row.done} of ${row.total} done`}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="pp-summary">
              {allDone ? (
                <strong>Everything is done.</strong>
              ) : (
                <span>
                  <strong>
                    {data.stats.completed} of {data.stats.total}
                  </strong>{" "}
                  {data.stats.total === 1 ? "item" : "items"} done
                </span>
              )}
              {forYou > 0 && (
                <a href="#review" className="pp-summary-alert">
                  {forYou === 1
                    ? "1 item is waiting for you"
                    : `${forYou} items are waiting for you`}
                </a>
              )}
              <span className="pp-summary-updated">
                Updated {formatDistanceToNow(new Date(data.board.updatedAt))}{" "}
                ago
              </span>
            </p>
          </section>
        )}

        {forYou > 0 && (
          <section id="review" className="pp-review">
            <div className="pp-review-head">
              <h2>Waiting for you</h2>
              <p>
                {needed.length && pending.length
                  ? "Approve finished work, and send what the team needs to keep going."
                  : needed.length
                    ? `${data.brand.name} needs something from you to keep going.`
                    : "Open an item to approve it or ask for changes."}
              </p>
            </div>
            <ul className="pp-review-list">
              {needed.map((card) => (
                <li key={card.id} className="pp-review-item">
                  <div className="pp-review-text">
                    <h3>{card.title}</h3>
                    <p className="pp-meta">
                      <span>{stageOf.get(card.id)}</span>
                    </p>
                    <p className="pp-need">
                      <strong>We need:</strong> {card.waitingOnClient}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="pp-btn pp-btn-primary"
                    onClick={() => setOpenCardId(card.id)}
                  >
                    Reply
                  </button>
                </li>
              ))}
              {pending.map((card) => (
                <li key={card.id} className="pp-review-item">
                  <div className="pp-review-text">
                    <h3>{card.title}</h3>
                    <p className="pp-meta">
                      <span>{stageOf.get(card.id)}</span>
                      {card.dueDate && (
                        <span>
                          Due {format(new Date(card.dueDate), "MMM d")}
                        </span>
                      )}
                      {!!card.files?.length && (
                        <span>
                          {card.files.length}{" "}
                          {card.files.length === 1 ? "file" : "files"}
                        </span>
                      )}
                    </p>
                    {card.description && (
                      <p className="pp-review-desc">{card.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="pp-btn pp-btn-primary"
                    onClick={() => setOpenCardId(card.id)}
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="pp-work">
          <div className="pp-work-head">
            <h2>All work</h2>
            {data.board.allowRequests && (
              <button
                type="button"
                className="pp-btn pp-btn-quiet"
                onClick={() => setRequestOpen(true)}
              >
                Send a request
              </button>
            )}
          </div>
          <div className="pp-columns">
            {data.lists.map((list) => (
              <div key={list.id} className="pp-column">
                <h3 className="pp-column-name">
                  {list.name}
                  <span>{list.cards.length}</span>
                </h3>
                {list.cards.length ? (
                  <ul className="pp-items">
                    {list.cards.map((card) => (
                      <li key={card.id}>
                        <ItemRow
                          card={card}
                          onOpen={() => setOpenCardId(card.id)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pp-none">Nothing here right now.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {data.brand.showBadge && (
        <footer className="pp-footer">
          <Link to={demo ? "/login?mode=register&ref=demo" : "/?ref=portal"}>
            Client portal by <strong>danto</strong>. Make one for your clients,
            free.
          </Link>
        </footer>
      )}

      {openCard && (
        <CardDialog
          token={token}
          card={openCard}
          stage={stageOf.get(openCard.id) || ""}
          brand={data.brand.name}
          style={style}
          approveLabel={data.board.workflow?.approve || "Approve"}
          defaultName={data.board.clientName || ""}
          onClose={() => setOpenCardId(null)}
        />
      )}
      <RequestDialog
        token={token}
        open={requestOpen}
        brand={data.brand.name}
        style={style}
        defaultName={data.board.clientName || ""}
        onClose={() => setRequestOpen(false)}
      />
    </div>
  );
}

function StatusIcon({ card }: { card: PublicPortalCard }) {
  if (card.isCompleted)
    return (
      <svg className="pp-icon is-done" viewBox="0 0 20 20" aria-label="Done">
        <circle cx="10" cy="10" r="9" />
        <path d="M6 10.4l2.6 2.6L14 7.6" />
      </svg>
    );
  return (
    <svg
      className={`pp-icon ${card.approvalStatus === "pending" ? "is-waiting" : ""}`}
      viewBox="0 0 20 20"
      aria-label="Not done yet"
    >
      <circle cx="10" cy="10" r="8.25" />
    </svg>
  );
}

function ItemRow({
  card,
  onOpen,
}: {
  card: PublicPortalCard;
  onOpen: () => void;
}) {
  const status = statusText[card.approvalStatus];
  const overdue =
    !!card.dueDate &&
    !card.isCompleted &&
    isBefore(new Date(card.dueDate), startOfDay(new Date()));
  const selects = card.fields?.filter(
    (field) => field.type === "select" || field.type === "multiselect",
  );
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`pp-item ${card.isCompleted ? "is-done" : ""}`}
    >
      <StatusIcon card={card} />
      <span className="pp-item-body">
        <span className="pp-item-title">{card.title}</span>
        <span className="pp-meta">
          {status && (
            <span className={`pp-status is-${card.approvalStatus}`}>
              {status}
            </span>
          )}
          {card.waitingOnClient && (
            <span className="pp-status is-pending">Needs you</span>
          )}
          {card.dueDate && !card.isCompleted && (
            <span className={overdue ? "is-late" : undefined}>
              {overdue ? "Delayed, was due " : "Due "}
              {format(new Date(card.dueDate), "MMM d")}
            </span>
          )}
          {selects?.map((field) => (
            <span key={field.key} title={field.label}>
              {fieldText(field)}
            </span>
          ))}
          {card.checklist.total > 0 && (
            <span>
              {card.checklist.done}/{card.checklist.total} steps
            </span>
          )}
          {!!card.files?.length && (
            <span className="pp-with-icon">
              <AttachFileRounded />
              {card.files.length}
            </span>
          )}
          {card.feedback.length > 0 && (
            <span className="pp-with-icon">
              <ChatBubbleOutlineRounded />
              {card.feedback.length}
            </span>
          )}
        </span>
        {overdue && card.delayReason && (
          <span className="pp-item-note">Why: {card.delayReason}</span>
        )}
      </span>
    </button>
  );
}

function fieldText(field: PortalField) {
  if (Array.isArray(field.value)) return field.value.join(", ");
  if (field.type === "date" && typeof field.value === "string")
    return format(new Date(`${field.value}T00:00:00`), "MMM d, yyyy");
  return String(field.value);
}

/** The details the client needs to judge this item: caption, links, sizes. */
function PortalFields({ fields }: { fields: PortalField[] }) {
  return (
    <dl className="pp-fields">
      {fields.map((field) => (
        <div key={field.key}>
          <dt>{field.label}</dt>
          <dd
            style={{
              whiteSpace: field.type === "longtext" ? "pre-line" : "normal",
            }}
          >
            {field.type === "url" && typeof field.value === "string" ? (
              <a href={field.value} target="_blank" rel="noopener noreferrer">
                {field.value.replace(/^https?:\/\//, "").slice(0, 60)}
              </a>
            ) : (
              fieldText(field)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const feedbackVerb = {
  approved: "approved this",
  changes_requested: "asked for changes",
  request: "requested this",
  comment: "commented",
} as const;

function CardDialog({
  token,
  card,
  stage,
  brand,
  style,
  approveLabel,
  defaultName,
  onClose,
}: {
  token: string;
  card: PublicPortalCard;
  stage: string;
  brand: string;
  style: CSSProperties;
  approveLabel: string;
  defaultName: string;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [name, setName] = useState(() => storedName() || defaultName);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"comment" | "changes_requested">("comment");
  // Hide Approve / Request changes as soon as the client has answered, even
  // before the refreshed portal data arrives, so nobody answers twice.
  const [answered, setAnswered] = useState<
    null | "approved" | "changes_requested"
  >(null);
  const [commented, setCommented] = useState(false);
  const respond = useMutation({
    mutationFn: async (kind: "approved" | "changes_requested" | "comment") => {
      if (token === DEMO_TOKEN) {
        client.setQueryData<PublicPortal>(["portal", token], (data) =>
          data && demoRespond(data, card.id, kind, name.trim(), message.trim()),
        );
        return;
      }
      await publicApi.post(`/portal/${token}/cards/${card.id}/respond`, {
        kind,
        authorName: name.trim(),
        message: message.trim(),
      });
    },
    onSuccess: (_, kind) => {
      if (token !== DEMO_TOKEN) rememberName(name.trim());
      setMessage("");
      if (kind === "comment") setCommented(true);
      else setAnswered(kind);
      if (token !== DEMO_TOKEN)
        client.invalidateQueries({ queryKey: ["portal", token] });
    },
    // E.g. already answered in another tab: show the current status.
    onError: () => client.invalidateQueries({ queryKey: ["portal", token] }),
  });
  const canAct = card.approvalStatus === "pending" && !answered;
  const status = statusText[card.approvalStatus];
  const busy = respond.isPending;
  const askingChanges = canAct && mode === "changes_requested";

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="body"
      slotProps={{ paper: { className: "pp-dialog", style } }}
    >
      <div className="pp-dialog-top">
        <p className="pp-meta">
          {stage && <span>{stage}</span>}
          {status && !answered && (
            <span className={`pp-status is-${card.approvalStatus}`}>
              {status}
            </span>
          )}
        </p>
        <button
          type="button"
          className="pp-close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseRounded />
        </button>
      </div>
      <h2 className="pp-dialog-title">{card.title}</h2>

      <div className="pp-dialog-body">
        {card.waitingOnClient && (
          <p className="pp-callout is-need">
            <strong>{brand} needs from you:</strong> {card.waitingOnClient}
            <br />
            Reply with a comment below, or send it the way you usually do.
          </p>
        )}
        {card.delayReason && (
          <p className="pp-callout is-late">
            <strong>Running late:</strong> {card.delayReason}
          </p>
        )}
        {!!card.fields?.length && <PortalFields fields={card.fields} />}
        {card.description && <p className="pp-desc">{card.description}</p>}
        {!!card.files?.length && (
          <div>
            <h3 className="pp-sub">Files to review</h3>
            <FileGrid files={card.files} />
          </div>
        )}
        {card.checklist.total > 0 && (
          <div>
            <h3 className="pp-sub">
              {card.checklist.done} of {card.checklist.total} steps done
            </h3>
            <span className="pp-bar" aria-hidden>
              <span
                className="pp-bar-fill"
                style={{
                  width: `${(card.checklist.done / card.checklist.total) * 100}%`,
                }}
              />
            </span>
          </div>
        )}
        {card.feedback.length > 0 && (
          <div>
            <h3 className="pp-sub">Conversation</h3>
            <ol className="pp-thread">
              {card.feedback.map((entry) => (
                <li key={entry.id} className={`is-${entry.kind}`}>
                  <p className="pp-thread-who">
                    <strong>{entry.authorName}</strong>{" "}
                    {feedbackVerb[entry.kind]}
                    <time>
                      {formatDistanceToNow(new Date(entry.createdAt))} ago
                    </time>
                  </p>
                  {entry.kind !== "approved" &&
                    entry.kind !== "request" &&
                    entry.message && <p>{entry.message}</p>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="pp-respond">
        {answered ? (
          <div className="pp-done" role="status">
            <strong>
              {answered === "approved"
                ? "Approved. Thank you!"
                : "Change request sent."}
            </strong>
            <span>{brand} has been notified.</span>
          </div>
        ) : (
          <>
            <h3 className="pp-sub">
              {canAct ? "Your response" : "Leave a comment"}
            </h3>
            {commented && !respond.isError && (
              <Alert severity="success" sx={{ mb: 1.5 }}>
                Comment sent. {brand} has been notified.
              </Alert>
            )}
            {respond.isError && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {errorMessage(respond.error)}
              </Alert>
            )}
            <div className="pp-form">
              <NameField name={name} onChange={setName} />
              <TextField
                label={
                  askingChanges
                    ? "What should change?"
                    : canAct
                      ? "Comment (optional)"
                      : "Comment"
                }
                multiline
                minRows={askingChanges ? 4 : 2}
                value={message}
                autoFocus={askingChanges}
                onChange={(event) => setMessage(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 4000 } }}
              />
            </div>
            <div className="pp-actions">
              {canAct && !askingChanges && (
                <button
                  type="button"
                  className="pp-btn pp-btn-primary"
                  disabled={!name.trim() || busy}
                  onClick={() => respond.mutate("approved")}
                >
                  {approveLabel}
                </button>
              )}
              {canAct && (
                <button
                  type="button"
                  className={`pp-btn ${askingChanges ? "pp-btn-primary" : "pp-btn-quiet"}`}
                  disabled={
                    !name.trim() || busy || (askingChanges && !message.trim())
                  }
                  onClick={() => {
                    if (!askingChanges) setMode("changes_requested");
                    else respond.mutate("changes_requested");
                  }}
                >
                  {askingChanges ? "Send change request" : "Request changes"}
                </button>
              )}
              {askingChanges ? (
                <button
                  type="button"
                  className="pp-btn pp-btn-text"
                  onClick={() => setMode("comment")}
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  className="pp-btn pp-btn-text"
                  disabled={!name.trim() || !message.trim() || busy}
                  onClick={() => respond.mutate("comment")}
                >
                  Send comment
                </button>
              )}
            </div>
            {canAct && !name.trim() && (
              <p className="pp-hint">
                Add your name so the team knows who answered.
              </p>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}

function RequestDialog({
  token,
  open,
  brand,
  style,
  defaultName,
  onClose,
}: {
  token: string;
  open: boolean;
  brand: string;
  style: CSSProperties;
  defaultName: string;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [name, setName] = useState(() => storedName() || defaultName);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  // Pick up a name typed in a review since the page loaded.
  useEffect(() => {
    if (open) setName((current) => storedName() || current || defaultName);
  }, [open, defaultName]);
  const submit = useMutation({
    mutationFn: async () => {
      if (token === DEMO_TOKEN) {
        client.setQueryData<PublicPortal>(["portal", token], (data) =>
          data && demoRequest(data, name.trim(), title.trim(), details.trim()),
        );
        return;
      }
      await publicApi.post(`/portal/${token}/requests`, {
        authorName: name.trim(),
        title: title.trim(),
        details: details.trim(),
      });
    },
    onSuccess: () => {
      if (token !== DEMO_TOKEN) rememberName(name.trim());
      setTitle("");
      setDetails("");
      if (token !== DEMO_TOKEN)
        client.invalidateQueries({ queryKey: ["portal", token] });
    },
  });
  const close = () => {
    submit.reset();
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="sm"
      scroll="body"
      slotProps={{ paper: { className: "pp-dialog", style } }}
    >
      <div className="pp-dialog-top">
        <span />
        <button
          type="button"
          className="pp-close"
          onClick={close}
          aria-label="Close"
        >
          <CloseRounded />
        </button>
      </div>
      <h2 className="pp-dialog-title">Send a request</h2>
      <p className="pp-desc pp-dialog-lead">
        Need something new or changed? It goes straight onto the project and{" "}
        {brand} is notified.
      </p>
      <div className="pp-respond">
        {submit.isSuccess ? (
          <div className="pp-done" role="status">
            <strong>Request sent.</strong>
            <span>It’s on the project now and {brand} has been notified.</span>
            <div className="pp-actions">
              <button
                type="button"
                className="pp-btn pp-btn-quiet"
                onClick={() => submit.reset()}
              >
                Send another
              </button>
              <button
                type="button"
                className="pp-btn pp-btn-text"
                onClick={close}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {submit.isError && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {errorMessage(submit.error)}
              </Alert>
            )}
            <div className="pp-form">
              <NameField name={name} onChange={setName} />
              <TextField
                label="What do you need?"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 180 } }}
              />
              <TextField
                label="Details, links or a deadline"
                multiline
                minRows={4}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 4000 } }}
              />
            </div>
            <div className="pp-actions">
              <button
                type="button"
                className="pp-btn pp-btn-primary"
                disabled={
                  !name.trim() || title.trim().length < 3 || submit.isPending
                }
                onClick={() => submit.mutate()}
              >
                Send request
              </button>
              <button
                type="button"
                className="pp-btn pp-btn-text"
                onClick={close}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}

export default PortalPage;

/** /demo: a sample portal anyone can click through (nothing is saved). */
export function DemoPortalPage() {
  return <PortalPage demo />;
}
