# User Story: Email Delivery System

**Story ID**: VanityURL-008
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P1 - High
**Estimated Effort**: 6-8 hours
**Sprint**: Sprint 2 (Week 2)
**Dependencies**: Story 2 (Slug Generation), Story 7 (Designer Dashboard)

---

## User Story

**As a** SparkleClassic customer
**I want** to receive an email with my personalized game URL when it's ready
**So that** I can easily find and share my game without searching for it

---

## Business Context

Email delivery is the **critical handoff** from production to customer:
- **Customer Satisfaction**: Fast, reliable delivery builds trust
- **Reduced Support**: Clear emails prevent "Where's my game?" tickets
- **Viral Growth**: Easy-to-share URLs drive referrals

**Revenue Risk**: Lost/delayed emails = lost customers + refund requests

---

## Acceptance Criteria

### Email Service Integration

- [ ] **AC1.1**: Integrate SendGrid or AWS SES
- [ ] **AC1.2**: API key stored in environment variables
- [ ] **AC1.3**: Test email sending in staging environment
- [ ] **AC1.4**: Fallback to secondary service if primary fails

### Email Template

- [ ] **AC2.1**: HTML email template with:
  - SparkleClassic branding (logo, colors)
  - Pet name personalization: "Fluffy's game is ready!"
  - Large, prominent URL button: "Play Now"
  - Plain text URL for copy/paste
  - QR code for mobile scanning
  - Social sharing buttons (Facebook, Twitter, WhatsApp)
  - Support contact information

- [ ] **AC2.2**: Plain text version for email clients without HTML support

- [ ] **AC2.3**: Mobile-responsive design (80% of opens on mobile)

### Email Content

- [ ] **AC3.1**: Subject line: "🎮 [Pet Name]'s Personalized Game is Ready!"

- [ ] **AC3.2**: Email body includes:
  ```
  Hi [Customer Name],

  Great news! [Pet Name]'s personalized platformer game is ready to play!

  [Play Now Button] → sparkleclassic.com/fluffy-happy

  Share your game:
  [Facebook] [Twitter] [WhatsApp]

  [QR Code Image]

  Need help? Reply to this email or visit our support page.

  Thanks for choosing SparkleClassic!
  The SparkleClassic Team
  ```

- [ ] **AC3.3**: Footer includes:
  - Unsubscribe link (required by law)
  - Company address
  - Privacy policy link

### QR Code Generation

- [ ] **AC4.1**: Generate QR code for game URL using `qrcode` library
- [ ] **AC4.2**: QR code embedded as inline image in email
- [ ] **AC4.3**: QR code scans directly to game (no intermediate page)

### Sending Logic

- [ ] **AC5.1**: Email sent automatically when:
  - Designer clicks "Create & Send" in dashboard
  - Config created via API with `sendEmail: true` flag

- [ ] **AC5.2**: Email NOT sent if:
  - Config marked as "draft"
  - Customer email invalid/missing
  - Previous email already sent (prevent duplicates)

- [ ] **AC5.3**: Retry logic for failed sends:
  - Retry 3 times with exponential backoff (1s, 5s, 25s)
  - If all retries fail, log error and alert admin
  - Designer can manually resend from dashboard

### Delivery Tracking

- [ ] **AC6.1**: Track email status:
  - Queued
  - Sent
  - Delivered
  - Opened
  - Clicked
  - Bounced
  - Failed

- [ ] **AC6.2**: Store status in `game_configs` table:
  ```sql
  ALTER TABLE game_configs ADD COLUMN email_status VARCHAR(20);
  ALTER TABLE game_configs ADD COLUMN email_sent_at TIMESTAMP;
  ALTER TABLE game_configs ADD COLUMN email_opened_at TIMESTAMP;
  ```

- [ ] **AC6.3**: Webhook from SendGrid updates status in real-time

### Resend Capability

- [ ] **AC7.1**: Designer dashboard shows email status per game
- [ ] **AC7.2**: "Resend Email" button available if:
  - Email failed to send
  - Customer reports not receiving
  - More than 24 hours since last send

- [ ] **AC7.3**: Resend increments send count (track in database)

---

## Technical Implementation

