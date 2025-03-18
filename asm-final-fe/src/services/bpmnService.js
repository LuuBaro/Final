// src/services/bpmnService.js
import BpmnJS from "bpmn-js";

/**
 * Service xử lý các tác vụ liên quan đến BPMN viewer và dữ liệu runtime từ Camunda API.
 */
class BpmnService {
  constructor() {
    this.viewer = null;
  }

  // Khởi tạo viewer và gắn vào container
  initializeViewer(container) {
    if (!container) {
      throw new Error("Container chưa sẵn sàng");
    }

    this.viewer = new BpmnJS({ container });

    // Ngăn chặn hành vi cuộn trang khi sử dụng wheel trên sơ đồ
    const preventDefaultWheel = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };
    container.addEventListener("wheel", preventDefaultWheel, { passive: false });

    // Trả về cleanup function
    return () => {
      if (this.viewer) {
        this.viewer.destroy();
      }
      container.removeEventListener("wheel", preventDefaultWheel);
    };
  }

  // Import BPMN XML vào viewer
  async importBpmnXml(bpmnXml, container) {
    if (!this.viewer || !bpmnXml) {
      throw new Error("Viewer hoặc bpmnXml không sẵn sàng");
    }

    if (!bpmnXml.includes("</bpmn:definitions>")) {
      throw new Error("XML không hợp lệ: Thiếu thẻ đóng </bpmn:definitions>");
    }

    const canvas = this.viewer.get("canvas");
    if (!canvas) {
      throw new Error("Canvas không được khởi tạo");
    }

    try {
      await this.viewer.importXML(bpmnXml);

      // Tính toán và đặt viewbox để căn giữa sơ đồ
      const minX = 172;
      const maxX = 1482;
      const minY = 77;
      const maxY = 390;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const width = maxX - minX;
      const height = maxY - minY;

      const containerWidth = container.clientWidth || 800;
      const containerHeight = container.clientHeight || 600;
      const scale = Math.min(containerWidth / width, containerHeight / height) * 0.9;
      canvas.viewbox({
        x: centerX - containerWidth / (2 * scale),
        y: centerY - containerHeight / (2 * scale),
        width: containerWidth / scale,
        height: containerHeight / scale,
      });
    } catch (err) {
      throw new Error(`Lỗi khi tải sơ đồ: ${err.message}`);
    }
  }

  // Fetch runtime data từ Camunda API
  async fetchRuntimeData(processDefinitionId) {
    try {
      const instancesResponse = await fetch(
        `http://localhost:8080/engine-rest/process-instance?processDefinitionId=${processDefinitionId}`
      );
      if (!instancesResponse.ok) {
        throw new Error("Không thể lấy process instances");
      }
      const instances = await instancesResponse.json();

      const counts = {};
      for (const instance of instances) {
        const activityResponse = await fetch(
          `http://localhost:8080/engine-rest/process-instance/${instance.id}/activity-instances`
        );
        if (!activityResponse.ok) {
          throw new Error("Không thể lấy activity instances");
        }
        const activityData = await activityResponse.json();

        activityData.childActivityInstances.forEach((activity) => {
          if (!activity.endTime) {
            const activityId = activity.activityId;
            counts[activityId] = (counts[activityId] || 0) + 1;
          }
        });
      }
      return counts;
    } catch (error) {
      throw new Error(`Lỗi khi lấy dữ liệu runtime: ${error.message}`);
    }
  }

  // Thêm overlays để hiển thị số lượng instance
  addOverlays(instanceCounts) {
    if (!this.viewer || Object.keys(instanceCounts).length === 0) return;

    const overlays = this.viewer.get("overlays");
    const elementRegistry = this.viewer.get("elementRegistry");

    overlays.clear();
    Object.entries(instanceCounts).forEach(([activityId, count]) => {
      const element = elementRegistry.get(activityId);
      if (element) {
        overlays.add(activityId, {
          position: { bottom: 13, left: 0 },
          html: `<div class="instance-count">${count}</div>`,
        });
      }
    });
  }

  // Hủy viewer khi không cần thiết
  destroy() {
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
}

export default BpmnService;