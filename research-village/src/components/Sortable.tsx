"use client";
import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";

/** 끌어서 순서 바꾸기 공통 설정: 마우스는 조금 끌면, 터치는 꾹 누르면 시작하고, 키보드로도 옮길 수 있다 */
export function useSortSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

/** 끌 수 있는 한 칸. disabled 면 그냥 감싸개일 뿐이다 */
export function SortableItem({ id, disabled = false, className = "", style, children, as: Tag = "div" }: { id: string; disabled?: boolean; className?: string; style?: CSSProperties; children: ReactNode; as?: "div" | "li" }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <Tag ref={setNodeRef as never} className={className} style={{ ...style, transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1, zIndex: isDragging ? 5 : undefined, touchAction: disabled ? undefined : "manipulation", cursor: disabled ? undefined : "grab" }} {...(disabled ? {} : attributes)} {...(disabled ? {} : { role: "group", "aria-roledescription": "끌어서 옮길 수 있는 항목" })} {...(disabled ? {} : listeners)}>
      {children}
    </Tag>
  );
}
