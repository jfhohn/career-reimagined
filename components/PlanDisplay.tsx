import React, { useState } from 'react';
import { CareerPlan, LinkableItem } from '../types';
import { CheckCircle2, BookOpen, Building, User, Target, Calendar, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PlanDisplayProps {
  plan: CareerPlan;
  careerImage: string;
  onBack: () => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, careerImage, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // A4 Settings
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2); // 170mm

      let cursorY = margin;

      // --- PAGE 1: Cover Page ---
      
      // Title
      doc.setFontSize(26);
      doc.setTextColor(8, 45, 15); // #082D0F
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(plan.career, contentWidth);
      doc.text(titleLines, pageWidth / 2, cursorY + 10, { align: 'center' });
      cursorY += 15 + (titleLines.length * 10);

      // Intro
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const introLines = doc.splitTextToSize(plan.intro, contentWidth);
      doc.text(introLines, margin, cursorY);
      cursorY += (introLines.length * 5) + 15;

      // Image
      const img = new Image();
      img.src = careerImage;
      await new Promise((resolve) => { 
        img.onload = resolve;
        img.onerror = resolve; // Fallback
      });

      const maxImgHeight = pageHeight - cursorY - margin;
      let renderW = contentWidth;
      let renderH = (img.height * contentWidth) / img.width;

      if (renderH > maxImgHeight) {
        renderH = maxImgHeight;
        renderW = (img.width * maxImgHeight) / img.height;
      }
      
      const xOffset = (pageWidth - renderW) / 2;
      doc.addImage(careerImage, 'PNG', xOffset, cursorY, renderW, renderH);


      // --- PAGE 2+: Content ---
      
      const captureAndAdd = async (elementId: string) => {
        const el = document.getElementById(elementId);
        if (!el) return;

        // Capture settings
        const canvas = await html2canvas(el, { 
            scale: 3, // Higher scale for better text resolution
            useCORS: true, 
            backgroundColor: '#ffffff',
            // Ensure full height capture
            windowWidth: 1000 
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgHeightInPdf = (canvas.height * contentWidth) / canvas.width;
        
        // Page break logic
        // Check if adding this image exceeds page height
        if (cursorY + imgHeightInPdf > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }

        doc.addImage(imgData, 'PNG', margin, cursorY, contentWidth, imgHeightInPdf);
        cursorY += imgHeightInPdf + 5; // Spacing between blocks
      };

      doc.addPage();
      cursorY = margin;
      
      doc.setFontSize(16);
      doc.setTextColor(8, 45, 15);
      doc.setFont("helvetica", "bold");
      doc.text("Professional Profile", margin, cursorY);
      cursorY += 8;

      await captureAndAdd('print-skills');
      await captureAndAdd('print-resources');
      await captureAndAdd('print-network-leaders');
      await captureAndAdd('print-network-companies');

      // Roadmap Header Check
      if (cursorY + 25 > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      } else {
        cursorY += 5;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(8, 45, 15);
      doc.text("8-Week Roadmap", margin, cursorY);
      cursorY += 8;

      for (const week of plan.weeks) {
        await captureAndAdd(`print-week-${week.weekNumber}`);
      }

      doc.save(`${plan.career.replace(/\s+/g, '_')}_Plan.pdf`);

    } catch (error) {
      console.error("PDF Export failed", error);
      alert("Could not export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const renderLink = (item: LinkableItem) => (
    <a 
        href={item.url || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="text-evergreen-600 hover:text-evergreen-800 hover:underline transition-colors block break-words"
    >
        {item.title}
    </a>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-evergreen-900 transition-colors">
            ← Back to Gallery
        </button>
        <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-evergreen-900 text-white rounded-lg hover:bg-evergreen-800 disabled:opacity-50 transition-colors shadow-md"
        >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
        </button>
      </div>

      {/* Screen Display */}
      <div className="relative bg-white rounded-3xl p-8 shadow-sm border border-slate-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-evergreen-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 shrink-0 rounded-xl overflow-hidden shadow-lg border-2 border-white">
                <img src={careerImage} alt={plan.career} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                     <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        {plan.career}
                    </h1>
                    {plan.isFictional && (
                        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold rotate-3 shadow-sm border border-yellow-200 whitespace-nowrap">
                            Satirical Mode Active
                        </div>
                    )}
                </div>
                <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                    {plan.intro}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
              {/* Skills */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                      <Target className="w-5 h-5 text-evergreen-600" />
                      Key Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {plan.skillsToDevelop.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-evergreen-50 text-evergreen-800 text-sm rounded-md font-medium">
                              {skill}
                          </span>
                      ))}
                  </div>
              </div>

              {/* Resources */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                      <BookOpen className="w-5 h-5 text-evergreen-600" />
                      Learn From
                  </h3>
                  <ul className="space-y-3">
                      {plan.recommendedCourses.map((course, i) => (
                          <li key={i} className="text-sm text-slate-600 border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                              {renderLink(course)}
                          </li>
                      ))}
                  </ul>
              </div>

              {/* Network */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                      <User className="w-5 h-5 text-evergreen-600" />
                      Network
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Thought Leaders</h4>
                          <div className="flex flex-wrap gap-2">
                              {plan.thoughtLeaders.map((leader, i) => (
                                  <span key={i} className="text-sm">
                                      {renderLink(leader)}
                                      {i < plan.thoughtLeaders.length - 1 && <span className="text-slate-300 ml-1">|</span>}
                                  </span>
                              ))}
                          </div>
                      </div>
                      <div>
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Building className="w-3 h-3" /> Target Companies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {plan.targetCompanies.map((company, i) => (
                                  <span key={i} className="text-sm">
                                      {renderLink(company)}
                                      {i < plan.targetCompanies.length - 1 && <span className="text-slate-300 ml-1">|</span>}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="md:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-evergreen-600" />
                  8-Week Roadmap
              </h2>
              <div className="space-y-4">
                  {plan.weeks.map((week) => (
                      <div key={week.weekNumber} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-evergreen-300 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                              <span className="inline-block px-3 py-1 bg-evergreen-900 text-white text-xs font-bold rounded-full w-fit">
                                  Week {week.weekNumber}
                              </span>
                              <h3 className="text-lg font-bold text-evergreen-800">{week.theme}</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Key Goals</h4>
                                  <ul className="space-y-1">
                                      {week.goals.map((goal, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                              <CheckCircle2 className="w-4 h-4 text-evergreen-500 shrink-0 mt-0.5" />
                                              {goal}
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                              <div>
                                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Action Items</h4>
                                  <ul className="space-y-1">
                                      {week.actionItems.map((item, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                              <span className="block w-1.5 h-1.5 rounded-full bg-evergreen-400 mt-1.5 shrink-0" />
                                              {item}
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* 
        PRINT TEMPLATE
        - Layout: Single column vertical stacks for reliability.
        - Width: 640px (Matches A4 170mm content width @ ~96dpi to prevent scaling artifacts).
        - Padding: Generous internal padding + bottom spacer to prevent clipping.
        - Typography: Relaxed line height and specific fonts.
      */}
      <div className="fixed left-[-9999px] top-0 w-[640px] bg-white text-slate-900 pointer-events-none font-sans antialiased">
        
        {/* Skills */}
        <div id="print-skills" className="mb-6 p-6 border border-slate-300 rounded-lg bg-white">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                <Target className="w-6 h-6 text-evergreen-700" /> Key Skills
            </h3>
            <div className="flex flex-wrap gap-3">
                {plan.skillsToDevelop.map((skill, i) => (
                    <span key={i} className="px-3 py-2 bg-slate-50 text-slate-800 text-sm font-medium rounded border border-slate-200">
                        {skill}
                    </span>
                ))}
            </div>
            {/* Spacer for safety */}
            <div className="h-2 w-full"></div>
        </div>

        {/* Resources */}
        <div id="print-resources" className="mb-6 p-6 border border-slate-300 rounded-lg bg-white">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                <BookOpen className="w-6 h-6 text-evergreen-700" /> Learn From
            </h3>
            <ul className="flex flex-col gap-4">
                {plan.recommendedCourses.map((course, i) => (
                    <li key={i} className="flex flex-col gap-1 pb-1">
                         <div className="font-bold text-slate-800 text-base leading-snug">{course.title}</div>
                         <div className="text-sm text-slate-500 break-words leading-snug">{course.url}</div>
                    </li>
                ))}
            </ul>
             <div className="h-2 w-full"></div>
        </div>

        {/* Network - Leaders */}
        <div id="print-network-leaders" className="mb-6 p-6 border border-slate-300 rounded-lg bg-white">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                <User className="w-6 h-6 text-evergreen-700" /> Network & Thought Leaders
            </h3>
            <ul className="flex flex-col gap-3">
                {plan.thoughtLeaders.map((leader, i) => (
                    <li key={i} className="text-sm text-slate-800 flex items-start gap-3 leading-snug pb-1">
                        <div className="w-2 h-2 rounded-full bg-evergreen-500 mt-1.5 shrink-0" />
                        <span className="font-medium">{leader.title}</span>
                    </li>
                ))}
            </ul>
             <div className="h-2 w-full"></div>
        </div>

        {/* Network - Companies */}
        <div id="print-network-companies" className="mb-6 p-6 border border-slate-300 rounded-lg bg-white">
             <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                <Building className="w-6 h-6 text-evergreen-700" /> Target Companies
            </h3>
             <ul className="flex flex-col gap-3">
                {plan.targetCompanies.map((company, i) => (
                    <li key={i} className="text-sm text-slate-800 flex items-start gap-3 leading-snug pb-1">
                        <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <span className="font-medium">{company.title}</span>
                    </li>
                ))}
            </ul>
             <div className="h-2 w-full"></div>
        </div>

        {/* Weeks */}
        {plan.weeks.map((week) => (
            <div id={`print-week-${week.weekNumber}`} key={week.weekNumber} className="mb-4 bg-white p-6 rounded-lg border border-slate-300">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block px-3 py-1 bg-evergreen-800 text-white text-sm font-bold rounded uppercase tracking-wider">
                        Week {week.weekNumber}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">{week.theme}</h3>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Key Goals</h4>
                        <ul className="space-y-3">
                            {week.goals.map((goal, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-snug">
                                    <CheckCircle2 className="w-4 h-4 text-evergreen-600 shrink-0 mt-0.5" />
                                    <span>{goal}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Action Items</h4>
                        <ul className="space-y-3">
                            {week.actionItems.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-snug">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                 <div className="h-2 w-full"></div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default PlanDisplay;
