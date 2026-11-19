import nodemailer from "nodemailer";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
const isLocalSite = !rawSiteUrl || rawSiteUrl.includes("localhost") || rawSiteUrl.includes("127.0.0.1");
const siteUrl = isLocalSite ? "" : rawSiteUrl;
const adminEmail = process.env.ADMIN_EMAIL || "admin@journal.ac.org";

/**
 * Mailgun REST API Configuration
 * Dynamically resolves configuration from MongoDB JournalSettings or process.env
 */
async function getMailgunConfig(dbSettings?: any) {
  let settings = dbSettings;
  if (!settings) {
    try {
      await connectToDatabase();
      settings = await JournalSettings.findOne().lean();
    } catch (err: any) {
      // Database might be initializing
    }
  }

  const rawApiKey = (settings?.mailgunApiKey || process.env.MAILGUN_API_KEY || "").trim();
  const rawDomain = (settings?.mailgunDomain || process.env.MAILGUN_DOMAIN || "").trim();
  const rawUrl = (
    settings?.mailgunUrl ||
    process.env.MAILGUN_URL ||
    "https://api.mailgun.net"
  ).trim();

  // Clean URL: strip trailing /v3 or slashes
  const cleanUrl = rawUrl.replace(/\/v[1-4]\/?$/, "").replace(/\/+$/, "");

  // If user entered an email address e.g. "noreply@email.inleadsit.com", extract domain
  const hasEmailInDomain = rawDomain.includes("@");
  const cleanDomain = hasEmailInDomain ? rawDomain.split("@")[1] : rawDomain;

  const from =
    settings?.mailgunFrom ||
    process.env.MAILGUN_FROM ||
    process.env.SMTP_FROM ||
    '"IJASR Editorial Office" <editorial@journal.ac.org>';

  // Only initialize REST API client if domain is a pure domain and not an explicit SMTP user
  if (rawApiKey && cleanDomain && !hasEmailInDomain) {
    const mailgun = new Mailgun(FormData);
    const client = mailgun.client({
      username: "api",
      key: rawApiKey,
      url: cleanUrl,
    });
    return { client, cleanDomain, rawDomain, rawApiKey, cleanUrl, from, settings, isSmtpOnly: false };
  }

  return { client: null, cleanDomain, rawDomain, rawApiKey, cleanUrl, from, settings, isSmtpOnly: hasEmailInDomain };
}

/**
 * Creates and returns a Nodemailer transporter if SMTP credentials are configured.
 * 1. Checks explicit SMTP environment variables
 * 2. Checks Mailgun settings in MongoDB (supports Mailgun SMTP credentials)
 */
async function getTransporter(dbSettings?: any) {
  // 1. Explicit SMTP environment variables
  const envHost = process.env.SMTP_HOST;
  const envPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const envUser = process.env.SMTP_USER;
  const envPass = process.env.SMTP_PASS;
  const envSecure = process.env.SMTP_SECURE === "true" || envPort === 465;

  if (envHost && envUser && envPass) {
    return nodemailer.createTransport({
      host: envHost,
      port: envPort,
      secure: envSecure,
      auth: { user: envUser, pass: envPass },
    });
  }

  // 2. Derive from MongoDB Mailgun Settings
  let settings = dbSettings;
  if (!settings) {
    try {
      await connectToDatabase();
      settings = await JournalSettings.findOne().lean();
    } catch {
      // Ignore
    }
  }

  const apiKey = (settings?.mailgunApiKey || process.env.MAILGUN_API_KEY || "").trim();
  const rawDomain = (settings?.mailgunDomain || process.env.MAILGUN_DOMAIN || "").trim();
  const url = (settings?.mailgunUrl || process.env.MAILGUN_URL || "").trim();

  if (apiKey && rawDomain) {
    const isEu = url.toLowerCase().includes("eu");
    const smtpHost = isEu ? "smtp.eu.mailgun.org" : "smtp.mailgun.org";
    
    // User can be rawDomain (e.g. noreply@email.inleadsit.com) or postmaster@domain
    const smtpUser = rawDomain.includes("@") ? rawDomain : `postmaster@${rawDomain}`;

    return nodemailer.createTransport({
      host: smtpHost,
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: apiKey,
      },
    });
  }

  return null;
}

/**
 * Universal safe email sender.
 * 1. Checks Mailgun REST API (configured via /admin/settings or MAILGUN_API_KEY env)
 * 2. If REST API fails (or key is an SMTP password), seamlessly falls back to Mailgun SMTP
 * 3. Fallback: Clean console simulation log if credentials are not configured yet
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const plainText = text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const recipientList = Array.isArray(to) ? to : [to];

  let dbSettings: any = null;
  try {
    await connectToDatabase();
    dbSettings = await JournalSettings.findOne().lean();
  } catch {
    // Database might be initializing
  }

  const mg = await getMailgunConfig(dbSettings);
  let mailgunError: string | null = null;

  // 1. Try Mailgun REST API if configured (and not explicitly configured as SMTP user)
  if (mg.client && mg.cleanDomain && !mg.isSmtpOnly) {
    try {
      const result = await mg.client.messages.create(mg.cleanDomain, {
        from: mg.from,
        to: recipientList,
        subject,
        text: plainText,
        html,
      });
      console.log(`[EmailService:Mailgun-API] Sent email to ${recipientList.join(", ")} - ID: ${result.id}`);
      return { success: true, provider: "mailgun-api", id: result.id };
    } catch (apiError: any) {
      mailgunError = apiError.message || String(apiError);
      console.warn(
        `[EmailService:Mailgun-API] REST API dispatch failed (${mailgunError}). Attempting SMTP fallback...`
      );
    }
  }

  // 2. Try SMTP Transporter (supports Mailgun SMTP & custom SMTP)
  try {
    const transporter = await getTransporter(dbSettings);
    if (transporter) {
      const info = await transporter.sendMail({
        from: mg.from,
        to: recipientList,
        subject,
        text: plainText,
        html,
      });
      console.log(`[EmailService:SMTP] Sent email to ${recipientList.join(", ")} - ID: ${info.messageId}`);
      return { success: true, provider: "smtp", messageId: info.messageId };
    }
  } catch (smtpError: any) {
    console.error("[EmailService:SMTP] SMTP dispatch failed:", smtpError.message || smtpError);
    return { success: false, error: smtpError.message || "SMTP dispatch error" };
  }

  // If Mailgun REST API was configured but failed, and no SMTP succeeded:
  if (mailgunError) {
    return {
      success: false,
      error: `Mailgun delivery failed: ${mailgunError}`,
    };
  }

  // 3. Fallback: Simulation log when neither Mailgun nor SMTP succeeds
  console.log("\n==================== [EMAIL SERVICE: DISPATCH SIMULATION] ====================");
  console.log(`To: ${recipientList.join(", ")}`);
  console.log(`From: ${mg.from}`);
  console.log(`Subject: ${subject}`);
  console.log(`Preview: ${plainText.slice(0, 300)}...`);
  console.log("Status: Delivered (simulated - configure Mailgun in /admin/settings or .env.local)");
  console.log("===============================================================================\n");

  return { success: true, simulated: true };
}

/**
 * 1. MANUSCRIPT SUBMISSION NOTIFICATION
 * Sent automatically when an author successfully submits a manuscript.
 */
export async function sendManuscriptSubmissionEmail(manuscript: {
  submissionId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  manuscriptType: string;
  category: string;
  institution?: string;
  country?: string;
}) {
  const subject = `[IJASR] Manuscript Submission Confirmation (${manuscript.submissionId})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F8FC; margin: 0; padding: 24px; color: #243447; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #D9E2EC; box-shadow: 0 4px 12px rgba(16, 42, 69, 0.05); }
    .header { background: #102A43; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 13px; color: #9FB3C8; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 600; color: #102A43; margin-bottom: 12px; }
    .box { background: #F5F8FC; border: 1px solid #D9E2EC; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .box-item { margin-bottom: 8px; font-size: 13px; }
    .box-item:last-child { margin-bottom: 0; }
    .box-label { font-weight: 700; color: #102A43; min-width: 140px; display: inline-block; }
    .ref-badge { display: inline-block; background: #E3F2FD; color: #1769AA; font-weight: 700; font-family: monospace; padding: 4px 10px; border-radius: 6px; font-size: 15px; }
    .button-container { text-align: center; margin: 28px 0; }
    .button { display: inline-block; background: #0C8B83; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 6px; }
    .steps { margin: 20px 0; padding-left: 20px; font-size: 13px; color: #486581; }
    .steps li { margin-bottom: 6px; }
    .footer { background: #F5F8FC; padding: 20px 24px; text-align: center; font-size: 12px; color: #627D98; border-top: 1px solid #D9E2EC; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>International Journal of Advanced Scientific Research</h1>
      <p>Editorial Desk Intake Confirmation</p>
    </div>
    <div class="content">
      <div class="greeting">Dear ${manuscript.authorName},</div>
      <p>Thank you for submitting your research work to the <strong>International Journal of Advanced Scientific Research (IJASR)</strong>. We are pleased to confirm that your manuscript has been successfully received by our editorial intake office.</p>

      <div class="box">
        <div class="box-item">
          <span class="box-label">Manuscript Reference ID:</span>
          <span class="ref-badge">${manuscript.submissionId}</span>
        </div>
        <div class="box-item">
          <span class="box-label">Title:</span>
          <strong>${manuscript.title}</strong>
        </div>
        <div class="box-item">
          <span class="box-label">Manuscript Type:</span>
          <span>${manuscript.manuscriptType}</span>
        </div>
        <div class="box-item">
          <span class="box-label">Field / Category:</span>
          <span>${manuscript.category}</span>
        </div>
        <div class="box-item">
          <span class="box-label">Submission Date:</span>
          <span>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      <p><strong>What Happens Next?</strong></p>
      <ol class="steps">
        <li><strong>Initial Editorial Screening:</strong> The Editor-in-Chief reviews your submission for scope, integrity, and author guidelines alignment (typically 2-3 business days).</li>
        <li><strong>Double-Blind Peer Review:</strong> Eligible manuscripts are assigned to independent reviewers in your research field.</li>
        <li><strong>Editorial Decision:</strong> You will be notified via email regarding reviewer comments, revision requests, or formal acceptance.</li>
      </ol>

      <p style="font-size: 13px; color: #486581;">Please retain your Reference ID <strong>${manuscript.submissionId}</strong> for all correspondence with our editorial staff.</p>

      <div class="button-container">
        <a href="${siteUrl ? `${siteUrl}/author-guidelines` : '#'}" class="button">View Author Guidelines & Workflow</a>
      </div>

      <p style="font-size: 13px; margin-top: 24px;">
        Sincerely,<br>
        <strong>Editorial Office</strong><br>
        International Journal of Advanced Scientific Research (IJASR)
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} International Journal of Advanced Scientific Research. All rights reserved.<br>
      This is an automated confirmation email regarding your academic submission.
    </div>
  </div>
</body>
</html>
  `;

  // 1. Send confirmation to author
  const authorResult = await sendEmail({
    to: manuscript.authorEmail,
    subject,
    html,
  });

  // 2. Notify journal editors
  const adminSubject = `[Editorial Notice] New Manuscript Submitted: ${manuscript.submissionId}`;
  const adminHtml = `
    <div style="font-family: sans-serif; padding: 20px; color: #243447;">
      <h2 style="color: #102A43;">New Manuscript Submission Received</h2>
      <p>A new research paper has been submitted to IJASR and is ready for editorial review.</p>
      <ul>
        <li><strong>Ref ID:</strong> ${manuscript.submissionId}</li>
        <li><strong>Title:</strong> ${manuscript.title}</li>
        <li><strong>Author:</strong> ${manuscript.authorName} (${manuscript.authorEmail})</li>
        <li><strong>Institution:</strong> ${manuscript.institution || "N/A"}, ${manuscript.country || "N/A"}</li>
        <li><strong>Type / Category:</strong> ${manuscript.manuscriptType} • ${manuscript.category}</li>
      </ul>
      <p><a href="${siteUrl ? `${siteUrl}/admin/submissions` : '#'}" style="display: inline-block; background: #1769AA; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Submissions in Admin Portal &rarr;</a></p>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: adminSubject,
    html: adminHtml,
  });

  return authorResult;
}

/**
 * 2. ARTICLE PUBLISHED NOTIFICATION
 * Sent automatically when an article is published or set to "published" status.
 * Supports single recipient or array of recipients (authors, co-authors)
 * Also copies the editorial desk so the journal staff has full audit trail.
 */
export async function sendArticlePublishedEmail(
  article: {
    title: string;
    slug: string;
    doi?: string;
    volume?: { volumeNumber?: number; year?: number };
    issue?: { issueNumber?: number };
    authors?: Array<{ name: string; email?: string }>;
  },
  recipientEmail: string | string[],
  recipientName?: string
) {
  // Normalize recipient list
  const rawList = Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail];
  const validRecipients = Array.from(
    new Set(
      rawList
        .filter((e) => typeof e === "string" && e.trim().includes("@"))
        .map((e) => e.trim().toLowerCase())
    )
  );

  let dbSettings: any = null;
  try {
    await connectToDatabase();
    dbSettings = await JournalSettings.findOne().lean();
  } catch {
    // Ignore
  }

  const journalEmail = dbSettings?.email || adminEmail;
  const journalName = dbSettings?.journalName || "International Journal of Advanced Scientific Research";
  const journalShort = dbSettings?.shortName || "IJASR";

  if (validRecipients.length === 0) {
    console.warn("[EmailService] No valid author email provided for article publication notice. Notifying editorial desk.");
    
    // Notify admin/editorial desk even if author email is missing
    const alertSubject = `[${journalShort} Notice] Article Published (Author Email Missing): "${article.title.slice(0, 50)}..."`;
    const alertHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #243447;">
        <h2 style="color: #102A43;">Article Published Online</h2>
        <p>The following article has been published on the journal portal, but <strong>no author email address</strong> was provided in the article record to receive an automated notification.</p>
        <ul>
          <li><strong>Title:</strong> ${article.title}</li>
          <li><strong>Slug:</strong> ${article.slug}</li>
          <li><strong>Authors:</strong> ${article.authors?.map((a) => a.name).join(", ") || "N/A"}</li>
        </ul>
        <p><a href="${siteUrl ? `${siteUrl}/articles/${article.slug}` : '#'}" style="display:inline-block;padding:10px 18px;background:#1769AA;color:#fff;border-radius:6px;text-decoration:none;">View Public Article</a></p>
      </div>
    `;
    await sendEmail({
      to: journalEmail,
      subject: alertSubject,
      html: alertHtml,
    });

    return { success: false, error: "Missing author email (editorial desk notified)", editorialNotified: true };
  }

  const subject = `[${journalShort}] Congratulations! Your Article Has Been Published: "${article.title.slice(0, 50)}..."`;
  const articleUrl = siteUrl ? `${siteUrl}/articles/${article.slug}` : "";
  const pdfDownloadUrl = siteUrl ? `${siteUrl}/api/articles/${article.slug}/pdf?download=true` : "";
  const authorDisplayName = recipientName || article.authors?.[0]?.name || "Author";
  const volText = article.volume?.volumeNumber ? `Volume ${article.volume.volumeNumber}` : "Latest Volume";
  const issText = article.issue?.issueNumber ? `Issue ${article.issue.issueNumber}` : "Current Issue";
  const yearText = article.volume?.year || new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F8FC; margin: 0; padding: 24px; color: #243447; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #D9E2EC; box-shadow: 0 4px 12px rgba(16, 42, 69, 0.05); }
    .header { background: #102A43; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 13px; color: #14B8A6; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 600; color: #102A43; margin-bottom: 12px; }
    .celebration { background: #E6FFFA; border: 1px solid #A7F3D0; border-radius: 8px; padding: 16px; margin: 20px 0; color: #065F46; font-size: 14px; text-align: center; }
    .box { background: #F5F8FC; border: 1px solid #D9E2EC; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .box-item { margin-bottom: 8px; font-size: 13px; }
    .box-item:last-child { margin-bottom: 0; }
    .box-label { font-weight: 700; color: #102A43; min-width: 130px; display: inline-block; }
    .button-container { text-align: center; margin: 28px 0; }
    .button-primary { display: inline-block; background: #0C8B83; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; margin-right: 8px; margin-bottom: 8px; }
    .button-secondary { display: inline-block; background: #1769AA; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; margin-bottom: 8px; }
    .share-box { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 16px; font-size: 13px; color: #92400E; margin-top: 20px; }
    .footer { background: #F5F8FC; padding: 20px 24px; text-align: center; font-size: 12px; color: #627D98; border-top: 1px solid #D9E2EC; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${journalName}</h1>
      <p>&star; Official Publication Announcement &star;</p>
    </div>
    <div class="content">
      <div class="greeting">Dear ${authorDisplayName},</div>

      <div class="celebration">
        <strong>&check; Congratulations!</strong> Your scholarly article has been formally peer-reviewed, typeset, and published online.
      </div>

      <p>We are delighted to inform you that your research paper is now live and universally accessible under Open Access CC BY 4.0 licensing in the <strong>${journalName} (${journalShort})</strong>.</p>

      <div class="box">
        <div class="box-item">
          <span class="box-label">Article Title:</span>
          <strong>${article.title}</strong>
        </div>
        <div class="box-item">
          <span class="box-label">Citation Placement:</span>
          <span>${volText}, ${issText} (${yearText})</span>
        </div>
        ${
          article.doi
            ? `<div class="box-item">
                <span class="box-label">DOI Identifier:</span>
                <a href="https://doi.org/${article.doi}" style="color: #1769AA; font-weight: 600;">https://doi.org/${article.doi}</a>
               </div>`
            : ""
        }
        <div class="box-item">
          <span class="box-label">Publication Date:</span>
          <span>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div class="box-item">
          <span class="box-label">Access Model:</span>
          <span>Immediate Worldwide Open Access (CC BY 4.0)</span>
        </div>
      </div>

      <div class="button-container">
        <a href="${articleUrl || '#'}" class="button-primary">View Article Online</a>
        <a href="${pdfDownloadUrl || '#'}" class="button-secondary">Download Official PDF</a>
      </div>

      <div class="share-box">
        <strong>&xrarr; Maximize Your Research Impact:</strong><br>
        We encourage you to share your article URL with academic colleagues, university repositories, ResearchGate, Google Scholar, and social research platforms.
      </div>

      <p style="font-size: 13px; margin-top: 24px;">
        Thank you for choosing ${journalShort} to publish your valued scholarly contribution. We look forward to receiving your future research submissions.
      </p>

      <p style="font-size: 13px;">
        Warm regards,<br>
        <strong>Editorial & Publishing Desk</strong><br>
        ${journalName} (${journalShort})
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${journalName}. All rights reserved.<br>
      Published under Creative Commons Attribution 4.0 International License (CC BY 4.0).
    </div>
  </div>
</body>
</html>
  `;

  // 1. Send notice to all author recipients
  const authorResult = await sendEmail({
    to: validRecipients,
    subject,
    html,
  });

  // 2. Also send an editorial confirmation copy to the journal desk if not already in recipients
  if (journalEmail && !validRecipients.includes(journalEmail.toLowerCase())) {
    const adminSubject = `[${journalShort} Notice] Published Article Alert: "${article.title.slice(0, 50)}..."`;
    const adminHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #243447;">
        <h3 style="color: #102A43;">Article Published Notification Sent</h3>
        <p>The publication announcement has been successfully emailed to authors.</p>
        <ul>
          <li><strong>Title:</strong> ${article.title}</li>
          <li><strong>Recipients:</strong> ${validRecipients.join(", ")}</li>
          ${articleUrl ? `<li><strong>URL:</strong> <a href="${articleUrl}">${articleUrl}</a></li>` : ""}
        </ul>
      </div>
    `;
    await sendEmail({
      to: journalEmail,
      subject: adminSubject,
      html: adminHtml,
    });
  }

  return { ...authorResult, recipients: validRecipients };
}

/**
 * 3. MANUSCRIPT STATUS UPDATE NOTIFICATION
 * Sent when an admin changes a manuscript's status in /admin/submissions/[id]
 */
export async function sendManuscriptStatusEmail(manuscript: {
  submissionId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  status: string;
  adminNotes?: string;
}) {
  if (!manuscript.authorEmail || !manuscript.authorEmail.includes("@")) {
    return { success: false, error: "Missing author email" };
  }

  let dbSettings: any = null;
  try {
    await connectToDatabase();
    dbSettings = await JournalSettings.findOne().lean();
  } catch {
    // Ignore
  }

  const journalName = dbSettings?.journalName || "International Journal of Advanced Scientific Research";
  const journalShort = dbSettings?.shortName || "IJASR";

  const statusLabels: Record<string, { label: string; color: string; desc: string }> = {
    under_review: {
      label: "Under Peer Review",
      color: "#1769AA",
      desc: "Your manuscript has passed initial screening and has been assigned to expert peer reviewers in your discipline.",
    },
    revision_requested: {
      label: "Revision Requested",
      color: "#D97706",
      desc: "The editorial board has completed peer review. Please review the reviewer comments and submit a revised manuscript.",
    },
    accepted: {
      label: "Formally Accepted",
      color: "#059669",
      desc: "Congratulations! Your manuscript has met all editorial and peer-review quality standards and has been formally accepted for publication.",
    },
    published: {
      label: "Published Online",
      color: "#0C8B83",
      desc: "Your research article is now officially typeset and published in the journal archives.",
    },
    rejected: {
      label: "Declined",
      color: "#DC2626",
      desc: "Following editorial evaluation, we regret to inform you that your manuscript cannot be accepted for publication in this volume.",
    },
  };

  const current = statusLabels[manuscript.status] || {
    label: manuscript.status.replace("_", " ").toUpperCase(),
    color: "#102A43",
    desc: `The status of your manuscript has been updated to ${manuscript.status}.`,
  };

  const subject = `[${journalShort}] Status Update on Manuscript ${manuscript.submissionId}: ${current.label}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F8FC; margin: 0; padding: 24px; color: #243447; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #D9E2EC; box-shadow: 0 4px 12px rgba(16, 42, 69, 0.05); }
    .header { background: #102A43; padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-family: Georgia, serif; }
    .content { padding: 30px 24px; line-height: 1.6; }
    .badge { display: inline-block; background: ${current.color}; color: #ffffff; font-weight: 700; padding: 6px 14px; border-radius: 6px; font-size: 14px; margin: 12px 0; }
    .box { background: #F5F8FC; border: 1px solid #D9E2EC; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .box-item { margin-bottom: 8px; font-size: 13px; }
    .box-item:last-child { margin-bottom: 0; }
    .box-label { font-weight: 700; color: #102A43; min-width: 140px; display: inline-block; }
    .notes { background: #FFFBEB; border-left: 4px solid #D97706; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #78350F; border-radius: 4px; }
    .footer { background: #F5F8FC; padding: 20px 24px; text-align: center; font-size: 12px; color: #627D98; border-top: 1px solid #D9E2EC; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${journalName}</h1>
      <p style="margin:0;font-size:12px;color:#9FB3C8;letter-spacing:1px;text-transform:uppercase;">Editorial Review Desk Notice</p>
    </div>
    <div class="content">
      <div style="font-size: 16px; font-weight: 600; color: #102A43;">Dear ${manuscript.authorName},</div>
      <p>We are writing to update you on the editorial status of your manuscript submitted to <strong>${journalName}</strong>.</p>

      <div style="text-align: center; margin: 16px 0;">
        <span class="badge">${current.label}</span>
      </div>

      <p>${current.desc}</p>

      <div class="box">
        <div class="box-item"><span class="box-label">Manuscript ID:</span> <strong>${manuscript.submissionId}</strong></div>
        <div class="box-item"><span class="box-label">Title:</span> <strong>${manuscript.title}</strong></div>
        <div class="box-item"><span class="box-label">Effective Date:</span> <span>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
      </div>

      ${
        manuscript.adminNotes
          ? `<div class="notes"><strong>Editorial Office Notes:</strong><br>${manuscript.adminNotes}</div>`
          : ""
      }

      <p style="font-size: 13px; margin-top: 24px;">
        For questions or correspondence, please reply directly or quote your Reference ID <strong>${manuscript.submissionId}</strong>.
      </p>

      <p style="font-size: 13px;">
        Sincerely,<br>
        <strong>Editorial Office</strong><br>
        ${journalName} (${journalShort})
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${journalName}. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  return await sendEmail({
    to: manuscript.authorEmail,
    subject,
    html,
  });
}
