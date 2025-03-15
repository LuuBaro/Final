package com.example.workflow.service;

import com.example.workflow.dto.OrderItemDTO;
import com.example.workflow.dto.OrderReportDTO;
import com.example.workflow.model.*;
import com.example.workflow.repository.*;
import com.example.workflow.utils.Constants;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final DataSource dataSource;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(UUID id) {
        return orderRepository.findById(id);
    }

    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    public void deleteOrder(UUID id) {
        orderRepository.deleteById(id);
    }

    @Transactional
    public Order createOrderFromCart(UUID userId) {
        // Kiểm tra user tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Lấy danh sách sản phẩm trong giỏ hàng
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Tạo đơn hàng mới
        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // Xử lý từng mục trong giỏ hàng
        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();

            // Kiểm tra số lượng tồn kho
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Tạo OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            // Cập nhật số lượng tồn kho
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        // Lưu order trước để có ID
        Order savedOrder = orderRepository.save(order);

        // Lưu từng OrderItem
        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(savedOrder); // Gán lại tham chiếu đến savedOrder
            orderItemRepository.save(orderItem);
        }

        // Đẩy vào Camunda
        Map<String, Object> variables = new HashMap<>();
        variables.put("orderId", savedOrder.getId().toString());
        variables.put("userId", user.getId().toString());
        variables.put("totalAmount", totalAmount.toString()); // Chuyển BigDecimal thành String nếu cần

        runtimeService.startProcessInstanceByKey(
                "orderProcess",                  // Tên quy trình trong Camunda
                savedOrder.getId().toString(),   // Business key
                variables                        // Biến truyền vào
        );

        // Xóa giỏ hàng sau khi tạo đơn hàng thành công
        cartRepository.deleteAll(cartItems);

        return savedOrder;
    }

    // Người dùng huỷ hàng
    public ResponseEntity<?> cancelOrder(String orderId, String taskId) {
        try {
            // 1. Kiểm tra order có tồn tại không
            UUID orderUUID = UUID.fromString(orderId);
            Optional<Order> optionalOrder = orderRepository.findById(orderUUID);
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.badRequest().body("Order not found");
            }

            // 2. Cập nhật trạng thái đơn hàng
            Order order = optionalOrder.get();
            order.setStatus(Order.OrderStatus.CANCELED);
            orderRepository.save(order);

            // 3. Chuẩn bị biến cho Camunda
            // Gán orderCanceled = false để biểu thị rằng khách hàng muốn hủy đơn.
            Map<String, Object> variables = new HashMap<>();
            variables.put("orderCanceled", true);

            Task task = null;
            // Nếu taskId không được truyền, tìm kiếm task dựa trên business key (orderId) và task definition key
            if (taskId == null || taskId.trim().isEmpty()) {
                task = taskService.createTaskQuery()
                        .processInstanceBusinessKey(order.getId().toString())
                        .taskDefinitionKey(Constants.USER_TASK_CANCEL_ORDER)
                        .singleResult();
                if (task == null) {
                    // Log thông tin để kiểm tra
                    System.out.println("Không tìm thấy task với business key: " + order.getId().toString() +
                            " và task definition key: " + Constants.USER_TASK_CANCEL_ORDER);
                    return ResponseEntity.badRequest().body("Task not found for order cancellation");
                }
                taskId = task.getId();
            } else {
                // Nếu taskId đã được truyền, truy vấn task đó
                task = taskService.createTaskQuery().taskId(taskId).singleResult();
                if (task == null) {
                    return ResponseEntity.badRequest().body("Task not found");
                }
            }

            // 4. Hoàn thành task, Camunda sẽ rẽ nhánh theo điều kiện (ví dụ: ${orderCanceled == false})
            taskService.complete(taskId, variables);

            return ResponseEntity.ok("Order canceled successfully.");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid orderId format");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    // Xác nhận hủy và xóa đơn
    public ResponseEntity<?> deleteOrder(String orderId, String taskId) {
        try {
            // 1. Kiểm tra order có tồn tại không
            UUID orderUUID = UUID.fromString(orderId);
            Optional<Order> optionalOrder = orderRepository.findById(orderUUID);
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.badRequest().body("Order not found");
            }

            Order order = optionalOrder.get();
            // 2. Cập nhật trạng thái đơn hàng nếu cần (ví dụ: chuyển thành DELETED hoặc giữ nguyên trạng thái)
            // Nếu bạn muốn cập nhật trạng thái, hãy chắc chắn rằng enum OrderStatus có giá trị này.
            order.setStatus(Order.OrderStatus.DELETED); // Hoặc bạn có thể không thay đổi trạng thái
            orderRepository.save(order);

            // 3. Chuẩn bị biến cho Camunda để báo hiệu rằng đơn đã bị xóa (hoàn tất task)
            Map<String, Object> variables = new HashMap<>();
            variables.put("deleted", true);

            Task task = null;
            // Nếu taskId không được truyền, tìm kiếm task dựa trên business key (orderId) và task definition key
            if (taskId == null || taskId.trim().isEmpty()) {
                task = taskService.createTaskQuery()
                        .processInstanceBusinessKey(order.getId().toString())
                        .taskDefinitionKey(Constants.USER_TASK_DELETE_ORDER)
                        .singleResult();
                if (task == null) {
                    // Log để kiểm tra
                    System.out.println("Không tìm thấy task với business key: " + order.getId().toString() +
                            " và task definition key: " + Constants.USER_TASK_DELETE_ORDER);
                    return ResponseEntity.badRequest().body("Task not found for order deletion");
                }
                taskId = task.getId();
            } else {
                // Nếu taskId đã được truyền, truy vấn task đó
                task = taskService.createTaskQuery().taskId(taskId).singleResult();
                if (task == null) {
                    return ResponseEntity.badRequest().body("Task not found");
                }
            }

            // 4. Hoàn thành task, Camunda sẽ tiến hành end-task (rẽ nhánh theo biến deleted)
            taskService.complete(taskId, variables);

            return ResponseEntity.ok("Order deleted successfully.");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid orderId format");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    // Admin duyệt đơn hàng trước khi người dùng hủy hàng
    public ResponseEntity<?> approveOrder(String orderId, String taskId) {
        try {
            UUID orderUUID = UUID.fromString(orderId);
            Optional<Order> optionalOrder = orderRepository.findById(orderUUID);
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }
            Order order = optionalOrder.get();

            // Cập nhật trạng thái duyệt
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // Thiết lập biến cho Camunda
            Map<String, Object> variables = new HashMap<>();
            variables.put("orderCanceled", false); // Đặt false vì admin duyệt đơn
            variables.put("orderId", order.getId().toString());

            Task task = taskService.createTaskQuery()
                    .processInstanceBusinessKey(order.getId().toString())
                    .taskDefinitionKey(Constants.USER_TASK_CANCEL_ORDER)
                    .singleResult();

            if (task == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Task not found"));
            }

            taskService.complete(task.getId(), variables);

            // ✅ Trả về trạng thái mới của đơn hàng
            return ResponseEntity.ok(Map.of("status", order.getStatus().toString()));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid orderId format"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error: " + e.getMessage()));
        }
    }

    // Nếu còn hàng
    public ResponseEntity<String> approveStock(String orderId) {
        try {
            UUID orderUUID;
            try {
                orderUUID = UUID.fromString(orderId);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body("❌ Invalid orderId format");
            }

            Optional<Order> optionalOrder = orderRepository.findById(orderUUID);
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.badRequest().body("❌ Order not found");
            }

            // 🔍 Kiểm tra Process Instance trước
            ProcessInstance instance = runtimeService.createProcessInstanceQuery()
                    .processInstanceBusinessKey(orderId)
                    .singleResult();

            if (instance == null) {
                return ResponseEntity.badRequest().body("❌ Không tìm thấy ProcessInstance với orderId: " + orderId);
            }

            Order order = optionalOrder.get();

            // Cập nhật trạng thái duyệt
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // 🔍 Tìm Task "Còn hàng"
            Task task = taskService.createTaskQuery()
                    .processInstanceId(instance.getId())
                    .taskDefinitionKey(Constants.USER_TASK_APPROVE_ORDER)
                    .singleResult();

            if (task == null) {
                return ResponseEntity.badRequest().body("❌ Không tìm thấy User Task 'Còn hàng' trong quy trình.");
            }

            // ✅ Hoàn thành Task
            Map<String, Object> variables = new HashMap<>();
            variables.put("isInStock", true);
            taskService.complete(task.getId(), variables);

            return ResponseEntity.ok("✅ Đơn hàng đã xác nhận còn hàng và chuyển sang kiểm tra thanh toán!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("❌ Internal Server Error: " + e.getMessage());
        }
    }

    // Nếu hết hàng
    public ResponseEntity<?> rejectStock(String orderId) {
        try {
            // 1️⃣ Chuyển đổi orderId sang UUID để đảm bảo hợp lệ
            UUID orderUUID;
            try {
                orderUUID = UUID.fromString(orderId);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body("❌ Invalid orderId format");
            }

            // 2️⃣ Kiểm tra đơn hàng có tồn tại không
            Optional<Order> optionalOrder = orderRepository.findById(orderUUID);
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.badRequest().body("❌ Order not found");
            }

            Order order = optionalOrder.get();

            // Cập nhật trạng thái duyệt
            order.setStatus(Order.OrderStatus.CANCELED);
            orderRepository.save(order);

            // 3️⃣ Tìm Task "Hết hàng" liên quan đến đơn hàng
            Task task = taskService.createTaskQuery()
                    .processInstanceBusinessKey(orderUUID.toString()) // Tìm theo businessKey (orderId)
                    .taskDefinitionKey(Constants.USER_TASK_REJECT_ORDER) // Định danh task "Hết hàng"
                    .singleResult();

            if (task == null) {
                // Log thông tin để debug nếu cần
                System.out.println("Không tìm thấy task 'Hết hàng' cho đơn hàng: " + orderId);
                return ResponseEntity.badRequest().body("❌ Không tìm thấy User Task 'Hết hàng' cho đơn hàng: " + orderId);
            }

            // 4️⃣ Hoàn thành Task "Hết hàng" với biến báo hiệu hết hàng
            Map<String, Object> variables = new HashMap<>();
            variables.put("isInStock", false); // Xác nhận hết hàng
            taskService.complete(task.getId(), variables);

            return ResponseEntity.ok(Map.of(
                    "message", "🚨 Đơn hàng đã bị hủy do hết hàng!",
                    "orderId", orderId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("❌ Internal Server Error: " + e.getMessage());
        }
    }

    // Xác nhận thanh toán thành công
    public ResponseEntity<?> completePaymentSuccess(String orderId) {
        try {
            UUID orderUUID;
            try {
                orderUUID = UUID.fromString(orderId);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body("❌ Invalid orderId format");
            }

            Optional<Order> optionalOrder = orderRepository.findById(orderUUID);
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.badRequest().body("❌ Order not found");
            }

            Order order = optionalOrder.get();

            // Cập nhật trạng thái duyệt
            order.setStatus(Order.OrderStatus.APPROVED);
            orderRepository.save(order);

            // Tìm Task "Thanh toán thành công"
            Task task = taskService.createTaskQuery()
                    .processInstanceBusinessKey(orderUUID.toString()) // Tìm theo orderId
                    .taskDefinitionKey("Activity_0ardm9h") // ID của User Task "Thanh toán thành công"
                    .singleResult();

            if (task == null) {
                return ResponseEntity.badRequest().body("❌ Không tìm thấy User Task 'Thanh toán thành công' cho orderId: " + orderId);
            }

            // Hoàn thành Task => Camunda sẽ tự động đi đến End Event
            taskService.complete(task.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "✅ Đơn hàng đã hoàn tất, bắt đầu giao hàng!",
                    "orderId", orderId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("❌ Internal Server Error: " + e.getMessage());
        }
    }

    // Xác nhận thanh toán thất bại
    public ResponseEntity<?> completePaymentFailure(String orderId) {
        try {
            UUID orderUUID;
            try {
                orderUUID = UUID.fromString(orderId);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body("❌ Invalid orderId format");
            }

            Optional<Order> optionalOrder = orderRepository.findById(orderUUID);
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.badRequest().body("❌ Order not found");
            }

            Order order = optionalOrder.get();

            // Cập nhật trạng thái duyệt
            order.setStatus(Order.OrderStatus.DELETED);
            orderRepository.save(order);

            // Tìm Task "Thanh toán thất bại"
            Task task = taskService.createTaskQuery()
                    .processInstanceBusinessKey(orderUUID.toString()) // Tìm theo orderId
                    .taskDefinitionKey("Activity_0vqplu0") // ID của User Task "Thanh toán thất bại"
                    .singleResult();

            if (task == null) {
                return ResponseEntity.badRequest().body("❌ Không tìm thấy User Task 'Thanh toán thất bại' cho orderId: " + orderId);
            }

            // Hoàn thành Task => Camunda sẽ tự động kết thúc quy trình
            taskService.complete(task.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "❌ Thanh toán thất bại, đơn hàng đã bị hủy!",
                    "orderId", orderId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("❌ Internal Server Error: " + e.getMessage());
        }
    }

    // Lấy danh sách báo cáo đơn hàng
    public List<OrderReportDTO> getOrderReport(LocalDate fromDate, LocalDate toDate, String status) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM camunda.get_order_report(?, ?, ?)")) {
            // Thiết lập tham số
            stmt.setObject(1, fromDate != null ? java.sql.Date.valueOf(fromDate) : null);
            stmt.setObject(2, toDate != null ? java.sql.Date.valueOf(toDate) : null);
            stmt.setString(3, status);

            List<OrderReportDTO> orders = new ArrayList<>();
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    OrderReportDTO dto = new OrderReportDTO();
                    dto.setId(UUID.fromString(rs.getString("order_id")));
                    dto.setUserName(rs.getString("user_name"));
                    dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    dto.setStatus(rs.getString("status"));
                    dto.setTotalAmount(rs.getBigDecimal("total_amount"));
                    dto.setProducts(rs.getString("products"));

                    // Lấy chi tiết đơn hàng
                    List<OrderItemDTO> items = getOrderItems(conn, dto.getId());
                    dto.setItems(items);

                    orders.add(dto);
                }
            }
            return orders;
        } catch (SQLException e) {
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    // Lấy chi tiết đơn hàng
    private List<OrderItemDTO> getOrderItems(Connection conn, UUID orderId) throws SQLException {
        try (PreparedStatement itemStmt = conn.prepareStatement(
                "SELECT oi.quantity, p.name, oi.price, oi.subtotal " +
                        "FROM order_items oi JOIN products p ON oi.product_id = p.id " +
                        "WHERE oi.order_id = ?")) {
            itemStmt.setObject(1, orderId);
            List<OrderItemDTO> items = new ArrayList<>();
            try (ResultSet itemRs = itemStmt.executeQuery()) {
                while (itemRs.next()) {
                    OrderItemDTO item = new OrderItemDTO();
                    item.setQuantity(itemRs.getInt("quantity"));
                    item.setProductName(itemRs.getString("name"));
                    item.setPrice(itemRs.getBigDecimal("price"));
                    item.setSubtotal(itemRs.getBigDecimal("subtotal"));
                    items.add(item);
                }
            }
            return items;
        }
    }

    // Xuất báo cáo
    public byte[] exportReport(String format, LocalDate fromDate, LocalDate toDate, String status) throws JRException {
        try (Connection conn = dataSource.getConnection()) {
            // Load file JRXML
            InputStream jrxmlInputStream = getClass().getResourceAsStream("/reports/order_report.jrxml");
            if (jrxmlInputStream == null) {
                throw new IllegalStateException("Report template 'order_report.jrxml' not found in resources/reports/");
            }

            // Log tham số
            System.out.println("Export Parameters: FROM_DATE_PARAM=" + fromDate + ", TO_DATE_PARAM=" + toDate + ", STATUS_PARAM=" + status);

            // Compile báo cáo
            JasperReport jasperReport = JasperCompileManager.compileReport(jrxmlInputStream);
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("FROM_DATE_PARAM", fromDate != null ? fromDate.toString() : null);
            parameters.put("TO_DATE_PARAM", toDate != null ? toDate.toString() : null);
            parameters.put("STATUS_PARAM", status);

            // Điền dữ liệu vào báo cáo
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            // Xuất báo cáo
            if ("excel".equalsIgnoreCase(format)) {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                JRXlsxExporter exporter = new JRXlsxExporter();
                exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
                exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(baos));
                exporter.exportReport();
                return baos.toByteArray();
            } else if ("pdf".equalsIgnoreCase(format)) {
                return JasperExportManager.exportReportToPdf(jasperPrint);
            } else {
                throw new IllegalArgumentException("Unsupported report format: " + format);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }
}