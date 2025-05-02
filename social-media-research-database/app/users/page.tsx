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
        }))
      );
    } catch (err) {
      setError("Failed to load users.");
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
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to add user: ${res.status} ${res.statusText}`
        );
      }
      setNewUser({});
      await fetchUsers();
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
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      if (!res.ok) throw new Error("Failed to update user.");
      setEditingUser(null);
      await fetchUsers();
    } catch {
      setError("Could not update user.");
    } finally {
      setSaving(false);
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
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
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
