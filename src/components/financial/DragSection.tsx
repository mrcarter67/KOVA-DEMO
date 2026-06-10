"use client";
import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragSectionProps {
  id: string;
  onDragStart: (id: string) => void;
  onDrop:      (id: string) => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function DragSection({ id, onDragStart, onDrop, children, className, title }: DragSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver,     setIsOver]     = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = "move"; setIsDragging(true); onDragStart(id); }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={e => { e.preventDefault(); setIsOver(false); onDrop(id); }}
      className={cn(
        "fin-section-drag relative",
        isDragging && "dragging",
        isOver     && "drag-over",
        className,
      )}
    >
      {/* Drag handle */}
      <div
        className="absolute -left-0.5 top-3.5 z-10 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        title={`Drag to reorder${title ? " — " + title : ""}`}
      >
        <GripVertical size={13} className="text-muted-foreground/40 hover:text-muted-foreground" />
      </div>
      <div className="group">{children}</div>
    </div>
  );
}
