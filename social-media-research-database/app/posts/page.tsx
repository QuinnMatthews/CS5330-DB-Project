// posts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Post, Repost } from "./types";

import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import moment from "moment";
import { Underdog } from "next/font/google";

type User = {
  username: string;
  social_name: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [reposts, setReposts] = useState<Repost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newPost, setNewPost] = useState<Partial<Post>>({});
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [usernamesForPlatform, setUsernamesForPlatform] = useState<string[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [deletingSocial, setDeletingSocial] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [viewRepostPost, setViewRepostPost] = useState<Post | null>(null);
  const [newRepost, setNewRepost] = useState<Partial<Repost>>({});

  // Filters
  const [filters, setFilters] = useState({
    social_name: "",
    username: "",
    start: "",
    end: "",
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
        const uniquePlatforms = Array.from(
          new Set(data.map((u) => u.social_name))
        );
        setPlatforms(uniquePlatforms);
      })
      .catch((error) => setError("Failed to load users: " + error.message));
  };

  const fetchReposts = async () => {
    fetch("/api/reposts")
      .then((res) => res.json())
      .then((data: Post[]) => setReposts(data))
      .catch((error) => setError("Failed to load reposts: " + error.message));
  };

  useEffect(() => {
    fetchPosts();
    fetchUsers();
    fetchReposts();
  }, []);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setNewPost({ ...newPost, social_name: platform, username: "" });
    const usernames = users
      .filter((u) => u.social_name === platform)
      .map((u) => u.username);
    setUsernamesForPlatform(usernames);
  };

  const sqlFormat = (datetime: string) =>
    moment(datetime).utc().format("YYYY-MM-DDTHH:mm:ss");

  const sqlFormatNonConverting = (datetime: string) =>
    moment(datetime).format("YYYY-MM-DDTHH:mm:ss");

  const handleNewPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPost,
          datetime: sqlFormat(newPost.datetime),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const messages = Object.entries(errorData.details || {})
          .map(
            ([field, issue]: any) =>
              issue?._errors?.[0] && `${field}: ${issue._errors[0]}`
          )
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

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingPost,
          datetime: sqlFormat(editingPost.datetime),
        }),
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

      setEditingPost(null);
      await fetchPosts();
    } catch (err: any) {
      setError(`Could not update post: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (
    datetime: string,
    username: string,
    social_name: string
  ) => {
    if (
      !window.confirm(`Are you sure you want to delete the post posted at \
${new Date(datetime).toLocaleString()} by ${social_name} user "${username}"?`)
    ) {
      return;
    }

    setDeletingDate(datetime);
    setDeletingName(username);
    setDeletingSocial(social_name);
    setError(null);

    try {
      const res = await fetch(`/api/posts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: sqlFormat(datetime),
          username: username,
          social_name: social_name,
        }),
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

        throw new Error(
          errorData.error ||
            `Failed to delete the post posted at \
${new Date(datetime).toLocaleString()} by ${social_name} user "${username}"`
        );
      }

      await fetchPosts();
    } catch (err: any) {
      console.error(
        `Failed to delete the post posted at \
${new Date(datetime).toLocaleString()} by ${social_name} user "${username}"`,
        err
      );
      setError(`Could not delete post: ${err.message || "Unknown error"}`);
    } finally {
      setDeletingDate(null);
      setDeletingName(null);
      setDeletingSocial(null);
    }
  };

  const handleFilterSearch = () => {
    setError(null);
    const query = new URLSearchParams();
    if (filters.social_name) query.append("social_name", filters.social_name);
    if (filters.username) query.append("username", filters.username);
    if (filters.start) {
      const start = new Date(filters.start);
      query.append("start", start.toISOString());
    }
    if (filters.end) {
      const end = new Date(filters.end);
      // Includes the end date
      end.setHours(23, 59, 59, 999);
      query.append("end", end.toISOString());
    }
    if (filters.first_name) query.append("first_name", filters.first_name);
    if (filters.last_name) query.append("last_name", filters.last_name);
    fetchPosts("?" + query.toString());
  };

  const handleAddRepost  = async(e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      post_datetime: sqlFormatNonConverting(viewRepostPost?.datetime),
      post_username: viewRepostPost?.username,
      social_name: viewRepostPost?.social_name,
      repost_datetime: sqlFormatNonConverting(newRepost.repost_datetime),
      repost_username: newRepost.repost_username,
     };

     try {
       const res = await fetch("/api/reposts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

       if (!res.ok) {
         const errorData = await res.json().catch(() => ({}));
         if (errorData?.details) {
          
          const details = errorData.details;
          let messages: string[] = [];
          
          // Handle top-level form errors
          if (Array.isArray(details?._errors) && details._errors.length > 0) {
            messages.push(...details._errors);
          }
          
          // Handle field-level errors
          for (const [field, issue] of Object.entries(details)) {
            if (field === "_errors") continue; // already handled
            const _i = issue as any;
            const msg = _i?.["_errors"]?.[0];
            if (msg) {
              messages.push(`${field}: ${msg}`);
            }
          }
          
          throw new Error(messages.join("; ") || "Invalid input.");
          }
         throw new Error(errorData.error || "Failed to repost post.");
       }

     } catch (err: any) {
       console.error("Failed to repost post:", err);
       setError(`Could not repost post: ${err.message || "Unknown error"}`);
     } finally {
       setNewRepost({ });
       await fetchReposts();
       await fetchPosts();
     }

    setViewRepostPost(null);
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
          <Button variant="primary" onClick={() => setShowPostModal(true)}>
            Add New Post
          </Button>
        </Col>
      </Row>

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters Section */}
      <Row className="mb-4">
        <Col md={10}>
          <h5>Filter</h5>
          <Form>
            <Row className="mb-3">
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Platform</Form.Label>
                  <Form.Select
                    value={filters.social_name}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        social_name: e.target.value,
                        username: "",
                      }))
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

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Select
                    value={filters.username}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, username: e.target.value }))
                    }
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

              <Col md={2}>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., John"
                    value={filters.first_name}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, first_name: e.target.value }))
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Doe"
                    value={filters.last_name}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, last_name: e.target.value }))
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.start}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, start: e.target.value }))
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.end}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, end: e.target.value }))
                    }
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
          {posts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {posts.map((post, index) => (
                <Col
                  key={`${post.username}-${post.social_name}-${post.datetime}-${index}`}
                >
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>
                        {post.text.length > 50
                          ? `${post.text.slice(0, 50)}...`
                          : post.text}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {post.social_name} • {post.username}
                      </Card.Subtitle>
                      <Card.Text>
                        <strong>Time:</strong>{" "}
                        {new Date(post.datetime).toLocaleString()}
                        <br />
                        <strong>Location:</strong>{" "}
                        {[post.city, post.region, post.country]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                        <br />
                        <strong>Likes:</strong> {post.likes ?? 0} |{" "}
                        <strong>Dislikes:</strong> {post.dislikes ?? 0}
                        <br />
                        <strong>Multimedia:</strong>{" "}
                        {post.has_multimedia ? "✔️" : "❌"}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => setViewRepostPost({ ...post })}
                      >
                        Reposts ({post.reposts ?? 0})
                      </Button>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => setEditingPost({ ...post })}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() =>
                            handleDeletePost(
                              post.datetime,
                              post.username,
                              post.social_name
                            )
                          }
                          disabled={
                            deletingDate === post.datetime &&
                            deletingName === post.username &&
                            deletingSocial === post.social_name
                          }
                        >
                          {deletingDate === post.datetime &&
                          deletingName === post.username &&
                          deletingSocial === post.social_name ? (
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
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={!!editingPost} onHide={() => setEditingPost(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Post
            {editingPost && (
              <small className="text-muted ms-2">
                by {editingPost.username} on {editingPost.social_name}
              </small>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingPost && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Post Text</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editingPost.text || ""}
                  required
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, text: e.target.value })
                  }
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingPost.city || ""}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, city: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingPost.region || ""}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          region: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingPost.country || ""}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          country: e.target.value,
                        })
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
                      value={editingPost.likes || ""}
                      min={0}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
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
                      value={editingPost.dislikes || ""}
                      min={0}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
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
                  checked={!!editingPost.has_multimedia}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      has_multimedia: e.target.checked,
                    })
                  }
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingPost(null)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleUpdatePost}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showPostModal}
        onHide={() => setShowPostModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              handleNewPostSubmit(e);
              setShowPostModal(false);
            }}
          >
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

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setShowPostModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Post
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

