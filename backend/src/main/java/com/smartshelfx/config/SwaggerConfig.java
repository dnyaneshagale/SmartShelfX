package com.smartshelfx.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI smartShelfXAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartShelfX API")
                        .description("AI-Based Inventory Forecast & Auto-Replenishment System")
                        .version("1.0")
                        .contact(new Contact()
                                .name("SmartShelfX Team")
                                .email("support@smartshelfx.com")));
    }
}
