package com.example.collegeportal.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.collegeportal.model.Application;
import com.example.collegeportal.model.ApplicationRepository;
import com.example.collegeportal.model.College;
import com.example.collegeportal.model.Course;
import com.example.collegeportal.model.CourseRepository;
import com.example.collegeportal.model.User;
import com.example.collegeportal.repository.CollegeRepository;
import com.example.collegeportal.repository.UserRepository;
import com.example.collegeportal.security.JwtUtil;

@RestController
@RequestMapping("/api/college")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CollegeController {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    // Get current college profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }

            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());

            Optional<College> college = collegeRepository.findByUserId(userId);
            if (college.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "College profile not found"));
            }

            return ResponseEntity.ok(college.get());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }

    // Create or update college profile
    @PostMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> data) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }

            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || !userOpt.get().getRole().equals("COLLEGE")) {
                return ResponseEntity.status(403).body(Map.of("error", "Only colleges can update profile"));
            }

            Optional<College> collegeOpt = collegeRepository.findByUserId(userId);
            College college = collegeOpt.orElseGet(() -> {
                College newCollege = new College();
                newCollege.setUserId(userId);
                User user = userOpt.get();
                newCollege.setName(user.getCollegeName());
                return newCollege;
            });

            if (data.containsKey("name")) {
                String name = (String) data.get("name");
                if (name != null && !name.trim().isEmpty()) college.setName(name);
            }
            if (data.containsKey("description")) college.setDescription((String) data.get("description"));
            if (data.containsKey("location")) college.setLocation((String) data.get("location"));
            if (data.containsKey("city")) college.setCity((String) data.get("city"));
            if (data.containsKey("state")) college.setState((String) data.get("state"));
            if (data.containsKey("category")) college.setCategory((String) data.get("category"));
            if (data.containsKey("facilities")) college.setFacilities((String) data.get("facilities"));
            if (data.containsKey("website")) college.setWebsite((String) data.get("website"));
            if (data.containsKey("contactPhone")) college.setContactPhone((String) data.get("contactPhone"));
            if (data.containsKey("contactEmail")) college.setContactEmail((String) data.get("contactEmail"));
            if (data.containsKey("establishedYear")) {
                Object val = data.get("establishedYear");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setEstablishedYear(Double.valueOf(val.toString()).intValue()); } catch (Exception e) {}
                } else { college.setEstablishedYear(null); }
            }
            if (data.containsKey("imagePath")) college.setImagePath((String) data.get("imagePath"));
            if (data.containsKey("nirf")) {
                Object val = data.get("nirf");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setNirf(Double.valueOf(val.toString()).intValue()); } catch (Exception e) {}
                } else { college.setNirf(null); }
            }
            if (data.containsKey("accreditation")) college.setAccreditation((String) data.get("accreditation"));
            if (data.containsKey("type")) college.setType((String) data.get("type"));
            if (data.containsKey("avgPackage")) {
                Object val = data.get("avgPackage");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setAvgPackage(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setAvgPackage(null); }
            }
            if (data.containsKey("highestPackage")) {
                Object val = data.get("highestPackage");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setHighestPackage(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setHighestPackage(null); }
            }
            if (data.containsKey("placementPercentage")) {
                Object val = data.get("placementPercentage");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setPlacementPercentage(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setPlacementPercentage(null); }
            }
            if (data.containsKey("minFee")) {
                Object val = data.get("minFee");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setMinFee(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setMinFee(null); }
            }
            if (data.containsKey("maxFee")) {
                Object val = data.get("maxFee");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setMaxFee(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setMaxFee(null); }
            }
            if (data.containsKey("totalSeats")) {
                Object val = data.get("totalSeats");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setTotalSeats(Double.valueOf(val.toString()).intValue()); } catch (Exception e) {}
                } else { college.setTotalSeats(null); }
            }
            if (data.containsKey("cutoff")) {
                Object val = data.get("cutoff");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setCutoff(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setCutoff(null); }
            }
            if (data.containsKey("logoPath")) college.setLogoPath((String) data.get("logoPath"));
            if (data.containsKey("shortName")) college.setShortName((String) data.get("shortName"));
            if (data.containsKey("topRecruiters")) college.setTopRecruiters((String) data.get("topRecruiters"));
            if (data.containsKey("gallery")) college.setGallery((String) data.get("gallery"));
            if (data.containsKey("eligibilityCriteria")) college.setEligibilityCriteria((String) data.get("eligibilityCriteria"));

            College saved = collegeRepository.save(college);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "College profile updated successfully");
            response.put("college", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            String msg = e.getMessage() != null ? e.getMessage() : e.toString();
            error.put("error", "Database error: " + msg);
            return ResponseEntity.status(500).body(error);
        }
    }

    // Apply for a course and automatically update seats
    @PostMapping(value = "/apply", consumes = "multipart/form-data")
    public ResponseEntity<?> apply(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam Long collegeId,
            @RequestParam String courseName,
            @RequestParam String quota,
            @RequestParam String studentName,
            @RequestParam String studentEmail,
            @RequestParam String studentPhone,
            @RequestParam Double tenthMark,
            @RequestParam Double twelfthMark,
            @RequestParam Double cutoffMark,
            @RequestPart(required = false) MultipartFile tenthMarksheet,
            @RequestPart(required = false) MultipartFile twelfthMarksheet,
            @RequestPart(required = false) MultipartFile photo) {
        try {
            Optional<College> collegeOpt = collegeRepository.findById(collegeId);
            if (collegeOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "College not found"));
            College college = collegeOpt.get();

            List<Course> courses = courseRepository.findByCollegeId(collegeId);
            // More efficient duplicate check using repository query
            String fullCourseName = courseName + " (" + quota + ")";
            Course selectedCourse = courses.stream()
                .filter(c -> (c.getName() + " (" + (c.getQuota() != null ? c.getQuota() : "N/A") + ")").equals(fullCourseName))
                .findFirst().orElse(null);

            if (applicationRepository.existsByCollegeIdAndCourseNameAndStudentEmailIgnoreCase(collegeId, fullCourseName, studentEmail)) {
                return ResponseEntity.status(409).body(Map.of("error", "You have already applied for this course at this college."));
            }
            
            Application app = new Application();
            
            if (token != null && token.startsWith("Bearer ")) {
                try {
                    String jwt = token.substring(7);
                    Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());
                    app.setStudentId(userId);
                } catch (Exception e) { /* continue as guest if token invalid */ }
            }

            app.setCollegeId(collegeId);
            app.setCollegeName(college.getName());
            app.setCourseName(fullCourseName);
            app.setStatus(selectedCourse != null && selectedCourse.getSeats() <= 0 ? "WAITING_LIST" : "PENDING");
            app.setStudentName(studentName);
            app.setStudentEmail(studentEmail);
            app.setStudentPhone(studentPhone);
            app.setTenthMark(tenthMark);
            app.setTwelfthMark(twelfthMark);
            app.setCutoffMark(cutoffMark);
            
            if (tenthMarksheet != null) app.setTenthMarksheetPath(saveFile(tenthMarksheet));
            if (twelfthMarksheet != null) app.setTwelfthMarksheetPath(saveFile(twelfthMarksheet));
            if (photo != null) app.setPhotoPath(saveFile(photo));
            
            applicationRepository.save(app);
            return ResponseEntity.ok(Map.of("message", "Application submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Use UUID to prevent filename collisions and sanitize the extension
        String originalName = file.getOriginalFilename();
        String extension = originalName != null && originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
        String fileName = java.util.UUID.randomUUID().toString() + extension;

        Path filePath = Paths.get(uploadDir, fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + fileName; // Return a URL path
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());
            Optional<College> college = collegeRepository.findByUserId(userId);
            if (college.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "College not found"));
            return ResponseEntity.ok(applicationRepository.findByCollegeId(college.get().getId()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());
            return ResponseEntity.ok(applicationRepository.findByStudentId(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/applications/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Optional<Application> appOpt = applicationRepository.findById(id);
        if (appOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "App not found"));
        
        Application app = appOpt.get();
        String oldStatus = app.getStatus();
        String status = data.get("status");
        app.setStatus(status);
        applicationRepository.save(app);

        if ("ACCEPTED".equals(status) && !"ACCEPTED".equals(oldStatus)) {
            List<Course> courses = courseRepository.findByCollegeId(app.getCollegeId());
            for (Course course : courses) {
                String fullCourseName = course.getName() + " (" + (course.getQuota() != null ? course.getQuota() : "N/A") + ")";
                if (fullCourseName.equals(app.getCourseName())) {
                    if (course.getSeats() > 0) {
                        course.setSeats(course.getSeats() - 1);
                        courseRepository.save(course);
                    }
                    break;
                }
            }
        } else if ("ACCEPTED".equals(oldStatus) && !"ACCEPTED".equals(status)) {
            List<Course> courses = courseRepository.findByCollegeId(app.getCollegeId());
            for (Course course : courses) {
                String fullCourseName = course.getName() + " (" + (course.getQuota() != null ? course.getQuota() : "N/A") + ")";
                if (fullCourseName.equals(app.getCourseName())) {
                    course.setSeats((course.getSeats() != null ? course.getSeats() : 0) + 1);
                    courseRepository.save(course);
                    
                    List<Application> waiting = applicationRepository.findByCollegeIdAndCourseNameAndStatusOrderByIdAsc(app.getCollegeId(), app.getCourseName(), "WAITING_LIST");
                    if (!waiting.isEmpty()) {
                        Application nextInLine = waiting.get(0);
                        nextInLine.setStatus("PENDING");
                        applicationRepository.save(nextInLine);
                    }
                    break;
                }
            }
        }
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }

    // Course Catalog Endpoints
    @GetMapping("/{collegeId}/courses")
    public ResponseEntity<?> getCourses(@PathVariable Long collegeId) {
        return ResponseEntity.ok(courseRepository.findByCollegeId(collegeId));
    }

    @PostMapping("/courses")
    public ResponseEntity<?> updateCourse(@RequestHeader("Authorization") String token, @RequestBody Course course) {
        try {
            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());
            Optional<College> college = collegeRepository.findByUserId(userId);
            if (college.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "College not found"));
            
            course.setCollegeId(college.get().getId());
            return ResponseEntity.ok(courseRepository.save(course));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/courses/delete/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted"));
    }

    // Get all colleges (for student search)
    @GetMapping("/list")
    public ResponseEntity<?> getAllColleges(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer maxNirf,
            @RequestParam(required = false) Double minPlacement,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(required = false) Double maxCutoff) {
        try {
            List<College> colleges = collegeRepository.findAll();
            Stream<College> stream = colleges.stream();

            if (category != null && !category.isEmpty() && !"All".equalsIgnoreCase(category)) {
                stream = stream.filter(c -> category.equalsIgnoreCase(c.getCategory()));
            }
            if (type != null && !type.isEmpty() && !"All".equalsIgnoreCase(type)) {
                stream = stream.filter(c -> type.equalsIgnoreCase(c.getType()));
            }
            if (city != null && !city.isEmpty() && !"All".equalsIgnoreCase(city)) {
                stream = stream.filter(c -> city.equalsIgnoreCase(c.getCity()));
            }
            if (maxNirf != null) {
                stream = stream.filter(c -> c.getNirf() != null && c.getNirf() <= maxNirf);
            }
            if (minPlacement != null) {
                stream = stream.filter(c -> c.getPlacementPercentage() != null && c.getPlacementPercentage() >= minPlacement);
            }
            if (maxFee != null) {
                stream = stream.filter(c -> (c.getMinFee() != null && c.getMinFee() <= maxFee) || 
                                           (c.getMaxFee() != null && c.getMaxFee() <= maxFee));
            }
            if (maxCutoff != null) {
                stream = stream.filter(c -> c.getCutoff() == null || c.getCutoff() <= maxCutoff);
            }

            return ResponseEntity.ok(stream.collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching colleges: " + e.getMessage()));
        }
    }

    // Get specific college details
    @GetMapping("/{collegeId}")
    public ResponseEntity<?> getCollege(@PathVariable Long collegeId) {
        try {
            Optional<College> college = collegeRepository.findById(collegeId);
            if (college.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "College not found"));
            }
            return ResponseEntity.ok(college.get());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching college: " + e.getMessage()));
        }
    }
}
