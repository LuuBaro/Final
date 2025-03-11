package com.example.workflow.service;

import com.example.workflow.model.*;
import com.example.workflow.repository.*;
import com.example.workflow.utils.Constants;
import lombok.RequiredArgsConstructor;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private final RuntimeService runtimeService;
    private final TaskService taskService;

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
            order.setStatus(Order.OrderStatus.CANCELED); // Hoặc bạn có thể không thay đổi trạng thái
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
}