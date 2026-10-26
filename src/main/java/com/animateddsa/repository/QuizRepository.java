package com.animateddsa.repository;

import com.animateddsa.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCategoryId(Long categoryId);
    Optional<Quiz> findByQuestionId(Long questionId);
}
