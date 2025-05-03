"use client";

import { useState } from "react";
import { Modal, Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { Project } from "./types";

type Props = {
  show: boolean;
  onHide: () => void;
  onRefresh: () => void;
};

type FieldErrors = Record<string, string[]>;

const formatDate = (d: unknown) =>
  d instanceof Date && !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";

export default function AddProjectModal({ show, onHide, onRefresh }: Props) {
  const [form, setForm] = useState<Partial<Project>>({});
  const [fields, setFields] = useState<string[]>([]);
  const [newField, setNewField] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddField = () => {
    const sanitized = newField.trim();
    if (!sanitized) {
      setErrors({ newField: ["Please enter a field name"] });
      return;
    }

    if (fields.includes(sanitized)) {
      setErrors({ newField: ["A field with the same name already exists"] });
      return;
    }

    setFields((prev) => [...prev, sanitized]);
    setNewField("");
    setErrors((prev) => ({ ...prev, newField: [] }));
  };

  const handleRemoveField = (fieldName: string) => {
    setFields((prev) => prev.filter((f) => f !== fieldName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    try {
      const formattedForm = {
        ...form,
        start_date: formatDate(form.start_date),
        end_date: formatDate(form.end_date),
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedForm),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const fieldErrors: FieldErrors = {};
        let globalError = errorData.error || "An error occurred";

        if (errorData.details) {
          for (const [field, detail] of Object.entries(errorData.details)) {
            const messages = (detail as any)?._errors || [];
            if (messages.length) {
              fieldErrors[field] = messages;
            }
          }
          if (Object.keys(fieldErrors).length > 0) {
            globalError = null; // Don't show generic error if field-level feedback exists
          }
        }

        setErrors(fieldErrors);
        if (globalError) setGeneralError(globalError);
        return;
      }

      if (form.name && fields.length > 0) {
        const fieldResults = await Promise.all(
          fields.map((field) =>
            fetch(
              `/api/projects/${encodeURIComponent(form.name as string)}/fields`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field_name: field }),
              },
            ).then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
          ),
        );
        const failed = fieldResults.find((r) => !r.ok);
        if (failed) {
          setGeneralError(failed.data?.error ?? "Failed to add one or more fields");
          return;
        }
      }

      setSuccessMessage("Project created successfully.");
      setForm({});
      setFields([]);
      setNewField("");
      onRefresh();
      setTimeout(() => {
        setSuccessMessage(null);
        onHide();
      }, 1500);
    } catch (err: any) {
      setGeneralError("Unexpected error. Please try again.");
      console.error("Failed to create project:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (field: string) => errors[field]?.[0];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {generalError && <Alert variant="danger">{generalError}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  isInvalid={!!getFieldError("name")}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("name")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Institute</Form.Label>
                <Form.Control
                  value={form.institute || ""}
                  onChange={(e) => setForm({ ...form, institute: e.target.value })}
                  isInvalid={!!getFieldError("institute")}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("institute")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Manager First Name</Form.Label>
                <Form.Control
                  value={form.manager_first || ""}
                  onChange={(e) => setForm({ ...form, manager_first: e.target.value })}
                  isInvalid={!!getFieldError("manager_first")}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("manager_first")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Manager Last Name</Form.Label>
                <Form.Control
                  value={form.manager_last || ""}
                  onChange={(e) => setForm({ ...form, manager_last: e.target.value })}
                  isInvalid={!!getFieldError("manager_last")}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("manager_last")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formatDate(form.start_date)}
                  onChange={(e) =>
                    setForm({ ...form, start_date: new Date(e.target.value) })
                  }
                  isInvalid={!!getFieldError("start_date")}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("start_date")}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formatDate(form.end_date)}
                  onChange={(e) =>
                    setForm({ ...form, end_date: new Date(e.target.value) })
                  }
                  isInvalid={!!getFieldError("end_date")}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {getFieldError("end_date")}
                </Form.Control.Feedback>
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
                isInvalid={!!getFieldError("newField")}
              />
              <Form.Control.Feedback type="invalid">
                {getFieldError("newField")}
              </Form.Control.Feedback>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-success"
                className="w-100"
                onClick={handleAddField}
                disabled={submitting}
              >
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
                    disabled={submitting}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
