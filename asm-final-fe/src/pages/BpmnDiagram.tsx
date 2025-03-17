// src/components/BpmnDiagram.tsx
import React, { useEffect, useRef, useState } from "react";
import BpmnJS, { BpmnJS as BpmnJSInstance } from "bpmn-js";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

// Định nghĩa type cho props
interface BpmnDiagramProps {
  bpmnXml: string | null;
  processDefinitionId: string;
}

const BpmnDiagram: React.FC<BpmnDiagramProps> = ({
  bpmnXml,
  processDefinitionId,
}) => {
  const viewerRef = useRef<BpmnJSInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [instanceCounts, setInstanceCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isImported, setIsImported] = useState(false);

  // Khởi tạo viewer một lần duy nhất khi component mount
  useEffect(() => {
    if (!containerRef.current) {
      console.error("Container chưa sẵn sàng");
      setError("Container chưa sẵn sàng");
      return;
    }

    console.log("Container sẵn sàng:", containerRef.current);

    // Khởi tạo BpmnJS
    const viewer = new BpmnJS({
      container: containerRef.current,
    });
    viewerRef.current = viewer;

    // Ngăn chặn hành vi cuộn trang khi sử dụng wheel trên sơ đồ
    const preventDefaultWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault(); // Chỉ ngăn chặn khi Ctrl được nhấn (zoom)
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", preventDefaultWheel, { passive: false });
    }

    // Cleanup khi component unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
      if (container) {
        container.removeEventListener("wheel", preventDefaultWheel);
      }
    };
  }, []); // Chỉ chạy một lần khi component mount

  // Xử lý import XML khi bpmnXml thay đổi
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !bpmnXml) {
      console.error("Viewer hoặc bpmnXml không sẵn sàng:", { viewer, bpmnXml });
      setError("Viewer hoặc dữ liệu BPMN không sẵn sàng");
      return;
    }

    // Kiểm tra xem bpmnXml có hợp lệ không
    if (!bpmnXml.includes("</bpmn:definitions>")) {
      console.error("bpmnXml không hợp lệ: Thiếu thẻ đóng </bpmn:definitions>");
      setError("XML không hợp lệ: Thiếu thẻ đóng");
      return;
    }

    console.log("bpmnXml trước khi import:", bpmnXml.substring(0, 500));

    // Đảm bảo container và canvas sẵn sàng trước khi import
    const importXML = () => {
      const canvas = viewer.get("canvas");
      if (!canvas) {
        console.error("Canvas không được khởi tạo trước khi import");
        setError("Canvas không được khởi tạo");
        return;
      }

      viewer
        .importXML(bpmnXml)
        .then(() => {
          console.log("Import BPMN XML thành công");
          console.log("Canvas sau khi import:", canvas);

          // Tính toán trung tâm của sơ đồ dựa trên layout trong <bpmndi:BPMNDiagram>
          const minX = 172; // Tọa độ x nhỏ nhất từ BPMNShape (StartEvent_1)
          const maxX = 1482; // Tọa độ x lớn nhất từ Event_16lgxzo
          const minY = 77; // Tọa độ y nhỏ nhất từ Activity_Cancel_Order
          const maxY = 390; // Tọa độ y lớn nhất từ Event_0s9smuw

          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const width = maxX - minX;
          const height = maxY - minY;

          // Đặt viewbox để căn giữa sơ đồ
          const containerWidth = containerRef.current?.clientWidth || 800;
          const containerHeight = containerRef.current?.clientHeight || 600;
          const scale = Math.min(containerWidth / width, containerHeight / height) * 0.9; // 90% để có khoảng cách
          canvas.viewbox({
            x: centerX - containerWidth / (2 * scale),
            y: centerY - containerHeight / (2 * scale),
            width: containerWidth / scale,
            height: containerHeight / scale,
          });

          setIsImported(true);
        })
        .catch((err: Error) => {
          console.error("Lỗi khi import BPMN XML:", err);
          if (!isImported) {
            setError(`Lỗi khi tải sơ đồ: ${err.message}`);
          }
        });
    };

    // Thêm độ trễ để đảm bảo canvas layers sẵn sàng
    setTimeout(() => {
      importXML();
    }, 500); // Độ trễ 500ms
  }, [bpmnXml]);

  // Fetch runtime data từ Camunda REST API
  const fetchRuntimeData = async () => {
    try {
      const instancesResponse = await fetch(
        `http://localhost:8080/engine-rest/process-instance?processDefinitionId=${processDefinitionId}`
      );
      if (!instancesResponse.ok)
        throw new Error("Không thể lấy process instances");
      const instances = await instancesResponse.json();

      const counts: Record<string, number> = {};

      for (const instance of instances) {
        const activityResponse = await fetch(
          `http://localhost:8080/engine-rest/process-instance/${instance.id}/activity-instances`
        );
        if (!activityResponse.ok)
          throw new Error("Không thể lấy activity instances");
        const activityData = await activityResponse.json();

        activityData.childActivityInstances.forEach((activity: any) => {
          if (!activity.endTime) {
            const activityId = activity.activityId;
            counts[activityId] = (counts[activityId] || 0) + 1;
          }
        });
      }

      setInstanceCounts(counts);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu runtime:", error);
      setError(error.message);
    }
  };

  // Hiển thị số lượng instance trên các activity
  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer && isImported && Object.keys(instanceCounts).length > 0) {
      const overlays = viewer.get("overlays") as any;
      const elementRegistry = viewer.get("elementRegistry") as any;

      // Xóa overlays cũ (nếu có)
      overlays.clear();

      Object.entries(instanceCounts).forEach(([activityId, count]) => {
        const element = elementRegistry.get(activityId);
        if (element) {
          overlays.add(activityId, {
            position: { bottom: 10, left: 0 },
            html: `<div class="instance-count" style="
              background-color: #52B415;
              color: white;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
            ">${count}</div>`,
          });
        }
      });
    }
  }, [instanceCounts, isImported]);

  // Fetch runtime data sau khi import thành công
  useEffect(() => {
    if (isImported) {
      fetchRuntimeData();
    }
  }, [isImported]);

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
    background-color: #52B415;
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