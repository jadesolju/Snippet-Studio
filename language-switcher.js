document.addEventListener("DOMContentLoaded", () => {
  const selector = document.querySelector("#language-select");
  if (!selector) return;

  const pathMatch = window.location.pathname.match(/^\/[^/]+/);
  const currentBase = pathMatch?.[0] ?? "/th";
  selector.value = currentBase;

  selector.addEventListener("change", () => {
    const nextBase = selector.value;
    if (!nextBase || nextBase === currentBase) return;

    if (window.snippetStudioHasUnsavedChanges?.()) {
      const message = selector.dataset.confirmSwitch || "Switch language? Unsaved edits may be lost.";
      if (!window.confirm(message)) {
        selector.value = currentBase;
        return;
      }
    }

    const suffix = window.location.pathname.slice(currentBase.length).replace(/\/$/, "");
    const locale = nextBase.slice(1);
    document.cookie = `ss_lang=${encodeURIComponent(locale)}; Max-Age=31536000; Path=/; SameSite=Lax`;
    window.location.assign(`${nextBase}${suffix}${window.location.search}${window.location.hash}`);
  });
});
