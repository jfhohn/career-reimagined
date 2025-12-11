import React, { useState } from 'react';
import { AppStep, CareerImage, CareerPlan } from './types';
import { generateCareerImage, generateCareerPlan, fileToBase64, detectSubjectType } from './services/geminiService';
import UploadSection from './components/UploadSection';
import CareerSelection from './components/CareerSelection';
import LoadingOverlay from './components/LoadingOverlay';
import ImageGallery from './components/ImageGallery';
import PlanDisplay from './components/PlanDisplay';
import { Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [subjectDescription, setSubjectDescription] = useState<string>("Human"); // Default to Human
  const [careers, setCareers] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<CareerImage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CareerPlan | null>(null);
  const [selectedCareerImage, setSelectedCareerImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  
  // Cache for generated plans
  const [careerPlans, setCareerPlans] = useState<Record<string, CareerPlan>>({});

  const handleImageSelected = async (file: File) => {
    setInputImage(file);
    setLoadingMessage("Analyzing subject...");
    try {
      const base64 = await fileToBase64(file);
      setImageBase64(base64);
      
      // Detect subject (Human vs Pet type)
      const subject = await detectSubjectType(base64);
      setSubjectDescription(subject);
      console.log("Detected subject:", subject);

      setStep(AppStep.UPLOAD);
    } catch (e) {
      console.error("Error processing image", e);
      alert("Could not process image.");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleGenerateImages = async () => {
    if (!imageBase64 || careers.length === 0) return;

    setStep(AppStep.GENERATING_IMAGES);
    setLoadingMessage(`Reimagining your ${subjectDescription}...`);
    
    // Initialize placeholders
    const placeholders: CareerImage[] = careers.map(c => ({
      id: crypto.randomUUID(),
      career: c,
      imageUrl: '',
      loading: true
    }));
    setGeneratedImages(placeholders);

    // Process in parallel but handle failures gracefully
    const promises = careers.map(async (career, index) => {
      try {
        const imageUrl = await generateCareerImage(imageBase64, career, subjectDescription, inputImage?.type);
        setGeneratedImages(prev => prev.map(img => 
          img.career === career ? { ...img, imageUrl, loading: false } : img
        ));
      } catch (error) {
        setGeneratedImages(prev => prev.map(img => 
          img.career === career ? { ...img, loading: false, error: "Failed to generate." } : img
        ));
      }
    });

    await Promise.all(promises);
    setLoadingMessage(null);
    setStep(AppStep.GALLERY);
  };

  const handleSelectCareer = async (career: string) => {
    // Find associated image
    const img = generatedImages.find(i => i.career === career);
    if (img) setSelectedCareerImage(img.imageUrl);

    // Check cache first
    if (careerPlans[career]) {
        setSelectedPlan(careerPlans[career]);
        setStep(AppStep.PLAN_VIEW);
        return;
    }

    setStep(AppStep.GENERATING_PLAN);
    setLoadingMessage(`Drafting plan for ${subjectDescription} as ${career}...`);
    
    try {
      const plan = await generateCareerPlan(career, subjectDescription);
      // Update cache
      setCareerPlans(prev => ({ ...prev, [career]: plan }));
      setSelectedPlan(plan);
      setStep(AppStep.PLAN_VIEW);
    } catch (e) {
      console.error(e);
      alert("Failed to generate plan. Please try again.");
      setStep(AppStep.GALLERY);
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleRetry = () => {
    setInputImage(null);
    setImageBase64(null);
    setSubjectDescription("Human");
    setCareers([]);
    setGeneratedImages([]);
    setSelectedPlan(null);
    setCareerPlans({}); 
    setStep(AppStep.UPLOAD);
  };

  const handleBackToGallery = () => {
    setStep(AppStep.GALLERY);
  };

  return (
    <div className="min-h-screen bg-evergreen-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleRetry}>
            <div className="w-8 h-8 bg-evergreen-900 rounded-lg flex items-center justify-center text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">Career Reimagined</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8">
        
        {step === AppStep.UPLOAD && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-fade-in">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        See yourself (or your pet) in a new light.
                    </h1>
                    <p className="text-lg text-slate-600">
                        Upload a photo and let AI reimagine the professional future—whether it's becoming a CEO, a Pilot, or a Space Ranger.
                    </p>
                </div>
                
                {!inputImage ? (
                    <>
                        <UploadSection onImageSelected={handleImageSelected} />
                        {loadingMessage && (
                            <div className="mt-4 flex items-center gap-2 text-evergreen-800 font-medium animate-pulse">
                                Analyzing image subject...
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center space-y-8 animate-fade-in">
                         <div className="relative group flex flex-col items-center gap-2">
                            <img 
                                src={URL.createObjectURL(inputImage)} 
                                alt="Original" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <div className="bg-evergreen-100 text-evergreen-900 text-xs font-bold px-3 py-1 rounded-full border border-evergreen-200">
                                Detected: {subjectDescription}
                            </div>
                            <button 
                                onClick={() => setInputImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <CareerSelection 
                            careers={careers} 
                            setCareers={setCareers} 
                            onGenerate={handleGenerateImages} 
                        />
                    </div>
                )}
            </div>
        )}

        {step === AppStep.GENERATING_IMAGES && loadingMessage && (
            <LoadingOverlay message={loadingMessage} subMessage="This takes a few seconds..." />
        )}

        {step === AppStep.GALLERY && (
            <ImageGallery 
                images={generatedImages} 
                onSelectCareer={handleSelectCareer} 
                onRetry={handleRetry}
            />
        )}

        {step === AppStep.GENERATING_PLAN && loadingMessage && (
             <LoadingOverlay message={loadingMessage} subMessage="Consulting the experts..." />
        )}

        {step === AppStep.PLAN_VIEW && selectedPlan && selectedCareerImage && (
            <PlanDisplay 
                plan={selectedPlan} 
                careerImage={selectedCareerImage}
                onBack={handleBackToGallery} 
            />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Career Reimagined. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
