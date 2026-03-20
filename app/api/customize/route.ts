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

        let photoPath: string | null = null;
        let photoUrl: string | null = null;
        let attachments: Array<{
            filename: string;
            content: Buffer;
            contentType?: string;
        }> = [];

        if (hasPhoto && photo instanceof File) {
            const bytes = await photo.arrayBuffer();
            const safeFileName = sanitizeFileName(photo.name || "reference.jpg");
            photoPath = `${requestId}/${Date.now()}-${safeFileName}`;

            const { error: uploadError } = await supabase.storage
                .from("custom-requests")
                .upload(photoPath, Buffer.from(bytes), {
                    contentType: photo.type || "application/octet-stream",
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            const { data: publicUrlData } = supabase.storage
                .from("custom-requests")
                .getPublicUrl(photoPath);

            photoUrl = publicUrlData.publicUrl;

            attachments.push({
                filename: photo.name || `${requestId}-reference.jpg`,
                content: Buffer.from(bytes),
                contentType: photo.type || "application/octet-stream",
            });
        }

        const { error: updateError } = await supabase
            .from("custom_requests")
            .update({
                request_id: requestId,
                photo_path: photoPath,
                photo_url: photoUrl,
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
Photo URL: ${photoUrl || "Not provided"}
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
                    <strong>Photo Uploaded:</strong> ${hasPhoto ? "Yes" : "No"}<br />
                    <strong>Photo URL:</strong> ${photoUrl || "Not provided"}
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
            { message: error instanceof Error ? error.message : "Failed to submit request." },
            { status: 500 }
        );
    }
}