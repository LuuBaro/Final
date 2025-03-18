// src/components/BpmnDiagram.jsx
import React, { useEffect, useRef, useState } from "react";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import BpmnService from "../services/bpmnService";

const BpmnDiagram = ({ bpmnXml, processDefinitionId }) => {
  const containerRef = useRef(null);
  const bpmnServiceRef = useRef(null);
  const [instanceCounts, setInstanceCounts] = useState({});
  const [error, setError] = useState(null);
  const [isImported, setIsImported] = useState(false);

  // Khởi tạo BpmnService khi component mount
  useEffect(() => {
    if (!containerRef.current) {
      setError("Container chưa sẵn sàng");
      return;
    }

    const bpmnService = new BpmnService();
    bpmnServiceRef.current = bpmnService;

    const cleanup = bpmnService.initializeViewer(containerRef.current);

    return () => {
      bpmnService.destroy();
      if (cleanup) cleanup();
    };
  }, []);

  // Import XML khi bpmnXml thay đổi
  useEffect(() => {
    const bpmnService = bpmnServiceRef.current;
    if (!bpmnService || !bpmnXml || !containerRef.current) {
      setError("Viewer hoặc dữ liệu BPMN không sẵn sàng");
      return;
    }

    const importXML = async () => {
      try {
        await bpmnService.importBpmnXml(bpmnXml, containerRef.current);
        setIsImported(true);
      } catch (err) {
        setError(err.message);
      }
    };

    importXML();
  }, [bpmnXml]);

  // Fetch runtime data và thêm overlays khi import thành công
  useEffect(() => {
    const bpmnService = bpmnServiceRef.current;
    if (!bpmnService || !isImported) return;

    const loadRuntimeData = async () => {
      try {
        const counts = await bpmnService.fetchRuntimeData(processDefinitionId);
        setInstanceCounts(counts);
        bpmnService.addOverlays(counts);
      } catch (err) {
        setError(err.message);
      }
    };

    loadRuntimeData();
  }, [isImported, processDefinitionId]);

  return (
    <div className="flex justify-center items-center w-full">
      <div
        ref={containerRef}
        className="w-full h-[500px] border border-gray-300 rounded-lg shadow-md"
        style={{ overflow: "auto", display: "block" }}
      />
    </div>
  );
};

// CSS cho overlays
const styles = `
  .instance-count {
    background-color: #4f46e5;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    z-index: 1000;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default BpmnDiagram;