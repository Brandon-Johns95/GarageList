import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Generating password reset link for:", email)

    // Generate the reset link using admin client
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
    })

    if (error) {
      console.error("Admin password reset error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.properties?.action_link) {
      console.error("No action link generated")
      return NextResponse.json({ error: "Failed to generate reset link" }, { status: 500 })
    }

    const resetLink = data.properties.action_link
    console.log("Reset link generated successfully")

    // Create Zoho Mail transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: `"Garage List" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "Reset Your Password - Garage List",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2563eb; margin-bottom: 30px;">Reset Your Password</h1>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Hi there,<br><br>
              You requested to reset your password for your Garage List account. Click the button below to create a new password:
            </p>
            
            <a href="${resetLink}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin: 20px 0;">
              Reset My Password
            </a>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999;">
              Thanks,<br>
              The Garage List Team
            </p>
          </div>
        </body>
        </html>
      `,
    }

    // Send email
    console.log("Sending email via Zoho Mail...")
    const info = await transporter.sendMail(mailOptions)
    console.log("Password reset email sent successfully:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("Unexpected error in custom reset password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
