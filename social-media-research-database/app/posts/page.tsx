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
  state?: string;
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

  useEffect(() => {
    // TODO: Replace with real GET /api/posts
    setPosts([
      {
        datetime: "2025-05-01T12:00:00",
        username: "user123",
        social_name: "Facebook",
        text: "This is a mock post for Facebook.",
        has_multimedia: false,
        likes: 12,
        dislikes: 2,
        city: "Dallas",
        state: "TX",
        country: "USA",
      },
    ]);

    // Load users for dropdown
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
        const platformList = Array.from(
          new Set(data.map((u) => u.social_name))
        );
        setPlatforms(platformList);
      })
      .catch((error) => {
        setError("Failed to load users: " + error.message);
      });
  }, []);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setNewPost({ ...newPost, social_name: platform, username: "" });
    const usernames = users
      .filter((u) => u.social_name === platform)
      .map((u) => u.username);
    setUsernamesForPlatform(usernames);
  };

  const handleNewPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting post:", newPost);
    // TODO: Send post to backend endpoint (POST /api/posts)
  };

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
                      setNewPost({ ...newPost, state: e.target.value })
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

      {/* Posts Table */}
      <Row>
        <Col>
          <h4 className="mb-3">Existing Posts</h4>
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
                    {[post.city, post.state, post.country]
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
        </Col>
      </Row>
    </Container>
  );
}
