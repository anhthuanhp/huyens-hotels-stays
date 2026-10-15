// Keep public contact links readable without Cloudflare replacing them with /cdn-cgi URLs.
// All interpolated values are escaped before entering HTML.
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]!);
}
export default function EmailLink({ address, className = "", label }: { address: string; className?: string; label?: string }) {
  const email = escapeHtml(address);
  const content = label ? '<span class="block text-sm text-neutral-500">' + escapeHtml(label) + '</span><span class="mt-1 block break-all text-lg font-semibold text-neutral-900">' + email + "</span>" : email;
  const html = '<!--email_off--><a href="mailto:' + email + '" class="' + escapeHtml(className) + '">' + content + "</a><!--/email_off-->";
  return <span className="contents" dangerouslySetInnerHTML={{ __html: html }} />;
}
