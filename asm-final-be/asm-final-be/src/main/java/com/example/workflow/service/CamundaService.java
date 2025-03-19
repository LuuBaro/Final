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
        UUID orderId = UUID.fromString((String) execution.getVariable("orderId"));
        boolean orderIsValid = true;

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            System.out.println("Order không tồn tại với orderId: " + orderId);
            execution.setVariable("isInStock", false);
            return;
        }

        System.out.println("Kiểm tra đơn hàng: " + orderId);
        for (OrderItem detailRequest : order.getItems()) {
            Product product = productRepository.findById(detailRequest.getProduct().getId()).orElse(null);
            if (product == null) {
                System.out.println("Sản phẩm không tồn tại với ID: " + detailRequest.getProduct().getId());
                orderIsValid = false;
                break;
            }
            int stock = product.getStock();
            int quantity = detailRequest.getQuantity();
            System.out.println("Sản phẩm: " + product.getName() + ", Stock: " + stock + ", Quantity yêu cầu: " + quantity);

            if (quantity > stock) {
                System.out.println("Số lượng yêu cầu (" + quantity + ") vượt quá tồn kho (" + stock + ") cho sản phẩm: " + product.getName());
                orderIsValid = false;
                break;
            } else {
                System.out.println("Số lượng yêu cầu (" + quantity + ") phù hợp với tồn kho (" + stock + ") cho sản phẩm: " + product.getName());
            }
        }
        execution.setVariable("isInStock", orderIsValid);
        System.out.println("Kết quả kiểm tra tồn kho: isInStock = " + orderIsValid);

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
