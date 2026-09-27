package com.kaarigarexpo.kaarigar_service.repository;

import com.kaarigarexpo.kaarigar_service.entity.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, String> {
}
