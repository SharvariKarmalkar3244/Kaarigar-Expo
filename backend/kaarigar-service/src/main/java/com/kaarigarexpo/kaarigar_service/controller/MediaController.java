package com.kaarigarexpo.kaarigar_service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import com.kaarigarexpo.kaarigar_service.entity.MediaAsset;
import com.kaarigarexpo.kaarigar_service.repository.MediaAssetRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@RestController
@RequestMapping("/api/kaarigars/media")
public class MediaController {

    private static final Map<String, String> IMAGE_EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    private final Path storageRoot;
    private final MediaAssetRepository mediaAssetRepository;
    private final long maxUploadSizeBytes;
    private final S3Client s3Client;
    private final String s3Bucket;

    public MediaController(
            @Value("${media.storage-dir:uploads}") String storageDirectory,
            @Value("${media.max-upload-size-bytes:8388608}") long maxUploadSizeBytes,
            MediaAssetRepository mediaAssetRepository,
            ObjectProvider<S3Client> s3Client,
            @Value("${media.s3.bucket:}") String s3Bucket
    ) {
        this.storageRoot = Path.of(storageDirectory).toAbsolutePath().normalize();
        this.mediaAssetRepository = mediaAssetRepository;
        this.maxUploadSizeBytes = maxUploadSizeBytes;
        this.s3Client = s3Client.getIfAvailable();
        this.s3Bucket = s3Bucket;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse upload(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestPart("file") MultipartFile file
    ) {
        if (userId == null || role == null || role.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in before uploading images");
        }
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose an image to upload");
        }
        if (file.getSize() > maxUploadSizeBytes) {
            long maxUploadSizeMegabytes = maxUploadSizeBytes / (1024 * 1024);
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Images must be " + maxUploadSizeMegabytes + " MB or smaller"
            );
        }

        String contentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);
        String extension = IMAGE_EXTENSIONS.get(contentType);
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Use a JPG, PNG, WebP, or GIF image");
        }

        String filename = UUID.randomUUID() + extension;
        try {
            byte[] bytes = file.getBytes();
            if (s3Client != null) {
                requireS3Bucket();
                s3Client.putObject(PutObjectRequest.builder().bucket(s3Bucket).key(filename).contentType(contentType).build(), RequestBody.fromBytes(bytes));
            } else {
                mediaAssetRepository.save(new MediaAsset(filename, contentType, bytes));
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to read the image", exception);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to store the image", exception);
        }

        return new UploadResponse("/api/kaarigars/media/" + filename);
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        if (!filename.matches("[0-9a-fA-F-]+\\.(jpg|png|webp|gif)")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }

        MediaAsset asset = mediaAssetRepository.findById(filename).orElse(null);
        if (asset != null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(asset.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                    .body(new ByteArrayResource(asset.getData()));
        }

        if (s3Client != null) {
            requireS3Bucket();
            try {
                var object = s3Client.getObjectAsBytes(GetObjectRequest.builder().bucket(s3Bucket).key(filename).build());
                String type = object.response().contentType();
                return ResponseEntity.ok()
                        .contentType(type == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(type))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                        .body(new ByteArrayResource(object.asByteArray()));
            } catch (S3Exception exception) {
                if (exception.statusCode() == 404) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to load the image", exception);
            }
        }

        Path file = storageRoot.resolve(filename).normalize();
        if (!file.startsWith(storageRoot) || !Files.isRegularFile(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }

        try {
            Resource resource = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            MediaType mediaType = contentType == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(contentType);
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                    .body(resource);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found", exception);
        }
    }

    public record UploadResponse(String url) {}

    private void requireS3Bucket() {
        if (s3Bucket == null || s3Bucket.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Object storage is enabled but no bucket is configured");
        }
    }
}
