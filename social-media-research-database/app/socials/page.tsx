"use client";

import { useEffect, useState } from "react";
import { Platform } from "./types";

import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [newPlatform, setNewPlatform] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/socials");
      const data = await res.json();
      setPlatforms(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load platforms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform.trim()) {
      setError("Platform name cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlatform.trim() }),
      });

      if (!res.ok) throw new Error("Failed to add platform.");
      setNewPlatform("");
      setError(null);
      await fetchPlatforms();
    } catch (err) {
      console.error(err);
      setError("Platform might already exist or server error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (name: string) => {
    setDeletingName(name);
    try {
      const res = await fetch(`/api/socials`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error();
      await fetchPlatforms();
    } catch {
      setError(`Failed to delete platform: ${name}`);
    } finally {
      setDeletingName(null);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Tracked Social Media Platforms</h2>
          <p className="text-muted">Manage the list of supported platforms.</p>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form onSubmit={handleAddPlatform}>
            <Form.Group className="mb-3">
              <Form.Label>Add New Platform</Form.Label>
              <Form.Control
                type="text"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                placeholder="e.g. Twitter, Facebook"
                disabled={submitting}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Adding...
                </>
              ) : (
                "Add Platform"
              )}
            </Button>
          </Form>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h5>Existing Platforms</h5>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <Table bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Platform Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(p.name)}
                        disabled={deletingName === p.name}
                      >
                        {deletingName === p.name ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />{" "}
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {platforms.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-muted">
                      No platforms tracked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
}
