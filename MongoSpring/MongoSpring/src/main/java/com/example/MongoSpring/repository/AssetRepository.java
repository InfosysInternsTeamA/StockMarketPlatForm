package com.example.MongoSpring.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.MongoSpring.model.Asset;

public interface AssetRepository extends MongoRepository<Asset, String> {
}
