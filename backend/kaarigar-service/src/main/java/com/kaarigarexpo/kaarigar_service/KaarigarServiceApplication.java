package com.kaarigarexpo.kaarigar_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class KaarigarServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(KaarigarServiceApplication.class, args);
	}

}
