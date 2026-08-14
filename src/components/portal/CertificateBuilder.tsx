import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, Surface } from "@/components/portal/shell";
import { saveCertificateLayout, getCertificateLayout } from "@/lib/portal.functions";
import { useServerFn } from "@tanstack/react-start";
import { Save, Plus, Trash2, FileImage } from "lucide-react";
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
  fields: CertificateField[];
}

const FONTS = [
  "Inter, sans-serif",
  "Georgia, serif",
  "'Times New Roman', serif",
  "'Courier New', monospace",
  "'Space Grotesk', sans-serif",
  "cursive",
];

export function CertificateBuilder() {
  const [level, setLevel] = useState("L1");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [fields, setFields] = useState<CertificateField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const docFrameRef = useRef<HTMLDivElement>(null);

  const saveFn = useServerFn(saveCertificateLayout);
  const getFn = useServerFn(getCertificateLayout);

  useEffect(() => {
    async function load() {
      try {
        const layout = await getFn({ data: { level } });
        if (layout) {
          setBackgroundUrl(layout.background_url || "");
          setFields(layout.fields as CertificateField[]);
        } else {
          setBackgroundUrl("");
          setFields([]);
        }
      } catch (e) {
        console.error("Failed to load layout", e);
      }
    }
    load();
  }, [level, getFn]);

  async function handleSave() {
    try {
      setMessage("");
      await saveFn({ data: { level, background_url: backgroundUrl, fields: fields as any } });
      setMessage(`Layout for ${level} saved successfully.`);
    } catch (e) {
      setMessage(errorMessage(e, "Failed to save layout."));
    }
  }

  function addField() {
    const newField: CertificateField = {
      id: "f" + Math.random().toString(36).slice(2, 9),
      name: "Field " + (fields.length + 1),
      xPct: 0.1,
      yPct: 0.1,
      fontSize: 28,
      color: "#111111",
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
              <div>
                <label className="text-xs font-medium mb-1 block">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="L1">Level 1 (L1)</option>
                  <option value="L2">Level 2 (L2)</option>
                  <option value="L3">Level 3 (L3)</option>
                  <option value="L4">Level 4 (L4)</option>
                  <option value="L5">Level 5 (L5)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Background Image URL (Google Drive/Public URL)</label>
                <Input
                  value={backgroundUrl}
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save Layout
              </Button>
            </div>
          </Panel>

          <Panel title="Placeholders" icon={Plus}>
            <Button variant="outline" className="w-full mb-4" onClick={addField}>
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {fields.length === 0 && <p className="text-xs text-muted-foreground">No placeholders yet.</p>}
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
                  <label className="text-xs font-medium mb-1 block">Field Name</label>
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
                  <label className="text-xs font-medium mb-1 block">Font Family</label>
                  <select
                    value={selectedField.fontFamily}
                    onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {FONTS.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
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
          </Panel>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-muted/30 border border-dashed rounded-lg p-6 min-h-[600px] flex items-center justify-center">
          <div 
            className="relative shadow-2xl bg-white max-w-full" 
            ref={docFrameRef}
            style={{ width: "800px", aspectRatio: "1.414" }} // Default A4 landscape approx
          >
            {backgroundUrl ? (
              <img src={backgroundUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                No background image
              </div>
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
