import React, { useState, useEffect, useRef } from 'react';
import {
  IdCard,
  Save,
  Upload,
  Eye,
  CheckCircle,
  Move,
  Type,
  Maximize2,
  Palette,
  Sparkles,
  Layers,
  RefreshCw,
  Plus,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.js';

interface FieldConfig {
  id: number;
  template_id: number;
  field_key: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font_size: number;
  font_family: string;
  font_weight: string;
  text_color: string;
  text_align: 'left' | 'center' | 'right';
  is_visible: number;
  border_radius?: number;
  border_color?: string;
  border_width?: number;
}

interface TemplateRecord {
  id: number;
  name: string;
  description: string;
  card_width: number;
  card_height: number;
  orientation: string;
  front_background_url: string;
  is_active: number;
}

export const AdminTemplateDesigner: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRecord | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>('name');
  
  // View mode: 'editor' (with drag boxes) or 'preview' (backend rendered sample)
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Dragging state on canvas
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragFieldKey, setDragFieldKey] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({ mouseX: 0, mouseY: 0, initialX: 0, initialY: 0 });

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New Template Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateWidth, setNewTemplateWidth] = useState(1012);
  const [newTemplateHeight, setNewTemplateHeight] = useState(638);
  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null);

  const loadTemplates = async () => {
    try {
      const res = await api.getTemplates();
      setTemplates(res.templates || []);
      if (res.templates?.length > 0) {
        // select active or first
        const active = res.templates.find((t: TemplateRecord) => t.is_active === 1) || res.templates[0];
        selectTemplate(active.id);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const selectTemplate = async (templateId: number) => {
    try {
      const res = await api.getTemplate(templateId);
      setSelectedTemplate(res.template);
      setFields(res.fields || []);
      if (res.fields?.length > 0) {
        setSelectedFieldKey(res.fields[0].field_key);
      }
      setPreviewDataUrl(null);
    } catch (err) {
      console.error('Failed to select template:', err);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const activeField = fields.find(f => f.field_key === selectedFieldKey) || fields[0];

  // Update a field's property
  const updateFieldProperty = (key: string, prop: keyof FieldConfig, value: any) => {
    setFields(prev => prev.map(f => {
      if (f.field_key === key) {
        return { ...f, [prop]: value };
      }
      return f;
    }));
  };

  // Canvas Drag Handling
  // Scaling factors: scale = renderedWidth / card_width
  const getScale = () => {
    if (!canvasContainerRef.current || !selectedTemplate) return 1;
    const renderedWidth = canvasContainerRef.current.clientWidth;
    return renderedWidth / selectedTemplate.card_width;
  };

  const handleMouseDown = (e: React.MouseEvent, fieldKey: string) => {
    if (viewMode !== 'editor') return;
    e.stopPropagation();
    e.preventDefault();

    const targetField = fields.find(f => f.field_key === fieldKey);
    if (!targetField) return;

    setSelectedFieldKey(fieldKey);
    setIsDragging(true);
    setDragFieldKey(fieldKey);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: targetField.x,
      initialY: targetField.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragFieldKey || !selectedTemplate) return;

    const scale = getScale();
    const deltaX = (e.clientX - dragStart.mouseX) / scale;
    const deltaY = (e.clientY - dragStart.mouseY) / scale;

    const newX = Math.round(Math.max(0, Math.min(selectedTemplate.card_width - 20, dragStart.initialX + deltaX)));
    const newY = Math.round(Math.max(0, Math.min(selectedTemplate.card_height - 20, dragStart.initialY + deltaY)));

    setFields(prev => prev.map(f => {
      if (f.field_key === dragFieldKey) {
        return { ...f, x: newX, y: newY };
      }
      return f;
    }));
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragFieldKey(null);
    }
  };

  // Generate Live Sample Preview
  const generatePreview = async () => {
    if (!selectedTemplate) return;
    setIsLoadingPreview(true);
    try {
      const res = await api.previewTemplate(selectedTemplate.id, {
        fields
      });
      setPreviewDataUrl(res.previewDataUrl);
      setViewMode('preview');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to render preview.' });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Save all fields to DB
  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await api.updateTemplate(selectedTemplate.id, {
        name: selectedTemplate.name,
        card_width: selectedTemplate.card_width,
        card_height: selectedTemplate.card_height,
        orientation: selectedTemplate.orientation,
        fields
      });

      setStatusMessage({ type: 'success', text: 'Template field positions and styles saved successfully!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save template.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Set template as active
  const handleActivateTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      await api.activateTemplate(selectedTemplate.id);
      setStatusMessage({ type: 'success', text: `"${selectedTemplate.name}" is now the active default template.` });
      await loadTemplates();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Handle New Template Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName || !newTemplateFile) {
      alert('Please provide a name and background image file.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', newTemplateName);
      payload.append('card_width', newTemplateWidth.toString());
      payload.append('card_height', newTemplateHeight.toString());
      payload.append('background', newTemplateFile);

      const res = await api.createTemplate(payload);
      setIsUploadModalOpen(false);
      setNewTemplateName('');
      setNewTemplateFile(null);
      await loadTemplates();
      selectTemplate(res.id);
      setStatusMessage({ type: 'success', text: 'New ID card template uploaded successfully!' });
    } catch (err: any) {
      alert(err.message || 'Failed to upload template.');
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="py-20 text-center text-charcoal-600">
        <div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading ID card template designer...</p>
      </div>
    );
  }

  // Calculate scaling for visual editor canvas
  const canvasWidth = selectedTemplate.card_width || 1012;
  const canvasHeight = selectedTemplate.card_height || 638;
  const aspectRatioPercent = (canvasHeight / canvasWidth) * 100;

  return (
    <div className="space-y-6 animate-fade-in pb-16" onMouseUp={handleMouseUp}>
      
      {/* Top Header & Template Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-gold-100 text-gold-800 border border-gold-300">
              CORE SYSTEM MODULE
            </span>
            {selectedTemplate.is_active === 1 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> Active Default Template
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950 mt-1">
            Dynamic ID Card Template Designer
          </h1>
          <p className="text-xs text-charcoal-600">
            Click and drag fields directly over the background card, or enter exact pixel coordinates for pixel-perfect ID card printing
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedTemplate.id}
            onChange={(e) => selectTemplate(parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-charcoal-900 outline-none"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.is_active === 1 ? '★ (Active)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-charcoal-800 bg-white border border-gray-300 hover:bg-cream-100 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-gold-600" />
            <span>Upload New Card Background</span>
          </button>

          {selectedTemplate.is_active === 0 && (
            <button
              onClick={handleActivateTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Set as Active</span>
            </button>
          )}

          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-md transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-charcoal-950" />
            <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 shadow-sm ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border border-rose-200 text-rose-900'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Designer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Canvas & View Mode (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Canvas Mode Switcher */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-cream-300 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal-700">Canvas Mode:</span>
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'editor'
                    ? 'bg-charcoal-900 text-gold-300 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Interactive Drag Editor
              </button>
              <button
                onClick={generatePreview}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'preview'
                    ? 'bg-charcoal-900 text-gold-300 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-gold-500" />
                <span>Live Sample Preview</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-charcoal-600 hidden sm:block">
              Native: {canvasWidth} × {canvasHeight} px
            </div>
          </div>

          {/* Interactive Card Canvas Container */}
          <div className="bg-charcoal-950 p-4 sm:p-6 rounded-3xl border-2 border-gold-400 shadow-2xl overflow-hidden select-none">
            
            <div
              ref={canvasContainerRef}
              onMouseMove={handleMouseMove}
              className="relative w-full rounded-2xl overflow-hidden bg-charcoal-900 shadow-inner"
              style={{
                aspectRatio: `${canvasWidth} / ${canvasHeight}`,
                cursor: isDragging ? 'grabbing' : 'default'
              }}
            >
              {/* Background Card Image */}
              <img
                src={selectedTemplate.front_background_url}
                alt="ID Card Background"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* 1. EDITOR MODE: Overlay Draggable Bounding Boxes */}
              {viewMode === 'editor' && (
                <div className="absolute inset-0">
                  {fields.map((f) => {
                    const isSelected = f.field_key === selectedFieldKey;
                    const leftPercent = (f.x / canvasWidth) * 100;
                    const topPercent = (f.y / canvasHeight) * 100;
                    const widthPercent = (f.width / canvasWidth) * 100;
                    const heightPercent = (f.height / canvasHeight) * 100;

                    if (!f.is_visible) return null;

                    return (
                      <div
                        key={f.id}
                        onMouseDown={(e) => handleMouseDown(e, f.field_key)}
                        style={{
                          left: `${leftPercent}%`,
                          top: `${topPercent}%`,
                          width: `${widthPercent}%`,
                          height: `${heightPercent}%`,
                        }}
                        className={`absolute cursor-move transition-shadow flex items-center justify-center group ${
                          isSelected
                            ? 'ring-2 ring-gold-400 bg-gold-400/20 shadow-lg z-20'
                            : 'border border-dashed border-gold-300/60 hover:bg-gold-300/10 z-10'
                        }`}
                      >
                        {/* Field Label Pill */}
                        <div className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase whitespace-nowrap shadow pointer-events-none ${
                          isSelected
                            ? 'bg-gold-400 text-charcoal-950'
                            : 'bg-charcoal-900/90 text-gold-300 border border-gold-400/50'
                        }`}>
                          {f.label} ({f.x}, {f.y})
                        </div>

                        {/* Special Graphic Placeholder for Photo or QR Code */}
                        {f.field_key === 'photo' && (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gold-300 text-[10px] font-bold bg-charcoal-800/60 border border-gold-400/40 rounded">
                            <span>[ Member Photo ]</span>
                          </div>
                        )}

                        {f.field_key === 'qr_code' && (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gold-300 text-[10px] font-bold bg-charcoal-800/60 border border-gold-400/40 rounded">
                            <span>[ QR Code ]</span>
                          </div>
                        )}

                        {f.field_key !== 'photo' && f.field_key !== 'qr_code' && (
                          <div
                            style={{
                              color: f.text_color,
                              fontSize: `${Math.max(10, Math.round(f.font_size * 0.7))}px`,
                              fontFamily: f.font_family,
                              fontWeight: f.font_weight as any,
                              textAlign: f.text_align
                            }}
                            className="w-full truncate px-1 text-center font-bold"
                          >
                            {f.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. PREVIEW MODE: High-Res Rendered Canvas Output */}
              {viewMode === 'preview' && (
                <div className="absolute inset-0 bg-charcoal-950 flex items-center justify-center">
                  {isLoadingPreview ? (
                    <div className="text-center text-gold-300 space-y-2">
                      <div className="w-8 h-8 border-3 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-mono">Rendering high-res card...</p>
                    </div>
                  ) : previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Rendered Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <button
                      onClick={generatePreview}
                      className="px-4 py-2 rounded-xl bg-gold-400 text-charcoal-950 font-bold text-xs shadow"
                    >
                      Click to Generate Preview
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Instruction Footer under Canvas */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span>💡 Click any box to select & drag to reposition</span>
              <span>Coordinates automatically scale to {canvasWidth}x{canvasHeight}px</span>
            </div>
          </div>

          {/* Quick Field Selection Chips */}
          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm space-y-2">
            <span className="text-xs font-bold text-charcoal-800 uppercase font-mono tracking-wider block">
              Quick Field Selector
            </span>
            <div className="flex flex-wrap gap-2">
              {fields.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setSelectedFieldKey(f.field_key); setViewMode('editor'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    f.field_key === selectedFieldKey
                      ? 'bg-gold-400 text-charcoal-950 shadow-sm'
                      : 'bg-cream-100 hover:bg-cream-200 text-charcoal-800'
                  }`}
                >
                  <span>{f.label}</span>
                  {!f.is_visible && <span className="text-[10px] text-rose-600">(Hidden)</span>}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Precision Properties Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-cream-300 shadow-lg p-6 space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <span className="text-[10px] font-bold text-gold-700 font-mono uppercase tracking-wider">
                Precision Configuration
              </span>
              <h3 className="font-serif font-bold text-lg text-charcoal-950">
                {activeField?.label || 'Selected Field'}
              </h3>
            </div>
            
            <label className="flex items-center gap-1.5 text-xs font-bold text-charcoal-700 cursor-pointer">
              <input
                type="checkbox"
                checked={activeField?.is_visible === 1}
                onChange={(e) => updateFieldProperty(activeField.field_key, 'is_visible', e.target.checked ? 1 : 0)}
                className="rounded text-gold-600 focus:ring-gold-400"
              />
              <span>Visible</span>
            </label>
          </div>

          {/* Position Coordinates: X, Y, Width, Height */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-800 uppercase font-mono tracking-wider">
              <Move className="w-3.5 h-3.5 text-gold-600" />
              <span>Position & Dimensions (px)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">X Coordinate</label>
                <input
                  type="number"
                  value={activeField?.x ?? 0}
                  onChange={(e) => updateFieldProperty(activeField.field_key, 'x', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Y Coordinate</label>
                <input
                  type="number"
                  value={activeField?.y ?? 0}
                  onChange={(e) => updateFieldProperty(activeField.field_key, 'y', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Width</label>
                <input
                  type="number"
                  value={activeField?.width ?? 100}
                  onChange={(e) => updateFieldProperty(activeField.field_key, 'width', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Height</label>
                <input
                  type="number"
                  value={activeField?.height ?? 30}
                  onChange={(e) => updateFieldProperty(activeField.field_key, 'height', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Typography Styles (For Text Fields) */}
          {activeField?.field_key !== 'photo' && activeField?.field_key !== 'qr_code' && (
            <div className="space-y-3 pt-3 border-t border-cream-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-800 uppercase font-mono tracking-wider">
                <Type className="w-3.5 h-3.5 text-gold-600" />
                <span>Typography & Styling</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Font Size (px)</label>
                  <input
                    type="number"
                    value={activeField?.font_size ?? 20}
                    onChange={(e) => updateFieldProperty(activeField.field_key, 'font_size', parseInt(e.target.value, 10) || 12)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Font Weight</label>
                  <select
                    value={activeField?.font_weight ?? 'bold'}
                    onChange={(e) => updateFieldProperty(activeField.field_key, 'font_weight', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs outline-none bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="bold">Bold</option>
                    <option value="800">Extra Bold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Font Family</label>
                <select
                  value={activeField?.font_family ?? 'Inter'}
                  onChange={(e) => updateFieldProperty(activeField.field_key, 'font_family', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs outline-none bg-white"
                >
                  <option value="Inter">Inter (Modern Clean Sans)</option>
                  <option value="Cinzel">Cinzel (Regal Serif)</option>
                  <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Text Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateFieldProperty(activeField.field_key, 'text_align', align)}
                      className={`py-1 rounded-lg text-xs font-semibold capitalize border ${
                        activeField?.text_align === align
                          ? 'bg-charcoal-900 text-gold-300 border-charcoal-900'
                          : 'bg-white text-charcoal-700 border-gray-200'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeField?.text_color ?? '#FFFFFF'}
                    onChange={(e) => updateFieldProperty(activeField.field_key, 'text_color', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={activeField?.text_color ?? '#FFFFFF'}
                    onChange={(e) => updateFieldProperty(activeField.field_key, 'text_color', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Border & Radius Styling (For Photo / QR Code) */}
          {(activeField?.field_key === 'photo' || activeField?.field_key === 'qr_code') && (
            <div className="space-y-3 pt-3 border-t border-cream-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-800 uppercase font-mono tracking-wider">
                <Palette className="w-3.5 h-3.5 text-gold-600" />
                <span>Frame & Border Styling</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Corner Radius (px)</label>
                  <input
                    type="number"
                    value={activeField?.border_radius ?? 0}
                    onChange={(e) => updateFieldProperty(activeField.field_key, 'border_radius', parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g. 10 or 999 for circle"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Border Width (px)</label>
                  <input
                    type="number"
                    value={activeField?.border_width ?? 0}
                    onChange={(e) => updateFieldProperty(activeField.field_key, 'border_width', parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeField?.border_color ?? '#D4AF37'}
                    onChange={(e) => updateFieldProperty(activeField.field_key, 'border_color', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={activeField?.border_color ?? '#D4AF37'}
                    onChange={(e) => updateFieldProperty(activeField.field_key, 'border_color', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button in Panel */}
          <div className="pt-4 border-t border-cream-200">
            <button
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="w-full py-3 rounded-xl text-xs font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow transition"
            >
              {isSaving ? 'Saving Changes...' : 'Save All Configurations'}
            </button>
          </div>

        </div>

      </div>

      {/* New Template Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gold-300 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="font-serif font-bold text-lg text-charcoal-950">
                Upload New ID Card Background
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-charcoal-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VLPN Platinum Card 2026"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1">
                    Card Width (px)
                  </label>
                  <input
                    type="number"
                    value={newTemplateWidth}
                    onChange={(e) => setNewTemplateWidth(parseInt(e.target.value, 10) || 1012)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1">
                    Card Height (px)
                  </label>
                  <input
                    type="number"
                    value={newTemplateHeight}
                    onChange={(e) => setNewTemplateHeight(parseInt(e.target.value, 10) || 638)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1">
                  Background Graphic Image <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setNewTemplateFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-charcoal-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold-100 file:text-gold-900 hover:file:bg-gold-200 cursor-pointer"
                />
                <p className="text-[10px] text-charcoal-600 mt-1">
                  Upload a high-resolution landscape ID card background image without dynamic text or photo.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-gold-400 hover:bg-gold-500 shadow transition"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
