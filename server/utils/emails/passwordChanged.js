// "Your admin password was changed" alert, in the site's maroon & gold

const escape = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Rough "Chrome on Windows" from the user agent; good enough for a "was this you?" check
function describeDevice(ua = "") {
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "a browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "an unknown device";
  return `${browser} on ${os}`;
}

export default function passwordChangedEmail({ adminName, username, when, ip, userAgent, adminUrl }) {
  const time = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(when);
  const device = describeDevice(userAgent);
  const subject = "Your Iron Me Ka admin password was changed";

  const rows = [
    ["Account", username],
    ["When", `${time} (IST)`],
    ["Device", device],
    ["IP address", ip || "Unknown"],
  ];

  const text = [
    `Hello ${adminName},`,
    "",
    "The password for your Iron Me Ka admin panel was just changed.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "If this was you, no action is needed.",
    "If this wasn't you, someone may have access to your admin panel: sign in and change the password right away,",
    `and change JWT_SECRET on Render to sign everyone out. ${adminUrl || ""}`,
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;background:#f9f3e9;font-family:Arial,Helvetica,sans-serif;color:#262221">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7ddcc">
        <tr><td style="background:#741f3f;padding:26px 30px">
          <div style="font-family:Georgia,serif;font-size:24px;color:#ffffff">Iron Me Ka</div>
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#caa55e;margin-top:4px">Studio Admin · Security alert</div>
        </td></tr>
        <tr><td style="padding:30px">
          <p style="margin:0 0 14px;font-size:16px">Hello ${escape(adminName)},</p>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.6">The password for your <strong>Iron Me Ka admin panel</strong> was just changed.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f3e9;border-radius:12px;padding:6px 18px">
            ${rows
              .map(
                ([k, v]) => `<tr>
              <td style="padding:10px 0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#7a6f6b;width:110px">${escape(k)}</td>
              <td style="padding:10px 0;font-size:14px;font-weight:bold">${escape(v)}</td>
            </tr>`,
              )
              .join("")}
          </table>
          <p style="margin:22px 0 0;font-size:14px;line-height:1.6">If this was you, no action is needed.</p>
          <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#b42318"><strong>If this wasn't you</strong>, sign in and change the password right away, and change <code>JWT_SECRET</code> on Render to sign everyone out.</p>
          ${
            adminUrl
              ? `<p style="margin:26px 0 0"><a href="${escape(adminUrl)}" style="display:inline-block;background:#741f3f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:bold">Open admin panel</a></p>`
              : ""
          }
        </td></tr>
      </table>
      <p style="font-size:12px;color:#7a6f6b;margin-top:16px">This is an automatic security message from your website.</p>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html, text };
}
