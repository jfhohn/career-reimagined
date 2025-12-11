# Project Structure

## Directory Layout

```
/
├── index.html              # Entry point, Tailwind config, Import map
├── index.tsx               # React root mount
├── App.tsx                 # Main application controller/layout
├── types.ts                # TypeScript interfaces (CareerPlan, CareerImage, etc.)
├── constants.ts            # Configuration constants (Max careers, suggestions)
├── services/
│   └── geminiService.ts    # API interaction with Google Gemini
├── components/
│   ├── UploadSection.tsx   # File upload drag-and-drop area
│   ├── CareerSelection.tsx # Form to add careers
│   ├── LoadingOverlay.tsx  # Visual loading state
│   ├── ImageGallery.tsx    # Grid view of generated images
│   └── PlanDisplay.tsx     # Detailed view of career plan + PDF export
└── documents/
    ├── PRD.md              # Product Requirements
    └── project_structure.md # This file
```

## Data Flow

1.  **App.tsx**: Holds global state (`inputImage`, `careers`, `generatedImages`, `careerPlans`).
2.  **Upload**: User uploads image -> converted to base64 -> stored in `App` state.
3.  **Generation (Image)**: 
    - `App` calls `geminiService.generateCareerImage` for each career in parallel.
    - Results populate `generatedImages` array.
4.  **Selection**: User clicks an image in `ImageGallery`.
5.  **Generation (Plan)**:
    - Check `careerPlans` cache.
    - If miss: `App` calls `geminiService.generateCareerPlan`.
    - Result stored in `careerPlans` and set as `selectedPlan`.
6.  **Display**: `PlanDisplay` renders `selectedPlan`.
7.  **Export**: `PlanDisplay` uses `html2canvas` to capture the DOM and `jspdf` to bundle it into a downloadable file.

## Dependencies

- **React 19**: UI Framework.
- **Tailwind CSS**: Utility-first styling (loaded via CDN).
- **@google/genai**: Interaction with Gemini 2.5 Flash models.
- **Lucide React**: Icons.
- **html2canvas & jspdf**: PDF generation utilities.

## Key Design Decisions

- **Client-Side Processing**: PDF generation happens entirely in the browser to avoid backend complexity.
- **Session Caching**: Plans are cached in React state. A refresh clears the data (stateless backend).
- **Strict Schema**: Gemini output is forced into a JSON schema to ensure UI consistency, with fallback logic for URLs (Google Search) if the model doesn't provide them.
