"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Table, Alert } from "react-bootstrap";

type FieldStats = {
    field: string;
    percentage_with_value: number;
};

type Post = {
    datetime: string;
    username: string;
    social_name: string;
    text: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    likes: number | null;
    dislikes: number | null;
    has_multimedia: boolean | null;
    field_results: FieldResult[];
};

type FieldResult = {
    field_name: string;
    result: string | null;
};

type ExperimentSearchResult = {
    posts: Post[];
    field_stats: FieldStats[];
};

export default function SearchExperimentsPage() {
    const [projectNames, setProjectNames] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [data, setData] = useState<ExperimentSearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load project names
        fetch("/api/projects")
            .then((res) => res.json())
            .then((projects) => {
                const names = projects.map((p: any) => p.name);
                setProjectNames(names);
            })
            .catch((err) => setError("Failed to load projects: " + err.message));
    }, []);

    useEffect(() => {
        if (!selectedProject) return;

        setError(null);
        setData(null);

        const url = `/api/search-experiments?project_name=${encodeURIComponent(selectedProject)}`;
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch search results");
                return res.json();
            })
            .then((data: ExperimentSearchResult) => setData(data))
            .catch((err) => setError(err.message));
    }, [selectedProject]);

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold">Search Experiments</h2>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Select Project</Form.Label>
                        <Form.Select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="">Choose a project</option>
                            {projectNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}

            {data && (
                <>
                    <Row className="mb-4">
                        <Col>
                            <h4 className="fw-semibold">Field Coverage</h4>
                            <Table bordered hover responsive>
                                <thead className="table-secondary">
                                    <tr>
                                        <th>Field</th>
                                        <th>% Posts With Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.field_stats.map((stat) => (
                                        <tr key={stat.field}>
                                            <td>{stat.field}</td>
                                            <td>{stat.percentage_with_value.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <h4 className="fw-semibold">Posts</h4>
                            <Table bordered hover responsive>
                                <thead className="table-dark">
                                    <tr>
                                        <th>Datetime</th>
                                        <th>Platform</th>
                                        <th>Username</th>
                                        <th>Text</th>
                                        <th>City</th>
                                        <th>Region</th>
                                        <th>Country</th>
                                        <th>Likes</th>
                                        <th>Dislikes</th>
                                        <th>Has Multimedia</th>
                                        {data.field_stats.map((stat) => (
                                            <th key={stat.field}>{stat.field}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.posts.map((post, idx) => (
                                        <tr key={`${post.datetime}-${post.username}-${post.social_name}-${idx}`}>
                                            <td>{new Date(post.datetime).toLocaleString()}</td>
                                            <td>{post.social_name}</td>
                                            <td>{post.username}</td>
                                            <td>
                                              {post.text && post.text.length > 50
                                                ? post.text.slice(0, 50) + "..."
                                                : post.text || ""}
                                            </td>
                                            <td>{post.city}</td>
                                            <td>{post.region}</td>
                                            <td>{post.country}</td>
                                            <td>{post.likes}</td>
                                            <td>{post.dislikes}</td>
                                            <td>{post.has_multimedia ? "Yes" : "No"}</td>
                                            {data.field_stats.map((stat) => {
                                                const match = post.field_results.find(
                                                    (r) => r.field_name === stat.field
                                                );
                                                return <td key={stat.field}>{match?.result ?? "—"}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
}
