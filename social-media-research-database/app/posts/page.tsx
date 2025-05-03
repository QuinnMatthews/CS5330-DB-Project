// posts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { useRef } from "react";

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
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newPost, setNewPost] = useState<Partial<Post>>({});
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [usernamesForPlatform, setUsernamesForPlatform] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    social_name: "",
    username: "",
    start_date: "",
    end_date: "",
    first_name: "",
    last_name: "",
  });

  const fetchPosts = async (query = "") => {
    fetch(`/api/posts${query}`)
      .then((res) => res.json())
      .then((data: Post[]) => setPosts(data))
      .catch((error) => setError("Failed to load posts: " + error.message));
  };

  const fetchUsers = async () => {
    // Load users for dropdown
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
        const uniquePlatforms = Array.from(new Set(data.map((u) => u.social_name)));
        setPlatforms(uniquePlatforms);
      })
      .catch((error) => setError("Failed to load users: " + error.message));
  };

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, []);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setNewPost({ ...newPost, social_name: platform, username: "" });
    const usernames = users.filter((u) => u.social_name === platform).map((u) => u.username);
    setUsernamesForPlatform(usernames);
  };

  const handleNewPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const messages = Object.entries(errorData.details || {})
          .map(([field, issue]: any) => issue?._errors?.[0] && `${field}: ${issue._errors[0]}`)
          .filter(Boolean)
          .join("; ");

        throw new Error(messages || errorData.error || `Failed to submit post`);
      }

      setNewPost({});
      await fetchPosts();
    } catch (err: any) {
      setError(`Could not submit post: ${err.message || "Unknown error"}`);
      console.error("Submit post error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFilterSearch = () => {
    setError(null);
    const query = new URLSearchParams();
    if (filters.social_name) query.append("social_name", filters.social_name);
    if (filters.username) query.append("username", filters.username);
    if (filters.start_date) query.append("start", filters.start_date);
    if (filters.end_date) query.append("end", filters.end_date);
    if (filters.first_name) query.append("first_name", filters.first_name);
    if (filters.last_name) query.append("last_name", filters.last_name);
    fetchPosts("?" + query.toString());
  };

  // Update filtered usernames when platform filter changes
  useEffect(() => {
    const usernames = users
      .filter((u) => u.social_name === filters.social_name)
      .map((u) => u.username);
    setUsernamesForPlatform(usernames);
  }, [filters.social_name, users]);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Manage Posts</h2>
        </Col>
      </Row>

      {/* New Post Form */}
      <Row className="mb-5">
        <Col md={8}>
          <Form onSubmit={handleNewPostSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Platform</Form.Label>
              <Form.Select
                required
                value={selectedPlatform}
                onChange={(e) => handlePlatformChange(e.target.value)}
              >
                <option value="">Choose platform...</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Username</Form.Label>
              <Form.Select
                required
                disabled={!selectedPlatform}
                value={newPost.username || ""}
                onChange={(e) =>
                  setNewPost({ ...newPost, username: e.target.value })
                }
              >
                <option value="">Choose user...</option>
                {usernamesForPlatform.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Post Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                onChange={(e) =>
                  setNewPost({ ...newPost, text: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date/Time Posted</Form.Label>
              <Form.Control
                type="datetime-local"
                step="1"
                required
                onChange={(e) =>
                  setNewPost({ ...newPost, datetime: e.target.value })
                }
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) =>
                      setNewPost({ ...newPost, city: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) =>
                      setNewPost({ ...newPost, region: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) =>
                      setNewPost({ ...newPost, country: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Likes</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        likes: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dislikes</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        dislikes: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                label="Includes multimedia"
                onChange={(e) =>
                  setNewPost({ ...newPost, has_multimedia: e.target.checked })
                }
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Submit Post
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters Section */}
      <Row className="mb-4">
        <Col md={10}>
          <h5>Filter Existing Posts</h5>
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
                    {usernamesForPlatform.map((username) => (
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
            </Row>

            <Button variant="primary" onClick={handleFilterSearch}>
              Search
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Posts Table */}
      <Row>
        <Col>
          <h4 className="mb-3">Existing Posts</h4>
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
                      {[post.city, post.region, post.country].filter(Boolean).join(", ")}
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