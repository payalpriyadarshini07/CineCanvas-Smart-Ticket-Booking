package com.smartticket.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonRecommendationRequest {

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("favorite_genres")
    private List<String> favoriteGenres;

    private Integer limit;
}