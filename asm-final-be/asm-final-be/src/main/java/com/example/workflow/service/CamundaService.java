package com.example.workflow.service;

import com.example.workflow.model.Order;
import com.example.workflow.model.OrderItem;
import com.example.workflow.model.Product;
import com.example.workflow.repository.OrderRepository;
import com.example.workflow.repository.ProductRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service("service")
public class CamundaService implements JavaDelegate {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    ProductRepository productRepository;

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
        // Lấy thông tin sản phẩm từ biến trong quy trình
        UUID orderId = UUID.fromString((String) execution.getVariable("orderId"));
        boolean orderIsValid = true;

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            execution.setVariable("isInStock", false);
            return;
        }

        for (OrderItem detailRequest : order.getItems()) {
            Product product = productRepository.findById(detailRequest.getProduct().getId()).orElse(null);
            if (product == null || detailRequest.getQuantity() > product.getStock()) {
                orderIsValid = false;
                break;
            }
        }
        execution.setVariable("isInStock", orderIsValid);

        // Cập nhật trạng thái đơn hàng
        order.setStatus(Order.OrderStatus.CONFIRMED);
        orderRepository.save(order);
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
        execution.setVariable("paymentStatus", isPaymentSuccessful ? "SUCCESS" : "FAILED"); // Thêm dòng này
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
