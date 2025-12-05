package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.SalesHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesHistoryRepository extends JpaRepository<SalesHistory, Long> {

    List<SalesHistory> findByProductIdOrderBySaleDateDesc(Long productId);

    Page<SalesHistory> findByProductId(Long productId, Pageable pageable);

    @Query("SELECT sh FROM SalesHistory sh WHERE sh.product.id = :productId " +
            "AND sh.saleDate BETWEEN :startDate AND :endDate ORDER BY sh.saleDate ASC")
    List<SalesHistory> findByProductIdAndDateRange(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(sh.quantity) FROM SalesHistory sh WHERE sh.product.id = :productId " +
            "AND sh.saleDate BETWEEN :startDate AND :endDate")
    Integer getTotalSalesByProductAndDateRange(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(sh.totalAmount) FROM SalesHistory sh WHERE " +
            "sh.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalSalesAmount(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT sh.saleDate, SUM(sh.quantity), SUM(sh.totalAmount) FROM SalesHistory sh " +
            "WHERE sh.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY sh.saleDate ORDER BY sh.saleDate")
    List<Object[]> getDailySalesSummary(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT sh.product.id, sh.product.name, SUM(sh.quantity) as totalQty " +
            "FROM SalesHistory sh WHERE sh.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY sh.product.id, sh.product.name ORDER BY totalQty DESC")
    List<Object[]> getTopSellingProducts(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT AVG(sh.quantity) FROM SalesHistory sh WHERE sh.product.id = :productId " +
            "AND sh.saleDate BETWEEN :startDate AND :endDate")
    Double getAverageDailySales(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT sh.product.vendor.id, sh.product.vendor.username, SUM(sh.totalAmount) " +
            "FROM SalesHistory sh WHERE sh.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY sh.product.vendor.id, sh.product.vendor.username")
    List<Object[]> getSalesByVendor(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<SalesHistory> findBySaleDateBetween(LocalDate startDate, LocalDate endDate);
}
