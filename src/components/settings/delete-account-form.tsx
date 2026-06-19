"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { deleteAccount } from "@/app/settings/actions";
import { cn } from "@/lib/utils";

const FADE_MS = 300;

export function DeleteAccountForm() {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const canDelete = confirm === "DELETE";

  const openModal = () => {
    setShow(true);
    requestAnimationFrame(() => setActive(true));
  };

  const closeModal = () => {
    if (pending) return;
    setActive(false);
  };

  useEffect(() => {
    if (!active && show) {
      const id = setTimeout(() => {
        setShow(false);
        setConfirm("");
      }, FADE_MS);
      return () => clearTimeout(id);
    }
  }, [active, show]);

  useEffect(() => {
    if (!show) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setActive(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [show, pending]);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  return (
    <>
      <p className="text-sm leading-relaxed text-text-muted">
        Permanently delete your account and all bookmarks. This cannot be undone.
      </p>
      <button
        type="button"
        onClick={openModal}
        className="rounded-md border border-brand/50 bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20"
      >
        Delete account
      </button>

      {show &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <button
              type="button"
              className={cn(
                "absolute inset-0 bg-black/70 transition-opacity duration-300 ease-out motion-reduce:transition-none",
                active ? "opacity-100" : "opacity-0",
              )}
              aria-label="Close dialog"
              onClick={closeModal}
              disabled={pending}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              className={cn(
                "relative z-10 w-full max-w-sm rounded-md border border-brand/30 bg-surface p-6 shadow-2xl",
                "transition-all duration-300 ease-out motion-reduce:transition-none",
                active
                  ? "scale-100 opacity-100"
                  : "scale-[0.98] opacity-0",
              )}
            >
              <button
                type="button"
                onClick={closeModal}
                disabled={pending}
                className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden />
              </button>

              <form
                action={(formData) => {
                  startTransition(() => deleteAccount(formData));
                }}
                className="space-y-4"
              >
                <div className="space-y-2 pr-6">
                  <h2
                    id="delete-account-title"
                    className="font-serif text-xl text-text"
                  >
                    Delete account
                  </h2>
                  <p className="text-sm leading-relaxed text-text-muted">
                    This permanently removes your account and all bookmarks. This
                    action cannot be undone.
                  </p>
                </div>

                <label className="block space-y-2.5">
                  <span className="block text-sm text-text-muted">
                    Type{" "}
                    <span className="font-mono text-text">DELETE</span> to confirm
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    name="confirm"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="DELETE"
                    disabled={pending}
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text outline-none ring-brand focus:ring-1 disabled:opacity-50"
                  />
                </label>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={pending}
                    className="flex-1 rounded-md border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canDelete || pending}
                    className="flex-1 rounded-md border border-brand/50 bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending ? "Deleting…" : "Delete account"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
