import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import React from "react";

interface DeleteUserModalProps {
  show: boolean;
  onClose: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ show, onClose }) => {
  useEffect(() => {
    // This is needed to load Bootstrap's JavaScript
    import("bootstrap/dist/js/bootstrap");
  }, []);
  
  if (!show) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // convert the form data into a JSON object
    const data = JSON.stringify(Object.fromEntries(formData.entries()));


    try {
      let response = await fetch("/api/users/delete", {
        method: "POST",
        body: data,
      });
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Close the modal on successful submission
      onClose();
    } catch (error) {
      // Handle error
      console.error("Error submitting form:", error);
    }
  };
  
  
  // username, social_name, first_name, last_name, birthdate, gender, birth_country, residence_country

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username:
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="social_name" className="form-label">
                Platform:
              </label>
              <input
                type="text"
                className="form-control"
                id="social_name"
                name="social_name"
                required
              />
            </div>
            <Button variant="danger" type="submit">
              Submit
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteUserModal;