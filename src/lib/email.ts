import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const defaultFrom =
  process.env.SMTP_FROM || '"IJASR Editorial Office" <editorial@journal.ac.org>';
const adminEmail = process.env.ADMIN_EMAIL || "admin@journal.ac.org";

/**
 * Creates and returns a Nodemailer transporter if SMTP credentials are configured.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

/**
 * Universal safe email sender.
 * If SMTP is configured in .env.local, delivers via real SMTP.
 * If not configured, gracefully logs the email to console for development/testing.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const plainText = text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  try {
    const transporter = getTransporter();

    if (transporter) {
      const info = await transporter.sendMail({
        from: defaultFrom,
        to,
        subject,
        text: plainText,
        html,
      });
      console.log(`[EmailService] Real email sent to ${Array.isArray(to) ? to.join(", ") : to}: MessageId ${info.messageId}`);
      return { success: true, simulated: false, messageId: info.messageId };
    }

    // Fallback: Simulation log when SMTP is not yet configured
    console.log("\n==================== [EMAIL SERVICE: DISPATCH SIMULATION] ====================");
    console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`From: ${defaultFrom}`);
    console.log(`Subject: ${subject}`);
    console.log(`Preview: ${plainText.slice(0, 300)}...`);
    console.log("Status: Delivered (simulated - set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local for real sending)");
    console.log("===============================================================================\n");

    return { success: true, simulated: true };
  } catch (error: any) {
    console.error("[EmailService] Failed to send email:", error.message || error);
    // Never throw to prevent disrupting the core API workflow
    return { success: false, error: error.message };
  }
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
        <a href="${siteUrl}/author-guidelines" class="button">View Author Guidelines & Workflow</a>
      </div>

      <p style="font-size: 13px; margin-top: 24px;">
        Sincerely,<br>
        <strong>Editorial Office</strong><br>
        International Journal of Advanced Scientific Research (IJASR)<br>
        <a href="${siteUrl}" style="color: #1769AA;">${siteUrl}</a>
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
      <p><a href="${siteUrl}/admin/submissions" style="display: inline-block; background: #1769AA; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Submissions in Admin Portal &rarr;</a></p>
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
 */
export async function sendArticlePublishedEmail(article: {
  title: string;
  slug: string;
  doi?: string;
  volume?: { volumeNumber?: number; year?: number };
  issue?: { issueNumber?: number };
  authors?: Array<{ name: string; email?: string }>;
}, recipientEmail: string, recipientName?: string) {
  if (!recipientEmail || !recipientEmail.includes("@")) {
    console.warn("[EmailService] No valid recipient email provided for article publication notice.");
    return { success: false, error: "Missing recipient email" };
  }

  const subject = `[IJASR] Congratulations! Your Article Has Been Published: "${article.title.slice(0, 50)}..."`;
  const articleUrl = `${siteUrl}/articles/${article.slug}`;
  const pdfDownloadUrl = `${siteUrl}/api/articles/${article.slug}/pdf?download=true`;
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
      <h1>International Journal of Advanced Scientific Research</h1>
      <p>&star; Official Publication Announcement &star;</p>
    </div>
    <div class="content">
      <div class="greeting">Dear ${authorDisplayName},</div>

      <div class="celebration">
        <strong>&check; Congratulations!</strong> Your scholarly article has been formally peer-reviewed, typeset, and published online.
      </div>

      <p>We are delighted to inform you that your research paper is now live and universally accessible under Open Access CC BY 4.0 licensing in the <strong>International Journal of Advanced Scientific Research (IJASR)</strong>.</p>

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
        <a href="${articleUrl}" class="button-primary">View Article Online</a>
        <a href="${pdfDownloadUrl}" class="button-secondary">Download Official PDF</a>
      </div>

      <div class="share-box">
        <strong>&xrarr; Maximize Your Research Impact:</strong><br>
        We encourage you to share your article URL with academic colleagues, university repositories, ResearchGate, Google Scholar, and social research platforms.
      </div>

      <p style="font-size: 13px; margin-top: 24px;">
        Thank you for choosing IJASR to publish your valued scholarly contribution. We look forward to receiving your future research submissions.
      </p>

      <p style="font-size: 13px;">
        Warm regards,<br>
        <strong>Editorial & Publishing Desk</strong><br>
        International Journal of Advanced Scientific Research (IJASR)<br>
        <a href="${siteUrl}" style="color: #1769AA;">${siteUrl}</a>
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} International Journal of Advanced Scientific Research. All rights reserved.<br>
      Published under Creative Commons Attribution 4.0 International License (CC BY 4.0).
    </div>
  </div>
</body>
</html>
  `;

  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
}
