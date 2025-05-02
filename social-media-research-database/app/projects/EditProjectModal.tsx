"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { Field, Project } from "./types";

type Props = {
  show: boolean;
  onHide: () => void;
  selectedProject: Project | null;
  fields: Field[];
  onRefresh: () => void;
};

export default function EditProjectModal({
  show,
  onHide,
  selectedProject,
  fields,
  onRefresh,
}: Props) {
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  const [newField, setNewField] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      setProjectForm({ ...selectedProject });
    }
  }, [selectedProject]);

  const handleProjectUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    try {
      await fetch(`/api/projects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalName: selectedProject.name, updated: projectForm }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to update project", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newField.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/projects/${encodeURIComponent(selectedProject.name)}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_name: newField.trim() }),
      });
      setNewField("");
      onRefresh();
    } catch (err) {
      console.error("Failed to add field", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteField = async (fieldName: string) => {
    if (!selectedProject) return;
    try {
      await fetch(`/api/projects/${encodeURIComponent(selectedProject.name)}/fields`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_name: fieldName }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to delete field", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedProject && (
          <>
            <Form onSubmit={handleProjectUpdate} className="mb-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Project Name</Form.Label>
                    <Form.Control
                      value={projectForm.name || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Institute</Form.Label>
                    <Form.Control
                      value={projectForm.institute_name || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, institute_name: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Manager First Name</Form.Label>
                    <Form.Control
                      value={projectForm.manager_first_name || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, manager_first_name: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Manager Last Name</Form.Label>
                    <Form.Control
                      value={projectForm.manager_last_name || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, manager_last_name: e.target.value })}
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
                      value={projectForm.start_date || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={projectForm.end_date || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" variant="primary" disabled={submitting}>
                Save Changes
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

            <table className="table table-hover">
              {fields
                .filter((f) => f.project_id === selectedProject.id)
                .map((f) => (
                  <tr key={f.field_name} className="border-top border-bottom">
                    <td>{f.field_name}</td>
                    <td className="p-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteField(f.field_name)}
                      className=""
                    >
                      Delete
                    </Button>
                    </td>
                  </tr>
                ))}
            </table>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
