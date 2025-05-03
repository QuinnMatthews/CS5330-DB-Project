"use client";
import Link from "next/link";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function HomePage() {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Welcome to the Social Media Research Database</h2>
          <p className="text-muted">
            Manage social media posts, research projects, and analytical results with ease.
          </p>
        </Col>
      </Row>
      <h3>Manage Data</h3>
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Manage Platforms</Card.Title>
              <Card.Text>Add or update social media platforms.</Card.Text>
              <Link href="/socials" passHref>
                <Button variant="info">Go to Platforms</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Manage Users</Card.Title>
              <Card.Text>View and update users in the database.</Card.Text>
              <Link href="/users" passHref>
                <Button variant="secondary">Go to Users</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Manage Posts</Card.Title>
              <Card.Text>View and update social media posts in the database.</Card.Text>
              <Link href="/posts" passHref>
                <Button variant="primary">Go to Posts</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>New Project</Card.Title>
              <Card.Text>Create a new analysis project and define your metadata.</Card.Text>
              <Link href="/projects" passHref>
                <Button variant="success">Create Project</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

</Row>
<h3> Query </h3>
<Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Search Posts</Card.Title>
              <Card.Text>Query posts by media, user, name, or date range.</Card.Text>
              <Link href="/search-posts" passHref>
                <Button variant="success">Search Posts</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Search Experiments</Card.Title>
              <Card.Text>Explore projects and view analysis summaries.</Card.Text>
              <Link href="/search-experiments" passHref>
                <Button variant="dark">Search Experiments</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
