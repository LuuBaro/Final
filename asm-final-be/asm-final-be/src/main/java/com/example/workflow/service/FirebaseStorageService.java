package com.example.workflow.service;

import com.google.cloud.storage.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Service
public class FirebaseStorageService {

    private final FirebaseApp firebaseApp;

    public FirebaseStorageService(FirebaseApp firebaseApp) {
        this.firebaseApp = firebaseApp;
    }

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String bucketName = firebaseApp.getOptions().getStorageBucket();
        Storage storage = StorageClient.getInstance(firebaseApp).bucket(bucketName).getStorage();
        BlobId blobId = BlobId.of(bucketName, folder + "/" + fileName);

        // Thiết lập quyền truy cập công khai (PUBLIC_READ) khi upload
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .setAcl(Collections.singletonList(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER)))
                .build();

        try {
            // Upload file
            Blob blob = storage.create(blobInfo, file.getBytes());

            // Kiểm tra xem upload có thành công không
            if (blob == null) {
                throw new IOException("Upload file thất bại: " + fileName);
            }

            // Log sau khi upload thành công
            String url = "https://storage.googleapis.com/" + bucketName + "/" + folder + "/" + fileName;

            // Kiểm tra xem file có thực sự tồn tại không
            Blob checkBlob = storage.get(blobId);
            if (checkBlob != null && checkBlob.exists()) {
                System.out.println("Xác nhận file tồn tại trên Firebase Storage: " + fileName);
            } else {
                System.out.println("File không tồn tại trên Firebase Storage sau khi upload: " + fileName);
            }

            return url;
        } catch (Exception e) {
            // Log nếu có lỗi
            System.out.println("Lỗi khi upload file " + fileName + ": " + e.getMessage());
            throw new IOException("Không thể upload file: " + e.getMessage());
        }
    }
}
