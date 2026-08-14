import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, Surface } from "@/components/portal/shell";
import { saveCertificateLayout, getCertificateLayout, getSignedFile, listCertificateTemplates, createCertificateTemplate, saveTemplateVersion, publishTemplate, getTemplateVersion, generatePdfPreview } from "@/lib/portal.functions";
import { useServerFn } from "@tanstack/react-start";
import { Save, Plus, Trash2, FileImage, Upload, Loader2, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage } from "@/lib/utils";
import { validateTemplateHtml, generatePlaceholderMap, NormalizedCertificateData, VALID_PLACEHOLDERS } from "@/lib/certificateEngine";

export interface CertificateField {
  id: string;
  name: string;
  xPct: number;
  yPct: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  multiline: boolean;
  widthPct: number;
}

export interface CertificateLayout {
  id?: string;
  level: string;
  background_url: string | null;
  fields: {
    elements: CertificateField[];
    customHtml?: string;
    customCss?: string;
  };
}

const FONTS = [
  "Inter, sans-serif",
  "Georgia, serif",
  "'Times New Roman', serif",
  "'Courier New', monospace",
  "'Space Grotesk', sans-serif",
  "cursive",
];

const LEVELS = [
  { id: "L2", name: "L2 - Secondary Examination" },
  { id: "L3", name: "L3 - Higher Secondary Examination" }
];

const DOC_TYPES = [
  { id: "marksheet", name: "Marksheet" },
  { id: "certificate", name: "Certificate" }
];

export const SAMPLE_STUDENT_DATA: NormalizedCertificateData = {
  candidate: {
    learner_name: "John Doe",
    student_number: "WSE-849302-26",
    date_of_birth: "14 - 08 - 2005",
    gender: "Male",
    caste: "General",
    address: "123 Sample Avenue, Sample City",
    country: "United States",
    birthmark: "Mole on left cheek",
    face_id_number: "FACE-90210",
    father_name: "Richard Doe",
    mother_name: "Jane Doe",
  },
  academic: {
    qualification: "L2",
    academic_period: "2025-2026",
    programme: "Secondary Education Diploma",
    institution: "World Education Quality Standards Academy",
  },
  result: {
    total_marks: "1100",
    obtained_marks: "945",
    percentage: "85.91%",
    grade: "A",
  },
  subjects: [
    { name: "English Language", score: "88", grade: "A", min: "33", max: "100", isced: "0232", category: "General" },
    { name: "Mathematics", score: "92", grade: "A+", min: "33", max: "100", isced: "0541", category: "General" },
    { name: "Science", score: "85", grade: "A", min: "33", max: "100", isced: "0532", category: "General" },
    { name: "History", score: "78", grade: "B", min: "33", max: "100", isced: "0222", category: "General" },
    { name: "Geography", score: "81", grade: "A", min: "33", max: "100", isced: "0314", category: "General" },
    { name: "Physical Education", score: "95", grade: "A+", min: "33", max: "100", isced: "1014", category: "General" },
    { name: "Computer Science", score: "89", grade: "A", min: "33", max: "100", isced: "0611", category: "General" },
    { name: "Art & Design", score: "76", grade: "B", min: "33", max: "100", isced: "0211", category: "General" },
    { name: "Music", score: "84", grade: "A", min: "33", max: "100", isced: "0215", category: "General" },
    { name: "Economics", score: "87", grade: "A", min: "33", max: "100", isced: "0311", category: "General" },
    { name: "Foreign Language", score: "90", grade: "A+", min: "33", max: "100", isced: "0231", category: "General" },
  ],
  verification: {
    verification_code: "VRF-789-456",
    issued_date: "15 - 08 - 2026",
    qr_code_url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==", // Simple dummy QR
  }
};

