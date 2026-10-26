package com.animateddsa.dto;

public class ProgressUpdateRequest {
    private String status; // NOT_STARTED, IN_PROGRESS, SOLVED
    private String notes;

    public ProgressUpdateRequest() {}
    public ProgressUpdateRequest(String status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
