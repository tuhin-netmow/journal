import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { recipient } = await req.json();
    if (!recipient || typeof recipient !== "string" || !recipient.includes("@")) {
      return NextResponse.json(
        { error: "A valid recipient email address is required" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: recipient.trim(),
      subject: "[IJASR] Mailgun Integration Test Delivery",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #102A43; background: #F5F8FC; border-radius: 8px; border: 1px solid #D9E2EC; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #102A43; margin-top: 0;">Mailgun Email Delivery Confirmed!</h2>
          <p>Congratulations! Your academic journal's email delivery system is functioning properly.</p>
          <p>Authors and reviewers will receive real-time notifications for:</p>
          <ul>
            <li>Manuscript submission intake & confirmation</li>
            <li>Editorial decisions & review notifications</li>
            <li>Article publication announcements</li>
          </ul>
          <hr style="border: 0; border-top: 1px solid #D9E2EC; margin: 20px 0;" />
          <p style="font-size: 12px; color: #627D98;">Dispatched &bull; Time: ${new Date().toISOString()}</p>
        </div>
      `,
      text: "Mailgun Integration Test Email from IJASR. Your email delivery service is functioning properly!",
    });

    if (result.success && !(result as any).simulated) {
      return NextResponse.json({
        success: true,
        message: `Test email delivered successfully to ${recipient} via ${(result as any).provider || "Mailgun"}.`,
        provider: (result as any).provider,
        id: (result as any).id || (result as any).messageId,
      });
    } else if ((result as any).simulated) {
      return NextResponse.json({
        success: true,
        message: `Credentials not fully verified yet. Email logged to server console (simulation mode).`,
        simulated: true,
      });
    } else {
      return NextResponse.json(
        { error: (result as any).error || "Failed to deliver test email." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process test email" },
      { status: 500 }
    );
  }
}
