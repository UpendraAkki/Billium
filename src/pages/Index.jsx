import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  ClipboardList,
  Palette,
  Eye,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  FileText,
  Sparkles,
  RotateCcw,
  Upload,
  X,
  Loader2,
  Github,
} from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../utils/formatCurrency';
import { templates } from '../utils/templateRegistry';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { generatePDFFromElement } from '../utils/pdfGenerator';

// ─── Constants ──────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, title: 'Business', icon: Building2, subtitle: 'Your company' },
  { id: 1, title: 'Client', icon: Users, subtitle: 'Who to bill' },
  { id: 2, title: 'Invoice', icon: ClipboardList, subtitle: 'Items & pricing' },
  { id: 3, title: 'Design', icon: Palette, subtitle: 'Customize' },
  { id: 4, title: 'Preview', icon: Eye, subtitle: 'Download' },
];

const NOTE_OPTIONS = [
  "Thank you for choosing us! We hope your experience was pleasant and seamless.",
  "Your purchase supports our community! Thank you for being a part of our journey.",
  "We value your feedback! Help us improve by sharing your thoughts.",
  "Save more with our loyalty program! Ask about it on your next visit.",
  "Need assistance? We're here to help! Reach out to our customer support.",
  "Keep this receipt for returns or exchanges within 30 days.",
  "Every purchase makes a difference! Thank you for supporting sustainability.",
  "Have a great day! Thank you for your business.",
  "Thank you for shopping with us. We look forward to serving you again!",
  "Your satisfaction is our top priority. Don't hesitate to contact us.",
];

const generateRandomInvoiceNumber = () => {
  const length = Math.floor(Math.random() * 6) + 3;
  const alphabetCount = Math.min(Math.floor(Math.random() * 4), length);
  let result = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  for (let i = 0; i < alphabetCount; i++) result += alphabet[Math.floor(Math.random() * alphabet.length)];
  for (let i = alphabetCount; i < length; i++) result += numbers[Math.floor(Math.random() * numbers.length)];
  return result;
};

// ─── Reusable Input ─────────────────────────────────────────────────────────────

const ModernInput = ({ label, id, type = 'text', value, onChange, name, disabled = false, placeholder, className = '', min, max, step: stepProp }) => (
  <div className={className}>
    {label && <label htmlFor={id} className="label-modern">{label}</label>}
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder || label}
      min={min}
      max={max}
      step={stepProp}
      className="input-modern"
      autoComplete="off"
      spellCheck="false"
    />
  </div>
);

// ─── Step Indicator ─────────────────────────────────────────────────────────────