### SendGrid Integration

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendGameReadyEmail({ customerEmail, customerName, petName, slug, spriteUrl }) {
  // Generate QR code
  const QRCode = require('qrcode');
  const gameUrl = `https://sparkleclassic.com/${slug}`;
  const qrCodeDataUrl = await QRCode.toDataURL(gameUrl);

  const msg = {
    to: customerEmail,
    from: 'games@sparkleclassic.com',
    replyTo: 'support@sparkleclassic.com',
    subject: `🎮 ${petName}'s Personalized Game is Ready!`,
    text: `
      Hi ${customerName},

      Great news! ${petName}'s personalized platformer game is ready to play!

      Visit: ${gameUrl}

      Need help? Reply to this email.

      Thanks for choosing SparkleClassic!
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .button {
            background-color: #4CAF50;
            color: white;
            padding: 15px 32px;
            text-decoration: none;
            display: inline-block;
            font-size: 18px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .qr-code { max-width: 200px; margin: 20px auto; display: block; }
          .social-buttons img { width: 40px; margin: 0 5px; }
        </style>
      </head>
      <body>
        <img src="https://sparkleclassic.com/logo.png" alt="SparkleClassic" width="200"/>

        <h1>🎮 ${petName}'s Game is Ready!</h1>

        <p>Hi ${customerName},</p>

        <p>Great news! ${petName}'s personalized platformer game is ready to play!</p>

        <a href="${gameUrl}" class="button">Play Now</a>

        <p><strong>Your game URL:</strong><br/>${gameUrl}</p>

        <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code"/>
        <p style="text-align: center; font-size: 12px; color: #666;">Scan with your phone to play instantly</p>

        <p><strong>Share your game:</strong></p>
        <div class="social-buttons">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}">
            <img src="https://sparkleclassic.com/social/facebook.png" alt="Facebook"/>
          </a>
          <a href="https://twitter.com/intent/tweet?text=Check out ${petName}'s game!&url=${encodeURIComponent(gameUrl)}">
            <img src="https://sparkleclassic.com/social/twitter.png" alt="Twitter"/>
          </a>
          <a href="https://wa.me/?text=Check out ${petName}'s game: ${encodeURIComponent(gameUrl)}">
            <img src="https://sparkleclassic.com/social/whatsapp.png" alt="WhatsApp"/>
          </a>
        </div>

        <hr/>

        <p style="font-size: 12px; color: #666;">
          Need help? Reply to this email or visit <a href="https://sparkleclassic.com/support">our support page</a>.
        </p>

        <p style="font-size: 11px; color: #999;">
          You're receiving this email because you purchased a personalized game from SparkleClassic.
          <a href="%unsubscribe_url%">Unsubscribe</a> |
          <a href="https://sparkleclassic.com/privacy">Privacy Policy</a><br/>
          SparkleClassic LLC, 123 Game St, San Francisco, CA 94103
        </p>
      </body>
      </html>
    `,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${customerEmail} for ${slug}`);

    // Update database
    await db.query(
      `UPDATE game_configs
       SET email_status = 'sent', email_sent_at = NOW()
       WHERE slug = $1`,
      [slug]
    );

    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);

    await db.query(
      `UPDATE game_configs
       SET email_status = 'failed'
       WHERE slug = $1`,
      [slug]
    );

    throw error;
  }
}
```

### SendGrid Webhook Handler

```javascript
// Handle SendGrid event webhooks
router.post('/api/webhooks/sendgrid', async (req, res) => {
  const events = req.body;

  for (const event of events) {
    const { email, event: eventType, sg_message_id } = event;

    // Find config by email (may need to extract slug from email body)
    const config = await db.query(
      'SELECT slug FROM game_configs WHERE customer_email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (config.rows.length > 0) {
      const slug = config.rows[0].slug;

      switch (eventType) {
        case 'delivered':
          await db.query(
            `UPDATE game_configs SET email_status = 'delivered' WHERE slug = $1`,
            [slug]
          );
          break;
        case 'open':
          await db.query(
            `UPDATE game_configs SET email_status = 'opened', email_opened_at = NOW() WHERE slug = $1`,
            [slug]
          );
          break;
        case 'click':
          await db.query(
            `UPDATE game_configs SET email_status = 'clicked' WHERE slug = $1`,
            [slug]
          );
          break;
        case 'bounce':
        case 'dropped':
          await db.query(
            `UPDATE game_configs SET email_status = 'bounced' WHERE slug = $1`,
            [slug]
          );
          break;
      }
    }
  }

  res.sendStatus(200);
});
```

---

## Test Scenarios

### Scenario 1: Email Sent Successfully

**Given**: Designer creates game for customer "john@example.com"
**When**: Designer clicks "Create & Send"
**Then**:
- Email sent to john@example.com
- Subject: "🎮 Fluffy's Personalized Game is Ready!"
- Email contains game URL
- Database updated: `email_status = 'sent'`
- Designer sees success message

### Scenario 2: Email Delivery Tracked

**Given**: Email sent successfully
**When**: Customer opens email
**Then**:
- SendGrid webhook fires
- Database updated: `email_status = 'opened'`, `email_opened_at = NOW()`
- Admin dashboard shows "Opened" status

### Scenario 3: Email Send Fails

**Given**: Invalid email address: "invalid@@example.com"
**When**: Attempt to send email
**Then**:
- SendGrid returns error
- Retry 3 times with backoff
- After 3 failures, mark as 'failed'
- Alert admin
- Designer sees error message

### Scenario 4: Designer Resends Email

**Given**: Email status is 'failed'
**When**: Designer clicks "Resend Email"
**Then**:
- New email attempt
- Send count incremented
- If successful, status updated to 'sent'

### Scenario 5: QR Code Works

**Given**: Email delivered to customer
**When**: Customer scans QR code with phone
**Then**:
- Phone opens game URL directly
- No intermediate page
- Game loads on mobile

---

## Definition of Done

- [ ] SendGrid integrated
- [ ] Email template created (HTML + plain text)
- [ ] QR code generation working
- [ ] Email sent on game creation
- [ ] Delivery tracking functional
- [ ] Webhook handler receiving events
- [ ] Resend functionality works
- [ ] Test emails sent and verified
- [ ] Mobile rendering tested
- [ ] Spam score checked (< 5)
- [ ] Code reviewed and deployed

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Next Story**: Story 9 (Documentation & Testing)