{viewRepostPost && (
      <Modal
        show={viewRepostPost != null}
        onHide={() => setViewRepostPost(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>View Reposts</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {viewRepostPost && (
            <>
              <h5>Original Post:</h5>
              <p>{viewRepostPost.text}</p>
              <p>
                {viewRepostPost.username} - {viewRepostPost.datetime} -{" "}
                {viewRepostPost.city}, {viewRepostPost.region},{" "}
                {viewRepostPost.country}
              </p>

              <h5>Reposts:</h5>
              <Form onSubmit={handleAddRepost}>
                <Row>
                  <Col>
                    <Form.Group className="mb-3" >
                      <Form.Label>Select User</Form.Label>
                      <Form.Select
                        value={newRepost.repost_username}
                        onChange={(e) =>
                          setNewRepost({
                            ...newRepost,
                            repost_username: e.target.value,
                          })
                        }
                        disabled={reposts.length === 0}
                        required
                        
                      >
                        <option disabled selected value="">Choose user...</option>
                        {users.filter((u)=> u.social_name == viewRepostPost.social_name).map((user) => (
                      <option key={user.username} value={user.username}>
                        {user.username}
                      </option>
                    ))}
                    </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Repost Date/Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={newRepost.repost_datetime}
                        onChange={(e) =>
                          setNewRepost({
                            ...newRepost,
                            repost_datetime: e.target.value,
                          })
                        }
                        disabled={reposts.length === 0}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Button type="submit" variant="primary">
                    Add Repost
                  </Button>
                </Row>
              </Form>
              <Table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reposts
                    .filter((r) => r.post_datetime === viewRepostPost.datetime)
                    .filter((r) => r.post_username === viewRepostPost.username)
                    .filter((r) => r.social_name === viewRepostPost.social_name)
                    .map((rp) => (
                      <tr key={`${rp.repost_username}|${rp.repost_datetime}`}>
                        <td>{rp.repost_username}</td>
                        <td>{new Date(rp.repost_datetime).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewRepostPost(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>)}
    </Container>
  );
}
