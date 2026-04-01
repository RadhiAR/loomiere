import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function buildRequestId(id: number) {
    return `LMRA${String(id).padStart(3, "0")}`;
}

function sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
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

        const uploadedFiles = formData
            .getAll("photo")
            .filter((item): item is File => item instanceof File && item.size > 0);

        if (!firstName || !lastName || !email || !phone || !zipcode) {
            return Response.json(
                { message: "Please complete all required contact fields." },
                { status: 400 }
            );
        }

        const hasPhotos = uploadedFiles.length > 0;

        if (!description && !hasPhotos) {
            return Response.json(
                {
                    message:
                        "Please upload at least one photo, write a description, or provide both before submitting.",
                },
                { status: 400 }
            );
        }

        const { data: insertedRow, error: insertError } = await supabase
            .from("custom_requests")
            .insert([
                {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    phone,
                    zipcode,
                    product_type: productType || null,
                    description: description || null,
                    measurements: measurements || null,
                    notes: notes || null,
                    status: "submitted",
                },
            ])
            .select("id")
            .single();

        if (insertError || !insertedRow) {
            throw new Error(insertError?.message || "Failed to create request record.");
        }

        const requestId = buildRequestId(insertedRow.id);

        const photoPaths: string[] = [];
        const photoUrls: string[] = [];
        const attachments: Array<{
            filename: string;
            content: Buffer;
            contentType?: string;
        }> = [];

        for (const file of uploadedFiles) {
            const bytes = await file.arrayBuffer();
            const safeFileName = sanitizeFileName(file.name || "reference.jpg");
            const photoPath = `${requestId}/${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}-${safeFileName}`;

            const { error: uploadError } = await supabase.storage
                .from("custom-requests")
                .upload(photoPath, Buffer.from(bytes), {
                    contentType: file.type || "application/octet-stream",
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            const { data: publicUrlData } = supabase.storage
                .from("custom-requests")
                .getPublicUrl(photoPath);

            photoPaths.push(photoPath);
            photoUrls.push(publicUrlData.publicUrl);

            attachments.push({
                filename: file.name || `${requestId}-reference.jpg`,
                content: Buffer.from(bytes),
                contentType: file.type || "application/octet-stream",
            });
        }

        const primaryPhotoPath = photoPaths[0] || null;
        const primaryPhotoUrl = photoUrls[0] || null;

        const { error: updateError } = await supabase
            .from("custom_requests")
            .update({
                request_id: requestId,
                photo_path: primaryPhotoPath,
                photo_url: primaryPhotoUrl,
            })
            .eq("id", insertedRow.id);

        if (updateError) {
            throw new Error(updateError.message);
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
                        "Custom request saved successfully. Email is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in your environment variables.",
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

        const photoUrlsText = photoUrls.length
            ? photoUrls.map((url, index) => `Photo ${index + 1}: ${url}`).join("\n")
            : "Not provided";

        const teamEmailText = `
New Loomeira Custom Request Submitted

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
Photos Uploaded: ${hasPhotos ? `${uploadedFiles.length}` : "No"}
Photo URLs:
${photoUrlsText}
        `.trim();

        const teamEmailHtml = `
            <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
                <h2 style="margin-bottom: 8px;">New Loomeira Custom Request Submitted</h2>
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
                    <strong>Photos Uploaded:</strong> ${hasPhotos ? uploadedFiles.length : 0}
                </p>

                ${photoUrls.length
                ? `
                    <h3 style="margin-bottom: 6px;">Photo Links</h3>
                    <ul>
                        ${photoUrls
                    .map(
                        (url, index) =>
                            `<li><a href="${url}" target="_blank" rel="noopener noreferrer">Photo ${index + 1}</a></li>`
                    )
                    .join("")}
                    </ul>
                `
                : ""}
            </div>
        `;

        const customerEmailText = `
Hello ${firstName},

Thank you for submitting your custom request to Loomeira.

Your request has been received successfully.

Request ID: ${requestId}

Submitted Details
-----------------
Product Type: ${productType || "Not provided"}
Description: ${description || "Not provided"}
Measurements: ${measurements || "Not provided"}
Notes: ${notes || "Not provided"}
Photos Uploaded: ${hasPhotos ? uploadedFiles.length : 0}

A Loomeirite will reach out shortly if there are any questions. Work will begin with an estimated delivery timeline.

With love,
Loomeira Team
        `.trim();

        const customerEmailHtml = `
            <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.7;">
                <h2 style="margin-bottom: 8px;">Your Loomeira custom request has been received</h2>
                <p>Hello ${firstName},</p>
                <p>
                    Thank you for submitting your custom request to <strong>Loomeira</strong>.
                    We have received your request successfully.
                </p>

                <p><strong>Request ID:</strong> ${requestId}</p>

                <div style="margin-top: 16px;">
                    <strong>Submitted Details</strong><br />
                    Product Type: ${productType || "Not provided"}<br />
                    Description: ${description || "Not provided"}<br />
                    Measurements: ${measurements || "Not provided"}<br />
                    Notes: ${notes || "Not provided"}<br />
                    Photos Uploaded: ${hasPhotos ? uploadedFiles.length : 0}
                </div>

                <p style="margin-top: 16px;">
                    A Loomeirite will reach out shortly if there are any questions, and your work
                    will begin with an estimated delivery timeline.
                </p>

                <p style="margin-top: 20px;">With love,<br />Loomeira Team</p>
            </div>
        `;

        await transporter.sendMail({
            from: smtpFrom,
            to: recipientEmail,
            replyTo: email,
            subject: `Loomeira Custom Request - ${requestId}`,
            text: teamEmailText,
            html: teamEmailHtml,
            attachments,
        });

        await transporter.sendMail({
            from: smtpFrom,
            to: email,
            subject: `Loomeira Request Confirmation - ${requestId}`,
            text: customerEmailText,
            html: customerEmailHtml,
        });

        return Response.json({
            ok: true,
            requestId,
            message: "Custom request submitted successfully.",
        });
    } catch (error) {
        console.error("Customize request failed:", error);

        return Response.json(
            { message: error instanceof Error ? error.message : "Failed to submit request." },
            { status: 500 }
        );
    }
}