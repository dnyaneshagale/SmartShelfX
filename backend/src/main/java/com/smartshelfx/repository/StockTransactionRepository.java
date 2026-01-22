package com.smartshelfx.repository;

import com.smartshelfx.model.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByProductId(Long productId);
    
    @Query("SELECT st FROM StockTransaction st WHERE st.product.id = :productId " +
           "AND st.transactionDate >= :startDate ORDER BY st.transactionDate DESC")
    List<StockTransaction> findRecentTransactions(@Param("productId") Long productId, 
                                                   @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT st FROM StockTransaction st WHERE st.product.sku = :sku " +
           "AND st.transactionType = 'OUT' AND st.transactionDate >= :startDate")
    List<StockTransaction> findSalesDataForForecast(@Param("sku") String sku, 
                                                     @Param("startDate") LocalDateTime startDate);
}
