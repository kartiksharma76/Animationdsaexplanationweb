package com.animateddsa.repository;

import com.animateddsa.entity.Question;
import com.animateddsa.entity.User;
import com.animateddsa.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUserAndQuestion(User user, Question question);
    List<UserProgress> findAllByUser(User user);
    long countByUserAndStatus(User user, String status);
}
