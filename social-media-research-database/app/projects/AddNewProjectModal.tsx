"use client";

import { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { Project } from "./types";

type Props = {
  show: boolean;
  onHide: () => void;
  onRefresh: () => void;
};

export default function AddProjectModal({ show, onHide, onRefresh }: Props) {
  const [form, setForm] = useState<Partial<Project>>({});
  const [fields, setFields] = useState<string[]>([]);
  const [newField, setNewField] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddField = () => {
    if (newField.trim() && !fields.includes(newField.trim())) {
      setFields((prev) => [...prev, newField.trim()]);
      setNewField("");
    }
  };

  const handleRemoveField = (fieldName: string) => {
    setFields((prev) => prev.filter((f) => f !== fieldName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Project creation failed");
      if (form.name && fields.length > 0) {
        await Promise.all(
          fields.map((field) =>
            fetch(`/api/projects/${encodeURIComponent(form.name)}/fields`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ field_name: field }),
            })
          )
        );
      }
      setForm({});
      setFields([]);
      setNewField("");
      onHide();
      onRefresh();
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Institute</Form.Label>
                <Form.Control
                  value={form.institute_name || ""}
                  onChange={(e) => setForm({ ...form, institute_name: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Manager First Name</Form.Label>
                <Form.Control
                  value={form.manager_first_name || ""}
                  onChange={(e) => setForm({ ...form, manager_first_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Manager Last Name</Form.Label>
                <Form.Control
                  value={form.manager_last_name || ""}
                  onChange={(e) => setForm({ ...form, manager_last_name: e.target.value })}
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
                  value={form.start_date || ""}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.end_date || ""}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6>Add Initial Fields</h6>
          <Row className="mb-3">
            <Col md={10}>
              <Form.Control
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                placeholder="New field name"
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-success" className="w-100" onClick={handleAddField}>
                Add
              </Button>
            </Col>
          </Row>

          {fields.length > 0 && (
            <ul className="list-unstyled">
              {fields.map((field) => (
                <li key={field} className="mb-2 d-flex align-items-center gap-2">
                  <Form.Control value={field} disabled className="me-2" />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveField(field)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button type="submit" variant="primary" disabled={submitting}>
            Create Project
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
