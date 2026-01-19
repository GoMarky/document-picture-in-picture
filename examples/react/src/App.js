import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePictureInPictureWindow } from '@gomarky/picture-in-picture-window-react';
function App() {
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(300);
    const [currentTime, setCurrentTime] = useState('00:00:00');
    const pipContentRef = useRef(null);
    const { isSupported, isOpen, open, close, resize, focusOpener } = usePictureInPictureWindow({
        width,
        height,
        copyStyles: true,
        onOpen: (win) => {
            console.log('PiP window opened!', win);
            if (pipContentRef.current) {
                win.document.body.appendChild(pipContentRef.current);
            }
        },
        onClose: () => {
            console.log('PiP window closed!');
        },
    });
    const handleToggle = useCallback(async () => {
        if (isOpen) {
            close();
        }
        else {
            await open();
        }
    }, [isOpen, open, close]);
    const handleResize = useCallback(() => {
        resize(500, 400);
    }, [resize]);
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}:${seconds}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);
    return (_jsxs("div", { className: "container", children: [_jsxs("header", { children: [_jsx("h1", { children: "\uD83D\uDDBC\uFE0F Picture-in-Picture Window" }), _jsx("p", { className: "subtitle", children: "React Hook Demo" }), _jsxs("div", { className: "react-badge", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("circle", { cx: "12", cy: "12", r: "2.5", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4", fill: "none", stroke: "currentColor", strokeWidth: "1.5", transform: "rotate(60 12 12)" }), _jsx("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4", fill: "none", stroke: "currentColor", strokeWidth: "1.5", transform: "rotate(120 12 12)" })] }), "React"] })] }), _jsxs("div", { className: "status-bar", children: [_jsxs("div", { className: "status-item", children: [_jsx("span", { className: `status-dot ${isSupported ? 'active' : ''}` }), _jsx("span", { children: isSupported ? 'API Supported' : 'Not Supported' })] }), _jsxs("div", { className: "status-item", children: [_jsx("span", { className: `status-dot ${isOpen ? 'active' : ''}` }), _jsx("span", { children: isOpen ? 'Window open' : 'Window closed' })] })] }), _jsxs("div", { className: "card", children: [_jsxs("h2", { className: "card-title", children: [_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }), _jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }), _jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })] }), "Controls"] }), _jsxs("div", { className: "input-group", children: [_jsxs("div", { className: "input-wrapper", children: [_jsx("label", { htmlFor: "width", children: "Width (px)" }), _jsx("input", { type: "number", id: "width", value: width, onChange: (e) => setWidth(Number(e.target.value)), min: 200, max: 800 })] }), _jsxs("div", { className: "input-wrapper", children: [_jsx("label", { htmlFor: "height", children: "Height (px)" }), _jsx("input", { type: "number", id: "height", value: height, onChange: (e) => setHeight(Number(e.target.value)), min: 150, max: 600 })] })] }), _jsxs("div", { className: "controls", children: [_jsxs("button", { className: "btn-primary", onClick: handleToggle, disabled: !isSupported, children: [!isOpen ? (_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M15 3h6v6M14 10l7-7M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" }) })) : (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), _jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })] })), isOpen ? 'Close PiP Window' : 'Open PiP Window'] }), _jsx("button", { className: "btn-secondary", onClick: handleResize, disabled: !isOpen, children: "Resize to 500x400" }), _jsx("button", { className: "btn-secondary", onClick: focusOpener, disabled: !isOpen, children: "Focus Main Window" })] })] }), _jsxs("div", { className: "card", children: [_jsxs("h2", { className: "card-title", children: [_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("polygon", { points: "23 7 16 12 23 17 23 7" }), _jsx("rect", { x: "1", y: "5", width: "15", height: "14", rx: "2", ry: "2" })] }), "PiP Content"] }), _jsx("p", { style: { color: 'var(--text-secondary)', marginBottom: '1rem' }, children: "This content will be moved to the Picture-in-Picture window when opened." }), _jsxs("div", { ref: pipContentRef, className: `pip-content ${isOpen ? 'in-pip' : ''}`, children: [_jsxs("div", { className: "video-placeholder", children: [_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("polygon", { points: "5 3 19 12 5 21 5 3" }) }), _jsx("span", { children: "Video Player Placeholder" })] }), _jsxs("p", { children: ["Current time: ", _jsx("code", { children: currentTime })] })] })] }), !isSupported && (_jsxs("div", { className: "not-supported", children: ["\u26A0\uFE0F Document Picture-in-Picture API is not supported in your browser.", _jsx("br", {}), "Please use Chrome 116+ or Edge 116+."] }))] }));
}
export default App;