const StepIndicator = ({ steps, currentStep, onStepClick }) => (
  <div className="flex items-center justify-center gap-0 w-full max-w-2xl mx-auto mb-8">
    {steps.map((step, index) => {
      const Icon = step.icon;
      const isActive = currentStep === index;
      const isCompleted = currentStep > index;
      const isClickable = index <= currentStep;

      return (
        <React.Fragment key={step.id}>
          <button
            onClick={() => isClickable && onStepClick(index)}
            className={`flex flex-col items-center gap-1.5 group relative cursor-pointer
              ${isClickable ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
            disabled={!isClickable}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
              ${isCompleted
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                  : 'bg-gray-100 text-gray-400'
              }`}>
              {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold transition-colors ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                {step.title}
              </p>
              <p className="text-[10px] text-gray-400 hidden sm:block">{step.subtitle}</p>
            </div>
          </button>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mt-[-20px] rounded-full transition-colors duration-300
              ${currentStep > index ? 'bg-emerald-400' : 'bg-gray-200'}`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────

const Index = () => {
  const navigate = useNavigate();
  const pdfRef = useRef(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form state
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [billTo, setBillTo] = useState({ name: '', address: '', phone: '' });
  const [shipTo, setShipTo] = useState({ name: '', address: '', phone: '' });
  const [copyBillToShip, setCopyBillToShip] = useState(false);
  const [invoice, setInvoice] = useState({ date: '', paymentDate: '', number: '' });
  const [yourCompany, setYourCompany] = useState({ name: '', address: '', phone: '', email: '', website: '', logo: '' });
  const [items, setItems] = useState([{ name: '', description: '', quantity: 0, amount: 0, total: 0 }]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [notes, setNotes] = useState('');
  const [branding, setBranding] = useState({
    primaryColor: '#4F46E5',
    secondaryColor: '#1E40AF',
    accentColor: '#EF4444',
    fontFamily: 'Inter',
    logoPosition: 'left',
    showLogo: true,
  });

  // Preview state
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  // ─── Data persistence ──────────────────────────────────────────────────────

  useEffect(() => {
    const savedFormData = localStorage.getItem('formData');
    if (savedFormData) {
      const d = JSON.parse(savedFormData);
      setBillTo(d.billTo || { name: '', address: '', phone: '' });
      setShipTo(d.shipTo || { name: '', address: '', phone: '' });
      setInvoice(d.invoice || { date: '', paymentDate: '', number: '' });
      setYourCompany(d.yourCompany || { name: '', address: '', phone: '', email: '', website: '', logo: '' });
      setItems(d.items?.length ? d.items : [{ name: '', description: '', quantity: 0, amount: 0, total: 0 }]);
      setTaxPercentage(d.taxPercentage || 0);
      setNotes(d.notes || '');
      setSelectedCurrency(d.selectedCurrency || 'INR');
      setBranding(d.branding || branding);
    } else {
      setInvoice(prev => ({ ...prev, number: generateRandomInvoiceNumber() }));
    }
  }, []);

  useEffect(() => {
    const formData = { billTo, shipTo, invoice, yourCompany, items, taxPercentage, taxAmount, subTotal, grandTotal, notes, selectedCurrency, branding };
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [billTo, shipTo, invoice, yourCompany, items, taxPercentage, taxAmount, subTotal, grandTotal, notes, selectedCurrency, branding]);

  // ─── Calculations ──────────────────────────────────────────────────────────

  const updateTotals = useCallback(() => {
    const st = items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
    const ta = (st * taxPercentage) / 100;
    const gt = st + ta;
    setSubTotal(st);
    setTaxAmount(ta);
    setGrandTotal(gt);
  }, [items, taxPercentage]);

  useEffect(() => { updateTotals(); }, [items, taxPercentage, updateTotals]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'amount') {
      newItems[index].total = newItems[index].quantity * newItems[index].amount;
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', description: '', quantity: 0, amount: 0, total: 0 }]);

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setYourCompany(prev => ({ ...prev, logo: event.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleBrandingChange = (field, value) => setBranding(prev => ({ ...prev, [field]: value }));

  const refreshNotes = () => setNotes(NOTE_OPTIONS[Math.floor(Math.random() * NOTE_OPTIONS.length)]);

  const handleCopyBillToShip = (checked) => {
    setCopyBillToShip(checked);
    if (checked) setShipTo({ ...billTo });
  };

  // ─── Wizard Navigation ────────────────────────────────────────────────────

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    }
  };

  const goToStep = (step) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    scrollToTop();
  };

  // ─── Form Data ─────────────────────────────────────────────────────────────

  const getFormData = () => ({
    billTo, shipTo, invoice, yourCompany, items,
    taxPercentage, taxAmount, subTotal, grandTotal,
    notes, selectedCurrency, branding,
  });

  // ─── PDF Download ──────────────────────────────────────────────────────────

  const handleDownloadPDF = async () => {
    if (isDownloading || !pdfRef.current) return;
    setIsDownloading(true);
    try {
      await generatePDFFromElement(pdfRef.current, getFormData(), selectedTemplate);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── Utility Actions ──────────────────────────────────────────────────────

  const fillDummyData = () => {
    setYourCompany({ name: 'Acme Corp', address: '789 Oak St, Businessville, USA', phone: '(555) 555-5555', email: 'hello@acmecorp.com', website: 'www.acmecorp.com', logo: '' });
    setBillTo({ name: 'John Doe', address: '123 Main St, Anytown, USA', phone: '(555) 123-4567' });
    setShipTo({ name: 'Jane Smith', address: '456 Elm St, Othertown, USA', phone: '(555) 987-6543' });
    setInvoice({ date: new Date().toISOString().split('T')[0], paymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], number: generateRandomInvoiceNumber() });
    setItems([
      { name: 'Product A', description: 'High-quality item', quantity: 2, amount: 50, total: 100 },
      { name: 'Service B', description: 'Professional service', quantity: 1, amount: 200, total: 200 },
      { name: 'Product C', description: 'Another great product', quantity: 3, amount: 30, total: 90 },
    ]);
    setTaxPercentage(10);
    setNotes('Thank you for your business! Payment is due within 30 days.');
  };

  const clearForm = () => {
    setBillTo({ name: '', address: '', phone: '' });
    setShipTo({ name: '', address: '', phone: '' });
    setInvoice({ date: '', paymentDate: '', number: generateRandomInvoiceNumber() });
    setYourCompany({ name: '', address: '', phone: '', email: '', website: '', logo: '' });
    setItems([{ name: '', description: '', quantity: 0, amount: 0, total: 0 }]);
    setTaxPercentage(0);
    setNotes('');
    setCurrentStep(0);
    localStorage.removeItem('formData');
  };

  const currencySymbol = getCurrencySymbol(selectedCurrency);

  // ─── Step Content Renderers ────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-500" /> Company Information
        </h2>
        <div className="card-section space-y-4">
          <ModernInput label="Company Name" id="companyName" name="name" value={yourCompany.name} onChange={handleInputChange(setYourCompany)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernInput label="Phone" id="companyPhone" name="phone" value={yourCompany.phone} onChange={handleInputChange(setYourCompany)} />
            <ModernInput label="Email" id="companyEmail" name="email" type="email" value={yourCompany.email} onChange={handleInputChange(setYourCompany)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernInput label="Website" id="companyWebsite" name="website" value={yourCompany.website} onChange={handleInputChange(setYourCompany)} />
            <ModernInput label="Address" id="companyAddress" name="address" value={yourCompany.address} onChange={handleInputChange(setYourCompany)} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-500" /> Company Logo
        </h2>
        <div className="card-section">
          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload logo</span>
              </div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {yourCompany.logo && (
              <div className="relative">
                <img src={yourCompany.logo} alt="Logo" className="w-16 h-16 object-contain border rounded-xl bg-white p-1" />
                <button
                  onClick={() => setYourCompany(prev => ({ ...prev, logo: '' }))}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <span className="text-lg">💰</span> Currency
        </h2>
        <div className="card-section">
          <div className="flex gap-3">
            {[{ code: 'INR', symbol: '₹', label: 'Indian Rupee' }, { code: 'USD', symbol: '$', label: 'US Dollar' }].map(c => (
              <button
                key={c.code}
                onClick={() => setSelectedCurrency(c.code)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-medium
                  ${selectedCurrency === c.code
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
              >
                <span className="text-xl">{c.symbol}</span>
                <span className="text-sm">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> Bill To
        </h2>
        <div className="card-section space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernInput label="Client Name" id="billToName" name="name" value={billTo.name} onChange={handleInputChange(setBillTo)} />
            <ModernInput label="Phone" id="billToPhone" name="phone" value={billTo.phone} onChange={handleInputChange(setBillTo)} />
          </div>
          <ModernInput label="Address" id="billToAddress" name="address" value={billTo.address} onChange={handleInputChange(setBillTo)} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0 flex items-center gap-2">
            <span className="text-lg">📦</span> Ship To
          </h2>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={copyBillToShip}
              onChange={(e) => handleCopyBillToShip(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-500">Same as Bill To</span>
          </label>
        </div>
        <div className="card-section space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernInput label="Recipient Name" id="shipToName" name="name" value={shipTo.name} onChange={handleInputChange(setShipTo)} />
            <ModernInput label="Phone" id="shipToPhone" name="phone" value={shipTo.phone} onChange={handleInputChange(setShipTo)} />
          </div>
          <ModernInput label="Address" id="shipToAddress" name="address" value={shipTo.address} onChange={handleInputChange(setShipTo)} />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-500" /> Invoice Details
        </h2>
        <div className="card-section">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ModernInput label="Invoice Number" id="invoiceNumber" name="number" value={invoice.number} onChange={handleInputChange(setInvoice)} />
            <ModernInput label="Invoice Date" id="invoiceDate" name="date" type="date" value={invoice.date} onChange={handleInputChange(setInvoice)} />
            <ModernInput label="Payment Due" id="paymentDate" name="paymentDate" type="date" value={invoice.paymentDate} onChange={handleInputChange(setInvoice)} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">Line Items</h2>
          <button onClick={addItem} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="card-section relative group">
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">{index + 1}</span>
                <span className="text-sm font-medium text-gray-500">Item</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ModernInput label="Name" id={`itemName${index}`} value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
                <ModernInput label="Qty" id={`itemQty${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} min="0" />
                <ModernInput label={`Rate (${currencySymbol})`} id={`itemRate${index}`} type="number" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)} min="0" />
                <ModernInput label={`Total (${currencySymbol})`} id={`itemTotal${index}`} type="number" value={(item.quantity * item.amount).toFixed(2)} disabled />
              </div>
              <div className="mt-3">
                <ModernInput label="Description (optional)" id={`itemDesc${index}`} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="section-title">Summary</h2>
        <div className="card-section space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subTotal, selectedCurrency)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Tax Rate</span>
              <input
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                min="0"
                max="100"
                step="0.5"
              />
              <span className="text-sm text-gray-400">%</span>
            </div>
            <span className="font-semibold">{formatCurrency(taxAmount, selectedCurrency)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Grand Total</span>
            <span className="text-xl font-bold text-indigo-600">{formatCurrency(grandTotal, selectedCurrency)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-500" /> Brand Colors
        </h2>
        <div className="card-section">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'primaryColor', label: 'Primary' },
              { key: 'secondaryColor', label: 'Secondary' },
              { key: 'accentColor', label: 'Accent' },
            ].map(c => (
              <div key={c.key}>
                <label className="label-modern">{c.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding[c.key]}
                    onChange={(e) => handleBrandingChange(c.key, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={branding[c.key]}
                    onChange={(e) => handleBrandingChange(c.key, e.target.value)}
                    className="flex-1 input-modern text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title">Typography & Layout</h2>
        <div className="card-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-modern">Font Family</label>
              <select
                value={branding.fontFamily}
                onChange={(e) => handleBrandingChange('fontFamily', e.target.value)}
                className="input-modern"
              >
                <option value="Inter">Inter (Modern)</option>
                <option value="Arial">Arial (Classic)</option>
                <option value="Helvetica">Helvetica (Clean)</option>
                <option value="Times New Roman">Times New Roman (Traditional)</option>
                <option value="Georgia">Georgia (Elegant)</option>
                <option value="Roboto">Roboto (Technical)</option>
              </select>
            </div>
            <div>
              <label className="label-modern">Logo Position</label>
              <select
                value={branding.logoPosition}
                onChange={(e) => handleBrandingChange('logoPosition', e.target.value)}
                className="input-modern"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={branding.showLogo}
              onChange={(e) => handleBrandingChange('showLogo', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Show logo on invoices</span>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">Notes</h2>
          <button onClick={refreshNotes} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Suggest
          </button>
        </div>
        <div className="card-section">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-modern min-h-[100px] resize-y"
            placeholder="Add any notes, terms, or thank you message..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Choose Template</h2>
        <div className="flex gap-3 overflow-x-auto pb-3 px-1">
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => setSelectedTemplate(index + 1)}
              className={`template-thumb flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all
                ${selectedTemplate === index + 1 ? 'active border-indigo-500' : 'border-gray-200 hover:border-indigo-300'}`}
              style={{ width: 90, height: 127 }}
            >
              <img
                src={`/assets/template${index + 1}-preview.png`}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="section-title">Preview</h2>
        <div className="bg-gray-100 rounded-2xl p-4 sm:p-6 flex justify-center">
          <div className="rounded-xl shadow-2xl overflow-hidden" style={{ width: 500, height: 707 }}>
            <div style={{
              transform: 'scale(0.6297)',
              transformOrigin: 'top left',
              width: 794,
              height: 1123,
            }}>
              <InvoiceTemplate data={getFormData()} templateNumber={selectedTemplate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  // ─── Animation variants ───────────────────────────────────────────────────

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Billium</h1>
          </div>
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
            <button onClick={clearForm} className="btn-ghost flex items-center gap-1.5 text-sm">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={fillDummyData} className="btn-ghost flex items-center gap-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5" /> Sample
            </button>
            <button
              onClick={() => navigate('/receipt', { state: { formData: getFormData() } })}
              className="btn-ghost flex items-center gap-1.5 text-sm text-indigo-600"
            >
              <FileText className="w-3.5 h-3.5" /> Receipt
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />

        {/* Step Content Card */}
        <div className="wizard-card p-6 sm:p-8 mb-6 min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <button onClick={prevStep} className="btn-secondary flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>
          <div>
            {currentStep < STEPS.length - 1 ? (
              <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="btn-primary flex items-center gap-2"
              >
                {isDownloading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="w-4 h-4" /> Download PDF</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden full-size template for PDF capture */}
      {currentStep === 4 && (
        <div
          ref={pdfRef}
          style={{ position: 'fixed', left: -9999, top: 0, width: 794, height: 1123, zIndex: -9999, overflow: 'hidden' }}
        >
          <InvoiceTemplate data={getFormData()} templateNumber={selectedTemplate} />
        </div>
      )}
    </div>
  );
};

export default Index;
