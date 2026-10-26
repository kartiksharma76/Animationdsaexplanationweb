package com.animateddsa.repository;

import com.animateddsa.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    Optional<Question> findBySlug(String slug);

    List<Question> findByCategoryId(Long categoryId);

    List<Question> findByDifficulty(String difficulty);

    @Query("SELECT q FROM Question q WHERE " +
           "(:categoryId IS NULL OR q.category.id = :categoryId) AND " +
           "(:difficulty IS NULL OR :difficulty = '' OR UPPER(q.difficulty) = UPPER(:difficulty)) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(q.problemStatement) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY q.id ASC")
    List<Question> filterQuestions(
            @Param("categoryId") Long categoryId,
            @Param("difficulty") String difficulty,
            @Param("search") String search);

    long countByCategoryId(Long categoryId);

    long countByDifficulty(String difficulty);
}
