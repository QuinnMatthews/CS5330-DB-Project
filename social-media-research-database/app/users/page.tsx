"use client";

import { useEffect, useState } from "react";
import { Platform } from "../socials/types";
import { User } from "./types";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [deletingSocial, setDeletingSocial] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      setUsers(
        data.map((u: any) => ({
          social_name: u.social_name,
          username: u.username,
          first_name: u.first_name,
          last_name: u.last_name,
          birthdate: new Date(u.birthdate),
          gender: u.gender,
          birth_country: u.birth_country,
          residence_country: u.residence_country,
          verified: u.verified,
        }))
      );
    } catch (err: any) {
      setError("Failed to load users: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const res = await fetch("/api/socials");
      const data = await res.json();
      setPlatforms(data);
    } catch {
      setError("Failed to load platforms.");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPlatforms();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
  
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
  
        if (errorData?.details) {
          // Extract zod-formatted errors into a readable string
          const messages = Object.entries(errorData.details)
            .map(([field, issue]: any) => {
              const msg = issue?._errors?.[0];
              return msg ? `${field}: ${msg}` : null;
            })
            .filter(Boolean)
            .join("; ");
  
          throw new Error(messages || "Invalid input.");
        }
  
        throw new Error(errorData.error || `Failed to add user: ${res.status}`);
      }
  
      const addedUser = { ...newUser };
      setNewUser({});
      await fetchUsers();
      setEditingUser(addedUser);
    } catch (err: any) {
      setError(`Could not add user: ${err.message || "Unknown error"}`);
      console.error("Add user error:", err);
    } finally {
      setSaving(false);
    }
  };
  

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    setError(null);
  
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
  
        if (errorData?.details) {
          const messages = Object.entries(errorData.details)
            .map(([field, issue]: any) => {
              const msg = issue?._errors?.[0];
              return msg ? `${field}: ${msg}` : null;
            })
            .filter(Boolean)
            .join("; ");
  
          throw new Error(messages || "Invalid input.");
        }
  
        throw new Error(errorData.error || "Failed to update user.");
      }
  
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      setError(`Could not update user: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteUser = async (username: string, social_name: string) => {
    if (!window.confirm(`Are you sure you want to delete the ${social_name} user "${username}"?`)) {
      return;
    }
  
    setDeletingName(username);
    setDeletingSocial(social_name);
    setError(null);
  
    try {
      const res = await fetch(`/api/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, social_name: social_name }),
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
  
        if (errorData?.details) {
          const messages = Object.entries(errorData.details)
            .map(([field, issue]: any) => {
              const msg = issue?._errors?.[0];
              return msg ? `${field}: ${msg}` : null;
            })
            .filter(Boolean)
            .join("; ");
  
          throw new Error(messages || "Invalid input.");
        }
  
        throw new Error(errorData.error || `Failed to delete the ${social_name} user "${username}"`);
      }
  
      await fetchUsers();
    } catch (err: any) {
      console.error(`Failed to delete the ${social_name} user "${username}"`, err);
      setError(`Could not delete user: ${err.message || "Unknown error"}`);
    } finally {
      setDeletingName(null);
      setDeletingSocial(null);
    }
  };
  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Users</h2>
          <p className="text-muted">Manage social media users per platform.</p>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form onSubmit={handleAddUser}>
            <Form.Group className="mb-3">
              <Form.Label>Platform</Form.Label>
              <Form.Select
                required
                value={newUser.social_name || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, social_name: e.target.value })
                }
              >
                <option value="">Choose platform</option>
                {platforms.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                required
                type="text"
                maxLength={100}
                value={newUser.username || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Add User"}
            </Button>
          </Form>
          {error && (
            <Alert className="mt-3" variant="danger">
              {error}
            </Alert>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h5>Existing Users</h5>
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Table bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Platform</th>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Birthdate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={`${u.social_name}-${u.username}`}>
                    <td>{u.social_name}</td>
                    <td>{u.username}</td>
                    <td>
                      {u.first_name || ""} {u.last_name || ""}
                    </td>
                    <td>{u.birthdate?.toDateString() || "-"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setEditingUser({ ...u })}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteUser(u.username, u.social_name)}
                        disabled={deletingName === u.username && deletingSocial === u.social_name}
                      >
                        {deletingName === u.username && deletingSocial === u.social_name ? (
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
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={!!editingUser} onHide={() => setEditingUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingUser && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  value={editingUser.first_name || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      first_name: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  value={editingUser.last_name || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      last_name: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Birthdate</Form.Label>
                <Form.Control
                  type="date"
                  value={
                    editingUser.birthdate?.toISOString().split("T")[0] || ""
                  }
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      birthdate: new Date(e.target.value),
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={editingUser.gender || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, gender: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Birth Country</Form.Label>
                <Form.Control
                  value={editingUser.birth_country || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      birth_country: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Residence Country</Form.Label>
                <Form.Control
                  value={editingUser.residence_country || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      residence_country: e.target.value,
                    })
                  }
                />
              </Form.Group>
              
            <Form.Group className="mb-3">
              <Form.Check
                label="Verified"
                checked={editingUser.verified}
                onChange={(e) =>
                  setEditingUser({
                      ...editingUser,
                      verified: e.target.checked,
                    })
                }
              />
            </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingUser(null)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleUpdateUser}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
