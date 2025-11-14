import React, { useRef, useState, useEffect } from 'react';

interface ResizablePanelProps {
    children: React.ReactNode;
    initialWidth?: number;
    initialHeight?: number;
    initialX?: number;
    initialY?: number;
}

export const ResizablePanel = ({
    children,
    initialWidth = 380,
    initialHeight = 600,
    initialX = 10,
    initialY = 10,
}: ResizablePanelProps) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState({ x: initialX, y: initialY });
    const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
    const dragging = useRef(false);
    const resizing = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const sizeStart = useRef({ width: initialWidth, height: initialHeight });

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (dragging.current) {
                const dx = e.clientX - dragStart.current.x;
                const dy = e.clientY - dragStart.current.y;
                setPos((p) => ({ x: Math.max(0, p.x + dx), y: Math.max(0, p.y + dy) }));
                dragStart.current = { x: e.clientX, y: e.clientY };
            }
            if (resizing.current) {
                const dw = e.clientX - dragStart.current.x;
                const dh = e.clientY - dragStart.current.y;
                setSize({
                    width: Math.max(200, sizeStart.current.width + dw),
                    height: Math.max(200, sizeStart.current.height + dh),
                });
            }
        };

        const onMouseUp = () => {
            dragging.current = false;
            resizing.current = false;
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const startDrag = (e: React.MouseEvent) => {
        dragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const startResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        resizing.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        sizeStart.current = { width: size.width, height: size.height };
    };

    return (
        <div
            ref={panelRef}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                width: size.width,
                height: size.height,
                zIndex: 60,
            }}
            className="bg-white rounded shadow-lg overflow-hidden"
        >
            <div
                onMouseDown={startDrag}
                className="cursor-move px-3 py-2 bg-gray-100 border-b flex items-center justify-between"
                style={{ userSelect: 'none' }}
            >
                <div className="text-sm font-medium">Messages</div>
                <div className="text-xs text-muted-foreground">Drag to move • Drag corner to resize</div>
            </div>

            <div className="h-[calc(100%-56px)] overflow-auto">{children}</div>

            <div
                onMouseDown={startResize}
                className="absolute right-0 bottom-0 w-6 h-6 cursor-se-resize bg-transparent"
                style={{ touchAction: 'none' }}
            >
                <svg viewBox="0 0 10 10" width="100%" height="100%" className="opacity-30">
                    <path d="M0 10 L10 0 M6 10 L10 6 M0 6 L4 2" stroke="currentColor" strokeWidth={1} fill="none" />
                </svg>
            </div>
        </div>
    );
};

export default ResizablePanel;
