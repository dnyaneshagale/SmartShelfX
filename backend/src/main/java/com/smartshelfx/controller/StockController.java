package com.smartshelfx.controller;

import com.smartshelfx.dto.StockTransactionRequest;
import com.smartshelfx.model.StockTransaction;
import com.smartshelfx.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin(origins = "*")
public class StockController {
    
    @Autowired
    private StockService stockService;
    
    @PostMapping("/transaction")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> recordTransaction(@RequestBody StockTransactionRequest request) {
        return ResponseEntity.ok(stockService.recordTransaction(request));
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<List<StockTransaction>> getAllTransactions() {
        return ResponseEntity.ok(stockService.getAllTransactions());
    }
    
    @GetMapping("/transactions/{productId}")
    public ResponseEntity<List<StockTransaction>> getTransactionsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getTransactionsByProduct(productId));
    }
}
