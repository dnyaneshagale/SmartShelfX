package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.DemandForecast;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandForecastRepository extends JpaRepository<DemandForecast, Long> {

    List<DemandForecast> findByProductIdOrderByForecastDateDesc(Long productId);

    Page<DemandForecast> findByProductId(Long productId, Pageable pageable);

    @Query("SELECT df FROM DemandForecast df WHERE df.product.id = :productId " +
            "AND df.forecastDate BETWEEN :startDate AND :endDate ORDER BY df.forecastDate ASC")
    List<DemandForecast> findByProductIdAndDateRange(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT df FROM DemandForecast df WHERE df.isAtRisk = true ORDER BY df.daysUntilStockout ASC")
    List<DemandForecast> findProductsAtRisk();

    @Query("SELECT df FROM DemandForecast df WHERE df.isAtRisk = true AND df.product.vendor.id = :vendorId")
    List<DemandForecast> findProductsAtRiskByVendor(@Param("vendorId") Long vendorId);

    @Query("SELECT df FROM DemandForecast df WHERE df.forecastDate = :date AND df.forecastPeriod = :period")
    List<DemandForecast> findByDateAndPeriod(@Param("date") LocalDate date, @Param("period") String period);

    Optional<DemandForecast> findTopByProductIdOrderByCreatedAtDesc(Long productId);

    @Query("SELECT df FROM DemandForecast df WHERE df.product.id = :productId " +
            "AND df.forecastPeriod = :period ORDER BY df.forecastDate DESC")
    List<DemandForecast> findLatestByProductAndPeriod(
            @Param("productId") Long productId,
            @Param("period") String period,
            Pageable pageable);

    @Query("SELECT DISTINCT df.product.id FROM DemandForecast df WHERE df.isAtRisk = true")
    List<Long> findAtRiskProductIds();
}
