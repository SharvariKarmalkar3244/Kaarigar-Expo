package com.kaarigarexpo.kaarigar_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "media_assets")
public class MediaAsset {

    @Id
    @Column(length = 64, nullable = false)
    private String filename;

    @Column(length = 100, nullable = false)
    private String contentType;

    @Column(name = "file_data", nullable = false, columnDefinition = "bytea")
    private byte[] data;

    protected MediaAsset() {
    }

    public MediaAsset(String filename, String contentType, byte[] data) {
        this.filename = filename;
        this.contentType = contentType;
        this.data = data;
    }

    public String getFilename() {
        return filename;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getData() {
        return data;
    }
}
