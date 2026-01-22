package com.smartshelfx.repository;

import com.smartshelfx.model.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ForecastRepository extends JpaRepository<Forecast, Long> {
    List<Forecast> findByProductId(Long productId);
    Optional<Forecast> findBySku(String sku);
    List<Forecast> findBySkuOrderByCreatedAtDesc(String sku);
}
