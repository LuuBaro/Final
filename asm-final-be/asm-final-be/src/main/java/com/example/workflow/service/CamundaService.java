package com.example.workflow.service;

import com.example.workflow.model.Order;
import com.example.workflow.model.OrderItem;
import com.example.workflow.model.Product;
import com.example.workflow.repository.OrderRepository;
import com.example.workflow.repository.ProductRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service("service")
public class CamundaService implements JavaDelegate {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    ProductRepository productRepository;

    private static final Logger logger = LoggerFactory.getLogger(CamundaService.class);
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String activityId = execution.getCurrentActivityId();

        switch (activityId) {
            case "check-stock":   // Kiểm tra tồn kho
                processStockCheck(execution);
                break;
            case "confirm-payment":  // Xác nhận thanh toán
                confirmPayment(execution);
                break;
            case "process-payment": // Xử lý thanh toán
                processPayment(execution);
                break;
            default:
                throw new IllegalArgumentException("Không có logic xử lý cho Activity ID: " + activityId);
        }
    }

    // Kiểm tra tồn kho
    private void processStockCheck(DelegateExecution execution) {
        UUID orderId = UUID.fromString((String) execution.getVariable("orderId"));
        boolean orderIsValid = true;

        // Tìm đơn hàng
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            logger.error("Order không tồn tại với orderId: {}", orderId);
            execution.setVariable("isInStock", false);
            return;
        }

        logger.info("Kiểm tra đơn hàng: {}", orderId);

        // Kiểm tra tồn kho cho từng sản phẩm trong đơn hàng
        for (OrderItem detailRequest : order.getItems()) {
            Product product = productRepository.findById(detailRequest.getProduct().getId()).orElse(null);
            if (product == null) {
                logger.error("Sản phẩm không tồn tại với ID: {}", detailRequest.getProduct().getId());
                orderIsValid = false;
                break;
            }

            int stock = product.getStock();
            int quantity = detailRequest.getQuantity();

            logger.info("Sản phẩm: {}, Stock: {}, Quantity yêu cầu: {}", product.getName(), stock, quantity);

            if (quantity > stock) {
                logger.warn("Số lượng yêu cầu ({}) vượt quá tồn kho ({}) cho sản phẩm: {}", quantity, stock, product.getName());
                orderIsValid = false;
                break;
            } else {
                logger.info("Số lượng yêu cầu ({}) phù hợp với tồn kho ({}) cho sản phẩm: {}", quantity, stock, product.getName());
            }
        }

        // Lưu kết quả kiểm tra tồn kho
        execution.setVariable("isInStock", orderIsValid);
        logger.info("Kết quả kiểm tra tồn kho: isInStock = {}", orderIsValid);

        // Chỉ cập nhật trạng thái đơn hàng và trừ tồn kho nếu tồn kho đủ
        if (orderIsValid) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            // Trừ tồn kho ngay sau khi kiểm tra thành công
            for (OrderItem detailRequest : order.getItems()) {
                Product product = productRepository.findByIdForUpdate(detailRequest.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found with ID: " + detailRequest.getProduct().getId()));
                product.setStock(product.getStock() - detailRequest.getQuantity());
                productRepository.save(product);
                logger.info("Đã trừ tồn kho: Sản phẩm = {}, Stock mới = {}", product.getName(), product.getStock());
            }
        } else {
            order.setStatus(Order.OrderStatus.CANCELED);
        }
        orderRepository.save(order);
        logger.info("Cập nhật trạng thái đơn hàng: orderId = {}, status = {}", orderId, order.getStatus());
    }

    // Xác nhận thanh toán
    private void confirmPayment(DelegateExecution execution) {
        System.out.println("✅ Xác nhận thanh toán thành công.");
        execution.setVariable("paymentConfirmed", true);
    }

    // Xử lý thanh toán
    private void processPayment(DelegateExecution execution) {
//            Random random = new Random();
//            boolean isPaymentSuccessful = random.nextBoolean();
        boolean isPaymentSuccessful = true;
        execution.setVariable("isPaymentSuccessful", isPaymentSuccessful);
        execution.setVariable("paymentStatus", isPaymentSuccessful ? "SUCCESS" : "FAILED");
        // Lấy orderId từ biến quy trình
        UUID orderId = UUID.fromString((String) execution.getVariable("orderId"));
        Order order = orderRepository.findById(orderId).orElse(null);

        if (order != null) {
            order.setStatus(isPaymentSuccessful ? Order.OrderStatus.PAID : Order.OrderStatus.FAILED);
            orderRepository.save(order);
        }

        System.out.println("💰 Trạng thái thanh toán: " + (isPaymentSuccessful ? "✅ Thành công (PAYMENT_SUCCESS)" : "❌ Thất bại (PAYMENT_FAILED)"));
    }


}
