"use client";

import { useState, useEffect } from "react";
import {
  Offcanvas,
  Modal,
  Form,
  Button,
  Row,
  Col,
  Table,
  Spinner,
} from "react-bootstrap";

import moment from "moment";
import { Project } from "./types";
import { Post } from "@/app/posts/types";
import { User } from "@/app/users/types";

type Props = {
  show: boolean;
  onHide: () => void;
  selectedProject: Project | null;
};
  
const userTimeFormat = (datetime: string, seconds: boolean) =>
  moment(datetime).local().format("LL, LT" + (seconds ? "S" : ""));

const sqlFormat = (datetime: string) =>
  moment(datetime).utc().format("YYYY-MM-DDTHH:mm:ss");

const sqlFormatNonConverting = (datetime: string) =>
  moment(datetime).format("YYYY-MM-DDTHH:mm:ss");

export default function ManageProjectPostsModal({
  show,
  onHide,
  selectedProject,
}: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [associatedPosts, setAssociatedPosts] = useState<(Post & { field_results?: Record<string, string> })[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFieldResultModal, setUpdateFieldResultModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post & { field_results?: Record<string, string> }>({} as Post & { field_results?: Record<string, string> });
  const [newPost, setNewPost] = useState<Partial<Post>>({
    datetime: new Date().toISOString().slice(0, 16),
    username: "",
    social_name: "",
    text: "",
    country: "",
    region: "",
    city: "",
    likes: 0,
    dislikes: 0,
    seconds_known: true,
    has_multimedia: false,
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addSecondsKnown, setAddSecondsKnown] = useState(true);

  useEffect(() => {
    fetchPlatforms();
    fetchUsers();
    fetchAllPosts();

    if (selectedProject) {
      fetchAssociatedPosts(selectedProject.name);
    }
  }, [selectedProject]);

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch posts");
      }

      const data = await res.json();
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to fetch all posts:", err);
      setError(
        "Failed to fetch all posts: " + (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedPosts = async (projectName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectName}/posts`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch posts");
      }

      const data = await res.json();
      setAssociatedPosts(data);
    } catch (err: any) {
      console.error("Failed to fetch associated posts:", err);
      setError(
        "Failed to fetch associated posts: " + (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/socials");

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch platforms");
      }

      const data = await res.json();
      setPlatforms(data.map((s: { name: string }) => s.name));
    } catch (err: any) {
      console.error("Failed to fetch platforms:", err);

      setError(
        "Failed to fetch platforms: " + (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const data = await res.json();

      setUsers(data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError("Failed to fetch users: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
  
    // Validate form inputs
    if (
      !selectedProject ||
      !newPost.username ||
      !newPost.social_name ||
      !newPost.datetime ||
      !newPost.text
    ) {
      setError("All fields are required.");
      setSubmitting(false);
      return;
    }
  
    try {
      const postData = {
        ...newPost,
        datetime: sqlFormat(newPost.datetime),
        likes: Number(newPost.likes),
        dislikes: Number(newPost.dislikes),
        has_multimedia: Boolean(newPost.has_multimedia),
        seconds_known: Boolean(addSecondsKnown),
      };
  
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
  
      if (!res.ok) throw new Error("Failed to create post");
  
      // Immediately associate the new post with the current project
      await handleAssociatePost({
        datetime: newPost.datetime,
        username: newPost.username,
        social_name: newPost.social_name,
      });
  
      setError(null);
      setAddSecondsKnown(true);

      await fetchAllPosts();
      await fetchAssociatedPosts(selectedProject.name);
  
      setNewPost({
        datetime: new Date().toISOString().slice(0, 16),
        username: "",
        social_name: "",
        text: "",
        country: "",
        region: "",
        city: "",
        likes: 0,
        dislikes: 0,
        has_multimedia: false,
        seconds_known: true,
      });
      setShowAddModal(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false); // Always reset the button state
    }
  };

  const handleAssociatePost = async (post: Partial<Post>) => {
    // Validate inputs
    if (
      !selectedProject ||
      !post.datetime ||
      !post.username ||
      !post.social_name
    ) {
      setError("All fields are required.");
      return;
    }
    
    console.log(post);

    try {
      await fetch(`/api/projects/${selectedProject.name}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: sqlFormat(post.datetime),
          username: post.username,
          social_name: post.social_name,
        }),
      });

      await fetchAssociatedPosts(selectedProject.name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnassociatePost = async (post: Post) => {
    setError(null);
    setSubmitting(true);

    if (!selectedProject) {
      console.error("No project selected");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${selectedProject.name}/posts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: sqlFormat(post.datetime),
          username: post.username,
          social_name: post.social_name,
        }),
      });

      if (!res.ok) 
      {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to unassociate post");
      }

      await fetchAssociatedPosts(selectedProject.name);
    } catch (err : any) {
      setError((err as Error).message);
      console.error("Failed to unassociate post:", err);
    }
  };

  const handleUpdatePostFieldResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!selectedProject) {
      console.error("No project selected");
      return;
    }

    // Loop through each field and update the result
    for (const field in selectedPost.field_results) {
      const fieldValue = selectedPost.field_results[field];

      try {
        await fetch(
          `/api/projects/${selectedProject.name}/fields/${field}/result`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              post_datetime: sqlFormat(selectedPost.datetime),
              post_username: selectedPost.username,
              post_social_name: selectedPost.social_name,
              result: fieldValue,
            }),
          }
        );
        setUpdateFieldResultModal(false);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      }
    }

    await fetchAssociatedPosts(selectedProject.name);
    setSubmitting(false);
  };

  const isAssociated = (post: Post) =>
    associatedPosts.some(
      (p) =>
        p.datetime === post.datetime &&
        p.username === post.username &&
        p.social_name === post.social_name
    );

  if (!selectedProject) return <div>No project selected.</div>;

  return (
    <>
      <Offcanvas
        show={show}
        onHide={onHide}
        placement="end"
        style={{ width: "80%" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Manage Project Posts</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mb-3">
            <Button onClick={() => setShowAddModal(true)}>Add New Post</Button>
            <Button
              variant="secondary"
              onClick={() => setShowLinkModal(true)}
              className="m-1"
            >
              Link Existing Post
            </Button>
          </div>

          {error && <div className="text-danger">{error}</div>}
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Datetime</th>
                  <th>Username</th>
                  <th>Platform</th>
                  <th>Text</th>

                  {selectedProject.fields.map((field) => (
                    <th key={field}>{field}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {associatedPosts.map((post) => (
                  <tr
                    key={`${post.datetime}-${post.username}-${post.social_name}`}
                  >
                    <td>{userTimeFormat(post.datetime, post.seconds_known)}</td>
                    <td>{post.username}</td>
                    <td>{post.social_name}</td>
                    <td>{post.text?.slice(0, 40)}...</td>

                    {selectedProject.fields.map((field) => (
                      <td key={field}>{post.field_results?.[field]}</td>
                    ))}

                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setUpdateFieldResultModal(true);
                          setSelectedPost(post);
                        }}
                        className="m-1"
                      >
                        Edit Results
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleUnassociatePost(post)}
                      >
                        Unassociate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Modal
        show={showLinkModal}
        onHide={() => setShowLinkModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Link Existing Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Search Posts</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by username, platform, or text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form.Group>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Datetime</th>
                <th>Username</th>
                <th>Platform</th>
                <th>Text</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {posts
                .filter(
                  (post) =>
                    !isAssociated(post) &&
                    (post.username
                      .toLowerCase()
                      .includes(search.toLowerCase()) ||
                      post.social_name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      post.text?.toLowerCase().includes(search.toLowerCase()))
                )
                .map((post) => (
                  <tr
                    key={`${post.datetime}-${post.username}-${post.social_name}`}
                  >
                    <td>{userTimeFormat(post.datetime, post.seconds_known)}</td>
                    <td>{post.username}</td>
                    <td>{post.social_name}</td>
                    <td>{post.text?.slice(0, 40)}...</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAssociatePost(post)}
                      >
                        Link
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPost}>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Platform</Form.Label>
                  <Form.Select
                    value={newPost.social_name || ""}
                    onChange={(e) => {
                      const selectedPlatform = e.target.value;
                      setNewPost({
                        ...newPost,
                        social_name: selectedPlatform,
                        username: "",
                      });
                    }}
                    required
                  >
                    <option value="">Select a platform</option>
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Select
                    value={newPost.username || ""}
                    onChange={(e) =>
                      setNewPost({ ...newPost, username: e.target.value })
                    }
                    required
                    disabled={!newPost.social_name}
                  >
                    <option value="">Select a user</option>
                    {users
                      .filter((u) => u.social_name === newPost.social_name)
                      .map((u) => (
                        <option key={u.username} value={u.username}>
                          {u.username}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Datetime</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    step={addSecondsKnown ? 1 : 60}
                    value={newPost.datetime || ""}
                    onChange={(e) =>
                      setNewPost({ ...newPost, datetime: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    label="Seconds known"
                    checked={addSecondsKnown}
                    onChange={(e) => 
                      setAddSecondsKnown(e.target.checked)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Text</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={newPost.text || ""}
                    onChange={(e) =>
                      setNewPost({ ...newPost, text: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    value={newPost.city || ""}
                    onChange={(e) =>
                      setNewPost({ ...newPost, city: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Region</Form.Label>
                  <Form.Control
                    value={newPost.region || ""}
                    onChange={(e) =>
                      setNewPost({ ...newPost, region: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    value={newPost.country || ""}
                    onChange={(e) =>
                      setNewPost({ ...newPost, country: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Likes</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newPost.likes || 0}
                    onChange={(e) =>
                      setNewPost({ ...newPost, likes: Number(e.target.value) })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Dislikes</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newPost.dislikes || 0}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        dislikes: Number(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Check
                    label="Multimedia?"
                    checked={newPost.has_multimedia || false}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        has_multimedia: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" disabled={submitting} className="mt-3">
              {submitting ? "Submitting..." : "Add Post"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showFieldResultModal}
        onHide={() => {
          setUpdateFieldResultModal(false);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Post Field Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdatePostFieldResult}>
            {/* For each field, display a form group */}
            {selectedProject.fields.map((field) => (
              <Form.Group key={field}>
                <Form.Label>{field}</Form.Label>
                <Form.Control
                  type="string"
                  value={selectedPost.field_results?.[field] || ""}
                  onChange={(e) => {
                    setSelectedPost({
                      ...selectedPost,
                      field_results: {
                        ...selectedPost.field_results,
                        [field]: e.target.value,
                      },
                    });
                  }}
                />
              </Form.Group>
            ))}
            <Button type="submit" disabled={submitting} className="mt-3">
              {submitting ? "Submitting..." : "Update Results"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
