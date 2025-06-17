"use client";

import { DragDropContext, DropResult } from "react-beautiful-dnd";

interface DragDropContextProviderProps {
  children: React.ReactNode;
  onDragEnd: (result: DropResult) => void;
}

export default function DragDropContextProvider({
  children,
  onDragEnd,
}: DragDropContextProviderProps) {
  return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>;
}
