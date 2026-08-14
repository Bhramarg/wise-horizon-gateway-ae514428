import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, Surface } from "@/components/portal/shell";
import { saveCertificateLayout, getCertificateLayout, getSignedFile } from "@/lib/portal.functions";
import { useServerFn } from "@tanstack/react-start";
import { Save, Plus, Trash2, FileImage, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage } from "@/lib/utils";

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

async function uploadTo(bucket: "student-files" | "portfolios", folder: string, file: File) {
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export function CertificateBuilder() {
  const [level, setLevel] = useState("L2");
  const [docType, setDocType] = useState("marksheet");
  const layoutKey = `${level}-${docType}`;
  
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

  const saveFn = useServerFn(saveCertificateLayout);
  const getFn = useServerFn(getCertificateLayout);
  const signedUrlFn = useServerFn(getSignedFile);

  useEffect(() => {
    async function load() {
      try {
        const layout = await getFn({ data: { level: layoutKey } });
        if (layout) {
          setBackgroundUrl(layout.background_url || "");
          const f = layout.fields as any;
          if (Array.isArray(f)) {
            setFields(f);
            setCustomHtml("");
            setCustomCss("");
          } else if (f) {
            setFields(f.elements || []);
            setCustomHtml(f.customHtml || "");
            setCustomCss(f.customCss || "");
          }
        } else {
          setBackgroundUrl("");
          setFields([]);
          setCustomHtml("");
          setCustomCss("");
        }
      } catch (e) {
        console.error("Failed to load layout", e);
      }
    }
    load();
  }, [layoutKey, getFn]);

  useEffect(() => {
    async function resolvePreview() {
      if (!backgroundUrl) {
        setPreviewUrl("");
        return;
      }
      if (backgroundUrl.startsWith("http") || backgroundUrl.startsWith("data:")) {
        setPreviewUrl(backgroundUrl);
      } else {
        // It's a storage path
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
    try {
      setMessage("");
      await saveFn({ 
        data: { 
          level: layoutKey, 
          background_url: backgroundUrl, 
          fields: { elements: fields, customHtml, customCss } as any 
        } 
      });
      setMessage(`Layout for ${level} ${docType} saved successfully.`);
    } catch (e) {
      setMessage(errorMessage(e, "Failed to save layout."));
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
      {message ? <Surface className="p-4 text-sm text-muted-foreground">{message}</Surface> : null}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <Panel title="Layout Settings" icon={FileImage}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {LEVELS.map(l => (
                      <option key={l.id} value={l.id}>{l.id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Document</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {DOC_TYPES.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
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
              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save Layout
              </Button>
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
                    {["{{ learner_name }}", "{{ student_number }}", "{{ programme }}", "{{ date_of_birth }}", "{{ gender }}", "{{ caste }}", "{{ address }}", "{{ father_name }}", "{{ mother_name }}", "{{ qualification }}", "{{ academic_period }}", "{{ institution }}", "{{ total_marks }}", "{{ obtained_marks }}", "{{ percentage }}", "{{ grade }}", "{{ issued_date }}", "{{ verification_code }}"].map(p => (
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
            {customHtml && (
              <div 
                className="absolute inset-0 overflow-hidden" 
                dangerouslySetInnerHTML={{ __html: customHtml }} 
              />
            )}
            
            {fields.map((f) => {
              const left = f.xPct * 100 + "%";
              const top = f.yPct * 100 + "%";
              // Font size scaling assumption for preview
              const fs = f.fontSize * 0.7; // scaled down for 800px preview assuming high res natural
              
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
                  {f.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
