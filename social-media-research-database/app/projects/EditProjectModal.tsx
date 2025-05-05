"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { Project } from "./types";

type Props = {
  show: boolean;
  onHide: () => void;
  selectedProject: Project | null;
  onRefresh: () => void;
};

const formatDate = (d: unknown) =>
  d instanceof Date && !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";

export default function EditProjectModal({
  show,
  onHide,
  selectedProject,
  onRefresh,
}: Props) {
  const [projectForm, setProjectForm] = useState<Project | undefined>(undefined);
  const [newField, setNewField] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      setProjectForm({ ...selectedProject });
    }
  }, [selectedProject]);

  const handleProjectUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm) return;
    setSubmitting(true);
    try {
      await fetch(`/api/projects`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      onRefresh();
      setError(null);
      onHide();
    } catch (err) {
      console.error("Failed to update project", err);
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm || !newField.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/projects/${encodeURIComponent(projectForm.name)}/fields`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field_name: newField.trim() }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        if(errorData.details.field_name._errors) {
          throw new Error(`Field creation failed: ${errorData.details.field_name._errors[0]}`);
        }

        throw new Error(`Field creation failed: ${errorData.error || "Unknown error"}`);
      }

      setProjectForm((prev) => ({
        ...prev!,
        fields: [...(prev!.fields || []), newField.trim()],
      }));

      setNewField("");
      onRefresh();
    } catch (err) {
      console.error("Failed to add field", err);
      setFieldError(err instanceof Error ? err.message : "Failed to add field");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteField = async (fieldName: string) => {
    if (!projectForm) return;
    try {
      await fetch(
        `/api/projects/${encodeURIComponent(projectForm.name)}/fields`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field_name: fieldName }),
        }
      );
      onRefresh();
      setFieldError(null);
      setNewField("");
      setProjectForm((prev) => ({
        ...prev!,
        fields: prev!.fields!.filter((f) => f!== fieldName),
      }));
    } catch (err) {
      console.error("Failed to delete field", err);
      setFieldError(err instanceof Error ? err.message : "Failed to delete field");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {projectForm && (
          <>
            <h3>{projectForm.name}</h3>
            <Form onSubmit={handleProjectUpdate} className="mb-4">
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Institute</Form.Label>
                    <Form.Control
                      value={projectForm.institute || ""}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          institute: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Manager First Name</Form.Label>
                    <Form.Control
                      value={projectForm.manager_first || ""}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          manager_first: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Manager Last Name</Form.Label>
                    <Form.Control
                      value={projectForm.manager_last || ""}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          manager_last: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formatDate(projectForm.start_date)}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          start_date: new Date(e.target.value),
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formatDate(projectForm.end_date)}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          end_date: new Date(e.target.value),
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              {error && <div className="alert alert-danger">{error}</div>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </Form>

            <hr />
            <h5>Manage Fields</h5>

            <Form onSubmit={handleAddField} className="mb-3">
              <Row>
                <Col md={10}>
                  <Form.Control
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    placeholder="New field name"
                    required
                  />
                </Col>
                <Col md={2}>
                  <Button type="submit" variant="success" className="w-100">
                    Add
                  </Button>
                </Col>
              </Row>
            </Form>
            {fieldError && <div className="alert alert-danger">{fieldError}</div>}
            <table className="table">
              <thead>
                <tr>
                  <th>Field Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectForm.fields.map((f) => (
                  <tr key={f} className="">
                    <td>{f}</td>
                    <td className="p-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteField(f)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {projectForm.fields.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-muted">
                      No fields added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
