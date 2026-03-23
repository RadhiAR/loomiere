import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const name = String(body?.name || "").trim();
        const email = String(body?.email || "").trim();
        const phone = String(body?.phone || "").trim();
        const query = String(body?.query || "").trim();

        if (!name || !email || !phone || !query) {
            return Response.json(
                { message: "Please complete all contact form fields." },
                { status: 400 }
            );
        }

        const recipientEmail = "amy648354@gmail.com";

        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = Number(process.env.SMTP_PORT || 587);
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const smtpFrom = process.env.SMTP_FROM || smtpUser;

        if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
            return Response.json(
                {
                    message:
                        "Contact request received, but email is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in your environment variables.",
                },
                { status: 200 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const emailText = `
New Loomière Contact Request

Name: ${name}
Email: ${email}
Phone: ${phone}

Query:
${query}
        `.trim();

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
                <h2 style="margin-bottom: 8px;">New Loomière Contact Request</h2>

                <p>
                    <strong>Name:</strong> ${name}<br />
                    <strong>Email:</strong> ${email}<br />
                    <strong>Phone:</strong> ${phone}
                </p>

                <h3 style="margin-bottom: 6px;">Query</h3>
                <p style="white-space: pre-wrap;">${query}</p>
            </div>
        `;

        await transporter.sendMail({
            from: smtpFrom,
            to: recipientEmail,
            replyTo: email,
            subject: `Loomière Contact Request - ${name}`,
            text: emailText,
            html: emailHtml,
        });

        return Response.json({
            ok: true,
            message: "Contact request submitted successfully.",
        });
    } catch (error) {
        console.error("Contact request failed:", error);

        return Response.json(
            { message: error instanceof Error ? error.message : "Failed to submit contact request." },
            { status: 500 }
        );
    }
}