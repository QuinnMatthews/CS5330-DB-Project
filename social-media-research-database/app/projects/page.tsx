"use client";

import { useEffect, useState } from "react";
import { Field, Project } from "./types";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
  Stack,
} from "react-bootstrap";
import AddProjectModal from "./AddProjectModal";
import EditProjectModal from "./EditProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const projectsData = await res.json();
      setProjects(projectsData);

      const allFields = await Promise.all(
        projectsData.map(async (p: Project) => {
          const res = await fetch(`/api/projects/${encodeURIComponent(p.name)}/fields`);
          const data = await res.json();
          return data.map((f: Field) => ({ ...f, project_id: p.id }));
        })
      );

      setFields(allFields.flat());
    } catch (err) {
      console.error(err);
      setError("Failed to load projects or fields.");
    } finally {
      setLoading(false);
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
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.name}</td>
                      <td>{p.manager_first_name} {p.manager_last_name}</td>
                      <td>{p.institute_name}</td>
                      <td>
                        <small>{p.start_date} → {p.end_date}</small>
                      </td>
                      <td>
                        <ul className="mb-0 small">
                          {fields.filter((f) => f.project_id === p.id).map((f) => (
                            <li key={f.field_name}>{f.field_name}</li>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>

        <EditProjectModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          selectedProject={selectedProject}
          fields={fields}
          onRefresh={fetchProjects}
        />

        <AddProjectModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          onRefresh={fetchProjects}
        />
      </Stack>
    </Container>
  );
}