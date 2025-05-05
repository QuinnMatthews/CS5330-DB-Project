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
  onRefresh: () => void;
};

const sqlFormat = (datetime: string) =>
  moment(datetime).utc().format("YYYY-MM-DDTHH:mm:ss");
const timeFormat = (datetime: string) =>
  moment(datetime).format("YYYY-MM-DD HH:mm:ss");

export default function ManageProjectPostsModal({
  show,
  onHide,
  selectedProject,
  onRefresh,
}: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [associatedPosts, setAssociatedPosts] = useState<Post[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
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
    has_multimedia: false,
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      fetchData();
    }
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      const [allRes, assocRes, socialsRes, usersRes] = await Promise.all([
        fetch("/api/posts"),
        fetch(`/api/projects/${selectedProject?.name}/posts`),
        fetch(`/api/socials`),
        fetch(`/api/users`),
      ]);
      setPosts(await allRes.json());
      setAssociatedPosts(await assocRes.json());
      setPlatforms(
        (await socialsRes.json()).map((s: { name: string }) => s.name)
      );
      setUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
      setError("Failed to load posts.");
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate form inputs
    if (
      !newPost.username ||
      !newPost.social_name ||
      !newPost.datetime ||
      !newPost.text
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      const postData = {
        ...newPost,
        datetime: sqlFormat(newPost.datetime),
        likes: Number(newPost.likes),
        dislikes: Number(newPost.dislikes),
        has_multimedia: Boolean(newPost.has_multimedia),
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
      await fetchData();
      setError(null);

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
      });
      setShowAddModal(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssociatePost = async (post: Partial<Post>) => {
    // Validate inputs
    if (!post.datetime || !post.username || !post.social_name) {
      setError("All fields are required.");
      return;
    }

    try {
      await fetch(`/api/projects/${selectedProject?.name}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: sqlFormat(post.datetime),
          username: post.username,
          social_name: post.social_name,
        }),
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnassociatePost = async (post: Post) => {
    try {
      await fetch(`/api/projects/${selectedProject?.name}/posts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: sqlFormat(post.datetime),
          username: post.username,
          social_name: post.social_name,
        }),
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const isAssociated = (post: Post) =>
    associatedPosts.some(
      (p) =>
        p.datetime === post.datetime &&
        p.username === post.username &&
        p.social_name === post.social_name
    );

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
              {associatedPosts.map((post) => (
                <tr
                  key={`${post.datetime}-${post.username}-${post.social_name}`}
                >
                  <td>{timeFormat(post.datetime)}</td>
                  <td>{post.username}</td>
                  <td>{post.social_name}</td>
                  <td>{post.text?.slice(0, 40)}...</td>
                  <td>
                    <Button
                      variant="danger"
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
                    <td>{timeFormat(post.datetime)}</td>
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
                    value={newPost.datetime || ""}
                    onChange={(e) =>
                      setNewPost({ ...newPost, datetime: e.target.value })
                    }
                    required
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
    </>
  );
}
