"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";

type Post = {
  datetime: string;
  username: string;
  social_name: string;
  text: string;
  city?: string;
  region?: string;
  country?: string;
  likes?: number;
  dislikes?: number;
  has_multimedia: boolean;
};

type User = {
  username: string;
  social_name: string;
  first_name?: string;
  last_name?: string;
};

export default function SearchPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    social_name: "",
    username: "",
    start_date: "",
    end_date: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
        const platformList = Array.from(new Set(data.map((u) => u.social_name)));
        setPlatforms(platformList);
      })
      .catch((error) => {
        setError("Failed to load users: " + error.message);
      });
  }, []);

  useEffect(() => {
    const filteredUsernames = users
      .filter((u) => u.social_name === filters.social_name)
      .map((u) => u.username);
    setUsernames(filteredUsernames);
  }, [filters.social_name, users]);

  const handleSearch = async () => {
    setError(null);

    const queryParams = new URLSearchParams();
    if (filters.social_name) queryParams.append("social_name", filters.social_name);
    if (filters.username) queryParams.append("username", filters.username);
    if (filters.start_date) queryParams.append("start", filters.start_date);
    if (filters.end_date) queryParams.append("end", filters.end_date);
    if (filters.first_name) queryParams.append("first_name", filters.first_name);
    if (filters.last_name) queryParams.append("last_name", filters.last_name);

    const url = `/api/posts?${queryParams.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unknown error occurred");
      }
      const data = await res.json();
      setPosts(data);
    }  catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
        setError("Failed to fetch posts: " + (err as any).message);
      } else {
        setError("Failed to fetch posts: An unknown error occurred");
      }
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Search Posts</h2>
        </Col>
      </Row>

      {/* Filters Form */}
      <Row className="mb-4">
        <Col md={10}>

          <Form>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Platform</Form.Label>
                  <Form.Select
                    value={filters.social_name}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, social_name: e.target.value, username: "" }))
                    }
                  >
                    <option value="">All platforms</option>
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Select
                    value={filters.username}
                    onChange={(e) => setFilters((f) => ({ ...f, username: e.target.value }))}
                    disabled={!filters.social_name}
                  >
                    <option value="">All users</option>
                    {usernames.map((username) => (
                      <option key={username} value={username}>
                        {username}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Alice"
                    value={filters.first_name}
                    onChange={(e) => setFilters((f) => ({ ...f, first_name: e.target.value }))}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Smith"
                    value={filters.last_name}
                    onChange={(e) => setFilters((f) => ({ ...f, last_name: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
                  />
                </Form.Group>
              </Col>

              <Col md={8} className="d-flex align-items-end">
                <Button variant="primary" onClick={handleSearch}>
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Posts Table */}
      <Row>
        <Col>
          <h4 className="mb-3">Results</h4>
          {posts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            <Table bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Text</th>
                  <th>Platform</th>
                  <th>Username</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Likes</th>
                  <th>Dislikes</th>
                  <th>Multimedia</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr
                    key={`${post.username}-${post.social_name}-${post.datetime}-${index}`}
                  >
                    <td>{post.text.length > 50 ? `${post.text.slice(0, 50)}...` : post.text}</td>
                    <td>{post.social_name}</td>
                    <td>{post.username}</td>
                    <td>{new Date(post.datetime).toLocaleString()}</td>
                    <td>
                      {[post.city, post.region, post.country]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td>{post.likes ?? 0}</td>
                    <td>{post.dislikes ?? 0}</td>
                    <td>{post.has_multimedia ? "✔️" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
}
