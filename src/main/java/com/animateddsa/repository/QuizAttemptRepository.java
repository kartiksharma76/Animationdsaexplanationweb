package com.animateddsa.repository;

import com.animateddsa.entity.QuizAttempt;
import com.animateddsa.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findAllByUserOrderByCompletedAtDesc(User user);
    long countByUser(User user);
}
