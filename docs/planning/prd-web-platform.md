# Web Platform PRD - PetPixel Games Platform

**Document Version:** 2.0  
**Updated:** 2025-01-20  
**Status:** Final - Ready for Implementation

## Executive Summary

PetPixel Games is a web platform where users upload pet photos to generate personalized pixel art platformer games. This PRD focuses on the web platform development, with manual pixel art generation for the first 20 users to accelerate market validation.

**Key Strategy Change**: Manual pixel art creation for first 20 users to reach profitability faster, with AI automation as Phase 2.

## Web Platform Epic Breakdown

### Epic E001: User Authentication & Management
- User registration/login system
- Guest checkout functionality  
- Profile management
- Password reset flow
- Session management

### Epic E002: File Upload & Processing
- Photo upload interface (JPEG, PNG, HEIC up to 10MB)
- File validation and virus scanning
- Storage integration (AWS S3/CloudFlare)
- Upload progress indicators
- Multiple photo support (up to 5 per user)

### Epic E003: Game Generation & Customization
- Game customization interface (themes, difficulty, abilities)
- Manual pixel art workflow (internal tools)
- Game template selection
- Preview functionality
- Generation status tracking

### Epic E004: User Dashboard & Library  
- User game library
- Order history
- Download management
- Sharing functionality
- Account settings

### Epic E005: Payment Processing
- Stripe integration
- Package selection ($14.99 Basic, $24.99 Premium)
- Subscription option ($9.99/month)
- Receipt generation
- Payment confirmation flow

### Epic E006: Game Delivery & Sharing
- Unique URL generation
- Social media sharing
- HTML5 download packages
- Embed code generation
- Mobile-responsive game player

### Epic E007: Admin Dashboard (Internal)
- User management
- Order processing
- Manual pixel art assignment workflow
- Content moderation tools
- Analytics dashboard

### Epic E008: Analytics & Monitoring
- User behavior tracking
- Conversion funnel analysis
- Performance monitoring
- Error tracking
- A/B testing framework

## Success Metrics

**Phase 1 Targets (Manual Pixel Art)**:
- 20 paying customers in first 30 days
- $400+ revenue (20 × $20 average)
- <24 hour turnaround for pixel art delivery
- 90%+ customer satisfaction

**Phase 2 Targets (Automated)**:
- $50k MRR by month 12
- 2%+ conversion rate
- <3 minute game generation
- 99.9% uptime

## Technical Requirements

### Web Platform Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Storage**: AWS S3 or CloudFlare R2
- **Monitoring**: Sentry + Vercel Analytics

### Performance Requirements
- Page load times < 2 seconds
- File upload progress indicators
- Responsive design (mobile-first)
- SEO optimized landing pages
- Accessibility (WCAG 2.1 AA)

### Security Requirements
- HTTPS everywhere
- PCI DSS compliance (via Stripe)
- Input validation and sanitization
- Rate limiting
- File type validation
- Secure file uploads

## Legal & Compliance Requirements

### Photo Licensing Framework
- **User Photo Uploads**: Non-exclusive license for processing and pixel art generation
- **Required Terms**: "By uploading pet photos, you grant [Platform] a non-exclusive, worldwide, royalty-free license to process images for game generation"
- **User Rights**: Users retain full ownership of original photos
- **Pet Owner Verification**: Confirm user owns/has permission for uploaded pets

### AI-Generated Content Rights  
- **Pixel Art Ownership**: AI-generated pixel art falls in public domain (cannot be copyrighted)
- **Game Templates**: Platform owns proprietary game engine and templates
- **User Entitlements**: Personal use rights to customized games
- **Commercial Use**: Requires separate licensing agreement

### Required Legal Documentation
- Comprehensive Terms of Service covering photo licensing
- Privacy Policy for image processing and storage  
- Add-on Content License Agreement for DLC purchases
- Clear disclosure of AI content ownership rights

## User Journey (Manual Pixel Art Phase)

1. **Landing Page**: User discovers platform
2. **Upload**: User uploads pet photo(s)
3. **Customize**: User selects game options
4. **Payment**: User purchases game package
5. **Processing**: Admin creates pixel art manually
6. **Notification**: User receives completion email
7. **Delivery**: User downloads/plays generated game
8. **Sharing**: User shares game on social media

## Content Strategy

### Manual Pixel Art Workflow
- Internal artist creates pixel art from user photos
- Standard sprite sheets (idle, run, jump, special)
- Multiple art styles available
- 24-48 hour turnaround commitment
- Quality approval process

### Game Templates
- Pet Platformer (primary template)
- 3 difficulty levels (Easy, Medium, Hard)
- 5 world themes (Garden, House, Beach, Space, Park)
- 3-10 levels per game
- Customizable abilities and physics

## Revenue Model

### Base Game + Add-On Structure (No Subscriptions)
- **Base Game**: $14.99 (3 levels, 1 theme, standard abilities)
- **Add-On Content**:
  - Extra Level Packs: $2-5 each (3-5 levels per pack)
  - New Themes: $3-7 each (Beach, Space, House, Park, Garden)
  - Special Abilities: $2-4 each (Double jump, dash, wall climb, glide)
  - Premium Features: $5-10 each (Custom physics, boss battles, special mechanics)

### Revenue Projections (Manual Phase)
- **Base Revenue**: 20 customers × $14.99 = $300 base
- **Add-On Revenue**: 50% customers buy $10-25 in add-ons = $100-250 additional  
- **Total Month 1**: $400-550 (improved from previous $400)
- **Customer LTV**: $25-40 average (vs. previous $20 one-time)
- **Advantages**: Multiple revenue touchpoints, higher engagement, content scalability

## Phase 2: AI Automation Roadmap

**After Manual Phase Success**:
- Implement Stable Diffusion pixel art generation
- Background removal automation
- Reduced generation time to <3 minutes
- Scale to 1000+ monthly customers
- Expand to multiple game types

## Next Steps

1. **Development Priority**: Begin with E001 (User Auth) and E002 (File Upload)
2. **Design Priority**: Create manual pixel art workflow and admin tools
3. **Business Priority**: Establish artist workflow and customer service process
4. **Marketing Priority**: Landing page optimization and early user acquisition

---

*This PRD prioritizes speed to market with manual processes, establishing revenue and customer validation before investing in complex AI automation.*