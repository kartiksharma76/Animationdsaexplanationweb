package com.animateddsa.config;

import com.animateddsa.entity.*;
import com.animateddsa.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           QuestionRepository questionRepository,
                           QuizRepository quizRepository,
                           QuizQuestionRepository quizQuestionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        Map<String, Category> categories = seedCategories();
        seedQuestions(categories);
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                    "admin",
                    "admin@animateddsa.dev",
                    passwordEncoder.encode("Admin@123"),
                    "ROLE_ADMIN"
            );
            admin.setStreakDays(7);
            admin.setTotalSolved(15);
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("student")) {
            User student = new User(
                    "student",
                    "student@animateddsa.dev",
                    passwordEncoder.encode("Student@123"),
                    "ROLE_USER"
            );
            student.setStreakDays(3);
            student.setTotalSolved(5);
            userRepository.save(student);
        }
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> map = new HashMap<>();

        String[][] categoryData = {
                {"arrays", "Arrays", "Continuous memory linear collections, sliding windows, two pointers, prefix sums, and transformations.", "grid", "1"},
                {"strings", "Strings", "String manipulation, pattern matching, anagrams, palindromes, and prefix trees.", "type", "2"},
                {"linked-lists", "Linked Lists", "Singly & doubly linked nodes, pointer reversals, cycle detection, and merge operations.", "link", "3"},
                {"stacks", "Stacks", "LIFO data structures, monotonic stacks, parenthesis balancing, and expression evaluation.", "layers", "4"},
                {"queues", "Queues", "FIFO data structures, circular buffers, deques, and monotonic window buffers.", "inbox", "5"},
                {"searching", "Searching", "Linear search, binary search on arrays, binary search on answer spaces, and ternary search.", "search", "6"},
                {"sorting", "Sorting", "Comparison & non-comparison sorts: Bubble, Quick, Merge, and Heap sorts.", "bar-chart-2", "7"},
                {"trees", "Trees", "Binary Trees, Binary Search Trees, traversals, lowest common ancestors, and depth queries.", "git-pull-request", "8"},
                {"graphs", "Graphs", "Breadth-First Search, Depth-First Search, topological sorting, and shortest path algorithms.", "share-2", "9"},
                {"recursion", "Recursion", "Backtracking, recursion trees, divide-and-conquer, and state exploration.", "refresh-cw", "10"},
                {"greedy", "Greedy Algorithms", "Locally optimal choices, interval scheduling, fractional knapsack, and activity selection.", "zap", "11"},
                {"dynamic-programming", "Dynamic Programming", "Optimal substructure, overlapping subproblems, memoization, and tabular solutions.", "cpu", "12"}
        };

        for (String[] data : categoryData) {
            String slug = data[0];
            Category cat = categoryRepository.findBySlug(slug).orElseGet(() -> {
                Category c = new Category(slug, data[1], data[2], data[3], Integer.parseInt(data[4]));
                return categoryRepository.save(c);
            });
            map.put(slug, cat);
        }

        return map;
    }

    private void seedQuestions(Map<String, Category> categories) {
        if (questionRepository.count() > 0) {
            syncQuestionVisualizerTypes();
            return; // Already seeded
        }

        // 1. Two Sum (Arrays - Two Pointer)
        Question q1 = createTwoSumQuestion(categories.get("arrays"));
        questionRepository.save(q1);
        seedQuizForTwoSum(q1, categories.get("arrays"));

        // 2. Container With Most Water (Arrays - Two Pointer)
        Question q2 = createContainerWaterQuestion(categories.get("arrays"));
        questionRepository.save(q2);

        // 3. Maximum Subarray - Kadane's Algorithm (Arrays)
        Question q3 = createKadaneQuestion(categories.get("arrays"));
        questionRepository.save(q3);

        // 4. Longest Substring Without Repeating Characters (Strings - Sliding Window)
        Question q4 = createLongestSubstringQuestion(categories.get("strings"));
        questionRepository.save(q4);
        seedQuizForLongestSubstring(q4, categories.get("strings"));

        // 5. Valid Palindrome (Strings)
        Question q5 = createValidPalindromeQuestion(categories.get("strings"));
        questionRepository.save(q5);

        // 6. Reverse Linked List (Linked Lists)
        Question q6 = createReverseLinkedListQuestion(categories.get("linked-lists"));
        questionRepository.save(q6);
        seedQuizForReverseList(q6, categories.get("linked-lists"));

        // 7. Middle of the Linked List (Linked Lists - Fast & Slow Pointers)
        Question q7 = createMiddleNodeQuestion(categories.get("linked-lists"));
        questionRepository.save(q7);

        // 8. Valid Parentheses (Stacks)
        Question q8 = createValidParenthesesQuestion(categories.get("stacks"));
        questionRepository.save(q8);
        seedQuizForValidParentheses(q8, categories.get("stacks"));

        // 9. Sliding Window Maximum (Queues / Deque)
        Question q9 = createSlidingWindowMaxQuestion(categories.get("queues"));
        questionRepository.save(q9);

        // 10. Binary Search (Searching)
        Question q10 = createBinarySearchQuestion(categories.get("searching"));
        questionRepository.save(q10);
        seedQuizForBinarySearch(q10, categories.get("searching"));

        // 11. Bubble Sort (Sorting)
        Question q11 = createBubbleSortQuestion(categories.get("sorting"));
        questionRepository.save(q11);

        // 12. Binary Tree Inorder Traversal (Trees)
        Question q12 = createBinaryTreeInorderQuestion(categories.get("trees"));
        questionRepository.save(q12);

        // 13. Breadth First Search (Graphs)
        Question q13 = createBfsGraphQuestion(categories.get("graphs"));
        questionRepository.save(q13);

        // 14. Tower of Hanoi (Recursion)
        Question q14 = createTowerOfHanoiQuestion(categories.get("recursion"));
        questionRepository.save(q14);

        // 15. Activity Selection / Non-overlapping Intervals (Greedy)
        Question q15 = createActivitySelectionQuestion(categories.get("greedy"));
        questionRepository.save(q15);

        // 16. Climbing Stairs / Coin Change (Dynamic Programming)
        Question q16 = createClimbingStairsQuestion(categories.get("dynamic-programming"));
        questionRepository.save(q16);
    }

    private void syncQuestionVisualizerTypes() {
        Map<String, String> typeMap = new HashMap<>();
        typeMap.put("two-sum-sorted", "ARRAY_TWO_POINTER");
        typeMap.put("container-with-most-water", "CONTAINER_WATER");
        typeMap.put("maximum-subarray", "KADANE");
        typeMap.put("longest-substring-without-repeating-characters", "SLIDING_WINDOW");
        typeMap.put("valid-palindrome", "ARRAY_TWO_POINTER");
        typeMap.put("reverse-linked-list", "LINKED_LIST");
        typeMap.put("middle-of-the-linked-list", "LINKED_LIST_FAST_SLOW");
        typeMap.put("valid-parentheses", "STACK");
        typeMap.put("sliding-window-maximum", "QUEUE");
        typeMap.put("binary-search", "BINARY_SEARCH");
        typeMap.put("bubble-sort", "SORTING");
        typeMap.put("binary-tree-inorder-traversal", "TREE_TRAVERSAL");
        typeMap.put("breadth-first-search-graph", "GRAPH_BFS_DFS");
        typeMap.put("tower-of-hanoi", "RECURSION_TREE");
        typeMap.put("non-overlapping-intervals", "GREEDY_INTERVALS");
        typeMap.put("climbing-stairs", "DP_TABLE");

        for (Map.Entry<String, String> entry : typeMap.entrySet()) {
            questionRepository.findBySlug(entry.getKey()).ifPresent(q -> {
                if (!entry.getValue().equals(q.getVisualizerType())) {
                    q.setVisualizerType(entry.getValue());
                    questionRepository.save(q);
                }
            });
        }
    }

    // Question Creators

    private Question createTwoSumQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("two-sum-sorted");
        q.setTitle("Two Sum II - Input Array Is Sorted");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, " +
                "find two numbers such that they add up to a specific target number. Let these two numbers be " +
                "numbers[index1] and numbers[index2] where 1 <= index1 < index2 <= numbers.length.\n\n" +
                "Return the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2."
        );
        q.setConstraints(
                "- 2 <= numbers.length <= 3 * 10^4\n" +
                "- -1000 <= numbers[i] <= 1000\n" +
                "- numbers is sorted in non-decreasing order\n" +
                "- -1000 <= target <= 1000\n" +
                "- The tests are generated such that there is exactly one solution."
        );
        q.setExamplesJson(
                "[\n" +
                "  {\"input\": \"numbers = [2, 7, 11, 15], target = 9\", \"output\": \"[1, 2]\", \"explanation\": \"The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2].\"},\n" +
                "  {\"input\": \"numbers = [2, 3, 4], target = 6\", \"output\": \"[1, 3]\", \"explanation\": \"The sum of 2 and 4 is 6. Therefore index1 = 1, index2 = 3. We return [1, 3].\"}\n" +
                "]"
        );
        q.setBruteForceApproach(
                "Iterate through every pair (i, j) using nested loops and check if numbers[i] + numbers[j] == target. " +
                "This examines all n*(n-1)/2 pairs without taking advantage of the sorted property."
        );
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public int[] twoSumBruteForce(int[] numbers, int target) {\n" +
                "        for (int i = 0; i < numbers.length; i++) {\n" +
                "            for (int j = i + 1; j < numbers.length; j++) {\n" +
                "                if (numbers[i] + numbers[j] == target) {\n" +
                "                    return new int[]{i + 1, j + 1};\n" +
                "                }\n" +
                "            }\n" +
                "        }\n" +
                "        return new int[]{-1, -1};\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(n^2)");
        q.setBruteForceSpace("O(1)");

        q.setOptimizedApproach(
                "Use the Two-Pointer technique. Place the 'left' pointer at index 0 and the 'right' pointer at the last index. " +
                "Calculate sum = numbers[left] + numbers[right]:\n" +
                "1. If sum == target, solution is found!\n" +
                "2. If sum < target, increment left pointer to increase the sum.\n" +
                "3. If sum > target, decrement right pointer to decrease the sum."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public int[] twoSum(int[] numbers, int target) {\n" +
                "        int left = 0;\n" +
                "        int right = numbers.length - 1;\n" +
                "        \n" +
                "        while (left < right) {\n" +
                "            int sum = numbers[left] + numbers[right];\n" +
                "            if (sum == target) {\n" +
                "                return new int[]{left + 1, right + 1};\n" +
                "            } else if (sum < target) {\n" +
                "                left++;\n" +
                "            } else {\n" +
                "                right--;\n" +
                "            }\n" +
                "        }\n" +
                "        return new int[]{-1, -1};\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("ARRAY_TWO_POINTER");
        q.setDefaultInputJson("{\"array\": [2, 7, 11, 15], \"target\": 9}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [3, 4], \"pointers\": {\"left\": 0, \"right\": 3}, \"variables\": {\"left\": 0, \"right\": 3, \"target\": 9}, \"array\": [2, 7, 11, 15], \"activeIndices\": [0, 3], \"status\": \"info\", \"explanation\": \"Initialize left pointer at index 0 (val: 2) and right pointer at index 3 (val: 15).\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [7], \"pointers\": {\"left\": 0, \"right\": 3}, \"variables\": {\"sum\": 17, \"target\": 9, \"comparison\": \"17 > 9\"}, \"array\": [2, 7, 11, 15], \"activeIndices\": [0, 3], \"status\": \"warning\", \"explanation\": \"Sum = 2 + 15 = 17. Since 17 > target (9), we need a smaller sum. Decrement right pointer.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [12], \"pointers\": {\"left\": 0, \"right\": 2}, \"variables\": {\"left\": 0, \"right\": 2}, \"array\": [2, 7, 11, 15], \"activeIndices\": [0, 2], \"status\": \"info\", \"explanation\": \"Right pointer moved from index 3 to index 2 (val: 11).\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [7], \"pointers\": {\"left\": 0, \"right\": 2}, \"variables\": {\"sum\": 13, \"target\": 9, \"comparison\": \"13 > 9\"}, \"array\": [2, 7, 11, 15], \"activeIndices\": [0, 2], \"status\": \"warning\", \"explanation\": \"Sum = 2 + 11 = 13. Since 13 > target (9), decrement right pointer again.\"},\n" +
                "  {\"step\": 5, \"highlightLines\": [12], \"pointers\": {\"left\": 0, \"right\": 1}, \"variables\": {\"left\": 0, \"right\": 1}, \"array\": [2, 7, 11, 15], \"activeIndices\": [0, 1], \"status\": \"info\", \"explanation\": \"Right pointer moved to index 1 (val: 7).\"},\n" +
                "  {\"step\": 6, \"highlightLines\": [7, 8, 9], \"pointers\": {\"left\": 0, \"right\": 1}, \"variables\": {\"sum\": 9, \"target\": 9, \"result\": \"[1, 2]\"}, \"array\": [2, 7, 11, 15], \"activeIndices\": [0, 1], \"status\": \"success\", \"explanation\": \"Sum = 2 + 7 = 9 == target! Target found! Returning 1-based indices [1, 2].\"}\n" +
                "]"
        );
        return q;
    }

    private Question createContainerWaterQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("container-with-most-water");
        q.setTitle("Container With Most Water");
        q.setDifficulty("MEDIUM");
        q.setCategory(cat);
        q.setProblemStatement(
                "You are given an integer array height of length n. There are n vertical lines drawn such that the two " +
                "endpoints of the ith line are (i, 0) and (i, height[i]).\n\n" +
                "Find two lines that together with the x-axis form a container, such that the container contains the most water. " +
                "Return the maximum amount of water a container can store."
        );
        q.setConstraints(
                "- n == height.length\n" +
                "- 2 <= n <= 10^5\n" +
                "- 0 <= height[i] <= 10^4"
        );
        q.setExamplesJson(
                "[\n" +
                "  {\"input\": \"height = [1,8,6,2,5,4,8,3,7]\", \"output\": \"49\", \"explanation\": \"The vertical lines are at index 1 (val 8) and index 8 (val 7). Distance is 7, height is min(8,7) = 7. Area = 7 * 7 = 49.\"}\n" +
                "]"
        );
        q.setBruteForceApproach("Check every pair of lines (i, j) and compute area = (j - i) * min(height[i], height[j]).");
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public int maxArea(int[] height) {\n" +
                "        int max = 0;\n" +
                "        for (int i = 0; i < height.length; i++) {\n" +
                "            for (int j = i + 1; j < height.length; j++) {\n" +
                "                int area = (j - i) * Math.min(height[i], height[j]);\n" +
                "                max = Math.max(max, area);\n" +
                "            }\n" +
                "        }\n" +
                "        return max;\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(n^2)");
        q.setBruteForceSpace("O(1)");

        q.setOptimizedApproach(
                "Use two pointers at the extreme ends. The width is initially maximal. " +
                "To seek a greater area, the bottleneck is always the shorter line. " +
                "Hence, advance the pointer corresponding to the shorter height inward."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public int maxArea(int[] height) {\n" +
                "        int left = 0, right = height.length - 1;\n" +
                "        int maxWater = 0;\n" +
                "        \n" +
                "        while (left < right) {\n" +
                "            int h = Math.min(height[left], height[right]);\n" +
                "            int w = right - left;\n" +
                "            maxWater = Math.max(maxWater, h * w);\n" +
                "            \n" +
                "            if (height[left] < height[right]) {\n" +
                "                left++;\n" +
                "            } else {\n" +
                "                right--;\n" +
                "            }\n" +
                "        }\n" +
                "        return maxWater;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("ARRAY_TWO_POINTER");
        q.setDefaultInputJson("{\"array\": [1, 8, 6, 2, 5, 4, 8, 3, 7]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [3, 4], \"pointers\": {\"left\": 0, \"right\": 8}, \"variables\": {\"width\": 8, \"height\": 1, \"area\": 8, \"maxWater\": 8}, \"array\": [1, 8, 6, 2, 5, 4, 8, 3, 7], \"activeIndices\": [0, 8], \"status\": \"info\", \"explanation\": \"left=0 (h=1), right=8 (h=7). Area = min(1,7) * 8 = 8. Since height[left] < height[right], advance left.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [10, 11], \"pointers\": {\"left\": 1, \"right\": 8}, \"variables\": {\"width\": 7, \"height\": 7, \"area\": 49, \"maxWater\": 49}, \"array\": [1, 8, 6, 2, 5, 4, 8, 3, 7], \"activeIndices\": [1, 8], \"status\": \"success\", \"explanation\": \"left=1 (h=8), right=8 (h=7). Area = min(8,7) * 7 = 49. New maxWater=49! Since height[8] < height[1], decrement right.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [12, 13], \"pointers\": {\"left\": 1, \"right\": 7}, \"variables\": {\"width\": 6, \"height\": 3, \"area\": 18, \"maxWater\": 49}, \"array\": [1, 8, 6, 2, 5, 4, 8, 3, 7], \"activeIndices\": [1, 7], \"status\": \"info\", \"explanation\": \"left=1 (h=8), right=7 (h=3). Area = min(8,3) * 6 = 18. Decrement right because height[7] is smaller.\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [12, 13], \"pointers\": {\"left\": 1, \"right\": 6}, \"variables\": {\"width\": 5, \"height\": 8, \"area\": 40, \"maxWater\": 49}, \"array\": [1, 8, 6, 2, 5, 4, 8, 3, 7], \"activeIndices\": [1, 6], \"status\": \"info\", \"explanation\": \"left=1 (h=8), right=6 (h=8). Area = 8 * 5 = 40. Pointers continue converging until they meet.\"}\n" +
                "]"
        );
        return q;
    }

    private Question createKadaneQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("maximum-subarray");
        q.setTitle("Maximum Subarray (Kadane's Algorithm)");
        q.setDifficulty("MEDIUM");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum."
        );
        q.setConstraints(
                "- 1 <= nums.length <= 10^5\n" +
                "- -10^4 <= nums[i] <= 10^4"
        );
        q.setExamplesJson(
                "[\n" +
                "  {\"input\": \"nums = [-2,1,-3,4,-1,2,1,-5,4]\", \"output\": \"6\", \"explanation\": \"The subarray [4,-1,2,1] has the largest sum 6.\"}\n" +
                "]"
        );
        q.setBruteForceApproach("Compute sum of every subarray using two loops. Keep track of maximum.");
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public int maxSubArray(int[] nums) {\n" +
                "        int max = nums[0];\n" +
                "        for (int i = 0; i < nums.length; i++) {\n" +
                "            int cur = 0;\n" +
                "            for (int j = i; j < nums.length; j++) {\n" +
                "                cur += nums[j];\n" +
                "                max = Math.max(max, cur);\n" +
                "            }\n" +
                "        }\n" +
                "        return max;\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(n^2)");
        q.setBruteForceSpace("O(1)");

        q.setOptimizedApproach(
                "Kadane's Algorithm: Maintain currentSum and maxSum. " +
                "For each element, decide whether to add it to existing currentSum or start a fresh subarray at this element: " +
                "currentSum = max(num, currentSum + num). Update maxSum = max(maxSum, currentSum)."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public int maxSubArray(int[] nums) {\n" +
                "        int currentSum = nums[0];\n" +
                "        int maxSum = nums[0];\n" +
                "        \n" +
                "        for (int i = 1; i < nums.length; i++) {\n" +
                "            currentSum = Math.max(nums[i], currentSum + nums[i]);\n" +
                "            maxSum = Math.max(maxSum, currentSum);\n" +
                "        }\n" +
                "        return maxSum;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("KADANE");
        q.setDefaultInputJson("{\"array\": [-2, 1, -3, 4, -1, 2, 1, -5, 4]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [3, 4], \"pointers\": {\"i\": 0}, \"variables\": {\"currentSum\": -2, \"maxSum\": -2}, \"array\": [-2, 1, -3, 4, -1, 2, 1, -5, 4], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Initialize currentSum = nums[0] (-2) and maxSum = -2.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [7, 8], \"pointers\": {\"i\": 1}, \"variables\": {\"currentSum\": 1, \"maxSum\": 1}, \"array\": [-2, 1, -3, 4, -1, 2, 1, -5, 4], \"activeIndices\": [1], \"status\": \"success\", \"explanation\": \"At i=1 (val 1): max(1, -2+1) = 1. Subarray resets to start at 1. maxSum updated to 1.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [7, 8], \"pointers\": {\"i\": 2}, \"variables\": {\"currentSum\": -2, \"maxSum\": 1}, \"array\": [-2, 1, -3, 4, -1, 2, 1, -5, 4], \"activeIndices\": [2], \"status\": \"warning\", \"explanation\": \"At i=2 (val -3): max(-3, 1 + -3) = -2. maxSum remains 1.\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [7, 8], \"pointers\": {\"i\": 3}, \"variables\": {\"currentSum\": 4, \"maxSum\": 4}, \"array\": [-2, 1, -3, 4, -1, 2, 1, -5, 4], \"activeIndices\": [3], \"status\": \"success\", \"explanation\": \"At i=3 (val 4): max(4, -2+4) = 4. Subarray resets to start at 4! maxSum updated to 4.\"},\n" +
                "  {\"step\": 5, \"highlightLines\": [7, 8], \"pointers\": {\"i\": 6}, \"variables\": {\"currentSum\": 6, \"maxSum\": 6}, \"array\": [-2, 1, -3, 4, -1, 2, 1, -5, 4], \"activeIndices\": [3, 4, 5, 6], \"status\": \"success\", \"explanation\": \"Subarray [4, -1, 2, 1] accumulates to currentSum = 6, reaching global peak maxSum = 6!\"}\n" +
                "]"
        );
        return q;
    }

    private Question createLongestSubstringQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("longest-substring-without-repeating-characters");
        q.setTitle("Longest Substring Without Repeating Characters");
        q.setDifficulty("MEDIUM");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given a string s, find the length of the longest substring without repeating characters."
        );
        q.setConstraints(
                "- 0 <= s.length <= 5 * 10^4\n" +
                "- s consists of English letters, digits, symbols and spaces."
        );
        q.setExamplesJson(
                "[\n" +
                "  {\"input\": \"s = \\\"abcabcbb\\\"\", \"output\": \"3\", \"explanation\": \"The answer is \\\"abc\\\", with the length of 3.\"},\n" +
                "  {\"input\": \"s = \\\"bbbbb\\\"\", \"output\": \"1\", \"explanation\": \"The answer is \\\"b\\\", with the length of 1.\"}\n" +
                "]"
        );
        q.setBruteForceApproach("Check all substrings of s, verify whether all characters in substring are unique, and find the maximum length.");
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public int lengthOfLongestSubstring(String s) {\n" +
                "        int maxLen = 0;\n" +
                "        for (int i = 0; i < s.length(); i++) {\n" +
                "            Set<Character> seen = new HashSet<>();\n" +
                "            for (int j = i; j < s.length(); j++) {\n" +
                "                if (seen.contains(s.charAt(j))) break;\n" +
                "                seen.add(s.charAt(j));\n" +
                "                maxLen = Math.max(maxLen, j - i + 1);\n" +
                "            }\n" +
                "        }\n" +
                "        return maxLen;\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(n^2)");
        q.setBruteForceSpace("O(min(n, m))");

        q.setOptimizedApproach(
                "Sliding Window with a Hash Table / Index Map. " +
                "Keep two pointers 'left' and 'right'. Expand 'right' pointer. " +
                "If character s[right] is already seen inside the current window, move 'left' pointer to lastSeenIndex + 1. " +
                "Record max length at each step."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public int lengthOfLongestSubstring(String s) {\n" +
                "        Map<Character, Integer> charMap = new HashMap<>();\n" +
                "        int maxLen = 0;\n" +
                "        int left = 0;\n" +
                "        \n" +
                "        for (int right = 0; right < s.length(); right++) {\n" +
                "            char c = s.charAt(right);\n" +
                "            if (charMap.containsKey(c) && charMap.get(c) >= left) {\n" +
                "                left = charMap.get(c) + 1;\n" +
                "            }\n" +
                "            charMap.put(c, right);\n" +
                "            maxLen = Math.max(maxLen, right - left + 1);\n" +
                "        }\n" +
                "        return maxLen;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(min(m, n))");
        q.setVisualizerType("SLIDING_WINDOW");
        q.setDefaultInputJson("{\"string\": \"abcabcbb\"}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [5, 6], \"pointers\": {\"left\": 0, \"right\": 0}, \"variables\": {\"left\": 0, \"right\": 0, \"char\": \"a\", \"window\": \"a\", \"maxLen\": 1}, \"array\": [\"a\",\"b\",\"c\",\"a\",\"b\",\"c\",\"b\",\"b\"], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Window starts at index 0. 'a' is seen for first time. maxLen = 1.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [12, 13], \"pointers\": {\"left\": 0, \"right\": 1}, \"variables\": {\"left\": 0, \"right\": 1, \"char\": \"b\", \"window\": \"ab\", \"maxLen\": 2}, \"array\": [\"a\",\"b\",\"c\",\"a\",\"b\",\"c\",\"b\",\"b\"], \"activeIndices\": [0, 1], \"status\": \"info\", \"explanation\": \"Expand window to right=1 ('b'). Unique window \\\"ab\\\". maxLen = 2.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [12, 13], \"pointers\": {\"left\": 0, \"right\": 2}, \"variables\": {\"left\": 0, \"right\": 2, \"char\": \"c\", \"window\": \"abc\", \"maxLen\": 3}, \"array\": [\"a\",\"b\",\"c\",\"a\",\"b\",\"c\",\"b\",\"b\"], \"activeIndices\": [0, 1, 2], \"status\": \"success\", \"explanation\": \"Expand window to right=2 ('c'). Unique window \\\"abc\\\". maxLen = 3.\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [9, 10], \"pointers\": {\"left\": 1, \"right\": 3}, \"variables\": {\"left\": 1, \"right\": 3, \"char\": \"a\", \"duplicate\": \"a\", \"window\": \"bca\", \"maxLen\": 3}, \"array\": [\"a\",\"b\",\"c\",\"a\",\"b\",\"c\",\"b\",\"b\"], \"activeIndices\": [1, 2, 3], \"status\": \"warning\", \"explanation\": \"'a' already in window at index 0. Shrink window: advance left to 0 + 1 = 1. Window is now \\\"bca\\\".\"}\n" +
                "]"
        );
        return q;
    }

    private Question createValidPalindromeQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("valid-palindrome");
        q.setTitle("Valid Palindrome");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\n" +
                "Given a string s, return true if it is a palindrome, or false otherwise."
        );
        q.setConstraints(
                "- 1 <= s.length <= 2 * 10^5\n" +
                "- s consists only of printable ASCII characters."
        );
        q.setExamplesJson(
                "[\n" +
                "  {\"input\": \"s = \\\"A man, a plan, a canal: Panama\\\"\", \"output\": \"true\", \"explanation\": \"\\\"amanaplanacanalpanama\\\" is a palindrome.\"}\n" +
                "]"
        );
        q.setBruteForceApproach("Filter out non-alphanumeric characters into a new string, reverse it, and compare with original.");
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public boolean isPalindrome(String s) {\n" +
                "        String clean = s.replaceAll(\"[^a-zA-Z0-9]\", \"\").toLowerCase();\n" +
                "        String reversed = new StringBuilder(clean).reverse().toString();\n" +
                "        return clean.equals(reversed);\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(n)");
        q.setBruteForceSpace("O(n)");

        q.setOptimizedApproach("Use two pointers from left and right edges, skipping non-alphanumerics in-place without extra string allocation.");
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public boolean isPalindrome(String s) {\n" +
                "        int left = 0, right = s.length() - 1;\n" +
                "        while (left < right) {\n" +
                "            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;\n" +
                "            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;\n" +
                "            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {\n" +
                "                return false;\n" +
                "            }\n" +
                "            left++;\n" +
                "            right--;\n" +
                "        }\n" +
                "        return true;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("ARRAY_TWO_POINTER");
        q.setDefaultInputJson("{\"array\": [\"r\", \"a\", \"c\", \"e\", \"c\", \"a\", \"r\"]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [3], \"pointers\": {\"left\": 0, \"right\": 6}, \"variables\": {\"leftChar\": \"r\", \"rightChar\": \"r\", \"match\": true}, \"array\": [\"r\",\"a\",\"c\",\"e\",\"c\",\"a\",\"r\"], \"activeIndices\": [0, 6], \"status\": \"success\", \"explanation\": \"Compare left[0]='r' with right[6]='r'. Match! Move inwards.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [7, 8], \"pointers\": {\"left\": 1, \"right\": 5}, \"variables\": {\"leftChar\": \"a\", \"rightChar\": \"a\", \"match\": true}, \"array\": [\"r\",\"a\",\"c\",\"e\",\"c\",\"a\",\"r\"], \"activeIndices\": [1, 5], \"status\": \"success\", \"explanation\": \"Compare left[1]='a' with right[5]='a'. Match! Move inwards.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [7, 8], \"pointers\": {\"left\": 2, \"right\": 4}, \"variables\": {\"leftChar\": \"c\", \"rightChar\": \"c\", \"match\": true}, \"array\": [\"r\",\"a\",\"c\",\"e\",\"c\",\"a\",\"r\"], \"activeIndices\": [2, 4], \"status\": \"success\", \"explanation\": \"Compare left[2]='c' with right[4]='c'. Match! Move inwards.\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [12], \"pointers\": {\"left\": 3, \"right\": 3}, \"variables\": {\"center\": \"e\", \"isPalindrome\": true}, \"array\": [\"r\",\"a\",\"c\",\"e\",\"c\",\"a\",\"r\"], \"activeIndices\": [3], \"status\": \"success\", \"explanation\": \"Pointers meet at index 3 ('e'). Full string verified as valid Palindrome!\"}\n" +
                "]"
        );
        return q;
    }

    private Question createReverseLinkedListQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("reverse-linked-list");
        q.setTitle("Reverse Linked List");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given the head of a singly linked list, reverse the list, and return the reversed list."
        );
        q.setConstraints(
                "- The number of nodes in the list is the range [0, 5000].\n" +
                "- -5000 <= Node.val <= 5000"
        );
        q.setExamplesJson(
                "[\n" +
                "  {\"input\": \"head = [1,2,3,4,5]\", \"output\": \"[5,4,3,2,1]\", \"explanation\": \"The linked list pointers are reversed to point backwards.\"}\n" +
                "]"
        );
        q.setBruteForceApproach("Copy node values into an array/stack, then create a new linked list in reversed order.");
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public ListNode reverseList(ListNode head) {\n" +
                "        Stack<Integer> stack = new Stack<>();\n" +
                "        ListNode curr = head;\n" +
                "        while (curr != null) {\n" +
                "            stack.push(curr.val);\n" +
                "            curr = curr.next;\n" +
                "        }\n" +
                "        ListNode dummy = new ListNode(0);\n" +
                "        curr = dummy;\n" +
                "        while (!stack.isEmpty()) {\n" +
                "            curr.next = new ListNode(stack.pop());\n" +
                "            curr = curr.next;\n" +
                "        }\n" +
                "        return dummy.next;\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(n)");
        q.setBruteForceSpace("O(n)");

        q.setOptimizedApproach(
                "In-place iterative reversal using three pointers: prev (null initially), curr (head), and nextNode. " +
                "At each step: nextNode = curr.next, curr.next = prev, prev = curr, curr = nextNode."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public ListNode reverseList(ListNode head) {\n" +
                "        ListNode prev = null;\n" +
                "        ListNode curr = head;\n" +
                "        \n" +
                "        while (curr != null) {\n" +
                "            ListNode nextNode = curr.next;\n" +
                "            curr.next = prev;\n" +
                "            prev = curr;\n" +
                "            curr = nextNode;\n" +
                "        }\n" +
                "        return prev;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("LINKED_LIST");
        q.setDefaultInputJson("{\"nodes\": [1, 2, 3, 4, 5]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [3, 4], \"pointers\": {\"prev\": null, \"curr\": 1}, \"variables\": {\"prev\": \"null\", \"curr\": 1, \"nextNode\": \"null\"}, \"array\": [1, 2, 3, 4, 5], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Initialize prev = null, curr = Node(1).\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [7, 8], \"pointers\": {\"prev\": null, \"curr\": 1, \"next\": 2}, \"variables\": {\"prev\": \"null\", \"curr\": 1, \"nextNode\": 2}, \"array\": [1, 2, 3, 4, 5], \"activeIndices\": [0], \"status\": \"warning\", \"explanation\": \"Save nextNode = Node(2). Reverse pointer: Node(1).next = null (prev).\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [9, 10], \"pointers\": {\"prev\": 1, \"curr\": 2}, \"variables\": {\"prev\": 1, \"curr\": 2}, \"array\": [1, 2, 3, 4, 5], \"activeIndices\": [1], \"status\": \"info\", \"explanation\": \"Shift pointers: prev becomes Node(1), curr advances to Node(2).\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [7, 8], \"pointers\": {\"prev\": 1, \"curr\": 2, \"next\": 3}, \"variables\": {\"prev\": 1, \"curr\": 2, \"nextNode\": 3}, \"array\": [1, 2, 3, 4, 5], \"activeIndices\": [1], \"status\": \"warning\", \"explanation\": \"Reverse pointer: Node(2).next = Node(1).\"},\n" +
                "  {\"step\": 5, \"highlightLines\": [12], \"pointers\": {\"prev\": 5, \"curr\": null}, \"variables\": {\"newHead\": 5, \"status\": \"Reversed List Complete\"}, \"array\": [5, 4, 3, 2, 1], \"activeIndices\": [0], \"status\": \"success\", \"explanation\": \"curr becomes null. Return prev (Node 5) as the new head of the reversed list!\"}\n" +
                "]"
        );
        return q;
    }

    private Question createMiddleNodeQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("middle-of-the-linked-list");
        q.setTitle("Middle of the Linked List");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given the head of a singly linked list, return the middle node of the linked list. " +
                "If there are two middle nodes, return the second middle node."
        );
        q.setConstraints("- The number of nodes in the list is in the range [1, 100].\n- 1 <= Node.val <= 100");
        q.setExamplesJson("[{\"input\": \"head = [1,2,3,4,5]\", \"output\": \"[3,4,5]\", \"explanation\": \"The middle node is node 3.\"}]");
        q.setBruteForceApproach("First pass counts the total number of nodes N. Second pass traverses N/2 steps to reach the middle node.");
        q.setBruteForceCode("public class Solution { public ListNode middleNode(ListNode head) { int count = 0; ListNode cur = head; while (cur != null) { count++; cur = cur.next; } cur = head; for (int i = 0; i < count / 2; i++) cur = cur.next; return cur; } }");
        q.setBruteForceTime("O(n) with 2 passes");
        q.setBruteForceSpace("O(1)");
        q.setOptimizedApproach("Slow & Fast pointer technique (Tortoise and Hare): slow moves 1 step, fast moves 2 steps. When fast reaches the end, slow is at the middle!");
        q.setOptimizedCode("public class Solution { public ListNode middleNode(ListNode head) { ListNode slow = head, fast = head; while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; } return slow; } }");
        q.setOptimizedTime("O(n) in 1 pass");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("LINKED_LIST_FAST_SLOW");
        q.setDefaultInputJson("{\"nodes\": [1, 2, 3, 4, 5]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [2], \"pointers\": {\"slow\": 1, \"fast\": 1}, \"variables\": {\"slow\": 1, \"fast\": 1}, \"array\": [1, 2, 3, 4, 5], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Initialize slow and fast at head (Node 1).\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [4, 5], \"pointers\": {\"slow\": 2, \"fast\": 3}, \"variables\": {\"slow\": 2, \"fast\": 3}, \"array\": [1, 2, 3, 4, 5], \"activeIndices\": [1, 2], \"status\": \"info\", \"explanation\": \"Step 1: slow moves to Node 2 (1 step), fast moves to Node 3 (2 steps).\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [4, 5], \"pointers\": {\"slow\": 3, \"fast\": 5}, \"variables\": {\"slow\": 3, \"fast\": 5}, \"array\": [1, 2, 3, 4, 5], \"activeIndices\": [2, 4], \"status\": \"success\", \"explanation\": \"Step 2: slow moves to Node 3, fast moves to Node 5 (last node). Fast has no fast.next! Loop terminates, returning Node 3.\"}\n" +
                "]"
        );
        return q;
    }

    private Question createValidParenthesesQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("valid-parentheses");
        q.setTitle("Valid Parentheses");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\n" +
                "An input string is valid if:\n" +
                "1. Open brackets must be closed by the same type of brackets.\n" +
                "2. Open brackets must be closed in the correct order.\n" +
                "3. Every close bracket has a corresponding open bracket of the same type."
        );
        q.setConstraints("- 1 <= s.length <= 10^4\n- s consists of parentheses only '()[]{}'.");
        q.setExamplesJson(
                "[\n" +
                "  {\"input\": \"s = \\\"()[]{}\\\"\", \"output\": \"true\", \"explanation\": \"All open brackets are closed in order.\"},\n" +
                "  {\"input\": \"s = \\\"(]\\\"\", \"output\": \"false\", \"explanation\": \"Mismatched bracket types.\"}\n" +
                "]"
        );
        q.setBruteForceApproach("Repeatedly replace occurrences of '()', '[]', and '{}' with empty string until no more replacements can be made.");
        q.setBruteForceCode("public class Solution { public boolean isValid(String s) { while (s.contains(\"()\") || s.contains(\"[]\") || s.contains(\"{}\")) { s = s.replace(\"()\", \"\").replace(\"[]\", \"\").replace(\"{}\", \"\"); } return s.isEmpty(); } }");
        q.setBruteForceTime("O(n^2)");
        q.setBruteForceSpace("O(n)");

        q.setOptimizedApproach(
                "Use a LIFO Stack. Iterate through the string:\n" +
                "- If character is an opening bracket '(', '{', '[', push onto stack.\n" +
                "- If character is closing, check if stack is empty (invalid) or pop top and ensure types match.\n" +
                "- Finally, ensure stack is empty."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public boolean isValid(String s) {\n" +
                "        Stack<Character> stack = new Stack<>();\n" +
                "        for (char c : s.toCharArray()) {\n" +
                "            if (c == '(' || c == '{' || c == '[') {\n" +
                "                stack.push(c);\n" +
                "            } else {\n" +
                "                if (stack.isEmpty()) return false;\n" +
                "                char top = stack.pop();\n" +
                "                if ((c == ')' && top != '(') ||\n" +
                "                    (c == '}' && top != '{') ||\n" +
                "                    (c == ']' && top != '[')) {\n" +
                "                    return false;\n" +
                "                }\n" +
                "            }\n" +
                "        }\n" +
                "        return stack.isEmpty();\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(n)");
        q.setVisualizerType("STACK");
        q.setDefaultInputJson("{\"string\": \"{[()]}\"}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [5, 6], \"pointers\": {\"i\": 0}, \"variables\": {\"char\": \"{\", \"stack\": [\"{\"]}, \"array\": [\"{\", \"[\", \"(\", \")\", \"]\", \"}\"], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Push '{' onto stack. Stack: ['{'].\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [5, 6], \"pointers\": {\"i\": 1}, \"variables\": {\"char\": \"[\", \"stack\": [\"{\", \"[\"]}, \"array\": [\"{\", \"[\", \"(\", \")\", \"]\", \"}\"], \"activeIndices\": [1], \"status\": \"info\", \"explanation\": \"Push '[' onto stack. Stack: ['{', '['].\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [5, 6], \"pointers\": {\"i\": 2}, \"variables\": {\"char\": \"(\", \"stack\": [\"{\", \"[\", \"(\"]}, \"array\": [\"{\", \"[\", \"(\", \")\", \"]\", \"}\"], \"activeIndices\": [2], \"status\": \"info\", \"explanation\": \"Push '(' onto stack. Stack: ['{', '[', '('].\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [9, 10], \"pointers\": {\"i\": 3}, \"variables\": {\"char\": \")\", \"popped\": \"(\", \"match\": true, \"stack\": [\"{\", \"[\"]}, \"array\": [\"{\", \"[\", \"(\", \")\", \"]\", \"}\"], \"activeIndices\": [3], \"status\": \"success\", \"explanation\": \"Encountered ')'. Pop top '(' from stack. Matches! Stack: ['{', '['].\"},\n" +
                "  {\"step\": 5, \"highlightLines\": [9, 10], \"pointers\": {\"i\": 4}, \"variables\": {\"char\": \"]\", \"popped\": \"[\", \"match\": true, \"stack\": [\"{\"]}, \"array\": [\"{\", \"[\", \"(\", \")\", \"]\", \"}\"], \"activeIndices\": [4], \"status\": \"success\", \"explanation\": \"Encountered ']'. Pop top '[' from stack. Matches! Stack: ['{'].\"},\n" +
                "  {\"step\": 6, \"highlightLines\": [9, 10], \"pointers\": {\"i\": 5}, \"variables\": {\"char\": \"}\", \"popped\": \"{\", \"match\": true, \"stack\": []}, \"array\": [\"{\", \"[\", \"(\", \")\", \"]\", \"}\"], \"activeIndices\": [5], \"status\": \"success\", \"explanation\": \"Encountered '}'. Pop top '{' from stack. Matches! Stack is now empty.\"},\n" +
                "  {\"step\": 7, \"highlightLines\": [17], \"pointers\": {}, \"variables\": {\"stackEmpty\": true, \"result\": \"true\"}, \"array\": [\"{\", \"[\", \"(\", \")\", \"]\", \"}\"], \"activeIndices\": [], \"status\": \"success\", \"explanation\": \"All brackets consumed and stack is empty. String is valid!\"}\n" +
                "]"
        );
        return q;
    }

    private Question createSlidingWindowMaxQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("sliding-window-maximum");
        q.setTitle("Sliding Window Maximum");
        q.setDifficulty("HARD");
        q.setCategory(cat);
        q.setProblemStatement(
                "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. " +
                "You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window."
        );
        q.setConstraints("- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- 1 <= k <= nums.length");
        q.setExamplesJson("[{\"input\": \"nums = [1,3,-1,-3,5,3,6,7], k = 3\", \"output\": \"[3,3,5,5,6,7]\", \"explanation\": \"Window [1, 3, -1] has max 3; [3, -1, -3] has max 3; [-1, -3, 5] has max 5...\"}]");
        q.setBruteForceApproach("For each of the n - k + 1 windows, scan all k elements to locate maximum.");
        q.setBruteForceCode("public class Solution { public int[] maxSlidingWindow(int[] nums, int k) { int n = nums.length; int[] res = new int[n - k + 1]; for (int i = 0; i <= n - k; i++) { int max = nums[i]; for (int j = i + 1; j < i + k; j++) max = Math.max(max, nums[j]); res[i] = max; } return res; } }");
        q.setBruteForceTime("O(n * k)");
        q.setBruteForceSpace("O(1)");
        q.setOptimizedApproach("Use a Monotonic Deque (double-ended queue) storing indices in decreasing order of their values. The front of the deque always holds the maximum of the current window.");
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public int[] maxSlidingWindow(int[] nums, int k) {\n" +
                "        int n = nums.length;\n" +
                "        int[] res = new int[n - k + 1];\n" +
                "        Deque<Integer> deque = new ArrayDeque<>();\n" +
                "        \n" +
                "        for (int i = 0; i < n; i++) {\n" +
                "            while (!deque.isEmpty() && deque.peekFirst() <= i - k) {\n" +
                "                deque.pollFirst();\n" +
                "            }\n" +
                "            while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) {\n" +
                "                deque.pollLast();\n" +
                "            }\n" +
                "            deque.offerLast(i);\n" +
                "            if (i >= k - 1) {\n" +
                "                res[i - k + 1] = nums[deque.peekFirst()];\n" +
                "            }\n" +
                "        }\n" +
                "        return res;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(k)");
        q.setVisualizerType("QUEUE");
        q.setDefaultInputJson("{\"array\": [1, 3, -1, -3, 5, 3, 6, 7], \"k\": 3}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [6, 13], \"pointers\": {\"i\": 0}, \"variables\": {\"element\": 1, \"deque\": [\"idx:0 (val:1)\"]}, \"array\": [1, 3, -1, -3, 5, 3, 6, 7], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"i=0: Add index 0 (val 1) to deque.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [10, 11, 13], \"pointers\": {\"i\": 1}, \"variables\": {\"element\": 3, \"deque\": [\"idx:1 (val:3)\"]}, \"array\": [1, 3, -1, -3, 5, 3, 6, 7], \"activeIndices\": [1], \"status\": \"warning\", \"explanation\": \"i=1 (val 3): nums[0] (1) < 3, so remove index 0 from back. Push index 1. Deque maintains decreasing order.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [14, 15], \"pointers\": {\"i\": 2}, \"variables\": {\"element\": -1, \"deque\": [\"idx:1 (val:3)\", \"idx:2 (val:-1)\"], \"windowMax\": 3}, \"array\": [1, 3, -1, -3, 5, 3, 6, 7], \"activeIndices\": [0, 1, 2], \"status\": \"success\", \"explanation\": \"i=2: Window [1, 3, -1] complete! Deque front is index 1 with value 3. Window max = 3.\"}\n" +
                "]"
        );
        return q;
    }

    private Question createBinarySearchQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("binary-search");
        q.setTitle("Binary Search");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. " +
                "If target exists, then return its index. Otherwise, return -1.\n\n" +
                "You must write an algorithm with O(log n) runtime complexity."
        );
        q.setConstraints("- 1 <= nums.length <= 10^4\n- -10^4 < nums[i], target < 10^4\n- All integers in nums are unique and sorted in ascending order.");
        q.setExamplesJson("[{\"input\": \"nums = [-1,0,3,5,9,12], target = 9\", \"output\": \"4\", \"explanation\": \"9 exists in nums and its index is 4.\"}]");
        q.setBruteForceApproach("Linear Search: Check each element one by one from left to right.");
        q.setBruteForceCode("public class Solution { public int search(int[] nums, int target) { for (int i = 0; i < nums.length; i++) if (nums[i] == target) return i; return -1; } }");
        q.setBruteForceTime("O(n)");
        q.setBruteForceSpace("O(1)");
        q.setOptimizedApproach(
                "Divide and Conquer Binary Search: Maintain low and high pointers. " +
                "Compute mid = low + (high - low) / 2:\n" +
                "- If nums[mid] == target, return mid.\n" +
                "- If nums[mid] < target, target is in right half, so low = mid + 1.\n" +
                "- If nums[mid] > target, target is in left half, so high = mid - 1."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public int search(int[] nums, int target) {\n" +
                "        int low = 0;\n" +
                "        int high = nums.length - 1;\n" +
                "        \n" +
                "        while (low <= high) {\n" +
                "            int mid = low + (high - low) / 2;\n" +
                "            if (nums[mid] == target) {\n" +
                "                return mid;\n" +
                "            } else if (nums[mid] < target) {\n" +
                "                low = mid + 1;\n" +
                "            } else {\n" +
                "                high = mid - 1;\n" +
                "            }\n" +
                "        }\n" +
                "        return -1;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(log n)");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("BINARY_SEARCH");
        q.setDefaultInputJson("{\"array\": [-1, 0, 3, 5, 9, 12], \"target\": 9}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [3, 4], \"pointers\": {\"low\": 0, \"high\": 5}, \"variables\": {\"low\": 0, \"high\": 5, \"target\": 9}, \"array\": [-1, 0, 3, 5, 9, 12], \"activeIndices\": [0, 5], \"status\": \"info\", \"explanation\": \"Search range spans index 0 to 5. Target is 9.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [7, 10], \"pointers\": {\"low\": 0, \"mid\": 2, \"high\": 5}, \"variables\": {\"low\": 0, \"mid\": 2, \"high\": 5, \"midVal\": 3, \"comparison\": \"3 < 9\"}, \"array\": [-1, 0, 3, 5, 9, 12], \"activeIndices\": [2], \"status\": \"warning\", \"explanation\": \"mid = 0 + (5-0)/2 = 2. nums[2] is 3. Since 3 < 9, target must be in right half. low = mid + 1 = 3.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [7], \"pointers\": {\"low\": 3, \"mid\": 4, \"high\": 5}, \"variables\": {\"low\": 3, \"mid\": 4, \"high\": 5, \"midVal\": 9}, \"array\": [-1, 0, 3, 5, 9, 12], \"activeIndices\": [4], \"status\": \"info\", \"explanation\": \"mid = 3 + (5-3)/2 = 4. Checking nums[4] (value: 9).\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [8, 9], \"pointers\": {\"low\": 3, \"mid\": 4, \"high\": 5}, \"variables\": {\"mid\": 4, \"nums[mid]\": 9, \"target\": 9, \"found\": true}, \"array\": [-1, 0, 3, 5, 9, 12], \"activeIndices\": [4], \"status\": \"success\", \"explanation\": \"nums[4] == 9! Target found at index 4!\"}\n" +
                "]"
        );
        return q;
    }

    private Question createBubbleSortQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("bubble-sort");
        q.setTitle("Bubble Sort");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given an array of integers, sort the array in ascending order using the Bubble Sort algorithm. " +
                "Bubble sort works by repeatedly swapping adjacent elements if they are in the wrong order."
        );
        q.setConstraints("- 1 <= n <= 1000\n- -10^4 <= arr[i] <= 10^4");
        q.setExamplesJson("[{\"input\": \"arr = [5, 1, 4, 2, 8]\", \"output\": \"[1, 2, 4, 5, 8]\", \"explanation\": \"Elements bubble up to the rightmost sorted region.\"}]");
        q.setBruteForceApproach("Standard Bubble Sort with two nested loops comparing arr[j] and arr[j+1].");
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public void bubbleSort(int[] arr) {\n" +
                "        int n = arr.length;\n" +
                "        for (int i = 0; i < n - 1; i++) {\n" +
                "            for (int j = 0; j < n - i - 1; j++) {\n" +
                "                if (arr[j] > arr[j + 1]) {\n" +
                "                    int temp = arr[j];\n" +
                "                    arr[j] = arr[j + 1];\n" +
                "                    arr[j + 1] = temp;\n" +
                "                }\n" +
                "            }\n" +
                "        }\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(n^2)");
        q.setBruteForceSpace("O(1)");
        q.setOptimizedApproach("Add an early-exit 'swapped' flag. If no swaps occurred in an entire pass, the array is already sorted and we can break immediately in O(n) best-case time.");
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public void bubbleSortOptimized(int[] arr) {\n" +
                "        int n = arr.length;\n" +
                "        boolean swapped;\n" +
                "        for (int i = 0; i < n - 1; i++) {\n" +
                "            swapped = false;\n" +
                "            for (int j = 0; j < n - i - 1; j++) {\n" +
                "                if (arr[j] > arr[j + 1]) {\n" +
                "                    int temp = arr[j];\n" +
                "                    arr[j] = arr[j + 1];\n" +
                "                    arr[j + 1] = temp;\n" +
                "                    swapped = true;\n" +
                "                }\n" +
                "            }\n" +
                "            if (!swapped) break;\n" +
                "        }\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n^2) worst/avg, O(n) best");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("SORTING");
        q.setDefaultInputJson("{\"array\": [5, 1, 4, 2, 8]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [8], \"pointers\": {\"j\": 0, \"j+1\": 1}, \"variables\": {\"j\": 0, \"val_j\": 5, \"val_j1\": 1, \"action\": \"swap\"}, \"array\": [5, 1, 4, 2, 8], \"activeIndices\": [0, 1], \"status\": \"warning\", \"explanation\": \"Compare 5 and 1. 5 > 1, so swap them.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [10, 11], \"pointers\": {\"j\": 1, \"j+1\": 2}, \"variables\": {\"j\": 1, \"val_j\": 5, \"val_j1\": 4, \"action\": \"swap\"}, \"array\": [1, 5, 4, 2, 8], \"activeIndices\": [1, 2], \"status\": \"warning\", \"explanation\": \"Array is now [1, 5, 4, 2, 8]. Compare 5 and 4. 5 > 4, swap.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [10, 11], \"pointers\": {\"j\": 2, \"j+1\": 3}, \"variables\": {\"j\": 2, \"val_j\": 5, \"val_j1\": 2, \"action\": \"swap\"}, \"array\": [1, 4, 5, 2, 8], \"activeIndices\": [2, 3], \"status\": \"warning\", \"explanation\": \"Array is [1, 4, 5, 2, 8]. Compare 5 and 2. 5 > 2, swap.\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [8], \"pointers\": {\"j\": 3, \"j+1\": 4}, \"variables\": {\"j\": 3, \"val_j\": 5, \"val_j1\": 8, \"action\": \"keep\"}, \"array\": [1, 4, 2, 5, 8], \"activeIndices\": [3, 4], \"status\": \"success\", \"explanation\": \"Array is [1, 4, 2, 5, 8]. Compare 5 and 8. 5 < 8, no swap needed. Pass 1 finishes with 8 in place!\"}\n" +
                "]"
        );
        return q;
    }

    private Question createBinaryTreeInorderQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("binary-tree-inorder-traversal");
        q.setTitle("Binary Tree Inorder Traversal");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given the root of a binary tree, return the inorder traversal of its nodes' values (Left -> Root -> Right)."
        );
        q.setConstraints("- The number of nodes in the tree is in the range [0, 100].\n- -100 <= Node.val <= 100");
        q.setExamplesJson("[{\"input\": \"root = [1,null,2,3]\", \"output\": \"[1,3,2]\", \"explanation\": \"Inorder visits left subtree, root node, then right subtree.\"}]");
        q.setBruteForceApproach("Standard recursive DFS inorder traversal visiting root.left, adding root.val, then root.right.");
        q.setBruteForceCode("public class Solution { public List<Integer> inorderTraversal(TreeNode root) { List<Integer> res = new ArrayList<>(); helper(root, res); return res; } private void helper(TreeNode node, List<Integer> res) { if (node == null) return; helper(node.left, res); res.add(node.val); helper(node.right, res); } }");
        q.setBruteForceTime("O(n)");
        q.setBruteForceSpace("O(n)");
        q.setOptimizedApproach("Iterative inorder traversal using an explicit Stack to avoid system call stack overflow.");
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public List<Integer> inorderTraversal(TreeNode root) {\n" +
                "        List<Integer> result = new ArrayList<>();\n" +
                "        Stack<TreeNode> stack = new Stack<>();\n" +
                "        TreeNode curr = root;\n" +
                "        \n" +
                "        while (curr != null || !stack.isEmpty()) {\n" +
                "            while (curr != null) {\n" +
                "                stack.push(curr);\n" +
                "                curr = curr.left;\n" +
                "            }\n" +
                "            curr = stack.pop();\n" +
                "            result.add(curr.val);\n" +
                "            curr = curr.right;\n" +
                "        }\n" +
                "        return result;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(h) where h is height");
        q.setVisualizerType("TREE_TRAVERSAL");
        q.setDefaultInputJson("{\"tree\": {\"val\": 4, \"left\": {\"val\": 2, \"left\": {\"val\": 1}, \"right\": {\"val\": 3}}, \"right\": {\"val\": 6, \"left\": {\"val\": 5}, \"right\": {\"val\": 7}}}}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [8, 9], \"pointers\": {\"curr\": 4}, \"variables\": {\"curr\": 4, \"stack\": [4]}, \"array\": [4, 2, 6, 1, 3, 5, 7], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Push root Node(4) to stack, advance curr = curr.left (Node 2).\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [8, 9], \"pointers\": {\"curr\": 2}, \"variables\": {\"curr\": 2, \"stack\": [4, 2]}, \"array\": [4, 2, 6, 1, 3, 5, 7], \"activeIndices\": [1], \"status\": \"info\", \"explanation\": \"Push Node(2) to stack, advance curr = curr.left (Node 1).\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [12, 13], \"pointers\": {\"visited\": 1}, \"variables\": {\"visited\": 1, \"result\": [1]}, \"array\": [1], \"activeIndices\": [3], \"status\": \"success\", \"explanation\": \"Pop Node(1), add 1 to result list. Result: [1].\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [12, 13], \"pointers\": {\"visited\": 2}, \"variables\": {\"visited\": 2, \"result\": [1, 2]}, \"array\": [1, 2], \"activeIndices\": [1], \"status\": \"success\", \"explanation\": \"Pop Node(2), add 2 to result list. Move to right child (Node 3). Result: [1, 2].\"}\n" +
                "]"
        );
        return q;
    }

    private Question createBfsGraphQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("breadth-first-search-graph");
        q.setTitle("Breadth First Search (BFS) in Graph");
        q.setDifficulty("MEDIUM");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given a connected undirected graph with V vertices and an adjacency list adj, return a list containing the BFS traversal of the graph starting from vertex 0."
        );
        q.setConstraints("- 1 <= V, E <= 10^4\n- Graph is 0-indexed");
        q.setExamplesJson("[{\"input\": \"V = 5, adj = [[1,2,3],[],[4],[],[]]\", \"output\": \"[0, 1, 2, 3, 4]\", \"explanation\": \"BFS visits vertices level by level using a Queue.\"}]");
        q.setBruteForceApproach("Graph BFS using a FIFO Queue and a boolean visited[] array to prevent visiting vertices multiple times.");
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public List<Integer> bfsOfGraph(int V, List<List<Integer>> adj) {\n" +
                "        List<Integer> bfs = new ArrayList<>();\n" +
                "        boolean[] visited = new boolean[V];\n" +
                "        Queue<Integer> queue = new LinkedList<>();\n" +
                "        \n" +
                "        queue.add(0);\n" +
                "        visited[0] = true;\n" +
                "        \n" +
                "        while (!queue.isEmpty()) {\n" +
                "            int node = queue.poll();\n" +
                "            bfs.add(node);\n" +
                "            for (int neighbor : adj.get(node)) {\n" +
                "                if (!visited[neighbor]) {\n" +
                "                    visited[neighbor] = true;\n" +
                "                    queue.add(neighbor);\n" +
                "                }\n" +
                "            }\n" +
                "        }\n" +
                "        return bfs;\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(V + E)");
        q.setBruteForceSpace("O(V)");
        q.setOptimizedApproach("Queue-based level order traversal with bitset or boolean array ensuring each vertex and edge is examined exactly once.");
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public List<Integer> bfs(int V, List<List<Integer>> adj) {\n" +
                "        List<Integer> order = new ArrayList<>();\n" +
                "        boolean[] visited = new boolean[V];\n" +
                "        Queue<Integer> q = new ArrayDeque<>();\n" +
                "        \n" +
                "        visited[0] = true;\n" +
                "        q.offer(0);\n" +
                "        while (!q.isEmpty()) {\n" +
                "            int u = q.poll();\n" +
                "            order.add(u);\n" +
                "            for (int v : adj.get(u)) {\n" +
                "                if (!visited[v]) {\n" +
                "                    visited[v] = true;\n" +
                "                    q.offer(v);\n" +
                "                }\n" +
                "            }\n" +
                "        }\n" +
                "        return order;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(V + E)");
        q.setOptimizedSpace("O(V)");
        q.setVisualizerType("GRAPH_BFS_DFS");
        q.setDefaultInputJson("{\"nodes\": [0, 1, 2, 3, 4], \"edges\": [[0, 1], [0, 2], [1, 3], [2, 4]]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [7, 8], \"pointers\": {\"current\": 0}, \"variables\": {\"queue\": [0], \"visited\": [0], \"output\": []}, \"array\": [0, 1, 2, 3, 4], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Enqueue starting vertex 0, mark visited[0] = true.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [10, 11], \"pointers\": {\"current\": 0}, \"variables\": {\"polled\": 0, \"queue\": [1, 2], \"visited\": [0, 1, 2], \"output\": [0]}, \"array\": [0, 1, 2, 3, 4], \"activeIndices\": [0, 1, 2], \"status\": \"success\", \"explanation\": \"Dequeue vertex 0. Visit neighbors 1 and 2, enqueue them and mark visited.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [10, 11], \"pointers\": {\"current\": 1}, \"variables\": {\"polled\": 1, \"queue\": [2, 3], \"visited\": [0, 1, 2, 3], \"output\": [0, 1]}, \"array\": [0, 1, 2, 3, 4], \"activeIndices\": [1, 3], \"status\": \"info\", \"explanation\": \"Dequeue vertex 1. Add neighbor 3 to queue.\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [10, 11], \"pointers\": {\"current\": 2}, \"variables\": {\"polled\": 2, \"queue\": [3, 4], \"visited\": [0, 1, 2, 3, 4], \"output\": [0, 1, 2]}, \"array\": [0, 1, 2, 3, 4], \"activeIndices\": [2, 4], \"status\": \"info\", \"explanation\": \"Dequeue vertex 2. Add neighbor 4 to queue.\"}\n" +
                "]"
        );
        return q;
    }

    private Question createTowerOfHanoiQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("tower-of-hanoi");
        q.setTitle("Tower of Hanoi");
        q.setDifficulty("MEDIUM");
        q.setCategory(cat);
        q.setProblemStatement(
                "The Tower of Hanoi is a mathematical puzzle where you have 3 rods (A, B, C) and n disks of different sizes. " +
                "The objective is to move the entire stack to rod C, obeying the following rules:\n" +
                "1. Only one disk can be moved at a time.\n" +
                "2. Each move consists of taking the upper disk from one of the stacks and placing it on top of another stack.\n" +
                "3. No disk may be placed on top of a smaller disk."
        );
        q.setConstraints("- 1 <= n <= 16");
        q.setExamplesJson("[{\"input\": \"n = 3\", \"output\": \"7 moves\", \"explanation\": \"Total moves required is 2^n - 1 = 7.\"}]");
        q.setBruteForceApproach("Recursive divide and conquer moving n-1 disks to auxiliary rod, moving largest disk to destination, then moving n-1 disks to destination.");
        q.setBruteForceCode(
                "public class Solution {\n" +
                "    public void solveHanoi(int n, char from, char to, char aux) {\n" +
                "        if (n == 0) return;\n" +
                "        solveHanoi(n - 1, from, aux, to);\n" +
                "        System.out.println(\"Move disk \" + n + \" from \" + from + \" to \" + to);\n" +
                "        solveHanoi(n - 1, aux, to, from);\n" +
                "    }\n" +
                "}"
        );
        q.setBruteForceTime("O(2^n)");
        q.setBruteForceSpace("O(n) call stack depth");
        q.setOptimizedApproach("Optimal recurrence T(n) = 2*T(n-1) + 1 yields exactly 2^n - 1 moves, which is mathematically minimal.");
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public void hanoi(int n, char from, char to, char aux) {\n" +
                "        if (n == 1) {\n" +
                "            System.out.println(\"Move disk 1 from \" + from + \" to \" + to);\n" +
                "            return;\n" +
                "        }\n" +
                "        hanoi(n - 1, from, aux, to);\n" +
                "        System.out.println(\"Move disk \" + n + \" from \" + from + \" to \" + to);\n" +
                "        hanoi(n - 1, aux, to, from);\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(2^n)");
        q.setOptimizedSpace("O(n)");
        q.setVisualizerType("RECURSION_TREE");
        q.setDefaultInputJson("{\"n\": 3, \"pegs\": {\"A\": [3, 2, 1], \"B\": [], \"C\": []}}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [3], \"pointers\": {}, \"variables\": {\"disk\": 1, \"from\": \"A\", \"to\": \"C\"}, \"array\": [1, 2, 3], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Move Disk 1 from Rod A to Rod C.\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [5], \"pointers\": {}, \"variables\": {\"disk\": 2, \"from\": \"A\", \"to\": \"B\"}, \"array\": [2], \"activeIndices\": [1], \"status\": \"info\", \"explanation\": \"Move Disk 2 from Rod A to Rod B.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [3], \"pointers\": {}, \"variables\": {\"disk\": 1, \"from\": \"C\", \"to\": \"B\"}, \"array\": [1], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Move Disk 1 from Rod C to Rod B (on top of Disk 2).\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [5], \"pointers\": {}, \"variables\": {\"disk\": 3, \"from\": \"A\", \"to\": \"C\"}, \"array\": [3], \"activeIndices\": [2], \"status\": \"success\", \"explanation\": \"Move largest Disk 3 from Rod A to destination Rod C!\"}\n" +
                "]"
        );
        return q;
    }

    private Question createActivitySelectionQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("non-overlapping-intervals");
        q.setTitle("Non-overlapping Intervals (Activity Selection)");
        q.setDifficulty("MEDIUM");
        q.setCategory(cat);
        q.setProblemStatement(
                "Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals " +
                "you need to remove to make the rest of the intervals non-overlapping."
        );
        q.setConstraints("- 1 <= intervals.length <= 10^5\n- intervals[i].length == 2\n- -5 * 10^4 <= starti < endi <= 5 * 10^4");
        q.setExamplesJson("[{\"input\": \"intervals = [[1,2],[2,3],[3,4],[1,3]]\", \"output\": \"1\", \"explanation\": \"Remove [1,3] to make remaining intervals non-overlapping.\"}]");
        q.setBruteForceApproach("Generate all 2^n subsets of intervals, test for overlaps, and pick the largest non-overlapping subset.");
        q.setBruteForceCode("public class Solution { // Exponential 2^n subset generation }");
        q.setBruteForceTime("O(2^n)");
        q.setBruteForceSpace("O(n)");
        q.setOptimizedApproach(
                "Greedy Choice Property: Sort intervals by end time ascending. " +
                "Always pick the interval that finishes earliest, leaving maximum possible room for subsequent intervals. " +
                "If the next interval starts before previous end time, an overlap occurs and it must be removed."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public int eraseOverlapIntervals(int[][] intervals) {\n" +
                "        if (intervals.length == 0) return 0;\n" +
                "        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));\n" +
                "        \n" +
                "        int count = 0;\n" +
                "        int prevEnd = intervals[0][1];\n" +
                "        \n" +
                "        for (int i = 1; i < intervals.length; i++) {\n" +
                "            if (intervals[i][0] < prevEnd) {\n" +
                "                count++; // overlap, remove\n" +
                "            } else {\n" +
                "                prevEnd = intervals[i][1];\n" +
                "            }\n" +
                "        }\n" +
                "        return count;\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n log n) due to sorting");
        q.setOptimizedSpace("O(1)");
        q.setVisualizerType("GREEDY_INTERVALS");
        q.setDefaultInputJson("{\"intervals\": [[1, 2], [1, 3], [2, 3], [3, 4]]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [3], \"pointers\": {\"i\": 0}, \"variables\": {\"sorted\": \"[[1,2], [2,3], [1,3], [3,4]]\", \"prevEnd\": 2, \"removed\": 0}, \"array\": [2, 3, 3, 4], \"activeIndices\": [0], \"status\": \"info\", \"explanation\": \"Sort intervals by end time. Pick [1, 2] (ends earliest at 2).\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [8, 11], \"pointers\": {\"i\": 1}, \"variables\": {\"interval\": \"[2, 3]\", \"start\": 2, \"prevEnd\": 2, \"overlap\": false}, \"array\": [2, 3, 3, 4], \"activeIndices\": [1], \"status\": \"success\", \"explanation\": \"Next is [2, 3]. Start 2 >= prevEnd 2 (no overlap). Keep it, update prevEnd = 3.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [8, 9], \"pointers\": {\"i\": 2}, \"variables\": {\"interval\": \"[1, 3]\", \"start\": 1, \"prevEnd\": 3, \"overlap\": true, \"removed\": 1}, \"array\": [2, 3, 3, 4], \"activeIndices\": [2], \"status\": \"warning\", \"explanation\": \"Next is [1, 3]. Start 1 < prevEnd 3! Overlap detected. Increment removed count to 1.\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [8, 11], \"pointers\": {\"i\": 3}, \"variables\": {\"interval\": \"[3, 4]\", \"start\": 3, \"prevEnd\": 4, \"removed\": 1}, \"array\": [2, 3, 3, 4], \"activeIndices\": [3], \"status\": \"success\", \"explanation\": \"Next is [3, 4]. Start 3 >= 3. Keep it. Total intervals removed = 1.\"}\n" +
                "]"
        );
        return q;
    }

    private Question createClimbingStairsQuestion(Category cat) {
        Question q = new Question();
        q.setSlug("climbing-stairs");
        q.setTitle("Climbing Stairs");
        q.setDifficulty("EASY");
        q.setCategory(cat);
        q.setProblemStatement(
                "You are climbing a staircase. It takes n steps to reach the top.\n" +
                "Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?"
        );
        q.setConstraints("- 1 <= n <= 45");
        q.setExamplesJson("[{\"input\": \"n = 3\", \"output\": \"3\", \"explanation\": \"1. 1+1+1 step, 2. 1+2 steps, 3. 2+1 steps.\"}]");
        q.setBruteForceApproach("Pure recursion: climb(n) = climb(n - 1) + climb(n - 2). Computes same subproblems repeatedly.");
        q.setBruteForceCode("public class Solution { public int climbStairs(int n) { if (n <= 2) return n; return climbStairs(n - 1) + climbStairs(n - 2); } }");
        q.setBruteForceTime("O(2^n)");
        q.setBruteForceSpace("O(n) call stack");
        q.setOptimizedApproach(
                "Dynamic Programming: dp[i] represents number of distinct ways to reach step i. " +
                "Base cases: dp[1] = 1, dp[2] = 2. Transition: dp[i] = dp[i-1] + dp[i-2]. Space can be optimized to O(1) with two variables."
        );
        q.setOptimizedCode(
                "public class Solution {\n" +
                "    public int climbStairs(int n) {\n" +
                "        if (n <= 2) return n;\n" +
                "        int[] dp = new int[n + 1];\n" +
                "        dp[1] = 1;\n" +
                "        dp[2] = 2;\n" +
                "        \n" +
                "        for (int i = 3; i <= n; i++) {\n" +
                "            dp[i] = dp[i - 1] + dp[i - 2];\n" +
                "        }\n" +
                "        return dp[n];\n" +
                "    }\n" +
                "}"
        );
        q.setOptimizedTime("O(n)");
        q.setOptimizedSpace("O(n) or O(1)");
        q.setVisualizerType("DP_TABLE");
        q.setDefaultInputJson("{\"n\": 5, \"dp\": [0, 1, 2, 0, 0, 0]}");
        q.setVisualizationStepsJson(
                "[\n" +
                "  {\"step\": 1, \"highlightLines\": [4, 5], \"pointers\": {\"i\": 2}, \"variables\": {\"dp[1]\": 1, \"dp[2]\": 2}, \"array\": [0, 1, 2, 0, 0, 0], \"activeIndices\": [1, 2], \"status\": \"info\", \"explanation\": \"Base cases: dp[1]=1 (one 1-step), dp[2]=2 (1+1 or 2).\"},\n" +
                "  {\"step\": 2, \"highlightLines\": [8], \"pointers\": {\"i\": 3}, \"variables\": {\"dp[3]\": 3, \"calculation\": \"dp[2] + dp[1] = 2 + 1 = 3\"}, \"array\": [0, 1, 2, 3, 0, 0], \"activeIndices\": [1, 2, 3], \"status\": \"success\", \"explanation\": \"i=3: dp[3] = dp[2] + dp[1] = 3 ways.\"},\n" +
                "  {\"step\": 3, \"highlightLines\": [8], \"pointers\": {\"i\": 4}, \"variables\": {\"dp[4]\": 5, \"calculation\": \"dp[3] + dp[2] = 3 + 2 = 5\"}, \"array\": [0, 1, 2, 3, 5, 0], \"activeIndices\": [2, 3, 4], \"status\": \"success\", \"explanation\": \"i=4: dp[4] = dp[3] + dp[2] = 5 ways.\"},\n" +
                "  {\"step\": 4, \"highlightLines\": [8, 10], \"pointers\": {\"i\": 5}, \"variables\": {\"dp[5]\": 8, \"calculation\": \"dp[4] + dp[3] = 5 + 3 = 8\"}, \"array\": [0, 1, 2, 3, 5, 8], \"activeIndices\": [3, 4, 5], \"status\": \"success\", \"explanation\": \"i=5: dp[5] = dp[4] + dp[3] = 8 ways! Total distinct paths to step 5 is 8.\"}\n" +
                "]"
        );
        return q;
    }

    // Quizzes

    private void seedQuizForTwoSum(Question q, Category cat) {
        Quiz quiz = new Quiz(
                "Two Sum II Algorithm Mastery Quiz",
                "Test your understanding of the Two-Pointer technique and sorted array constraints.",
                cat,
                q
        );
        quizRepository.save(quiz);

        QuizQuestion qq1 = new QuizQuestion(
                quiz,
                "Why can we use the two-pointer approach in O(n) time for this problem?",
                "Because the array is already sorted in non-decreasing order",
                "Because the array has only positive numbers",
                "Because the array has a fixed length of 10",
                "Because we use a hash set under the hood",
                "A",
                "Sorting guarantees that moving the left pointer rightward increases the sum, and moving the right pointer leftward decreases the sum."
        );
        QuizQuestion qq2 = new QuizQuestion(
                quiz,
                "If numbers[left] + numbers[right] > target, what action should be taken?",
                "Increment left (left++)",
                "Decrement right (right--)",
                "Reset left to 0",
                "Return [-1, -1]",
                "B",
                "Since numbers is sorted, decrementing the right pointer reduces numbers[right], which decreases the total sum towards the target."
        );
        QuizQuestion qq3 = new QuizQuestion(
                quiz,
                "What is the auxiliary space complexity of the Two-Pointer solution?",
                "O(n)",
                "O(log n)",
                "O(1)",
                "O(n^2)",
                "C",
                "The algorithm only maintains two integer pointer variables (left, right), using constant O(1) extra space."
        );
        quizQuestionRepository.saveAll(List.of(qq1, qq2, qq3));
    }

    private void seedQuizForLongestSubstring(Question q, Category cat) {
        Quiz quiz = new Quiz(
                "Sliding Window Concepts Quiz",
                "Check your intuition on window contraction, hash map indices, and string traversals.",
                cat,
                q
        );
        quizRepository.save(quiz);

        QuizQuestion qq1 = new QuizQuestion(
                quiz,
                "When a duplicate character c is detected at right, how does the left pointer update?",
                "left = 0",
                "left = charMap.get(c) + 1 (if >= left)",
                "left++ only",
                "right = left",
                "B",
                "To skip past the duplicate without re-checking previous characters, left jumps to one index past the previous occurrence of c."
        );
        QuizQuestion qq2 = new QuizQuestion(
                quiz,
                "What is the overall time complexity of the optimized sliding window approach for string length n?",
                "O(n^2)",
                "O(n log n)",
                "O(n)",
                "O(2^n)",
                "C",
                "Each character is visited at most twice (once by right pointer and once by left pointer), resulting in linear O(n) time."
        );
        quizQuestionRepository.saveAll(List.of(qq1, qq2));
    }

    private void seedQuizForReverseList(Question q, Category cat) {
        Quiz quiz = new Quiz(
                "Linked List Pointer Inversion Quiz",
                "Test your understanding of linked list node links and iterative reversal.",
                cat,
                q
        );
        quizRepository.save(quiz);

        QuizQuestion qq1 = new QuizQuestion(
                quiz,
                "Why must we store curr.next in a temporary variable 'nextNode' before reversing the link?",
                "Because curr.val will be lost otherwise",
                "Because changing curr.next breaks the reference to the rest of the list",
                "Because Java does not allow direct pointer manipulation",
                "It is just a stylistic preference",
                "B",
                "Once curr.next = prev executes, the original link to the subsequent node is severed. Storing nextNode first prevents losing the remainder of the list."
        );
        quizQuestionRepository.save(qq1);
    }

    private void seedQuizForValidParentheses(Question q, Category cat) {
        Quiz quiz = new Quiz(
                "Stack & LIFO Principles Quiz",
                "Verify your knowledge of stack push/pop operations and bracket matching.",
                cat,
                q
        );
        quizRepository.save(quiz);

        QuizQuestion qq1 = new QuizQuestion(
                quiz,
                "Why is a Stack the ideal data structure for matching parentheses?",
                "Because it sorts elements automatically",
                "Because the most recently opened bracket must be the first one closed (LIFO property)",
                "Because it consumes zero memory",
                "Because it allows random access in O(1) time",
                "B",
                "Parenthesis nesting strictly obeys Last-In First-Out (LIFO), which maps directly onto a stack."
        );
        quizQuestionRepository.save(qq1);
    }

    private void seedQuizForBinarySearch(Question q, Category cat) {
        Quiz quiz = new Quiz(
                "Binary Search Invariants Quiz",
                "Master search space division, middle calculation, and termination conditions.",
                cat,
                q
        );
        quizRepository.save(quiz);

        QuizQuestion qq1 = new QuizQuestion(
                quiz,
                "Why is 'mid = low + (high - low) / 2' preferred over '(low + high) / 2'?",
                "It executes faster on CPU ALU",
                "It prevents integer overflow when low + high exceeds Integer.MAX_VALUE",
                "It is required by Java 21 specification",
                "It works on negative array indices",
                "B",
                "If both low and high are large (e.g. > 10^9), their sum overflows signed 32-bit integer arithmetic. The subtraction formulation avoids overflow."
        );
        quizQuestionRepository.save(qq1);
    }
}
