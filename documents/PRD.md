# Product Requirements Document: Career Reimagined

## 1. Overview
Career Reimagined is a web application that allows users to upload a photo of themselves (or their pet) and visualize themselves in various professional or fictional careers. Beyond the visual transformation, the app generates a satirical or serious 8-week career transition plan, complete with resources, network suggestions, and actionable steps.

## 2. Target Audience
- **Job Seekers:** Looking for motivation or a fun way to visualize a career pivot.
- **Pet Owners:** Wanting to create funny memes or portraits of their pets in human jobs.
- **General Users:** Seeking entertainment and social media content.

## 3. Core Features

### 3.1. User Input
- **Photo Upload:** Drag & drop interface for uploading JPEG/PNG/WEBP images (max 5MB).
- **Career Selection:** Users can input up to 4 specific careers or use an "I'm Feeling Lucky" button to generate random suggestions.

### 3.2. Image Generation
- **AI Model:** Utilizes Google Gemini (`gemini-2.5-flash-image`) to generate photorealistic transformations.
- **Context Preservation:** Maintains the subject's facial features while replacing attire and background to match the chosen career.

### 3.3. Career Plan Generation
- **AI Model:** Utilizes Google Gemini (`gemini-2.5-flash`) to generate structured JSON data.
- **Dual Mode:** 
  - **Real Careers:** Professional advice, real courses with links, real company names.
  - **Fictional Careers:** Satirical tone, made-up but plausible-sounding resources and experts.
- **Content:**
  - 8-Week Roadmap (Goals, Action Items).
  - Key Skills.
  - Recommended Courses (hyperlinked).
  - Thought Leaders (hyperlinked).
  - Target Companies (hyperlinked).

### 3.4. Output & Interaction
- **Gallery View:** View all generated career images side-by-side.
- **Plan View:** Detailed view of the career transition plan.
- **Persistence:** Generated plans are cached locally during the session so users can switch between gallery and plans without regeneration.
- **Export:**
  - Download individual images.
  - Export full career plan as a PDF (Page 1: Headshot, Page 2+: Plan details).

### 3.5. Design System
- **Theme:** "Evergreen" (Primary color: `#082D0F`).
- **Typography:** Inter (Sans-serif).
- **Styling:** Tailwind CSS with custom configuration.

## 4. Technical Requirements
- **Frontend:** React (TypeScript).
- **Styling:** Tailwind CSS.
- **AI Integration:** Google GenAI SDK (`@google/genai`).
- **PDF Generation:** `jspdf` + `html2canvas`.
- **Icons:** `lucide-react`.

## 5. Future Roadmap
- **Social Sharing:** Direct share to Instagram/LinkedIn.
- **User Accounts:** Save history across sessions.
- **Custom Plan Editing:** Allow users to tweak the generated plan.
- **Course Integration:** Real-time API integration with course providers (Udemy, Coursera) for live pricing/links.
