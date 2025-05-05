"use client";

import { useEffect, useState } from "react";
import { Field, Project } from "./types";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Alert,
  Spinner,
  Stack,
} from "react-bootstrap";
import AddProjectModal from "./AddProjectModal";
import EditProjectModal from "./EditProjectModal";
import ManageProjectPostsModal from "./ManageProjectPostsModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPostsModal, setShowEditPostsModal] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP Error: ${res.status} ${res.statusText}`
        );
      }

      const projectsData = await res.json();

      // Map to correct types
      const projectsDataCorrected: Project[] = projectsData.map((p: any) => ({
        name: p.name,
        manager_first: p.manager_first,
        manager_last: p.manager_last,
        institute: p.institute,
        start_date: new Date(p.start_date),
        end_date: new Date(p.end_date),
        fields: p.fields,
      }));

      setProjects(projectsDataCorrected);
    } catch (err: any) {
      console.error(err);
      setError(`Could not fetch projects: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectName: string) => {
    try {
      setLoading(true);                // show spinner / disable buttons
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP Error: ${res.status} ${res.statusText}`
        );
      }
      await fetchProjects();           // wait for state refresh
    } catch (err: any) {
      console.error(err);
      setError(`Could not delete project: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);               // always reset
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Container className="py-4">
      <Stack gap={3}>
        <Row>
          <Col>
            <h2 className="fw-bold">Manage Projects and Fields</h2>
            <p className="text-muted">
              View, add, and edit tracked analysis projects and their fields.
            </p>
            <Button onClick={() => setShowAddModal(true)} variant="primary">
              + New Project
            </Button>
          </Col>
        </Row>

        {error && (
          <Row>
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col>
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" role="status" />
              </div>
            ) : (
              <Table bordered striped responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Project</th>
                    <th>Manager</th>
                    <th>Institute</th>
                    <th>Dates</th>
                    <th>Fields</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.name}>
                      <td className="fw-semibold">{p.name}</td>
                      <td>
                        {p.manager_first} {p.manager_last}
                      </td>
                      <td>{p.institute}</td>
                      <td>
                        <small>
                          {p.start_date.toDateString()} →{" "}
                          {p.end_date.toDateString()}
                        </small>
                      </td>
                      <td>
                        <ul className="mb-0 small">
                          {p.fields && p.fields.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(p);
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(p);
                            setShowEditPostsModal(true);
                          }}
                          className="ms-2"
                        >
                          Manage Posts
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            handleDeleteProject(p.name);
                          }}
                          disabled={loading}
                          className="ms-2"
                        >
                          Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>

        <AddProjectModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          onRefresh={fetchProjects}
        />

        <EditProjectModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          selectedProject={selectedProject}
          onRefresh={fetchProjects}
        />

        <ManageProjectPostsModal
          show={showEditPostsModal}
          onHide={() => setShowEditPostsModal(false)}
          selectedProject={selectedProject}
          onRefresh={fetchProjects}
        />
      </Stack>
    </Container>
  );
}
