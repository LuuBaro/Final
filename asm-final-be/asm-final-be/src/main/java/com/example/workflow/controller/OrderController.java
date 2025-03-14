package com.example.workflow.controller;

import com.example.workflow.dto.OrderItemDTO;
import com.example.workflow.dto.OrderReportDTO;
import com.example.workflow.model.Order;
import com.example.workflow.model.User;
import com.example.workflow.repository.OrderRepository;
import com.example.workflow.service.OrderService;
import com.example.workflow.service.UserService;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.sql.*;
import java.sql.Date;
import java.util.*;

@RestController
@RequestMapping("/api")
public class OrderController {
    @Autowired
    private DataSource dataSource;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private OrderRepository orderRepository;

    // API lấy tất cả đơn hàng
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    // API lấy đơn hàng theo userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable("userId") String userId) {
        try {
            UUID userUUID = UUID.fromString(userId);
            List<Order> orders = orderRepository.findAllByUser_Id(userUUID);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid userId format");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout() {
        try {
            User currentUser = getCurrentUser();
            Order order = orderService.createOrderFromCart(currentUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi tạo đơn hàng");
        }
    }

//    @PostMapping("/orders/{orderId}/pay")
//    public ResponseEntity<?> payOrder(@PathVariable UUID orderId) {
//        try {
//            Order updatedOrder = orderService.updateOrderStatus(orderId, Order.OrderStatus.PAID);
//            return ResponseEntity.ok(updatedOrder);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Đã xảy ra lỗi khi thanh toán");
//        }
//    }

    // Lấy thông tin người dùng hiện tại từ Spring Security
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String userIdStr = ((UserDetails) principal).getUsername(); // Username là userId
            UUID userId = UUID.fromString(userIdStr);
            return userService.getUserById(userId);
        } else {
            throw new RuntimeException("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.");
        }
    }

    @GetMapping("/report")
    public ResponseEntity<List<OrderReportDTO>> getOrderReport(
            @RequestParam(name = "date", required = false) String date,
            @RequestParam(name = "status", required = false) String status) throws SQLException {
        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall("{ ? = call get_order_report(?, ?) }")) {
            stmt.registerOutParameter(1, Types.OTHER); // Đăng ký tham số trả về
            stmt.setObject(2, date != null && !date.isEmpty() ? java.sql.Date.valueOf(date) : null);
            stmt.setString(3, status);
            stmt.execute();
            ResultSet rs = stmt.getObject(1, ResultSet.class); // Lấy ResultSet từ hàm PostgreSQL
            List<OrderReportDTO> orders = new ArrayList<>();
            while (rs.next()) {
                OrderReportDTO dto = new OrderReportDTO();
                dto.setId(UUID.fromString(rs.getString("order_id")));
                dto.setUserName(rs.getString("user_name"));
                dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                dto.setStatus(rs.getString("status"));
                dto.setTotalAmount(rs.getBigDecimal("total_amount"));
                dto.setProducts(rs.getString("products"));

                // Lấy danh sách items
                try (PreparedStatement itemStmt = conn.prepareStatement(
                        "SELECT oi.quantity, p.name, oi.price, oi.subtotal " +
                                "FROM order_items oi JOIN products p ON oi.product_id = p.id " +
                                "WHERE oi.order_id = ?")) {
                    itemStmt.setObject(1, UUID.fromString(rs.getString("order_id")));
                    ResultSet itemRs = itemStmt.executeQuery();
                    List<OrderItemDTO> items = new ArrayList<>();
                    while (itemRs.next()) {
                        OrderItemDTO item = new OrderItemDTO();
                        item.setQuantity(itemRs.getInt("quantity"));
                        item.setProductName(itemRs.getString("name"));
                        item.setPrice(itemRs.getBigDecimal("price"));
                        item.setSubtotal(itemRs.getBigDecimal("subtotal"));
                        items.add(item);
                    }
                    dto.setItems(items);
                }
                orders.add(dto);
            }
            return ResponseEntity.ok(orders);
        }
    }

    @GetMapping("/export/{format}")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String format,
            @RequestParam(name = "date", required = false) String date,
            @RequestParam(name = "status", required = false) String status) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            JasperReport jasperReport = JasperCompileManager.compileReport(
                    getClass().getResourceAsStream("/reports/order_report.jrxml"));
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("DATE_PARAM", date);
            parameters.put("STATUS_PARAM", status);
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            byte[] reportBytes;
            String contentType;
            String fileName;
            if ("excel".equalsIgnoreCase(format)) {
                JRXlsxExporter exporter = new JRXlsxExporter();
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
                exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(baos));
                exporter.exportReport();
                reportBytes = baos.toByteArray();
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = "report.xlsx";
            } else {
                reportBytes = JasperExportManager.exportReportToPdf(jasperPrint);
                contentType = "application/pdf";
                fileName = "report.pdf";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", fileName);
            return new ResponseEntity<>(reportBytes, headers, HttpStatus.OK);
        }
    }
}
