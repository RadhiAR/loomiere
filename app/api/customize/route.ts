import nodemailer from "nodemailer";

function createRequestId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `LMR-CUST-${year}${month}${day}-${random}`;
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const firstName = String(formData.get("firstName") || "").trim();
        const lastName = String(formData.get("lastName") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const zipcode = String(formData.get("zipcode") || "").trim();
        const productType = String(formData.get("productType") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const measurements = String(formData.get("measurements") || "").trim();
        const notes = String(formData.get("notes") || "").trim();
        const photo = formData.get("photo");

        if (!firstName || !lastName || !email || !phone || !zipcode) {
            return Response.json(
                { message: "Please complete all required contact fields." },
                { status: 400 }
            );
        }

        const hasPhoto =
            photo instanceof File && typeof photo.name === "string" && photo.size > 0;

        if (!description && !hasPhoto) {
            return Response.json(
                {
                    message:
                        "Please upload a photo, write a description, or provide both before submitting.",
                },
                { status: 400 }
            );
        }

        const requestId = createRequestId();

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
                        "Request ID was created, but email is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in your environment variables.",
                    requestId,
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

        let attachments: Array<{
            filename: string;
            content: Buffer;
            contentType?: string;
        }> = [];

        if (hasPhoto && photo instanceof File) {
            const bytes = await photo.arrayBuffer();
            attachments.push({
                filename: photo.name || `${requestId}-reference.jpg`,
                content: Buffer.from(bytes),
                contentType: photo.type || "application/octet-stream",
            });
        }

        const emailText = `
New Loomière Custom Request Submitted

Request ID: ${requestId}

Customer Details
----------------
First Name: ${firstName}
Last Name: ${lastName}
Email: ${email}
Phone: ${phone}
Zipcode: ${zipcode}
Product Type: ${productType || "Not provided"}

Request Details
---------------
Description: ${description || "Not provided"}
Measurements: ${measurements || "Not provided"}
Notes: ${notes || "Not provided"}

Photo Uploaded: ${hasPhoto ? "Yes" : "No"}
        `.trim();

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
                <h2 style="margin-bottom: 8px;">New Loomière Custom Request Submitted</h2>
                <p style="margin-top: 0;"><strong>Request ID:</strong> ${requestId}</p>

                <h3 style="margin-bottom: 6px;">Customer Details</h3>
                <p>
                    <strong>First Name:</strong> ${firstName}<br />
                    <strong>Last Name:</strong> ${lastName}<br />
                    <strong>Email:</strong> ${email}<br />
                    <strong>Phone:</strong> ${phone}<br />
                    <strong>Zipcode:</strong> ${zipcode}<br />
                    <strong>Product Type:</strong> ${productType || "Not provided"}
                </p>

                <h3 style="margin-bottom: 6px;">Request Details</h3>
                <p>
                    <strong>Description:</strong> ${description || "Not provided"}<br />
                    <strong>Measurements:</strong> ${measurements || "Not provided"}<br />
                    <strong>Notes:</strong> ${notes || "Not provided"}<br />
                    <strong>Photo Uploaded:</strong> ${hasPhoto ? "Yes" : "No"}
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: smtpFrom,
            to: recipientEmail,
            replyTo: email,
            subject: `Loomière Custom Request - ${requestId}`,
            text: emailText,
            html: emailHtml,
            attachments,
        });

        return Response.json({
            ok: true,
            requestId,
            message: "Custom request submitted successfully.",
        });
    } catch (error) {
        console.error("Customize request failed:", error);

        return Response.json(
            { message: "Failed to submit request." },
            { status: 500 }
        );
    }
}