async function uploadTo(bucket: "student-files" | "portfolios", folder: string, file: File) {
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export function CertificateBuilder() {
  const [view, setView] = useState<"list" | "edit">("list");
  const [activeTemplate, setActiveTemplate] = useState<{ id: string, version_id: string } | null>(null);

  if (view === "list") {
    return <TemplateList onEdit={(t) => { setActiveTemplate(t); setView("edit"); }} />;
  }

  return <TemplateEditorView template={activeTemplate} onBack={() => setView("list")} />;
}

function TemplateList({ onEdit }: { onEdit: (t: { id: string, version_id: string }) => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const listFn = useServerFn(listCertificateTemplates);
  const createFn = useServerFn(createCertificateTemplate);
  
  useEffect(() => {
    listFn().then(setTemplates).catch(console.error);
  }, [listFn]);

  async function handleCreate() {
    try {
      const tmpl = await createFn({ data: { name: "New Template", type: "Marksheet", level: "L2" } });
      const versions = tmpl.versions || [{ id: "temp" }];
      onEdit({ id: tmpl.id, version_id: versions[0]?.id });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Certificate Templates</h2>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> New Template</Button>
      </div>
      <Surface className="p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Level</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{t.name}</td>
                <td className="py-3">{t.type}</td>
                <td className="py-3">{t.level}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${t.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3">
                  <Button variant="outline" size="sm" onClick={() => onEdit({ id: t.id, version_id: t.versions?.[0]?.id })}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No templates found.</td></tr>
            )}
          </tbody>
        </table>
      </Surface>
    </div>
  );
}

function TemplateEditorView({ template, onBack }: { template: { id: string, version_id: string } | null, onBack: () => void }) {
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fields, setFields] = useState<CertificateField[]>([]);
  const [customHtml, setCustomHtml] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [activeTab, setActiveTab] = useState<"visual"|"code">("visual");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const docFrameRef = useRef<HTMLDivElement>(null);

  const saveFn = useServerFn(saveTemplateVersion);
  const getFn = useServerFn(getTemplateVersion);
  const publishFn = useServerFn(publishTemplate);
  const previewPdfFn = useServerFn(generatePdfPreview);
  const signedUrlFn = useServerFn(getSignedFile);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    async function load() {
      if (!template?.version_id) return;
      try {
        const layout = await getFn({ data: { version_id: template.version_id } });
        if (layout) {
          setBackgroundUrl(layout.background_asset || "");
          const f = layout.metadata as any;
          if (Array.isArray(f)) {
            setFields(f);
            setCustomHtml(layout.html || "");
            setCustomCss(layout.css || "");
          } else if (f) {
            setFields(f.elements || []);
            setCustomHtml(layout.html || "");
            setCustomCss(layout.css || "");
          }
        }
      } catch (e) {
        console.error("Failed to load template version", e);
      }
    }
    load();
  }, [template, getFn]);

  useEffect(() => {
    async function resolvePreview() {
      if (!backgroundUrl) {
        setPreviewUrl("");
        return;
      }
      if (backgroundUrl.startsWith("http") || backgroundUrl.startsWith("data:")) {
        setPreviewUrl(backgroundUrl);
      } else {
        try {
          const res = await signedUrlFn({ data: { bucket: "student-files", path: backgroundUrl } });
          setPreviewUrl(res.url);
        } catch (e) {
          console.error("Failed to get signed URL for background", e);
        }
      }
    }
    resolvePreview();
  }, [backgroundUrl, signedUrlFn]);

  async function handleSave() {
    if (!template?.version_id) return;
    try {
      setMessage("");

      if (customHtml) {
        const errors = validateTemplateHtml(customHtml);
        if (errors.length > 0) {
          setMessage(`Cannot save. Invalid placeholders found: ${errors.join(", ")}`);
          return;
        }
      }

      await saveFn({ 
        data: { 
          version_id: template.version_id, 
          background_asset: backgroundUrl, 
          html: customHtml,
          css: customCss,
          metadata: { elements: fields }
        } 
      });
      setMessage(`Template saved successfully.`);
    } catch (e) {
      setMessage(errorMessage(e, "Failed to save template."));
    }
  }

  async function handlePublish() {
    if (!template?.id) return;
    try {
      await handleSave(); // save before publish
      await publishFn({ data: { template_id: template.id } });
      setMessage("Template successfully published!");
    } catch (e) {
      setMessage(errorMessage(e, "Failed to publish template."));
    }
  }

  async function handleGeneratePdf() {
    if (!template?.version_id) return;
    try {
      setIsGeneratingPdf(true);
      setMessage("Generating official PDF preview... please wait.");
      await handleSave(); // Ensure latest is saved
      const res = await previewPdfFn({ data: { version_id: template.version_id } });
      
      // Download or open the PDF from base64
      const pdfUrl = `data:application/pdf;base64,${res.base64}`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `preview_template_${template.id}.pdf`;
      link.click();

      setMessage("PDF Preview generated and downloaded successfully.");
    } catch (e) {
      setMessage(errorMessage(e, "Failed to generate PDF. Check server logs."));
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const path = await uploadTo("student-files", "templates", file);
      setBackgroundUrl(path);
      setMessage("Template image uploaded.");
    } catch (err) {
      setMessage(errorMessage(err, "Failed to upload image."));
    } finally {
      setIsUploading(false);
    }
  }

  function addField(placeholder?: string) {
    const newField: CertificateField = {
      id: "f" + Math.random().toString(36).slice(2, 9),
      name: placeholder || "Custom Text",
      xPct: 0.1,
      yPct: 0.1,
      fontSize: 16,
      color: "#000000",
      fontFamily: "Inter, sans-serif",
      bold: false,
      italic: false,
      align: "left",
      multiline: false,
      widthPct: 0.6,
    };
    setFields([...fields, newField]);
    setSelectedId(newField.id);
  }

  function updateField(id: string, patch: Partial<CertificateField>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function deleteField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  const selectedField = fields.find((f) => f.id === selectedId);

  // Drag logic
  const [dragging, setDragging] = useState<{ id: string; rect: DOMRect } | null>(null);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      const f = fields.find((x) => x.id === dragging.id);
      if (!f) return;
      let xPct = (e.clientX - dragging.rect.left) / dragging.rect.width;
      let yPct = (e.clientY - dragging.rect.top) / dragging.rect.height;
      xPct = Math.max(0, Math.min(0.98, xPct));
      yPct = Math.max(0, Math.min(0.98, yPct));
      updateField(f.id, { xPct, yPct });
    }

    function onMouseUp() {
      setDragging(null);
    }

    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, fields]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>&larr; Back</Button>
        <h2 className="text-xl font-bold tracking-tight">Editing Template</h2>
      </div>
      {message ? <Surface className="p-4 text-sm text-muted-foreground">{message}</Surface> : null}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <Panel title="Layout Settings" icon={FileImage}>
            <div className="space-y-4">
              <div className="flex flex-col mb-4">
                <span className="text-sm font-bold text-foreground">{template?.id}</span>
                <span className="text-xs text-muted-foreground mt-1">Editing Draft Version</span>
              </div>
                <label className="text-xs font-medium mb-1 block">Background Image</label>
                <div className="flex flex-col gap-2">
                  <Input
                    value={backgroundUrl}
                    onChange={(e) => setBackgroundUrl(e.target.value)}
                    placeholder="URL or upload a file..."
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" className="w-full relative overflow-hidden" disabled={isUploading}>
                      {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      Upload Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleUpload} 
                      />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full mt-4">
                <div className="flex gap-2 w-full">
                  <Button className="flex-1" variant="outline" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save Draft
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handlePublish}>
                    Publish
                  </Button>
                </div>
                <Button className="w-full mt-2" variant="secondary" onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
                  {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                  Test Puppeteer PDF
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Builder Tools" icon={Plus}>
            <div className="flex bg-muted p-1 rounded-md mb-4">
              <button 
                className={`flex-1 text-xs font-medium py-1.5 rounded ${activeTab === "visual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("visual")}
              >
                Visual Editor
              </button>
              <button 
                className={`flex-1 text-xs font-medium py-1.5 rounded ${activeTab === "code" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("code")}
              >
                HTML/CSS Override
              </button>
            </div>

            {activeTab === "visual" ? (
              <>
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2">Available Placeholders</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["{{ learner_name }}", "{{ student_number }}", "{{ programme }}", "{{ date_of_birth }}", "{{ gender }}", "{{ caste }}", "{{ address }}", "{{ country }}", "{{ father_name }}", "{{ mother_name }}", "{{ qualification }}", "{{ academic_period }}", "{{ institution }}", "{{ total_marks }}", "{{ obtained_marks }}", "{{ percentage }}", "{{ grade }}", "{{ issued_date }}", "{{ verification_code }}", "{{ qr_code }}", "{{ birthmark }}", "{{ face_id_number }}"].map(p => (
                      <span 
                        key={p} 
                        onClick={() => addField(p)}
                        className="text-[10px] bg-secondary text-secondary-foreground px-2 py-1 rounded border border-border cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full text-xs" onClick={() => addField("Custom Text")}>
                    <Plus className="mr-2 h-3 w-3" /> Add Custom Text
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {fields.length === 0 && <p className="text-xs text-muted-foreground">No fields yet.</p>}
                  {fields.map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between p-2 text-sm border rounded cursor-pointer ${
                        selectedId === f.id ? "border-primary bg-primary/10" : "border-border"
                      }`}
                      onClick={() => setSelectedId(f.id)}
                    >
                      <span className="truncate flex-1">{f.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteField(f.id); }} className="text-destructive p-1 ml-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {selectedField && (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium">Edit: {selectedField.name}</h4>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Text / Placeholder</label>
                      <Input value={selectedField.name} onChange={(e) => updateField(selectedField.id, { name: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-medium mb-1 block">Font Size</label>
                        <Input type="number" value={selectedField.fontSize} onChange={(e) => updateField(selectedField.id, { fontSize: Number(e.target.value) })} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium mb-1 block">Color</label>
                        <Input type="color" className="h-9 px-1 py-1" value={selectedField.color} onChange={(e) => updateField(selectedField.id, { color: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Font (Google Font or standard)</label>
                      <Input 
                        value={selectedField.fontFamily} 
                        onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })} 
                        placeholder="e.g. 'Roboto', sans-serif"
                      />
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Button size="sm" variant={selectedField.bold ? "default" : "outline"} onClick={() => updateField(selectedField.id, { bold: !selectedField.bold })}>Bold</Button>
                      <Button size="sm" variant={selectedField.italic ? "default" : "outline"} onClick={() => updateField(selectedField.id, { italic: !selectedField.italic })}>Italic</Button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Button size="sm" variant={selectedField.align === "left" ? "default" : "outline"} onClick={() => updateField(selectedField.id, { align: "left" })}>Left</Button>
                      <Button size="sm" variant={selectedField.align === "center" ? "default" : "outline"} onClick={() => updateField(selectedField.id, { align: "center" })}>Center</Button>
                      <Button size="sm" variant={selectedField.align === "right" ? "default" : "outline"} onClick={() => updateField(selectedField.id, { align: "right" })}>Right</Button>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Max Width % (0.1 to 1)</label>
                      <Input type="number" step="0.1" value={selectedField.widthPct} onChange={(e) => updateField(selectedField.id, { widthPct: Number(e.target.value) })} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Write custom HTML and CSS to completely override the base layout. Use placeholders like <code>{`{{ learner_name }}`}</code> or <code>{`{{ marks_table }}`}</code>.
                </p>
                <div>
                  <label className="text-xs font-medium mb-1 block">Custom HTML</label>
                  <textarea 
                    className="w-full h-48 text-xs font-mono p-2 border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={`<div class="title">{{ learner_name }}</div>\n{{ marks_table }}`}
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Custom CSS</label>
                  <textarea 
                    className="w-full h-32 text-xs font-mono p-2 border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={`.title { font-size: 24px; color: navy; }`}
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                  />
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-muted/30 border border-dashed rounded-lg p-6 min-h-[600px] flex items-center justify-center">
          <div 
            className="relative shadow-2xl bg-white max-w-full overflow-hidden" 
            ref={docFrameRef}
            style={{ width: "800px", aspectRatio: "0.707" }} // Portrait A4 approx
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm bg-muted/20">
                No background image
              </div>
            )}
            
            {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
            {(() => {
              if (!customHtml) return null;
              let renderedHtml = customHtml;
              const fieldMap = generatePlaceholderMap(SAMPLE_STUDENT_DATA);
              
              // We don't have full marks table building logic here, but we can at least map basic text variables.
              // For a true 1:1, we should generate marks table and summary table HTML.
              // We will just do basic placeholder replacements.
              const marksTableHtml = `<div style="padding: 10px; border: 1px dashed red; text-align: center; font-weight: bold; background: #ffebeb;">Marks Table Sample</div>`;
              const summaryTableHtml = `<div style="padding: 10px; border: 1px dashed blue; text-align: center; font-weight: bold; background: #ebf0ff;">Summary Table Sample</div>`;
              
              renderedHtml = renderedHtml
                .replace(/{{ ?marks_table ?}}/g, marksTableHtml)
                .replace(/{{ ?summary_table ?}}/g, summaryTableHtml)
                .replace(/{{ ?qr_code ?}}/g, `<img src="${SAMPLE_STUDENT_DATA.verification.qr_code_url}" style="width:100px; height:100px;" alt="QR Code" />`);

              Object.entries(fieldMap).forEach(([key, value]) => {
                const safeKey = key.replace(/([{}])/g, "\\$1").replace(/ /g, " ?");
                renderedHtml = renderedHtml.replace(new RegExp(safeKey, "g"), value);
              });

              return (
                <div 
                  className="absolute inset-0 overflow-hidden" 
                  dangerouslySetInnerHTML={{ __html: renderedHtml }} 
                />
              );
            })()}
            
            {fields.map((f) => {
              const left = f.xPct * 100 + "%";
              const top = f.yPct * 100 + "%";
              // Font size scaling assumption for preview
              const fs = f.fontSize * 0.7; // scaled down for 800px preview assuming high res natural
              
              let displayText = f.name;
              const fieldMap = generatePlaceholderMap(SAMPLE_STUDENT_DATA);
              if (fieldMap[f.name] !== undefined) {
                displayText = fieldMap[f.name] || `[Empty ${f.name}]`;
              }
              
              return (
                <div
                  key={f.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedId(f.id);
                    if (docFrameRef.current) {
                      setDragging({ id: f.id, rect: docFrameRef.current.getBoundingClientRect() });
                    }
                  }}
                  className={`absolute cursor-move border border-dashed px-1 whitespace-pre-wrap leading-tight ${
                    selectedId === f.id ? "border-primary bg-primary/20 z-10" : "border-transparent hover:border-border/50 hover:bg-black/5"
                  }`}
                  style={{
                    left,
                    top,
                    fontSize: fs + "px",
                    color: f.color,
                    fontFamily: f.fontFamily,
                    fontWeight: f.bold ? 700 : 400,
                    fontStyle: f.italic ? "italic" : "normal",
                    textAlign: f.align,
                    width: (f.widthPct * 100) + "%",
                    transform: "translate(-0.5px, -0.5px)"
                  }}
                >
                  <div className={`absolute -top-[20px] -left-[1px] text-[10px] bg-primary text-primary-foreground px-1 py-0.5 whitespace-nowrap rounded ${selectedId === f.id ? 'block' : 'hidden'}`}>
                    {f.name}
                  </div>
                  {displayText}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
