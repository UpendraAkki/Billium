import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Github } from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { generatePDFFromElement } from '../utils/pdfGenerator';
import { templates } from '../utils/templateRegistry';

const TemplatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [formData, setFormData] = useState(null);
  const [currentTemplate, setCurrentTemplate] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.formData) {
      setFormData(location.state.formData);
      setCurrentTemplate(location.state.selectedTemplate || 1);
    } else {
      const savedFormData = localStorage.getItem('formData');
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
    }
  }, [location.state]);

  const handleTemplateChange = (templateNumber) => {
    setCurrentTemplate(templateNumber);
  };

  const handleDownloadPDF = async () => {
    if (formData && !isDownloading && pdfRef.current) {
      setIsDownloading(true);
      try {
        await generatePDFFromElement(pdfRef.current, formData, currentTemplate);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-gray-500">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={handleBack} className="btn-ghost flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </button>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/UpendraAkki/Billium"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Star on GitHub</span>
            </a>
            <a
              href="https://github.com/UpendraAkki/Billium"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost inline-flex sm:hidden items-center justify-center text-sm text-gray-500"
              aria-label="Star Billium on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {isDownloading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Download className="w-4 h-4" /> Download PDF</>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        {/* Template Selector */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Templates</h2>
          <div className="flex gap-3 overflow-x-auto pb-3">
            {templates.map((template, index) => (
              <button
                key={index}
                className={`template-thumb flex-shrink-0 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                  ${currentTemplate === index + 1
                    ? 'active border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                onClick={() => handleTemplateChange(index + 1)}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        {/* Visible Preview (scaled down to fit viewport) */}
        <div className="bg-gray-100 rounded-2xl p-6 flex justify-center">
          <div className="rounded-xl shadow-2xl overflow-hidden" style={{ width: 600, height: 848 }}>
            <div style={{
              transform: 'scale(0.7556)',
              transformOrigin: 'top left',
              width: 794,
              height: 1123,
            }}>
              <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size template for PDF capture */}
      <div
        ref={pdfRef}
        style={{ position: 'fixed', left: -9999, top: 0, width: 794, height: 1123, zIndex: -9999, overflow: 'hidden' }}
      >
        <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
      </div>
    </div>
  );
};

export default TemplatePage;
